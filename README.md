<div align="center">

# 📈 VORTIS

### Revolutionary AI-Powered Stock Trading Intelligence Platform

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Claude AI](https://img.shields.io/badge/Claude-Sonnet%204.5-orange)](https://anthropic.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3FCF8E?logo=supabase)](https://supabase.com/)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF?logo=stripe)](https://stripe.com/)
[![License](https://img.shields.io/badge/License-Proprietary-red)]()

**Harness the power of Claude Sonnet 4.5 and Octagon MCP for intelligent stock market analysis and trading signals.**

[Live Demo](https://vortis.ai) · [Documentation](#documentation) · [Report Bug](https://github.com/thefiredev-cloud/vortis/issues)

</div>

---

## 🎯 Overview

Vortis is an enterprise-grade stock trading intelligence platform that combines cutting-edge AI with real-time market data to deliver actionable trading insights. Built for traders who demand accuracy and speed.

### Why Vortis?

- **AI-First Architecture** - Claude Sonnet 4.5 provides institutional-grade analysis
- - **Real-Time Intelligence** - Live market data via Octagon MCP integration
  - - **Production Ready** - Built with Next.js 15, React 19, and TypeScript
    - - **Secure & Scalable** - Enterprise authentication and database infrastructure
     
      - ---

      ## ✨ Features

      ### 🤖 AI-Powered Analysis
      Leverage Claude Sonnet 4.5's advanced reasoning capabilities for deep stock market analysis, pattern recognition, and predictive insights.

      ### 📊 Real-Time Market Data
      Access live market data through Octagon MCP integration - SEC filings, earnings transcripts, financial metrics, and more.

      ### 📈 Smart Trading Signals
      Get actionable buy/sell signals based on technical analysis, fundamental data, and AI-powered sentiment analysis.

      ### 🛡️ Risk Management
      Advanced algorithms to protect your investments with stop-loss recommendations, portfolio diversification insights, and risk scoring.

      ### 🎁 Free Trial
      Experience the platform with 1 free comprehensive stock analysis before subscribing.

      ---

      ## 🏗️ Architecture

      ```
      ┌─────────────────────────────────────────────────────────────┐
      │                     VORTIS PLATFORM                         │
      ├─────────────────────────────────────────────────────────────┤
      │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
      │  │   Next.js   │  │   Claude    │  │    Octagon MCP      │ │
      │  │   Frontend  │──│  Sonnet 4.5 │──│  (Market Data API)  │ │
      │  └─────────────┘  └─────────────┘  └─────────────────────┘ │
      │         │                │                    │            │
      │         ▼                ▼                    ▼            │
      │  ┌─────────────────────────────────────────────────────┐   │
      │  │              Supabase (PostgreSQL + Auth)           │   │
      │  └─────────────────────────────────────────────────────┘   │
      │         │                                                   │
      │         ▼                                                   │
      │  ┌─────────────────────────────────────────────────────┐   │
      │  │                 Stripe Payments                      │   │
      │  └─────────────────────────────────────────────────────┘   │
      └─────────────────────────────────────────────────────────────┘
      ```

      ---

      ## 🛠️ Tech Stack

      | Layer | Technology | Purpose |
      |-------|------------|---------|
      | **Frontend** | Next.js 15, React 19 | Server-side rendering, App Router |
      | **Language** | TypeScript 5.0 | Type-safe development |
      | **Styling** | Tailwind CSS | Utility-first styling |
      | **AI Engine** | Claude Sonnet 4.5 | Market analysis & insights |
      | **Market Data** | Octagon MCP | SEC filings, earnings, metrics |
      | **Authentication** | Supabase Auth | Secure user management |
      | **Database** | Supabase PostgreSQL | Scalable data storage |
      | **Payments** | Stripe | Subscription management |
      | **Hosting** | Netlify | Edge deployment & CDN |

      ---

      ## 🚀 Getting Started

      ### Prerequisites

      - Node.js 18+
      - - npm or yarn
        - - Supabase account
          - - Stripe account (for payments)
            - - Anthropic API key
              - - Octagon API key
               
                - ### Installation
               
                - ```bash
                  # Clone the repository
                  git clone https://github.com/thefiredev-cloud/vortis.git
                  cd vortis

                  # Install dependencies
                  npm install

                  # Set up environment variables
                  cp .env.local.example .env.local
                  ```

                  ### Environment Variables

                  ```env
                  # Supabase
                  NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
                  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
                  SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

                  # Stripe
                  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
                  STRIPE_SECRET_KEY=your_stripe_secret_key
                  STRIPE_WEBHOOK_SECRET=your_webhook_secret

                  # AI & Data
                  ANTHROPIC_API_KEY=your_anthropic_api_key
                  OCTAGON_API_KEY=your_octagon_api_key

                  # App
                  NEXT_PUBLIC_APP_URL=http://localhost:3000
                  ```

                  ### Run Development Server

                  ```bash
                  npm run dev
                  ```

                  Open [http://localhost:3000](http://localhost:3000) in your browser.

                  ---

                  ## 💰 Pricing Plans

                  <div align="center">

                  | Feature | Starter | Pro | Enterprise |
                  |---------|:-------:|:---:|:----------:|
                  | **Price** | $29/mo | $99/mo | $299/mo |
                  | **Analyses** | 100/month | Unlimited | Unlimited |
                  | **Market Insights** | Basic | Advanced | Advanced |
                  | **Trading Signals** | ❌ | ✅ | ✅ |
                  | **Real-time Data** | ❌ | ✅ | ✅ |
                  | **Portfolio Optimization** | ❌ | ✅ | ✅ |
                  | **Custom AI Models** | ❌ | ❌ | ✅ |
                  | **API Access** | ❌ | ❌ | ✅ |
                  | **White-label** | ❌ | ❌ | ✅ |
                  | **Support** | Email | 24/7 Priority | Dedicated Team |

                  </div>

                  ---

                  ## 📖 Documentation

                  - [API Reference](docs/api.md)
                  - - [Authentication Guide](docs/auth.md)
                    - - [Deployment Guide](docs/deployment.md)
                      - - [Contributing Guide](CONTRIBUTING.md)
                       
                        - ---

                        ## 🔒 Security

                        - All data encrypted at rest and in transit
                        - - SOC 2 compliant infrastructure
                          - - Regular security audits
                            - - GDPR compliant data handling
                             
                              - ---

                              ## 🤝 Contributing

                              We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

                              1. Fork the repository
                              2. 2. Create your feature branch (`git checkout -b feature/amazing-feature`)
                                 3. 3. Commit your changes (`git commit -m 'Add amazing feature'`)
                                    4. 4. Push to the branch (`git push origin feature/amazing-feature`)
                                       5. 5. Open a Pull Request
                                         
                                          6. ---
                                         
                                          7. ## 📞 Support
                                         
                                          8. - **Email**: support@vortis.ai
                                             - - **Documentation**: [docs.vortis.ai](https://docs.vortis.ai)
                                               - - **Issues**: [GitHub Issues](https://github.com/thefiredev-cloud/vortis/issues)
                                                
                                                 - ---

                                                 ## 📄 License

                                                 **Proprietary** - All rights reserved. See [LICENSE](LICENSE) for details.

                                                 ---

                                                 <div align="center">

                                                 **Built with ❤️ by [thefiredev](https://www.thefiredev.com/)**

                                                 *Empowering traders with AI-driven market intelligence*

                                                 </div>
