import '@testing-library/jest-dom';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { server } from './mocks/server';

// Establish API mocking before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests
afterEach(() => server.resetHandlers());

// Clean up after the tests are finished
afterAll(() => server.close());

// Mock environment variables
process.env.STRIPE_SECRET_KEY = 'sk_test_mock';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_mock';
process.env.STRIPE_STARTER_PRICE_ID = 'price_starter_mock';
process.env.STRIPE_PRO_PRICE_ID = 'price_pro_mock';
process.env.STRIPE_ENTERPRISE_PRICE_ID = 'price_enterprise_mock';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock_service_role_key';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'mock_anon_key';
