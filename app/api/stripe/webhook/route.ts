import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature")!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        const planName = session.metadata?.plan_name;

        if (!userId || !planName) {
          console.error("Missing metadata in checkout session");
          break;
        }

        // Create or update subscription record
        const { error } = await supabase.from("subscriptions").upsert({
          user_id: userId,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
          stripe_price_id: session.metadata?.price_id || "",
          plan_name: planName,
          status: "active",
          current_period_start: new Date(
            (session as any).subscription_data?.current_period_start * 1000
          ),
          current_period_end: new Date(
            (session as any).subscription_data?.current_period_end * 1000
          ),
        });

        if (error) {
          console.error("Failed to create subscription:", error);
        }

        // Create usage tracking record
        const analysesLimit = planName === "starter" ? 100 : -1; // -1 for unlimited
        await supabase.from("usage_tracking").insert({
          user_id: userId,
          plan_name: planName,
          analyses_used: 0,
          analyses_limit: analysesLimit,
          period_start: new Date(),
          period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        });

        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.user_id;

        if (!userId) break;

        await supabase
          .from("subscriptions")
          .update({
            status: subscription.status,
            current_period_start: new Date(
              subscription.current_period_start * 1000
            ),
            current_period_end: new Date(
              subscription.current_period_end * 1000
            ),
            cancel_at_period_end: subscription.cancel_at_period_end,
          })
          .eq("stripe_subscription_id", subscription.id);

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        await supabase
          .from("subscriptions")
          .update({
            status: "canceled",
          })
          .eq("stripe_subscription_id", subscription.id);

        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (subscriptionId) {
          await supabase
            .from("subscriptions")
            .update({
              status: "active",
              current_period_start: new Date(
                invoice.period_start * 1000
              ),
              current_period_end: new Date(invoice.period_end * 1000),
            })
            .eq("stripe_subscription_id", subscriptionId);
        }

        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (subscriptionId) {
          await supabase
            .from("subscriptions")
            .update({
              status: "past_due",
            })
            .eq("stripe_subscription_id", subscriptionId);
        }

        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
