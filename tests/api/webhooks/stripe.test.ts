import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/webhooks/stripe/route';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase/admin';
import {
  createMockSubscription,
  createMockCheckoutSession,
  createMockInvoice,
} from '@/tests/factories/subscription.factory';
import Stripe from 'stripe';

// Mock the dependencies
vi.mock('@/lib/stripe', () => ({
  stripe: {
    webhooks: {
      constructEvent: vi.fn(),
    },
    subscriptions: {
      retrieve: vi.fn(),
    },
  },
}));

vi.mock('@/lib/supabase/admin', () => ({
  supabaseAdmin: {
    from: vi.fn(() => ({
      upsert: vi.fn(() => ({ select: vi.fn(), single: vi.fn() })),
      insert: vi.fn(() => ({ select: vi.fn(), single: vi.fn() })),
      update: vi.fn(() => ({ eq: vi.fn() })),
      select: vi.fn(() => ({ eq: vi.fn(() => ({ single: vi.fn() })) })),
    })),
  },
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

vi.mock('@/lib/security-logger', () => ({
  securityLogger: {
    webhookVerificationFailed: vi.fn(),
    webhookProcessed: vi.fn(),
    paymentEvent: vi.fn(),
  },
}));

// Mock Next.js headers
vi.mock('next/headers', () => ({
  headers: vi.fn(() => ({
    get: vi.fn((key: string) => {
      if (key === 'stripe-signature') return 'valid_signature';
      return null;
    }),
  })),
}));

describe('Stripe Webhook API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Signature Verification', () => {
    it('should reject requests without signature', async () => {
      const { headers } = await import('next/headers');
      vi.mocked(headers).mockResolvedValueOnce({
        get: vi.fn(() => null),
      } as any);

      const request = new Request('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        body: JSON.stringify({ type: 'test' }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('No signature found');
    });

    it('should reject requests with invalid signature', async () => {
      vi.mocked(stripe.webhooks.constructEvent).mockImplementationOnce(() => {
        throw new Error('Invalid signature');
      });

      const request = new Request('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        body: 'raw_body',
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid signature');
    });

    it('should accept valid signatures', async () => {
      const mockEvent: Stripe.Event = {
        id: 'evt_test',
        object: 'event',
        api_version: '2025-09-30.clover',
        created: Math.floor(Date.now() / 1000),
        data: { object: {} },
        livemode: false,
        pending_webhooks: 0,
        request: null,
        type: 'checkout.session.completed',
      };

      vi.mocked(stripe.webhooks.constructEvent).mockReturnValueOnce(mockEvent);

      const mockSession = createMockCheckoutSession();
      mockEvent.data.object = mockSession;

      const mockSubscription = createMockSubscription();
      vi.mocked(stripe.subscriptions.retrieve).mockResolvedValueOnce(
        mockSubscription
      );

      // Mock database operations
      const mockUpsert = vi.fn(() => ({ select: vi.fn(), single: vi.fn() }));
      const mockInsert = vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({ catch: vi.fn() })),
        })),
      }));

      vi.mocked(supabaseAdmin.from).mockImplementation((table: string) => {
        if (table === 'subscriptions') {
          return { upsert: mockUpsert } as any;
        }
        if (table === 'usage_tracking') {
          return { insert: mockInsert } as any;
        }
        return {} as any;
      });

      const request = new Request('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        body: 'raw_body',
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.received).toBe(true);
    });
  });

  describe('checkout.session.completed', () => {
    it('should create subscription and usage tracking on checkout completion', async () => {
      const mockSession = createMockCheckoutSession({
        metadata: { user_id: 'user_123', plan_name: 'starter' },
      });

      const mockEvent: Stripe.Event = {
        id: 'evt_test',
        object: 'event',
        api_version: '2025-09-30.clover',
        created: Math.floor(Date.now() / 1000),
        data: { object: mockSession },
        livemode: false,
        pending_webhooks: 0,
        request: null,
        type: 'checkout.session.completed',
      };

      vi.mocked(stripe.webhooks.constructEvent).mockReturnValueOnce(mockEvent);

      const mockSubscription = createMockSubscription();
      vi.mocked(stripe.subscriptions.retrieve).mockResolvedValueOnce(
        mockSubscription
      );

      const mockUpsert = vi.fn(() => ({ select: vi.fn(), single: vi.fn() }));
      const mockInsert = vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({ catch: vi.fn() })),
        })),
      }));

      vi.mocked(supabaseAdmin.from).mockImplementation((table: string) => {
        if (table === 'subscriptions') {
          return { upsert: mockUpsert } as any;
        }
        if (table === 'usage_tracking') {
          return { insert: mockInsert } as any;
        }
        return {} as any;
      });

      const request = new Request('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        body: 'raw_body',
      });

      const response = await POST(request as any);

      expect(response.status).toBe(200);
      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'user_123',
          stripe_customer_id: mockSession.customer,
          stripe_subscription_id: mockSession.subscription,
          plan_name: 'starter',
          status: 'active',
        })
      );
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'user_123',
          plan_name: 'starter',
          analyses_used: 0,
          analyses_limit: 100,
        })
      );
    });

    it('should handle missing user_id gracefully', async () => {
      const mockSession = createMockCheckoutSession({
        metadata: {},
        client_reference_id: null,
      });

      const mockEvent: Stripe.Event = {
        id: 'evt_test',
        object: 'event',
        api_version: '2025-09-30.clover',
        created: Math.floor(Date.now() / 1000),
        data: { object: mockSession },
        livemode: false,
        pending_webhooks: 0,
        request: null,
        type: 'checkout.session.completed',
      };

      vi.mocked(stripe.webhooks.constructEvent).mockReturnValueOnce(mockEvent);

      const request = new Request('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        body: 'raw_body',
      });

      const response = await POST(request as any);

      expect(response.status).toBe(200);
      // Should still return success but not create records
    });

    it('should determine plan from price_id when metadata is missing', async () => {
      const mockSession = createMockCheckoutSession({
        metadata: { user_id: 'user_123' }, // No plan_name
      });

      const mockSubscription = createMockSubscription({
        items: {
          object: 'list',
          data: [
            {
              id: 'si_mock',
              object: 'subscription_item',
              price: {
                id: 'price_pro_mock', // Pro plan price
              } as any,
            } as any,
          ],
          has_more: false,
          url: '',
        },
      });

      const mockEvent: Stripe.Event = {
        id: 'evt_test',
        object: 'event',
        api_version: '2025-09-30.clover',
        created: Math.floor(Date.now() / 1000),
        data: { object: mockSession },
        livemode: false,
        pending_webhooks: 0,
        request: null,
        type: 'checkout.session.completed',
      };

      vi.mocked(stripe.webhooks.constructEvent).mockReturnValueOnce(mockEvent);
      vi.mocked(stripe.subscriptions.retrieve).mockResolvedValueOnce(
        mockSubscription
      );

      const mockUpsert = vi.fn(() => ({ select: vi.fn(), single: vi.fn() }));
      vi.mocked(supabaseAdmin.from).mockImplementation((table: string) => {
        if (table === 'subscriptions') {
          return { upsert: mockUpsert } as any;
        }
        return {
          insert: vi.fn(() => ({
            select: vi.fn(() => ({ single: vi.fn(() => ({ catch: vi.fn() })) })),
          })),
        } as any;
      });

      const request = new Request('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        body: 'raw_body',
      });

      await POST(request as any);

      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          plan_name: 'pro',
        })
      );
    });
  });

  describe('customer.subscription.updated', () => {
    it('should update subscription and usage tracking', async () => {
      const mockSubscription = createMockSubscription({
        id: 'sub_updated',
        status: 'active',
      });

      const mockEvent: Stripe.Event = {
        id: 'evt_test',
        object: 'event',
        api_version: '2025-09-30.clover',
        created: Math.floor(Date.now() / 1000),
        data: { object: mockSubscription },
        livemode: false,
        pending_webhooks: 0,
        request: null,
        type: 'customer.subscription.updated',
      };

      vi.mocked(stripe.webhooks.constructEvent).mockReturnValueOnce(mockEvent);

      const mockUpdate = vi.fn(() => ({ eq: vi.fn() }));
      const mockSelect = vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({ data: { user_id: 'user_123' } })),
        })),
      }));

      vi.mocked(supabaseAdmin.from).mockImplementation((table: string) => {
        if (table === 'subscriptions') {
          return { update: mockUpdate, select: mockSelect } as any;
        }
        if (table === 'usage_tracking') {
          return { update: vi.fn(() => ({ eq: vi.fn() })) } as any;
        }
        return {} as any;
      });

      const request = new Request('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        body: 'raw_body',
      });

      const response = await POST(request as any);

      expect(response.status).toBe(200);
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'active',
          plan_name: 'starter',
        })
      );
    });
  });

  describe('customer.subscription.deleted', () => {
    it('should mark subscription as canceled', async () => {
      const mockSubscription = createMockSubscription({
        id: 'sub_canceled',
        status: 'canceled',
      });

      const mockEvent: Stripe.Event = {
        id: 'evt_test',
        object: 'event',
        api_version: '2025-09-30.clover',
        created: Math.floor(Date.now() / 1000),
        data: { object: mockSubscription },
        livemode: false,
        pending_webhooks: 0,
        request: null,
        type: 'customer.subscription.deleted',
      };

      vi.mocked(stripe.webhooks.constructEvent).mockReturnValueOnce(mockEvent);

      const mockSelect = vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({ data: { user_id: 'user_123' } })),
        })),
      }));
      const mockUpdate = vi.fn(() => ({ eq: vi.fn() }));

      vi.mocked(supabaseAdmin.from).mockImplementation((table: string) => {
        if (table === 'subscriptions') {
          return { select: mockSelect, update: mockUpdate } as any;
        }
        return {} as any;
      });

      const request = new Request('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        body: 'raw_body',
      });

      const response = await POST(request as any);

      expect(response.status).toBe(200);
      expect(mockUpdate).toHaveBeenCalledWith({ status: 'canceled' });
    });
  });

  describe('invoice.paid', () => {
    it('should update subscription status and period on invoice paid', async () => {
      const mockInvoice = createMockInvoice({
        subscription: 'sub_mock123',
        status: 'paid',
      });

      const mockEvent: Stripe.Event = {
        id: 'evt_test',
        object: 'event',
        api_version: '2025-09-30.clover',
        created: Math.floor(Date.now() / 1000),
        data: { object: mockInvoice },
        livemode: false,
        pending_webhooks: 0,
        request: null,
        type: 'invoice.paid',
      };

      vi.mocked(stripe.webhooks.constructEvent).mockReturnValueOnce(mockEvent);

      const mockUpdate = vi.fn(() => ({ eq: vi.fn() }));
      vi.mocked(supabaseAdmin.from).mockReturnValueOnce({
        update: mockUpdate,
      } as any);

      const request = new Request('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        body: 'raw_body',
      });

      const response = await POST(request as any);

      expect(response.status).toBe(200);
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'active',
        })
      );
    });

    it('should ignore invoices without subscription', async () => {
      const mockInvoice = createMockInvoice({
        subscription: null,
      });

      const mockEvent: Stripe.Event = {
        id: 'evt_test',
        object: 'event',
        api_version: '2025-09-30.clover',
        created: Math.floor(Date.now() / 1000),
        data: { object: mockInvoice },
        livemode: false,
        pending_webhooks: 0,
        request: null,
        type: 'invoice.paid',
      };

      vi.mocked(stripe.webhooks.constructEvent).mockReturnValueOnce(mockEvent);

      const request = new Request('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        body: 'raw_body',
      });

      const response = await POST(request as any);

      expect(response.status).toBe(200);
      // Should not attempt to update subscription
    });
  });

  describe('invoice.payment_failed', () => {
    it('should mark subscription as past_due on payment failure', async () => {
      const mockInvoice = createMockInvoice({
        subscription: 'sub_mock123',
        status: 'open',
        attempted: true,
      });

      const mockEvent: Stripe.Event = {
        id: 'evt_test',
        object: 'event',
        api_version: '2025-09-30.clover',
        created: Math.floor(Date.now() / 1000),
        data: { object: mockInvoice },
        livemode: false,
        pending_webhooks: 0,
        request: null,
        type: 'invoice.payment_failed',
      };

      vi.mocked(stripe.webhooks.constructEvent).mockReturnValueOnce(mockEvent);

      const mockUpdate = vi.fn(() => ({ eq: vi.fn() }));
      vi.mocked(supabaseAdmin.from).mockReturnValueOnce({
        update: mockUpdate,
      } as any);

      const request = new Request('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        body: 'raw_body',
      });

      const response = await POST(request as any);

      expect(response.status).toBe(200);
      expect(mockUpdate).toHaveBeenCalledWith({ status: 'past_due' });
    });
  });

  describe('Error Handling', () => {
    it('should return 500 on handler errors', async () => {
      const mockEvent: Stripe.Event = {
        id: 'evt_test',
        object: 'event',
        api_version: '2025-09-30.clover',
        created: Math.floor(Date.now() / 1000),
        data: { object: createMockCheckoutSession() },
        livemode: false,
        pending_webhooks: 0,
        request: null,
        type: 'checkout.session.completed',
      };

      vi.mocked(stripe.webhooks.constructEvent).mockReturnValueOnce(mockEvent);
      vi.mocked(stripe.subscriptions.retrieve).mockRejectedValueOnce(
        new Error('Stripe API error')
      );

      const request = new Request('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        body: 'raw_body',
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Webhook handler failed');
    });
  });
});
