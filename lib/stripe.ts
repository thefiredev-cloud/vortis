import Stripe from 'stripe';

export const STRIPE_ENABLED = Boolean(
  process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.startsWith('sk_')
);

// Use placeholder key for build time if not configured
const STRIPE_KEY = STRIPE_ENABLED
  ? process.env.STRIPE_SECRET_KEY as string
  : 'sk_test_placeholder_key_for_build';

export const stripe: Stripe | null = STRIPE_ENABLED
  ? new Stripe(STRIPE_KEY, {
      apiVersion: '2025-09-30.clover',
      typescript: true,
    })
  : null;

// Product price IDs - these will be created in Stripe
export const PRICING_PLANS = {
  starter: {
    name: 'Starter',
    priceId: process.env.STRIPE_STARTER_PRICE_ID || '',
    price: 29,
    currency: 'usd',
    interval: 'month',
    features: [
      '100 stock analyses per month',
      'Basic market insights',
      'Email support',
      'Daily market updates',
    ],
    limits: {
      analyses: 100,
      realTimeData: false,
      advancedSignals: false,
      priorityProcessing: false,
      apiAccess: false,
    },
  },
  pro: {
    name: 'Pro',
    priceId: process.env.STRIPE_PRO_PRICE_ID || '',
    price: 99,
    currency: 'usd',
    interval: 'month',
    features: [
      'Unlimited analyses',
      'Advanced trading signals',
      'Real-time data feeds',
      'Priority processing',
      'Portfolio optimization',
      'Priority support (24/7)',
    ],
    limits: {
      analyses: -1, // unlimited
      realTimeData: true,
      advancedSignals: true,
      priorityProcessing: true,
      apiAccess: false,
    },
  },
  enterprise: {
    name: 'Enterprise',
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || '',
    price: 299,
    currency: 'usd',
    interval: 'month',
    features: [
      'Everything in Pro',
      'Custom AI models',
      'API access',
      'White-label options',
      'Dedicated support team',
      'Custom integrations',
    ],
    limits: {
      analyses: -1, // unlimited
      realTimeData: true,
      advancedSignals: true,
      priorityProcessing: true,
      apiAccess: true,
      customModels: true,
      dedicatedSupport: true,
    },
  },
} as const;

export type PlanName = keyof typeof PRICING_PLANS;
