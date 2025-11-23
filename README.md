# VORTIS

Revolutionary AI-powered stock trading intelligence platform providing comprehensive SEC filing analysis, earnings transcript insights, and real-time technical indicators for 8,000+ public companies.

## 🚀 Project Status

**Build**: ✅ Passing | **Tests**: ✅ 76/87 (88%) | **Security**: ✅ No vulnerabilities | **Deploy Ready**: ⚠️ Pending DB migrations

## ✨ Features

### Core Capabilities
- **📄 SEC Filing Analysis**: Instant insights from 10-K, 10-Q, and 8-K filings across 10+ years
- **🎤 Earnings Call Transcripts**: AI-powered sentiment analysis of management commentary
- **📊 20+ Technical Indicators**: RSI, MACD, Bollinger Bands, Moving Averages, and more
- **🏢 Institutional Holdings**: Track 13F filings and hedge fund positions
- **🔍 Private Company Data**: Research 3M+ private companies and 500K+ funding rounds (Enterprise)
- **⚡ Real-Time Updates**: Live market data with instant analysis

### Platform Features
- **🔐 Secure Authentication**: Clerk-powered user management with OAuth support
- **💳 Flexible Payments**: Stripe integration with multiple subscription tiers
- **🛡️ Rate Limiting**: Built-in protection against abuse (upgradeable to Redis)
- **📱 Mobile Optimized**: Responsive design with iOS-specific optimizations
- **🎨 Modern UI**: Dark mode with glassmorphic design and smooth animations
- **🔔 Smart Alerts**: Customizable watchlist alerts for price, volume, and trends

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - Latest React features
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Lucide Icons** - Modern icon library

### Backend & Services
- **Clerk** - Authentication & user management
- **Supabase** - PostgreSQL database with RLS
- **Stripe** - Payment processing
- **Vercel/Netlify** - Hosting & deployment

### Development & Testing
- **Vitest** - Unit & integration testing (88% pass rate)
- **ESLint** - Code quality & linting
- **TypeScript** - Static type checking

## 📦 Quick Start

### Prerequisites
- Node.js 22+
- npm or yarn
- Supabase account (for database)
- Clerk account (for authentication)
- Stripe account (for payments - optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/thefiredev-cloud/vortis.git
   cd vortis
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and fill in your credentials:
   - Clerk keys (from https://dashboard.clerk.com)
   - Supabase URL & keys (from https://supabase.com/dashboard)
   - Stripe keys (from https://dashboard.stripe.com) - optional
   - Set `NEXT_PUBLIC_APP_URL=http://localhost:3000`

4. **Apply database migrations**

   See [Database Setup](#-database-setup) section below

5. **Run development server**
   ```bash
   npm run dev
   ```

6. **Open the application**

   Navigate to [http://localhost:3000](http://localhost:3000)

## 🗄️ Database Setup

The application requires 6 database migrations to be applied via the Supabase Dashboard:

1. Navigate to your Supabase project SQL Editor
2. Apply migrations in order from `/supabase/migrations/`:
   - `20251009000001_enhance_core_schema.sql`
   - `20251009000002_create_api_usage_table.sql`
   - `20251009000003_create_user_preferences_table.sql`
   - `20251009000004_create_watchlist_alerts_table.sql`
   - `20251009000005_create_admin_views_functions.sql`
   - `20250109_clerk_database_functions.sql`

**Detailed instructions**: See `/supabase/migrations/README.md`

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

**Current Status**: 76/87 tests passing (88% pass rate)
- ✅ All Stripe webhook tests passing
- ✅ All rate limiting tests passing
- ⚠️ Some Clerk E2E tests require running dev server

## 🏗️ Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

**Note**: The build process works without configured API keys, enabling:
- UI-only mode for development
- Builds in CI/CD without secrets
- Graceful feature degradation

## 🚀 Deployment

### Deploy to Production

**Pre-requisites**:
1. Apply all database migrations (see [Database Setup](#-database-setup))
2. Configure environment variables on your hosting platform
3. Set up Stripe and Clerk webhooks

**Deployment Options**:
- **Netlify** (Recommended - config included)
- **Vercel**
- **Self-hosted** (Node.js 22+)

**Complete Guide**: See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for step-by-step instructions.

### Post-Deployment Checklist
- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] Stripe webhooks configured
- [ ] Clerk webhooks configured
- [ ] Test authentication flow
- [ ] Test payment flow (Stripe test mode)
- [ ] Verify rate limiting works
- [ ] Monitor error logs

## 💰 Pricing Plans

### Starter - $29/month
- 100 stock analyses per month
- SEC filing summaries (last 2 years)
- 5 technical indicators
- Email support
- Daily market updates

### Pro - $99/month (Most Popular)
- **Unlimited analyses**
- Full SEC filing access (10 years)
- 20+ technical indicators
- Earnings transcript analysis
- 13F institutional holdings
- Real-time alerts (SMS + Email)
- Portfolio optimization
- Priority support (24/7)

### Enterprise - $299/month
- Everything in Pro
- Private company data (3M+ companies)
- Funding round tracking (500K+ deals)
- M&A transaction database
- Full API access
- Custom research requests
- Dedicated account manager
- White-label options

## 📚 Documentation

- **[Deployment Guide](./DEPLOYMENT_GUIDE.md)** - Complete deployment instructions
- **[Environment Setup](./docs/ENVIRONMENT_SETUP.md)** - Environment variable configuration
- **[Production Guide](./docs/PRODUCTION_DEPLOYMENT.md)** - Production deployment checklist
- **[Rate Limiting](./docs/RATE_LIMITING.md)** - Rate limiting configuration
- **[Migration Guide](./supabase/migrations/README.md)** - Database migration instructions
- **[Quick Start](./docs/quickstart/QUICK_START.md)** - Getting started guide

## 🤝 Contributing

This is a proprietary project. External contributions are not currently accepted.

## 📄 License

Proprietary - All rights reserved

## 🆘 Support

For support inquiries:
- Email: support@vortis.ai
- Documentation: `/docs` directory
- Issues: Check deployment logs and documentation first

---

**Built with ❤️ using Next.js, Clerk, Supabase, and Stripe**

Last Updated: October 25, 2025
