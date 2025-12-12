import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe, STRIPE_ENABLED } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase/admin';
import Stripe from 'stripe';
import { logger } from '@/lib/logger';
import { securityLogger } from '@/lib/security-logger';
import { RateLimiter, RateLimitPresets, getIdentifier, addRateLimitHeaders } from '@/lib/rate-limit';

// Rate limiter for webhook endpoint
const rateLimiter = new RateLimiter(RateLimitPresets.WEBHOOK);

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!STRIPE_ENABLED || !stripe) {
    return NextResponse.json({ error: 'Stripe disabled' }, { status: 503 });
  }
  // Apply rate limiting (100 requests per minute per IP)
  const identifier = getIdentifier(request, null);
  const rateLimitResult = await rateLimiter.check(identifier);

  if (!rateLimitResult.allowed) {
    const headers = new Headers();
    addRateLimitHeaders(headers, rateLimitResult);

    securityLogger.suspiciousActivity('Stripe webhook rate limit exceeded', {
      severity: 'high',
      ipAddress: identifier,
      endpoint: '/api/webhooks/stripe',
    });

    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        retryAfter: rateLimitResult.resetIn,
      },
      {
        status: 429,
        headers,
      }
    );
  }

  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    securityLogger.webhookVerificationFailed('stripe', 'Missing signature header', {
      endpoint: '/api/webhooks/stripe',
    });
    return NextResponse.json(
      { error: 'No signature found' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe!.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    securityLogger.webhookVerificationFailed('stripe', 'Invalid signature', {
      endpoint: '/api/webhooks/stripe',
    });
    logger.error('Stripe webhook signature verification failed', err as Error);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(invoice);
        break;
      }

      default:
        logger.debug(`Unhandled Stripe event type: ${event.type}`, {
          eventId: event.id,
        });
    }

    securityLogger.webhookProcessed('stripe', event.type, {
      eventId: event.id,
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error('Stripe webhook handler error', error as Error, {
      eventType: event?.type,
      eventId: event?.id,
    });
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
  // Try both metadata patterns (metadata and client_reference_id)
  const userId = session.metadata?.user_id || session.client_reference_id;
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;

  if (!userId) {
    logger.error('Missing user ID in Stripe checkout session', undefined, {
      sessionId: session.id,
      customerId: session.customer as string,
    });
    return;
  }

  // Get subscription details to get period dates
  const stripeSubscription = await stripe!.subscriptions.retrieve(subscriptionId);
  const priceId = stripeSubscription.items.data[0].price.id;

  // Determine plan name from metadata or price ID
  let planName = session.metadata?.plan_name as 'starter' | 'pro' | 'enterprise' | undefined;
  if (!planName) {
    planName = 'starter';
    if (priceId === process.env.STRIPE_PRO_PRICE_ID) planName = 'pro';
    if (priceId === process.env.STRIPE_ENTERPRISE_PRICE_ID) planName = 'enterprise';
  }

  const periodStart = (stripeSubscription as unknown as { current_period_start?: number }).current_period_start;
  const periodEnd = (stripeSubscription as unknown as { current_period_end?: number }).current_period_end;
  const cancelAtEnd = (stripeSubscription as unknown as { cancel_at_period_end?: boolean }).cancel_at_period_end;

  // Create or update subscription record (upsert to handle duplicates)
  await supabaseAdmin.from('subscriptions').upsert({
    user_id: userId,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
    stripe_price_id: priceId,
    plan_name: planName,
    status: stripeSubscription.status,
    current_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : null,
    current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
    cancel_at_period_end: cancelAtEnd ?? false,
  });

  // Create usage tracking record (insert only if doesn't exist)
  const analysesLimit = planName === 'starter' ? 100 : -1;
  await supabaseAdmin.from('usage_tracking').insert({
    user_id: userId,
    plan_name: planName,
    analyses_used: 0,
    analyses_limit: analysesLimit,
    period_start: new Date().toISOString(),
    period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  }).select().single();

  securityLogger.paymentEvent('subscription_created', userId, {
    planName,
    subscriptionId,
  });

  logger.info('Checkout session completed', {
    userId,
    planName,
    subscriptionId,
    customerId,
  });
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription): Promise<void> {
  const priceId = subscription.items.data[0].price.id;

  // Determine plan name
  let planName: 'starter' | 'pro' | 'enterprise' = 'starter';
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) planName = 'pro';
  if (priceId === process.env.STRIPE_ENTERPRISE_PRICE_ID) planName = 'enterprise';

  await supabaseAdmin
    .from('subscriptions')
    .update({
      stripe_price_id: priceId,
      plan_name: planName,
      status: subscription.status,
      current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
      current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
    })
    .eq('stripe_subscription_id', subscription.id);

  // Update usage tracking - find by user_id from subscription
  const { data: sub } = await supabaseAdmin
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_subscription_id', subscription.id)
    .single();

  if (sub?.user_id) {
    const analysesLimit = planName === 'starter' ? 100 : -1;
    await supabaseAdmin
      .from('usage_tracking')
      .update({
        plan_name: planName,
        analyses_limit: analysesLimit,
      })
      .eq('user_id', sub.user_id);

    logger.info('Subscription updated', {
      userId: sub.user_id,
      planName,
      subscriptionId: subscription.id,
      status: subscription.status,
    });
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
  const { data: sub } = await supabaseAdmin
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_subscription_id', subscription.id)
    .single();

  await supabaseAdmin
    .from('subscriptions')
    .update({ status: 'canceled' })
    .eq('stripe_subscription_id', subscription.id);

  if (sub?.user_id) {
    securityLogger.paymentEvent('subscription_cancelled', sub.user_id, {
      subscriptionId: subscription.id,
    });

    logger.info('Subscription deleted', {
      userId: sub.user_id,
      subscriptionId: subscription.id,
    });
  }
}

async function handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
  const subscriptionId = (invoice as any).subscription as string | null;

  if (!subscriptionId) return;

  // Update subscription status and period dates
  await supabaseAdmin
    .from('subscriptions')
    .update({
      status: 'active',
      current_period_start: new Date(invoice.period_start * 1000).toISOString(),
      current_period_end: new Date(invoice.period_end * 1000).toISOString(),
    })
    .eq('stripe_subscription_id', subscriptionId);

  const { data: sub } = await supabaseAdmin
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_subscription_id', subscriptionId)
    .single();

  if (sub?.user_id) {
    securityLogger.paymentEvent('payment_succeeded', sub.user_id, {
      amount: invoice.amount_paid,
      currency: invoice.currency,
    });

    logger.info('Invoice paid', {
      userId: sub.user_id,
      subscriptionId,
      amount: invoice.amount_paid,
    });
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  const subscriptionId = (invoice as any).subscription as string | null;

  if (!subscriptionId) return;

  // Update subscription status
  await supabaseAdmin
    .from('subscriptions')
    .update({ status: 'past_due' })
    .eq('stripe_subscription_id', subscriptionId);

  const { data: sub } = await supabaseAdmin
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_subscription_id', subscriptionId)
    .single();

  if (sub?.user_id) {
    securityLogger.paymentEvent('payment_failed', sub.user_id, {
      amount: invoice.amount_due,
      currency: invoice.currency,
    });

    logger.warn('Invoice payment failed', {
      userId: sub.user_id,
      subscriptionId,
      amount: invoice.amount_due,
      attemptCount: invoice.attempt_count,
    });
  }
}
