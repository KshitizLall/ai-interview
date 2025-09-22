# AI Interview Prep 🚀

> AI-powered interview preparation platform with personalized questions, smart analytics, and comprehensive coaching tools.

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748)](https://www.prisma.io/)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-6772E5)](https://stripe.com/)
[![NextAuth](https://img.shields.io/badge/NextAuth-Authentication-00C896)](https://next-auth.js.org/)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Business Model](#business-model)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

AI Interview Prep is a comprehensive SaaS platform that helps job seekers prepare for interviews using artificial intelligence. The platform generates personalized interview questions based on resumes and job descriptions, provides AI-powered sample answers, tracks performance analytics, and offers mock interview sessions.

### 🌟 Key Highlights

- **AI-Powered**: Leverages OpenAI's GPT models for intelligent question generation and answer assistance
- **Personalized**: Tailors questions based on individual resumes and specific job requirements
- **Analytics-Driven**: Provides detailed insights into performance and improvement areas
- **Multi-Platform**: Web-based with responsive design for desktop and mobile
- **Subscription-Based**: Freemium model with tiered pricing for different user needs

## ✨ Features

### Core Features
- 📝 **Resume & Job Description Analysis**
- 🤖 **AI Question Generation** (technical, behavioral, experience-based)
- 💡 **Smart Answer Templates** with STAR method framework
- 🎯 **Mock Interview Sessions** with real-time feedback
- 📊 **Performance Analytics** and progress tracking
- 💾 **Session Management** with save/load functionality
- 📄 **PDF Export** of questions and answers

### Premium Features
- 📈 **Advanced Analytics Dashboard** with detailed insights
- 🎥 **Interview Recording & Playback** (Professional+)
- 👥 **Team Management** and collaboration (Enterprise)
- 🔌 **API Access** for integrations (Enterprise)
- 🏷️ **White-label PDF Export** (Enterprise)
- 📞 **Priority Support** (Professional+)

## 💰 Business Model

### Pricing Tiers

| Feature | Free | Starter | Professional | Enterprise |
|---------|------|---------|--------------|------------|
| **Price** | $0/month | $9/month | $29/month | $79/month |
| **AI Questions** | 5/month | 50/month | 200/month | Unlimited |
| **AI Answers** | 3/month | 25/month | 100/month | Unlimited |
| **Resume Uploads** | 1/month | 5/month | Unlimited | Unlimited |
| **Saved Sessions** | 0 | 3 | 10 | Unlimited |
| **PDF Export** | ❌ | Basic | Advanced | White-label |
| **Mock Interviews** | ❌ | ❌ | 3/month | Unlimited |
| **Analytics** | ❌ | Basic | Advanced | Enterprise |
| **Team Features** | ❌ | ❌ | ❌ | ✅ |
| **API Access** | ❌ | ❌ | ❌ | ✅ |
| **Support** | Community | Email | Priority | 24/7 + AM |

### Revenue Streams
- **Subscription Revenue**: Primary income from monthly/annual subscriptions
- **Enterprise Licensing**: Custom pricing for large organizations
- **API Usage**: Additional revenue from API integrations
- **Premium Services**: Optional coaching and consultation services

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui with Radix UI
- **State Management**: React hooks with local state
- **Authentication**: NextAuth.js
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod validation

### Backend
- **API**: Next.js API Routes
- **Database**: Prisma ORM with SQLite (dev) / PostgreSQL (prod)
- **Authentication**: NextAuth.js with JWT
- **Payments**: Stripe subscriptions
- **File Processing**: PDF-parse, Mammoth.js
- **AI Integration**: OpenAI GPT API
- **WebSocket**: Real-time features

### Infrastructure
- **Deployment**: Vercel (Frontend), Railway/PlanetScale (Database)
- **Storage**: Local filesystem (dev), AWS S3 (prod)
- **Monitoring**: Vercel Analytics
- **Email**: SMTP integration for transactional emails

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+ (for backend services)
- OpenAI API key
- Stripe account (for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/KshitizLall/ai-interview-prep.git
   cd ai-interview-prep
   ```

2. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd ../backend
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cd ../frontend
   cp .env.local.example .env.local
   ```

   Configure the following variables:
   ```env
   # Database
   DATABASE_URL="file:./dev.db"

   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"

   # OpenAI
   OPENAI_API_KEY="sk-your-openai-key"

   # Stripe
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
   STRIPE_SECRET_KEY="sk_test_..."
   STRIPE_WEBHOOK_SECRET="whsec_..."

   # Google OAuth (optional)
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   ```

5. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

6. **Start the development servers**
   
   Frontend:
   ```bash
   cd frontend
   npm run dev
   ```
   
   Backend:
   ```bash
   cd backend
   python -m uvicorn main:app --reload
   ```

7. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - Database Studio: `npx prisma studio`

## 📁 Project Structure

```
ai-interview-prep/
├── frontend/                 # Next.js frontend application
│   ├── app/                 # App router pages
│   │   ├── api/            # API routes
│   │   ├── auth/           # Authentication pages
│   │   ├── dashboard/      # User dashboard
│   │   ├── pricing/        # Pricing page
│   │   └── analytics/      # Analytics dashboard
│   ├── components/         # React components
│   │   ├── ui/            # shadcn/ui components
│   │   └── ...            # Custom components
│   ├── lib/               # Utility functions
│   ├── hooks/             # Custom React hooks
│   ├── types/             # TypeScript type definitions
│   ├── prisma/            # Database schema
│   └── public/            # Static assets
├── backend/                # FastAPI backend services
│   ├── app/
│   │   ├── api/           # API endpoints
│   │   ├── core/          # Core configurations
│   │   ├── models/        # Data models
│   │   └── services/      # Business logic
│   └── requirements.txt   # Python dependencies
├── docs/                  # Documentation
├── BUSINESS_PLAN.md       # Detailed business plan
└── README.md             # This file
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `GET/POST /api/auth/[...nextauth]` - NextAuth.js endpoints

### User Management
- `GET /api/user/usage` - Get current usage statistics
- `POST /api/user/update` - Update user profile

### Question Generation
- `POST /api/questions/generate` - Generate interview questions
- `POST /api/questions/answer` - Get AI-generated answers

### Subscription Management
- `POST /api/stripe/create-checkout-session` - Create Stripe checkout
- `POST /api/stripe/webhook` - Handle Stripe webhooks
- `GET /api/subscription/status` - Get subscription status

### Analytics
- `GET /api/analytics` - Get performance analytics
- `POST /api/analytics/track` - Track user interactions

## 🚢 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend (Railway/Heroku)
1. Create a new project on Railway/Heroku
2. Connect your repository
3. Configure environment variables
4. Deploy the backend services

### Database (PlanetScale/Supabase)
1. Create a database instance
2. Update DATABASE_URL in environment variables
3. Run `npx prisma db push` to sync schema

### Environment Variables for Production
```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="production-secret"
OPENAI_API_KEY="sk-production-key"
STRIPE_SECRET_KEY="sk_live_..."
# ... other production keys
```

## 📊 Key Metrics & KPIs

### Business Metrics
- **Monthly Recurring Revenue (MRR)**
- **Customer Acquisition Cost (CAC)**
- **Lifetime Value (LTV)**
- **Churn Rate** (target: <5% monthly)
- **Conversion Rate** (target: >10% free to paid)

### Technical Metrics
- **API Response Time** (<200ms average)
- **Uptime** (>99.9% target)
- **Error Rate** (<1% target)
- **Database Performance** (query time <100ms)

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Write tests for new features
- Update documentation for API changes
- Follow semantic commit message format

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** for providing the GPT API
- **Vercel** for hosting and deployment platform
- **Stripe** for payment processing infrastructure
- **shadcn/ui** for beautiful UI components
- **Prisma** for database management

## 📞 Support

### Getting Help
- **Documentation**: Check our [docs](./docs) folder
- **Issues**: Create a GitHub issue for bugs
- **Feature Requests**: Open a discussion for new features
- **Email**: support@aiinterviewprep.com (coming soon)

### Support Channels by Plan
- **Free**: Community GitHub discussions
- **Starter**: Email support (48h response)
- **Professional**: Priority email support (24h response)
- **Enterprise**: Dedicated support + account manager

---

<div align="center">

**Built with ❤️ for job seekers worldwide**

[Website](https://aiinterviewprep.com) • [Documentation](./docs) • [Support](https://github.com/KshitizLall/ai-interview-prep/discussions)

</div>
