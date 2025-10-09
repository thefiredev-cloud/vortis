import { http, HttpResponse } from 'msw';

export const handlers = [
  // Supabase mock handlers
  http.post('http://localhost:54321/rest/v1/subscriptions', () => {
    return HttpResponse.json([
      {
        id: 1,
        user_id: 'user_123',
        stripe_customer_id: 'cus_mock',
        stripe_subscription_id: 'sub_mock',
        stripe_price_id: 'price_starter_mock',
        plan_name: 'starter',
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        cancel_at_period_end: false,
      },
    ]);
  }),

  http.patch('http://localhost:54321/rest/v1/subscriptions', () => {
    return HttpResponse.json([
      {
        id: 1,
        status: 'active',
      },
    ]);
  }),

  http.post('http://localhost:54321/rest/v1/usage_tracking', () => {
    return HttpResponse.json([
      {
        id: 1,
        user_id: 'user_123',
        plan_name: 'starter',
        analyses_used: 0,
        analyses_limit: 100,
        period_start: new Date().toISOString(),
        period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ]);
  }),

  http.get('http://localhost:54321/rest/v1/subscriptions', () => {
    return HttpResponse.json([
      {
        user_id: 'user_123',
      },
    ]);
  }),
];
