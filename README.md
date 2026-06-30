<p align="center">
  <img src="https://img.shields.io/badge/Gaetin-SaaS%20Growth%20Platform-10B981?style=for-the-badge&logo=whatsapp&logoColor=white" alt="Gaetin" />
</p>

<h1 align="center">🚀 Gaetin</h1>

<p align="center">
  <strong>All-in-one SaaS growth platform for lead generation, WhatsApp outreach, CRM & analytics.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js" alt="Next.js 14" />
  <img src="https://img.shields.io/badge/TypeScript-5.5-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Prisma-5.18-2D3748?style=flat-square&logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Redis-7-DC382D?style=flat-square&logo=redis&logoColor=white" alt="Redis" />
  <img src="https://img.shields.io/badge/BullMQ-Queue-EE4B2B?style=flat-square" alt="BullMQ" />
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/License-Private-gray?style=flat-square" alt="License" />
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#%EF%B8%8F-architecture">Architecture</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-docker-deployment">Docker</a> •
  <a href="#-project-structure">Structure</a> •
  <a href="#-roadmap">Roadmap</a>
</p>

---

## 📋 Overview

**Gaetin** is a comprehensive SaaS growth platform designed for businesses that rely on WhatsApp as their primary communication channel. It provides an end-to-end pipeline:

```
Scrape Leads → Manage & Segment → Blast via WhatsApp → Handle Inbox/CS → Close Deals & Measure ROI
```

Built with a **multi-tenant architecture**, Gaetin supports teams and agencies with role-based access control (Owner / Admin / Agent) per workspace.

---

## ✨ Features

### 🔍 Lead Generation
- **Google Maps Scraper** — Automated lead extraction with deduplication
- **Lead Scoring** — Prioritize high-value prospects
- **Segmentation** — Organize leads with custom tags and filters
- **CSV/Excel Import & Export** — Bulk data management

### 💬 WhatsApp Messaging
- **Multi-Device Support** — Connect multiple WhatsApp numbers via QR
- **Broadcast Campaigns** — Schedule and send bulk messages
- **Template Engine** — Reusable message templates with variables
- **Anti-Ban Controls** — Daily limits, warm-up schedules, rate limiting
- **Number Validator** — Verify WhatsApp numbers before sending

### 📥 Inbox & Customer Service
- **Unified Inbox** — All conversations in one place
- **Two-Way Messaging** — Reply to customer messages in real-time
- **Auto-Reply** — Rule-based automated responses
- **Team Assignment** — Route conversations to agents

### 📊 CRM & Analytics
- **Deal Pipeline** — Visual Kanban-style deal tracking
- **ROI Tracking** — Measure campaign performance
- **Analytics Dashboard** — Comprehensive business metrics with charts
- **Follow-Up Automation** — Scheduled task reminders

### 🗺️ Map View
- **Geographic Analysis** — Visualize leads on an interactive map
- **Market Intelligence** — Identify opportunity clusters

### 💳 Billing & Subscription
- **Plan Management** — Free, Starter, Pro, Enterprise tiers
- **Midtrans/Xendit Integration** — Automated payment processing
- **Credit System** — Usage-based billing for advanced features

### ⚙️ Platform
- **Multi-Tenant** — Workspace isolation with team support
- **Dark/Light Mode** — Full theme support across all UI
- **Admin Panel** — Platform-wide management & monitoring
- **API-First** — 27+ REST API endpoints
- **Docker Ready** — One-command production deployment

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Caddy (Reverse Proxy)                │
│                   Auto SSL · HTTP/2 · HTTPS              │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│               Next.js 14 (App Router)                    │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │  Landing Page│  │  Dashboard   │  │  Admin Panel   │  │
│  │  (SSR)       │  │  (Client)    │  │  (Protected)   │  │
│  └─────────────┘  └──────────────┘  └────────────────┘  │
│  ┌──────────────────────────────────────────────────┐    │
│  │              API Routes (27+ endpoints)           │    │
│  │  auth · contacts · blast · campaigns · crm · ...  │    │
│  └──────────────────────────────────────────────────┘    │
└──────┬───────────────┬───────────────┬──────────────────┘
       │               │               │
┌──────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐
│ PostgreSQL  │ │    Redis    │ │   Baileys   │
│  (Prisma)   │ │  (BullMQ)   │ │ (WhatsApp)  │
│  Multi-     │ │  Queues &   │ │  Multi-     │
│  tenant DB  │ │  Caching    │ │  Session    │
└─────────────┘ └─────────────┘ └─────────────┘
```

### Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Multi-tenant via Workspace** | All data scoped by `Workspace`; users connect through `Membership` with roles |
| **WhatsApp Provider Abstraction** | `IMessagingProvider` interface decouples business logic from backend (Baileys / Fonnte / Cloud API) |
| **Queue-Based Processing** | Heavy operations (blast, scraping, validation, follow-up) offloaded to BullMQ workers |
| **Near-Zero Cost Stack** | All core features self-hosted on a single VPS — no per-message API fees |

---

## 🚀 Quick Start

### Prerequisites

| Requirement | Version |
|-------------|---------|
| Node.js | 20+ (recommended 22) |
| PostgreSQL | 14+ |
| Redis | 6+ |
| npm | 8+ |

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/hanafiafan/gaetin.git
cd gaetin

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env — fill in DATABASE_URL, REDIS_URL, JWT_SECRET, etc.

# 4. Generate Prisma client & run migrations
npm run db:generate
npm run db:migrate

# 5. (Optional) Seed demo data
npm run db:seed
# Demo login: demo@nusantara.test / Demo1234

# 6. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## 🐳 Docker Deployment

Deploy the entire stack with a single command:

```bash
# Set your domain and credentials
export DOMAIN=yourdomain.com
export DB_USER=postgres
export DB_PASSWORD=your-secure-password

# Launch all services
docker compose up -d
```

This spins up:
- **PostgreSQL 16** — Primary database
- **Redis 7** — Queue & caching
- **Gaetin App** — Next.js production build
- **Caddy** — Reverse proxy with automatic HTTPS

---

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm run start` | Start production server |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run test` | Run unit + property tests (Vitest) |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Create/apply database migrations |
| `npm run db:studio` | Open Prisma Studio (DB GUI) |
| `npm run db:seed` | Seed demo data |

---

## 📁 Project Structure

```
gaetin/
├── prisma/
│   ├── schema.prisma          # Database schema (multi-tenant)
│   └── seed.ts                # Demo data seeder
├── src/
│   ├── app/
│   │   ├── (auth)/            # Login & registration pages
│   │   ├── (dashboard)/
│   │   │   └── dashboard/
│   │   │       ├── analytics/     # Business metrics & charts
│   │   │       ├── blast/         # Broadcast messaging
│   │   │       ├── campaigns/     # Campaign management
│   │   │       ├── contacts/      # Contact management
│   │   │       ├── crm/           # Deal pipeline & CRM
│   │   │       ├── inbox/         # Unified messaging inbox
│   │   │       ├── map/           # Geographic lead view
│   │   │       ├── scraper/       # Google Maps scraper
│   │   │       ├── settings/      # Workspace settings
│   │   │       ├── tasks/         # Task management
│   │   │       ├── templates/     # Message templates
│   │   │       └── ...            # + billing, team, validator, etc.
│   │   ├── (admin)/           # Platform admin panel
│   │   ├── api/               # 27+ REST API endpoints
│   │   └── page.tsx           # Landing page
│   ├── components/
│   │   ├── dashboard/         # Dashboard-specific components
│   │   ├── admin/             # Admin panel components
│   │   └── ui/                # shadcn/ui base components
│   ├── lib/
│   │   ├── auth/              # JWT authentication
│   │   ├── billing/           # Payment processing
│   │   ├── blast/             # Broadcast engine
│   │   ├── contacts/          # Contact management
│   │   ├── crm/               # CRM business logic
│   │   ├── db/                # Prisma client singleton
│   │   ├── messaging/         # WhatsApp provider abstraction
│   │   ├── scraper/           # Lead scraping engine
│   │   ├── whatsapp/          # Baileys integration
│   │   └── ...                # + email, redis, validators, etc.
│   ├── config/                # Plan catalogs & feature flags
│   └── middleware.ts          # Auth & route protection
├── gateway/                   # WhatsApp gateway service
├── extension/                 # Chrome extension
├── docker-compose.yml         # Full-stack Docker deployment
├── Dockerfile                 # Multi-stage production build
└── Caddyfile                  # Reverse proxy configuration
```

---

## 💰 Cost Architecture

Gaetin is designed for **near-zero operational costs**. All core features run on a single VPS without third-party subscriptions.

| Category | Service | Cost |
|----------|---------|------|
| ✅ **Core (Free)** | PostgreSQL, Redis, Next.js, Baileys | Self-hosted |
| ✅ **Maps** | Leaflet + free tiles, Nominatim geocoding | Free tier |
| ✅ **Scraping** | Self-hosted Google Maps scraper | Free |
| 💳 **Revenue-Aligned** | Midtrans/Xendit payment processing | Per-transaction fee only |
| 📧 **Email** | Resend/Brevo transactional emails | Free tier |

> **Scaling note:** Since WhatsApp runs via Baileys, the primary scaling cost is server RAM (per active connection), not per-message API fees — significantly cheaper than gateway services.

---

## ⚠️ Compliance & Risk Notes

> [!WARNING]
> **Google Maps Scraping** — Scraping Google Maps violates their ToS. Consider using the official Google Places API or third-party data providers for production use.

> [!WARNING]
> **Unofficial WhatsApp API** — Using Baileys (unofficial WA API) carries a risk of account bans. The platform includes anti-ban controls (daily limits, warm-up, DoNotContact/opt-out lists), but consider offering the official WhatsApp Cloud API as an alternative for risk-averse users.

---

## 🗺️ Roadmap

- [x] Auth (register/login/JWT, lockout) + dashboard layout
- [x] WhatsApp connection (Baileys) + real-time status (Socket.IO)
- [x] Google Maps scraper + lead management (segments, scoring, dedup)
- [x] Blast + Campaign (queue, anti-ban) + number validation
- [x] Inbox / Customer Service (two-way) + auto-reply
- [x] CRM pipeline + Deal/ROI tracking
- [x] Follow-up automation + tasks
- [x] Subscription + Midtrans/Xendit billing
- [x] Map view (market analysis)
- [ ] White-label support
- [ ] WhatsApp Cloud API official integration
- [ ] Advanced AI-powered auto-reply
- [ ] Multi-language support

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This is a private project. All rights reserved.

---

<p align="center">
  Built with ❤️ using Next.js, TypeScript, and Prisma
  <br />
  <sub>© 2024–2026 Gaetin. All rights reserved.</sub>
</p>
