# Vortis Documentation

Complete documentation for the Vortis authentication and subscription system.

## Quick Navigation

### Getting Started
- **[Quick Start Guide](.quickstart/QUICK_START.md)** - 5-minute setup for development
- **[Environment Setup Instructions](./ENV_SETUP_INSTRUCTIONS.md)** - Complete .env.local configuration guide
- **[Environment Variables](./.env.example)** - Required configuration

### Google OAuth Authentication (NEW)
- **[Google OAuth Quick Start](./GOOGLE_AUTH_QUICKSTART.md)** - 5-minute OAuth setup
- **[Google OAuth Setup Guide](./GOOGLE_AUTH_SETUP.md)** - Complete configuration guide
- **[Google OAuth Testing](./GOOGLE_AUTH_TESTING.md)** - Comprehensive testing checklist
- **[Google OAuth Migration](./GOOGLE_AUTH_MIGRATION.md)** - Email to OAuth migration guide

### Stripe Setup
- **[Stripe Setup Summary](./STRIPE_SETUP_SUMMARY.md)** - Complete overview and quick reference
- **[Stripe Quick Start](./STRIPE_QUICK_START.md)** - 5-minute product setup
- **[Stripe Product Setup](./STRIPE_PRODUCT_SETUP.md)** - Comprehensive setup guide
- **[Stripe Testing Checklist](./STRIPE_TESTING_CHECKLIST.md)** - Complete testing procedures

### Cloudflare & Deployment (NEW)
- **[Cloudflare Quick Start](..cloudflare/CLOUDFLARE_QUICKSTART.md)** - Deploy in 30 minutes
- **[Deployment Checklist](..cloudflare/CLOUDFLARE_DEPLOYMENT_CHECKLIST.md)** - Step-by-step production deployment
- **[Vercel + Cloudflare Setup](./VERCEL_CLOUDFLARE_SETUP.md)** - Detailed configuration guide (RECOMMENDED)
- **[Deployment Options](./CLOUDFLARE_DEPLOYMENT.md)** - Compare Vercel, Cloudflare Pages, and Hybrid
- **[Configuration Reference](./CLOUDFLARE_CONFIG_REFERENCE.md)** - All Cloudflare settings explained
- **[Troubleshooting Guide](./CLOUDFLARE_TROUBLESHOOTING.md)** - Fix common issues
- **[Security & Performance](./CLOUDFLARE_SECURITY_PERFORMANCE.md)** - Advanced optimization

### Documentation
- **[Auth System Overview](./AUTH_SUMMARY.md)** - Complete system summary
- **[Full Documentation](./auth-system-documentation.md)** - Detailed technical guide
- **[Stripe Setup Guide](./stripe-setup-guide.md)** - Original payment integration guide
- **[Database Schema](./database-schema.sql)** - Complete database structure

## What's Implemented

### Authentication System
- Google OAuth 2.0 authentication (Google Sign-In only)
- Secure session management with HTTP-only cookies
- Protected route middleware
- OAuth callback handling
- Error handling and user feedback
- Mobile-responsive auth pages
- Accessibility compliant (WCAG AA)

### Subscription Management
- Stripe Checkout integration
- Multiple pricing tiers (Starter, Pro, Enterprise)
- Webhook event handling
- Customer portal access
- Usage tracking and limits
- Subscription status management

### Database Structure
- Complete PostgreSQL schema
- Row Level Security (RLS) policies
- Automatic triggers and functions
- Usage tracking system
- Payment history
- User profiles

### Security Features
- Row Level Security (RLS) on all tables
- Webhook signature verification
- CSRF protection
- Secure session handling
- Input validation
- Rate limiting ready

## File Structure

```
/docs
├── README.md                          # This file - main documentation index
├── QUICK_START.md                     # 5-minute development setup guide
├── AUTH_SUMMARY.md                    # Authentication system overview
├── auth-system-documentation.md       # Complete technical documentation
├── GOOGLE_AUTH_QUICKSTART.md          # 5-minute Google OAuth setup (NEW)
├── GOOGLE_AUTH_SETUP.md               # Complete OAuth configuration (NEW)
├── GOOGLE_AUTH_TESTING.md             # OAuth testing checklist (NEW)
├── GOOGLE_AUTH_MIGRATION.md           # Email to OAuth migration (NEW)
├── STRIPE_SETUP_SUMMARY.md            # Stripe setup overview
├── STRIPE_QUICK_START.md              # 5-minute Stripe product setup
├── STRIPE_PRODUCT_SETUP.md            # Comprehensive Stripe guide
├── STRIPE_TESTING_CHECKLIST.md        # Complete testing procedures
├── stripe-setup-guide.md              # Original Stripe integration guide
└── database-schema.sql                # Database schema & migrations
```

## Setup Instructions

### For Development

1. **Quick Setup** (5 minutes)
   ```bash
   # Follow the Quick Start Guide
   open docs/quickstart/QUICK_START.md
   ```

2. **Detailed Setup**
   - Read [auth-system-documentation.md](./auth-system-documentation.md)
   - Follow [stripe-setup-guide.md](./stripe-setup-guide.md)

### For Production

1. **Supabase Production Setup**
   - Create production project
   - Run [database-schema.sql](./database-schema.sql)
   - Configure email templates
   - Set redirect URLs

2. **Stripe Production Setup**
   - Switch to live mode
   - Create live products
   - Configure production webhook
   - Update environment variables

3. **Cloudflare Deployment** (RECOMMENDED)
   ```bash
   # Follow the Cloudflare Quick Start
   open docs/cloudflare/CLOUDFLARE_QUICKSTART.md

   # Or use the detailed checklist
   open docs/cloudflare/CLOUDFLARE_DEPLOYMENT_CHECKLIST.md
   ```
   - Deploy to Vercel
   - Configure Cloudflare DNS
   - Set up SSL/TLS (Full strict)
   - Configure caching rules
   - Update OAuth redirects
   - Test complete flow

## Key Features by File

### Authentication Routes

| Route | Purpose | Documentation |
|-------|---------|---------------|
| `/auth/login` | User login | [auth-system-documentation.md](./auth-system-documentation.md#sign-in) |
| `/auth/signup` | User registration | [auth-system-documentation.md](./auth-system-documentation.md#sign-up) |
| `/auth/callback` | Email verification | [auth-system-documentation.md](./auth-system-documentation.md#callback-handler) |

### API Routes

| Route | Purpose | Documentation |
|-------|---------|---------------|
| `/api/stripe/webhook` | Handle Stripe events | [auth-system-documentation.md](./auth-system-documentation.md#webhook-handler) |
| `/api/stripe/create-checkout` | Create checkout session | [stripe-setup-guide.md](./stripe-setup-guide.md#step-7-create-checkout-api-route) |
| `/api/stripe/create-portal` | Customer portal access | [stripe-setup-guide.md](./stripe-setup-guide.md#step-10-customer-portal-setup) |

### Protected Routes

| Route | Purpose | Documentation |
|-------|---------|---------------|
| `/dashboard` | Main dashboard | [auth-system-documentation.md](./auth-system-documentation.md#protected-dashboard) |
| `/dashboard/*` | All dashboard pages | [auth-system-documentation.md](./auth-system-documentation.md#middleware-route-protection) |

## Database Tables

| Table | Purpose | Documentation |
|-------|---------|---------------|
| `subscriptions` | User subscription data | [database-schema.sql](./database-schema.sql#L30) |
| `usage_tracking` | Usage limits & consumption | [database-schema.sql](./database-schema.sql#L71) |
| `stock_analyses` | Analysis history | [database-schema.sql](./database-schema.sql#L105) |
| `watchlist` | User watchlists | [database-schema.sql](./database-schema.sql#L132) |
| `user_profiles` | Extended user data | [database-schema.sql](./database-schema.sql#L162) |
| `payment_history` | Transaction records | [database-schema.sql](./database-schema.sql#L194) |

## Pricing Tiers

| Plan | Price | Analyses | Documentation |
|------|-------|----------|---------------|
| Free | $0 | 10/month | Default for new users |
| Starter | $29 | 100/month | [stripe-setup-guide.md](./stripe-setup-guide.md#12-create-starter-plan) |
| Pro | $99 | Unlimited | [stripe-setup-guide.md](./stripe-setup-guide.md#13-create-pro-plan) |
| Enterprise | $299 | Unlimited | [stripe-setup-guide.md](./stripe-setup-guide.md#14-create-enterprise-plan) |

## Environment Variables

### Required
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx...
STRIPE_WEBHOOK_SECRET=whsec_xxx...

# Stripe Price IDs
STRIPE_STARTER_PRICE_ID=price_xxx...
STRIPE_PRO_PRICE_ID=price_xxx...
STRIPE_ENTERPRISE_PRICE_ID=price_xxx...

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

See [.env.example](../.env.example) for complete list.

## Testing

### Test Checklist

**Authentication**:
- [ ] Sign up flow works
- [ ] Email verification works
- [ ] Login/logout works
- [ ] Protected routes work
- [ ] Session persistence works

**Subscriptions**:
- [ ] Checkout creates session
- [ ] Payment completes successfully
- [ ] Webhooks receive events
- [ ] Database updates correctly
- [ ] Usage tracking works
- [ ] Customer portal accessible

**Security**:
- [ ] RLS policies active
- [ ] Webhook signatures verified
- [ ] Unauthorized access blocked
- [ ] Sessions expire correctly

### Test Cards

**Success**: `4242 4242 4242 4242`
**Requires Auth**: `4000 0025 0000 3155`
**Declined**: `4000 0000 0000 9995`

See [stripe-setup-guide.md](./stripe-setup-guide.md#91-test-card-numbers) for complete list.

## Common Tasks

### Add Protected Route
```typescript
// In middleware.ts
const protectedPaths = ["/dashboard", "/your-new-route"];
```

### Check Subscription Status
```typescript
import { getSubscriptionStatus } from '@/lib/subscription-helpers';

const status = await getSubscriptionStatus(userId);
```

### Increment Usage
```typescript
import { incrementAnalysisUsage } from '@/lib/subscription-helpers';

await incrementAnalysisUsage(userId);
```

### Create Checkout Session
```typescript
<CheckoutButton
  planName="pro"
  priceId={PRICING_PLANS.pro.priceId}
  className="..."
>
  Subscribe
</CheckoutButton>
```

## Troubleshooting

### Common Issues

**Webhook Signature Failed**
- Verify webhook secret in `.env.local`
- Check Stripe CLI is running
- Ensure endpoint URL is correct

**Database Permission Denied**
- Check RLS policies
- Verify user is authenticated
- Use service_role for admin operations

**Session Not Persisting**
- Clear browser cookies
- Check middleware configuration
- Verify Supabase credentials

**Checkout Fails**
- Verify price IDs are correct
- Check Stripe keys are valid
- Ensure user is authenticated

See [auth-system-documentation.md](./auth-system-documentation.md#troubleshooting) for more.

## Architecture

```
┌─────────────────────────────────────────┐
│           User Browser                   │
└─────────────────────────────────────────┘
                  │
    ┌─────────────┼─────────────┐
    │             │             │
    ▼             ▼             ▼
[Public]    [Auth Pages]  [Protected]
[Routes]    [/auth/*]     [/dashboard]
    │             │             │
    │             ▼             │
    │      [Supabase Auth]      │
    │             │             │
    └─────────────┼─────────────┘
                  │
         [Middleware Check]
                  │
    ┌─────────────┼─────────────┐
    │             │             │
    ▼             ▼             ▼
[Supabase]   [Stripe]      [Database]
[Auth API]   [Checkout]    [PostgreSQL]
                  │
            [Webhooks]
                  │
           [Update DB]
```

## Resources

### Internal Documentation
- [Quick Start](.quickstart/QUICK_START.md)
- [Auth System](./auth-system-documentation.md)
- [Stripe Guide](./stripe-setup-guide.md)
- [Database Schema](./database-schema.sql)
- [System Summary](./AUTH_SUMMARY.md)

### External Resources
- [Supabase Documentation](https://supabase.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [Next.js 15 Docs](https://nextjs.org/docs)
- [Stripe Testing](https://stripe.com/docs/testing)

### Support
- Check relevant documentation
- Review console/server logs
- Check Stripe Dashboard logs
- Review Supabase logs

## Contributing

When making changes:

1. Update relevant documentation
2. Test thoroughly
3. Update this README if needed
4. Document breaking changes

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-10-09 | Initial complete implementation |

## Status

**System Status**: Production Ready
**Last Updated**: 2025-10-09
**Documentation**: Complete

## Next Steps

1. **Development**
   - Follow [QUICK_START.md](.quickstart/QUICK_START.md)
   - Test all features
   - Customize as needed

2. **Production**
   - Review [auth-system-documentation.md](./auth-system-documentation.md)
   - Follow production deployment steps
   - Set up monitoring

3. **Maintenance**
   - Monitor webhooks
   - Review usage patterns
   - Update dependencies
   - Backup database

---

For questions or issues, refer to the specific documentation files linked above.
