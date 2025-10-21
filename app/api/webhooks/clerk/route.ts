import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { Webhook } from 'svix';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { logger } from '@/lib/logger';
import { securityLogger } from '@/lib/security-logger';
import { RateLimiter, RateLimitPresets, addRateLimitHeaders } from '@/lib/rate-limit';

/**
 * Clerk Webhook Handler
 *
 * Syncs Clerk user events to Supabase database using database functions.
 * This maintains user data in Supabase while using Clerk for authentication.
 *
 * Webhook Events Handled:
 * - user.created: Create new profile in Supabase
 * - user.updated: Update existing profile
 * - user.deleted: Delete profile from Supabase
 *
 * Setup Instructions:
 * 1. Go to Clerk Dashboard > Webhooks
 * 2. Add endpoint: https://your-domain.com/api/webhooks/clerk
 * 3. Subscribe to: user.created, user.updated, user.deleted
 * 4. Copy webhook secret to CLERK_WEBHOOK_SECRET env var
 *
 * Database Functions Used:
 * - upsert_user_from_clerk(): Creates or updates user profile
 * - delete_user_from_clerk(): Deletes user and related data
 */

// Rate limiter for webhook endpoint
const rateLimiter = new RateLimiter(RateLimitPresets.WEBHOOK);

export async function POST(req: Request) {
  // Apply rate limiting (100 requests per minute per IP)
  const headersList = await headers();
  const forwarded = headersList.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0].trim() || 'unknown';
  const identifier = `ip:${ip}`;

  const rateLimitResult = await rateLimiter.check(identifier);

  if (!rateLimitResult.allowed) {
    const responseHeaders = new Headers();
    addRateLimitHeaders(responseHeaders, rateLimitResult);

    securityLogger.suspiciousActivity('Clerk webhook rate limit exceeded', {
      severity: 'high',
      ipAddress: ip,
      endpoint: '/api/webhooks/clerk',
    });

    return Response.json(
      {
        error: 'Rate limit exceeded',
        retryAfter: rateLimitResult.resetIn,
      },
      {
        status: 429,
        headers: responseHeaders,
      }
    );
  }

  // Verify Supabase is configured
  if (!supabaseAdmin) {
    securityLogger.configurationError('Supabase', 'Supabase admin client not configured', {
      endpoint: '/api/webhooks/clerk',
    });
    return Response.json(
      { error: 'Database not configured' },
      { status: 503 }
    );
  }

  // Verify webhook secret is configured
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    securityLogger.configurationError('CLERK_WEBHOOK_SECRET', 'Environment variable not set', {
      endpoint: '/api/webhooks/clerk',
    });
    return Response.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  // Get headers for webhook verification (headersList already defined above)
  const svix_id = headersList.get('svix-id');
  const svix_timestamp = headersList.get('svix-timestamp');
  const svix_signature = headersList.get('svix-signature');

  // Verify required headers are present
  if (!svix_id || !svix_timestamp || !svix_signature) {
    securityLogger.webhookVerificationFailed('clerk', 'Missing svix headers', {
      endpoint: '/api/webhooks/clerk',
    });
    return Response.json(
      { error: 'Missing svix headers' },
      { status: 400 }
    );
  }

  // Get the request body
  const payload = await req.text();

  // Verify webhook signature
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(payload, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    securityLogger.webhookVerificationFailed('clerk', 'Invalid signature', {
      endpoint: '/api/webhooks/clerk',
    });
    logger.error('Clerk webhook signature verification failed', err as Error);
    return Response.json(
      { error: 'Invalid webhook signature' },
      { status: 400 }
    );
  }

  // Handle different event types
  const eventType = evt.type;
  logger.info(`Received Clerk webhook: ${eventType}`, {
    eventType,
    eventId: svix_id,
  });

  try {
    // Handle user.created and user.updated
    if (eventType === 'user.created' || eventType === 'user.updated') {
      const {
        id,
        email_addresses,
        first_name,
        last_name,
        image_url,
        username,
        external_id,
      } = evt.data;

      // Get primary email address
      const primaryEmail = email_addresses?.find(
        (e) => e.id === evt.data.primary_email_address_id
      );

      // Call Supabase function to upsert user
      const { error } = await supabaseAdmin.rpc('upsert_user_from_clerk', {
        p_clerk_id: id,
        p_email: primaryEmail?.email_address || null,
        p_first_name: first_name || null,
        p_last_name: last_name || null,
        p_image_url: image_url || null,
        p_username: username || null,
        p_external_id: external_id || null,
      });

      if (error) {
        logger.error(`Failed to upsert user from Clerk webhook`, error as Error, {
          userId: id,
          eventType,
        });
        return Response.json(
          { error: 'Error upserting user' },
          { status: 500 }
        );
      }

      logger.info(`Successfully ${eventType === 'user.created' ? 'created' : 'updated'} user from Clerk`, {
        userId: id,
        eventType,
      });

      securityLogger.webhookProcessed('clerk', eventType, {
        userId: id,
      });

      return Response.json({ success: true });
    }

    // Handle user.deleted
    if (eventType === 'user.deleted') {
      const { id } = evt.data;

      if (!id) {
        logger.error('Missing user ID in Clerk deletion event', undefined, {
          eventType,
        });
        return Response.json(
          { error: 'Missing user ID' },
          { status: 400 }
        );
      }

      // Call Supabase function to delete user
      const { error } = await supabaseAdmin.rpc('delete_user_from_clerk', {
        p_clerk_id: id,
      });

      if (error) {
        logger.error(`Failed to delete user from Clerk webhook`, error as Error, {
          userId: id,
          eventType,
        });
        return Response.json(
          { error: 'Error deleting user' },
          { status: 500 }
        );
      }

      logger.info(`Successfully deleted user from Clerk`, {
        userId: id,
        eventType,
      });

      securityLogger.webhookProcessed('clerk', eventType, {
        userId: id,
      });

      return Response.json({ success: true });
    }

    // Unknown event type
    logger.debug(`Unhandled Clerk webhook event type: ${eventType}`, {
      eventType,
    });
    return Response.json({ success: true, message: 'Event type not handled' });
  } catch (error) {
    logger.error('Error processing Clerk webhook', error as Error, {
      eventType,
    });
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
