import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

// Product price IDs - these will be created in Stripe
export const PRICING_PLANS = {
  starter: {
    name: 'Starter',
    priceId: process.env.STRIPE_STARTER_PRICE_ID!,
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
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
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
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID!,
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
