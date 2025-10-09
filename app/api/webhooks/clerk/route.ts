import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { Webhook } from 'svix';
import { supabaseAdmin } from '@/lib/supabase/admin';

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

export async function POST(req: Request) {
  // Verify webhook secret is configured
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error('Missing CLERK_WEBHOOK_SECRET environment variable');
    return Response.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  // Get headers for webhook verification
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // Verify required headers are present
  if (!svix_id || !svix_timestamp || !svix_signature) {
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
    console.error('Webhook verification failed:', err);
    return Response.json(
      { error: 'Invalid webhook signature' },
      { status: 400 }
    );
  }

  // Handle different event types
  const eventType = evt.type;
  console.log(`Received Clerk webhook: ${eventType}`);

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
        console.error(`Error upserting user ${id}:`, error);
        return Response.json(
          { error: 'Error upserting user' },
          { status: 500 }
        );
      }

      console.log(`Successfully ${eventType === 'user.created' ? 'created' : 'updated'} user: ${id}`);
      return Response.json({ success: true });
    }

    // Handle user.deleted
    if (eventType === 'user.deleted') {
      const { id } = evt.data;

      if (!id) {
        console.error('Missing user ID in deletion event');
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
        console.error(`Error deleting user ${id}:`, error);
        return Response.json(
          { error: 'Error deleting user' },
          { status: 500 }
        );
      }

      console.log(`Successfully deleted user: ${id}`);
      return Response.json({ success: true });
    }

    // Unknown event type
    console.warn(`Unhandled webhook event type: ${eventType}`);
    return Response.json({ success: true, message: 'Event type not handled' });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
