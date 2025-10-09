#!/usr/bin/env tsx

/**
 * Environment Variable Validation Script
 *
 * Validates that all required environment variables are properly set
 * and checks for common configuration issues.
 *
 * Usage:
 *   npx tsx scripts/check-env.ts
 *   npm run check-env (if added to package.json scripts)
 */

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  info: string[];
}

interface EnvCheck {
  key: string;
  required: boolean;
  validator?: (value: string) => string | null;
  description: string;
}

const envChecks: EnvCheck[] = [
  // Supabase Configuration
  {
    key: 'NEXT_PUBLIC_SUPABASE_URL',
    required: true,
    validator: (val) => {
      if (!val.startsWith('https://')) return 'Must start with https://';
      if (!val.includes('.supabase.co')) return 'Must be a valid Supabase URL';
      if (val.includes('your-project-id')) return 'Contains placeholder value';
      return null;
    },
    description: 'Supabase project URL',
  },
  {
    key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    required: true,
    validator: (val) => {
      if (val.length < 100) return 'Supabase anon key should be longer';
      if (val.includes('your-supabase-anon-key')) return 'Contains placeholder value';
      if (!val.startsWith('eyJ')) return 'Should start with eyJ (JWT format)';
      return null;
    },
    description: 'Supabase anonymous key',
  },

  // Stripe Configuration
  {
    key: 'STRIPE_SECRET_KEY',
    required: true,
    validator: (val) => {
      if (!val.startsWith('sk_')) return 'Must start with sk_';
      if (val.startsWith('sk_live_') && process.env.NODE_ENV !== 'production') {
        return 'WARNING: Using live key in non-production environment';
      }
      if (val.includes('your_stripe_secret_key')) return 'Contains placeholder value';
      return null;
    },
    description: 'Stripe secret key (server-side)',
  },
  {
    key: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    required: true,
    validator: (val) => {
      if (!val.startsWith('pk_')) return 'Must start with pk_';
      if (val.startsWith('pk_live_') && process.env.NODE_ENV !== 'production') {
        return 'WARNING: Using live key in non-production environment';
      }
      if (val.includes('your_stripe_publishable_key')) return 'Contains placeholder value';
      return null;
    },
    description: 'Stripe publishable key (client-side)',
  },
  {
    key: 'STRIPE_WEBHOOK_SECRET',
    required: true,
    validator: (val) => {
      if (!val.startsWith('whsec_')) return 'Must start with whsec_';
      if (val.includes('your_webhook_secret')) return 'Contains placeholder value';
      return null;
    },
    description: 'Stripe webhook signing secret',
  },

  // Stripe Price IDs
  {
    key: 'STRIPE_STARTER_PRICE_ID',
    required: true,
    validator: (val) => {
      if (!val.startsWith('price_')) return 'Must start with price_';
      if (val.includes('your_starter_price_id')) return 'Contains placeholder value';
      return null;
    },
    description: 'Stripe Starter plan price ID',
  },
  {
    key: 'STRIPE_PRO_PRICE_ID',
    required: true,
    validator: (val) => {
      if (!val.startsWith('price_')) return 'Must start with price_';
      if (val.includes('your_pro_price_id')) return 'Contains placeholder value';
      return null;
    },
    description: 'Stripe Pro plan price ID',
  },
  {
    key: 'STRIPE_ENTERPRISE_PRICE_ID',
    required: true,
    validator: (val) => {
      if (!val.startsWith('price_')) return 'Must start with price_';
      if (val.includes('your_enterprise_price_id')) return 'Contains placeholder value';
      return null;
    },
    description: 'Stripe Enterprise plan price ID',
  },

  // Application Configuration
  {
    key: 'NEXT_PUBLIC_APP_URL',
    required: true,
    validator: (val) => {
      try {
        const url = new URL(val);
        if (process.env.NODE_ENV === 'production' && url.protocol !== 'https:') {
          return 'Should use HTTPS in production';
        }
        return null;
      } catch {
        return 'Must be a valid URL';
      }
    },
    description: 'Application base URL',
  },

  // Optional External APIs
  {
    key: 'ALPHA_VANTAGE_API_KEY',
    required: false,
    description: 'Alpha Vantage API key for stock data',
  },
  {
    key: 'FMP_API_KEY',
    required: false,
    description: 'Financial Modeling Prep API key',
  },
  {
    key: 'POLYGON_API_KEY',
    required: false,
    description: 'Polygon.io API key',
  },

  // Optional Email
  {
    key: 'RESEND_API_KEY',
    required: false,
    validator: (val) => {
      if (val && !val.startsWith('re_')) return 'Should start with re_';
      return null;
    },
    description: 'Resend.com API key',
  },

  // Optional Monitoring
  {
    key: 'NEXT_PUBLIC_SENTRY_DSN',
    required: false,
    validator: (val) => {
      if (val && !val.startsWith('https://')) return 'Should be an HTTPS URL';
      return null;
    },
    description: 'Sentry DSN for error tracking',
  },
  {
    key: 'NEXT_PUBLIC_GA_MEASUREMENT_ID',
    required: false,
    validator: (val) => {
      if (val && !val.startsWith('G-')) return 'Should start with G-';
      return null;
    },
    description: 'Google Analytics measurement ID',
  },
];

function validateEnvironment(): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
    info: [],
  };

  console.log('\n🔍 Validating environment variables...\n');

  // Check if .env.local exists
  const fs = require('fs');
  const path = require('path');
  const envLocalPath = path.join(process.cwd(), '.env.local');

  if (!fs.existsSync(envLocalPath)) {
    result.errors.push('.env.local file not found. Copy .env.example to .env.local');
    result.valid = false;
  } else {
    result.info.push('.env.local file found');
  }

  // Validate each environment variable
  for (const check of envChecks) {
    const value = process.env[check.key];

    if (!value) {
      if (check.required) {
        result.errors.push(`${check.key} is required but not set (${check.description})`);
        result.valid = false;
      } else {
        result.info.push(`${check.key} is optional and not set (${check.description})`);
      }
      continue;
    }

    // Run custom validator if provided
    if (check.validator) {
      const validationError = check.validator(value);
      if (validationError) {
        if (validationError.startsWith('WARNING:')) {
          result.warnings.push(`${check.key}: ${validationError}`);
        } else {
          result.errors.push(`${check.key}: ${validationError}`);
          result.valid = false;
        }
      } else {
        result.info.push(`${check.key}: ✓ Valid`);
      }
    } else {
      result.info.push(`${check.key}: ✓ Set`);
    }
  }

  // Cross-validation checks
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
  const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';

  if (stripeSecretKey && stripePublishableKey) {
    const secretIsTest = stripeSecretKey.startsWith('sk_test_');
    const publishableIsTest = stripePublishableKey.startsWith('pk_test_');

    if (secretIsTest !== publishableIsTest) {
      result.errors.push('Stripe keys mismatch: secret and publishable keys must both be test or both be live');
      result.valid = false;
    }
  }

  return result;
}

function printResults(result: ValidationResult) {
  console.log('\n' + '='.repeat(60));
  console.log('Environment Validation Results');
  console.log('='.repeat(60) + '\n');

  if (result.errors.length > 0) {
    console.log('❌ ERRORS:\n');
    result.errors.forEach((error) => console.log(`  - ${error}`));
    console.log('');
  }

  if (result.warnings.length > 0) {
    console.log('⚠️  WARNINGS:\n');
    result.warnings.forEach((warning) => console.log(`  - ${warning}`));
    console.log('');
  }

  if (result.valid) {
    console.log('✅ All required environment variables are properly configured!\n');

    if (result.info.length > 0 && process.argv.includes('--verbose')) {
      console.log('ℹ️  DETAILS:\n');
      result.info.forEach((info) => console.log(`  - ${info}`));
      console.log('');
    }
  } else {
    console.log('❌ Environment validation failed. Please fix the errors above.\n');
  }

  console.log('='.repeat(60) + '\n');
}

function printSetupGuide() {
  console.log('📋 Quick Setup Guide:\n');
  console.log('1. Copy .env.example to .env.local:');
  console.log('   cp .env.example .env.local\n');
  console.log('2. Get Supabase credentials:');
  console.log('   - Visit https://supabase.com/dashboard');
  console.log('   - Select your project');
  console.log('   - Go to Settings > API');
  console.log('   - Copy URL and anon key\n');
  console.log('3. Get Stripe credentials:');
  console.log('   - Visit https://dashboard.stripe.com/apikeys');
  console.log('   - Use test keys (sk_test_... and pk_test_...)');
  console.log('   - Create webhook endpoint at /api/stripe/webhook');
  console.log('   - Get webhook secret (whsec_...)\n');
  console.log('4. Create Stripe products:');
  console.log('   - Run: npx tsx scripts/setup-stripe-products.ts');
  console.log('   - Or manually create in Stripe Dashboard\n');
  console.log('5. Validate configuration:');
  console.log('   - Run: npx tsx scripts/check-env.ts\n');
}

// Main execution
function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log('\nEnvironment Variable Validation Tool\n');
    console.log('Usage: npx tsx scripts/check-env.ts [options]\n');
    console.log('Options:');
    console.log('  --help, -h      Show this help message');
    console.log('  --verbose, -v   Show detailed validation info');
    console.log('  --guide, -g     Show setup guide');
    console.log('');
    return;
  }

  if (args.includes('--guide') || args.includes('-g')) {
    printSetupGuide();
    return;
  }

  const result = validateEnvironment();
  printResults(result);

  if (!result.valid) {
    console.log('Need help? Run: npx tsx scripts/check-env.ts --guide\n');
    process.exit(1);
  }

  process.exit(0);
}

main();
