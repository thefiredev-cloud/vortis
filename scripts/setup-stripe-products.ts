/**
 * Script to create Stripe products and prices for Vortis
 * Run with: npx tsx scripts/setup-stripe-products.ts
 */

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

async function setupProducts() {
  console.log('🚀 Setting up Vortis Stripe products...\n');

  try {
    // Create Starter Product
    console.log('Creating Starter product...');
    const starterProduct = await stripe.products.create({
      name: 'Vortis Starter',
      description: 'Perfect for beginners exploring AI-powered stock analysis',
      metadata: {
        plan: 'starter',
      },
    });

    const starterPrice = await stripe.prices.create({
      product: starterProduct.id,
      unit_amount: 2900, // $29.00
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
      metadata: {
        plan: 'starter',
        features: JSON.stringify([
          '100 stock analyses per month',
          'Basic market insights',
          'Email support',
          'Daily market updates',
        ]),
      },
    });

    console.log(`✅ Starter created: ${starterPrice.id}\n`);

    // Create Pro Product
    console.log('Creating Pro product...');
    const proProduct = await stripe.products.create({
      name: 'Vortis Pro',
      description: 'For serious traders who need unlimited analysis and advanced features',
      metadata: {
        plan: 'pro',
      },
    });

    const proPrice = await stripe.prices.create({
      product: proProduct.id,
      unit_amount: 9900, // $99.00
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
      metadata: {
        plan: 'pro',
        features: JSON.stringify([
          'Unlimited analyses',
          'Advanced trading signals',
          'Real-time data feeds',
          'Priority processing',
          'Portfolio optimization',
          'Priority support (24/7)',
        ]),
      },
    });

    console.log(`✅ Pro created: ${proPrice.id}\n`);

    // Create Enterprise Product
    console.log('Creating Enterprise product...');
    const enterpriseProduct = await stripe.products.create({
      name: 'Vortis Enterprise',
      description: 'For institutions requiring custom models and dedicated support',
      metadata: {
        plan: 'enterprise',
      },
    });

    const enterprisePrice = await stripe.prices.create({
      product: enterpriseProduct.id,
      unit_amount: 29900, // $299.00
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
      metadata: {
        plan: 'enterprise',
        features: JSON.stringify([
          'Everything in Pro',
          'Custom AI models',
          'API access',
          'White-label options',
          'Dedicated support team',
          'Custom integrations',
        ]),
      },
    });

    console.log(`✅ Enterprise created: ${enterprisePrice.id}\n`);

    // Output environment variables
    console.log('📋 Add these to your .env.local file:\n');
    console.log(`STRIPE_STARTER_PRICE_ID=${starterPrice.id}`);
    console.log(`STRIPE_PRO_PRICE_ID=${proPrice.id}`);
    console.log(`STRIPE_ENTERPRISE_PRICE_ID=${enterprisePrice.id}`);
    console.log('\n✨ Stripe products created successfully!');
  } catch (error) {
    console.error('❌ Error creating products:', error);
    process.exit(1);
  }
}

setupProducts();
