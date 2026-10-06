# US Goods PasaBuy (PH E-Commerce Platform)

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%2016-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/ORM-Prisma-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)

---

## ⚡ Permanent Local Run Links (Quick Reference)

### 🛍️ Customer Storefront Links (Shopee/Lazada Pick & Buy Flow)
- **Main Storefront Home**: [http://localhost:3000](http://localhost:3000)
- **Allocated Product Catalog**: [http://localhost:3000/products](http://localhost:3000/products) (Clothes, Bags, Watches, Wallets, Caps)
- **Shopping Cart**: [http://localhost:3000/cart](http://localhost:3000/cart) (Adjust quantities, see subtotal & 50% deposit)
- **Checkout & Slot Reservation**: [http://localhost:3000/checkout](http://localhost:3000/checkout) (PH address, 50% deposit, GCash/Maya upload)
- **Customer Sign In**: [http://localhost:3000/login](http://localhost:3000/login) (1-Click demo customer login)
- **Customer Registration**: [http://localhost:3000/signup](http://localhost:3000/signup) (Create account with saved PH shipping address)
- **Customer Account & Orders**: [http://localhost:3000/account](http://localhost:3000/account) (Saved address, order history)
- **Order Tracking & Downpayments**: [http://localhost:3000/orders](http://localhost:3000/orders)
- **VS Code "Go Live" Button**: [http://127.0.0.1:5500](http://127.0.0.1:5500) (Fixed launcher on Port 5500 that auto-connects to store)

### 🛡️ Admin Portal Links (Manager / Owner View)
- **Admin Dashboard**: [http://localhost:3000/admin](http://localhost:3000/admin) *(Direct dashboard access; auto-redirects to login if unauthenticated)*
- **Admin Login Screen**: [http://localhost:3000/admin/login](http://localhost:3000/admin/login) *(Includes 1-Click "Sign In as Head Admin")*
- **Order Pipeline Manager**: [http://localhost:3000/admin/orders](http://localhost:3000/admin/orders)
- **Inventory & Margin Manager**: [http://localhost:3000/admin/inventory](http://localhost:3000/admin/inventory)

> **Port Guide:**
> - **Port 3000**: Next.js full-stack app engine (runs `npm run dev`).
> - **Port 5500**: VS Code Live Server ("Go Live" button). Reserved so it never changes ports.

---

A full-stack, enterprise-grade e-commerce application targeting the Philippine market for personal shopping and freight consolidation (*"PasaBuy"*) of US retail merchandise (Amazon, Sephora, Target, Coach, Best Buy).

---

## 1. Core Architecture & Highlights

```
┌─────────────────────────────────────────────────────────────┐
│                 Client Layer (Browser)                      │
│   Storefront (/shop, /cart)   │   Admin Portal (/admin/*)   │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
               ▼                               ▼
┌─────────────────────────────────────────────────────────────┐
│             Next.js Edge Middleware (RBAC Guard)            │
│  - /admin/* → Non-admin rewritten to 404 (Hidden portal)    │
│  - /account/* → Unauthenticated redirected to /login        │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
               ▼                               ▼
┌─────────────────────────────────────────────────────────────┐
│       App Router (Server Components & Route Handlers)       │
│  - Landed Cost Pricing Engine   - Proof of Payment Uploads  │
│  - Order Pipeline Service       - Admin Analytics API       │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│           PostgreSQL + S3-Compatible Object Storage         │
│  - Relational Schema (ACID)   - Cloudflare R2 / S3 Receipts │
└──────────────────────────────┴──────────────────────────────┘
```

### Key Capabilities
- **Strict RBAC Route Cloaking**: Edge middleware intercepts any unauthorized requests to `/admin/*` and performs an internal URL rewrite to `/not-found` (HTTP 404), completely concealing administrative surfaces.
- **PasaBuy Landed Cost Engine**: Automatically factors in:
  - Base US Retail Price (USD)
  - US State Sales Tax (0% assuming an Oregon / Delaware tax-free forwarder address)
  - International Air Cargo / Sea Cargo freight rates ($7.50/lb standard)
  - Box handling and inspection fee
  - Foreign exchange spot rate + bank card spread buffer (e.g. ₱59.00 PHP / USD)
  - Configurable service margin markup (15%)
- **Flexible Downpayment Model**: Full support for 50% initial downpayment via GCash, Maya, and Philippine Online Bank Transfers (BDO, BPI), with the remaining 50% settled once the parcel clears customs at the Philippine sorting hub.
- **Order Pipeline Audit Trail**: Tracks orders across 6 distinct stages:
  1. `ORDER_PLACED` (Downpayment submitted)
  2. `PURCHASED_IN_US` (Bought from US merchant)
  3. `IN_TRANSIT_FORWARDER` (Air/Sea cargo forwarder tracking AWB)
  4. `ARRIVED_IN_PH` (Customs cleared in Manila)
  5. `OUT_FOR_LOCAL_DELIVERY` (Dispatched via Lalamove / J&T Express)
  6. `COMPLETED` (Delivered and received)
- **Proof-of-Payment Verification Queue**: Administrative ledger allowing operators to review uploaded payment slips, verify transaction reference numbers, and approve or reject receipts.

---

## 2. Directory Layout

```text
├── prisma/
│   ├── schema.prisma                 # Prisma schema definition
│   └── migrations/
│       └── 01_init.sql               # Pure PostgreSQL DDL migration
├── public/                           # Static assets and icons
├── src/
│   ├── app/
│   │   ├── (storefront)/             # Public Customer Route Group
│   │   │   ├── page.tsx              # Landing page with Live Calculator & Hero
│   │   │   ├── products/             # Catalog browsing with category filters
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx     # Product detail & Landed Cost Breakdown
│   │   │   ├── custom-quote/page.tsx # "Paste US Link" custom quote request
│   │   │   └── orders/page.tsx       # Parcel tracking & GCash receipt upload
│   │   ├── admin/                    # ADMIN PORTAL (Strictly guarded by Edge RBAC)
│   │   │   ├── layout.tsx            # Privileged admin layout & sidebar
│   │   │   ├── page.tsx              # Analytics dashboard & FX buffer controller
│   │   │   ├── orders/page.tsx       # Pipeline stage advance & receipt verification
│   │   │   └── inventory/page.tsx    # US inventory & margin bulk adjuster
│   │   ├── api/                      # Backend Route Handlers
│   │   │   ├── admin/orders/[id]/status/route.ts
│   │   │   ├── admin/payments/[id]/verify/route.ts
│   │   │   ├── auth/login/route.ts
│   │   │   ├── auth/me/route.ts
│   │   │   └── pricing/calculate/route.ts
│   │   ├── globals.css               # Global Tailwind CSS
│   │   ├── layout.tsx                # Root layout
│   │   └── not-found.tsx             # 404 error page (Cloaking target)
│   ├── components/
│   │   ├── navbar.tsx                # Global navigation bar with live RBAC simulator
│   │   ├── footer.tsx                # Global footer with Philippine trust badges
│   │   └── landed-cost-calculator.tsx# Interactive pricing estimator widget
│   ├── data/
│   │   └── mock-data.ts              # Seed data for US catalog and mock orders
│   ├── lib/
│   │   ├── auth/
│   │   │   ├── guards.ts             # withAdminGuard & withCustomerGuard wrappers
│   │   │   └── session.ts            # Edge-compatible JWT signing with jose
│   │   ├── pricing.ts                # Landed cost calculator formula
│   │   └── prisma.ts                 # Prisma Client singleton
│   └── types/
│       └── index.ts                  # Shared TypeScript interfaces
├── middleware.ts                     # Edge Middleware for RBAC & 404 cloaking
├── package.json
└── tsconfig.json
```

---

## 3. Landed Cost Formula

$$\text{Landed Cost (PHP)} = \Big( (\text{Base USD} \times (1 + \text{Tax Rate})) + (\text{Weight} \times \text{Cargo Rate}) + \text{Handling Fee} \Big) \times \text{Buffered FX} \times (1 + \text{Margin})$$

- **Base USD**: US merchant listed retail price.
- **US Tax Rate**: Set to `0.00` if shipping to freight forwarders situated in tax-free US states (Oregon, Delaware, New Hampshire, Montana).
- **Cargo Rate**: Standard air freight rate (e.g. `$7.50 / lb`).
- **Buffered FX Rate**: Spot market conversion rate + Philippine credit card bank spread buffer (e.g. `₱59.00 PHP / USD`).
- **50% Downpayment**: $\lceil \text{Landed Cost (PHP)} \times 0.5 \rceil$.

---

## 4. Database Schema (PostgreSQL DDL)

To execute the database schema directly in Supabase or any standard PostgreSQL instance, run:

```bash
# Direct SQL script
psql $DATABASE_URL -f prisma/migrations/01_init.sql

# Or using Prisma CLI
npx prisma db push
```

Key tables:
- `users`: Includes `role` enum (`'CUSTOMER' | 'ADMIN'`), contact, and Philippine shipping address.
- `products`: Base USD pricing, weight in lbs, calculated PHP selling price, and merchant source URL.
- `orders`: Financial breakdown (subtotal, shipping, amount paid, remaining balance), and logistics tracking (AWB, local courier).
- `order_items`: Order line items with landed cost calculation snapshot.
- `order_status_history`: Audit trail logging every pipeline status transition.
- `payments`: Downpayment / full payment records, transaction reference numbers, and uploaded receipt URLs with review state.

---

## 5. Getting Started

### Prerequisites
- Node.js 18.18+ or Node.js 20+
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/sondre01/khin-ecommerce-usgoods-pasabuy.git
cd khin-ecommerce-usgoods-pasabuy

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

Visit [http://localhost:5500](http://localhost:5500) to view the application.

### Testing Role-Based Access Control (RBAC)

1. Use the **Simulator** toggle in the top announcement bar to switch between **Customer View** and **Admin View**.
2. When in **Customer View**, navigating to `/admin` triggers the Edge middleware, which internally rewrites to HTTP 404 (`/not-found`), completely cloaking the admin route.
3. When in **Admin View**, the `/admin` portal becomes accessible, revealing the analytics dashboard, order pipeline progression controls, and receipt verification queue.
