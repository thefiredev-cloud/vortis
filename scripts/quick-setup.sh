#!/bin/bash

# Vortis Quick Setup Script
# This script helps you quickly configure your environment

set -e  # Exit on error

echo ""
echo "======================================"
echo "  Vortis Environment Quick Setup"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo -e "${RED}Error: .env.local not found${NC}"
    echo "Please copy .env.example to .env.local first:"
    echo "  cp .env.example .env.local"
    exit 1
fi

echo -e "${GREEN}✓${NC} .env.local found"
echo ""

# Function to check if a variable is set and not a placeholder
check_var() {
    local var_name=$1
    local placeholder=$2
    local value=$(grep "^$var_name=" .env.local | cut -d '=' -f2-)

    if [ -z "$value" ] || [ "$value" = "$placeholder" ]; then
        return 1
    else
        return 0
    fi
}

echo "Checking configuration status..."
echo ""

# Check Supabase
echo -e "${BLUE}Supabase Configuration:${NC}"
if check_var "NEXT_PUBLIC_SUPABASE_URL" "https://your-project-id.supabase.co"; then
    echo -e "  ${GREEN}✓${NC} NEXT_PUBLIC_SUPABASE_URL configured"
else
    echo -e "  ${YELLOW}⚠${NC} NEXT_PUBLIC_SUPABASE_URL needs configuration"
    echo "    Get from: https://supabase.com/dashboard > Settings > API"
fi

if check_var "NEXT_PUBLIC_SUPABASE_ANON_KEY" "your-supabase-anon-key-here"; then
    echo -e "  ${GREEN}✓${NC} NEXT_PUBLIC_SUPABASE_ANON_KEY configured"
else
    echo -e "  ${YELLOW}⚠${NC} NEXT_PUBLIC_SUPABASE_ANON_KEY needs configuration"
    echo "    Get from: https://supabase.com/dashboard > Settings > API"
fi

echo ""

# Check Stripe
echo -e "${BLUE}Stripe Configuration:${NC}"
if check_var "STRIPE_SECRET_KEY" "sk_test_your_stripe_secret_key_here"; then
    echo -e "  ${GREEN}✓${NC} STRIPE_SECRET_KEY configured"
else
    echo -e "  ${YELLOW}⚠${NC} STRIPE_SECRET_KEY needs configuration"
    echo "    Get from: https://dashboard.stripe.com/apikeys"
fi

if check_var "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" "pk_test_your_stripe_publishable_key_here"; then
    echo -e "  ${GREEN}✓${NC} NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY configured"
else
    echo -e "  ${YELLOW}⚠${NC} NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY needs configuration"
    echo "    Get from: https://dashboard.stripe.com/apikeys"
fi

if check_var "STRIPE_WEBHOOK_SECRET" "whsec_your_webhook_secret_here"; then
    echo -e "  ${GREEN}✓${NC} STRIPE_WEBHOOK_SECRET configured"
else
    echo -e "  ${YELLOW}⚠${NC} STRIPE_WEBHOOK_SECRET needs configuration"
    echo "    Run: stripe listen --forward-to localhost:3000/api/stripe/webhook"
fi

echo ""

# Check Stripe Price IDs
echo -e "${BLUE}Stripe Price IDs:${NC}"
if check_var "STRIPE_STARTER_PRICE_ID" "price_your_starter_price_id"; then
    echo -e "  ${GREEN}✓${NC} STRIPE_STARTER_PRICE_ID configured"
else
    echo -e "  ${YELLOW}⚠${NC} STRIPE_STARTER_PRICE_ID needs configuration"
    echo "    Run: npx tsx scripts/setup-stripe-products.ts"
fi

if check_var "STRIPE_PRO_PRICE_ID" "price_your_pro_price_id"; then
    echo -e "  ${GREEN}✓${NC} STRIPE_PRO_PRICE_ID configured"
else
    echo -e "  ${YELLOW}⚠${NC} STRIPE_PRO_PRICE_ID needs configuration"
fi

if check_var "STRIPE_ENTERPRISE_PRICE_ID" "price_your_enterprise_price_id"; then
    echo -e "  ${GREEN}✓${NC} STRIPE_ENTERPRISE_PRICE_ID configured"
else
    echo -e "  ${YELLOW}⚠${NC} STRIPE_ENTERPRISE_PRICE_ID needs configuration"
fi

echo ""
echo "======================================"
echo ""

# Offer to run validation
echo "Would you like to run the full validation script? (y/n)"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo ""
    npx tsx scripts/check-env.ts
fi

echo ""
echo "======================================"
echo "  Setup Resources"
echo "======================================"
echo ""
echo "Full Documentation:"
echo "  docs/ENV_SETUP_INSTRUCTIONS.md"
echo ""
echo "Status Summary:"
echo "  ENV_SETUP_STATUS.md"
echo ""
echo "Validation:"
echo "  npx tsx scripts/check-env.ts"
echo ""
echo "Create Stripe Products:"
echo "  npx tsx scripts/setup-stripe-products.ts"
echo ""
echo "======================================"
echo ""
