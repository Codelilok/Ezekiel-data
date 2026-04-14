# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Contains the NetSwift data purchasing platform.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite, Tailwind CSS, shadcn/ui, Framer Motion

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## NetSwift Platform

A premium fintech-style mobile data purchasing platform for Ghana.

### Features
- **Homepage**: Hero + auth section (login/signup), buy data flow (MTN/Telecel/AirtelTigo), order tracking with backend validation (404 for invalid IDs), complaint/support form
- **Dashboard**: Wallet balance, orders today, GB sold today, success rate stats from real backend
- **Sidebar navigation**: Hamburger menu on mobile, persistent sidebar on desktop
- **Network pages**: /mtn, /telecel, /airteltigo — buy data for specific networks
- **Orders/History/Transactions**: Full list pages with real API data
- **Order tracking**: Real API call — flags invalid order IDs/phone numbers with a clear error message

### Pages
- `/` — Homepage (hero, auth, buy data, track order, support)
- `/dashboard` — Main dashboard with stats, quick actions, recent orders
- `/mtn`, `/telecel`, `/airteltigo` — Network-specific order pages
- `/orders`, `/history` — Orders history
- `/transactions` — Transaction ledger

### API Endpoints
- `GET /api/healthz` — health check
- `GET /api/orders` — list orders (filterable by network, status)
- `POST /api/orders` — create order
- `GET /api/orders/track?q=<id_or_phone>` — track order, 404 if not found
- `GET /api/orders/:id` — get single order
- `GET /api/dashboard/stats` — wallet balance, orders today, GB sold, success rate
- `GET /api/transactions` — list transactions

### DB Schema
- `orders` — orderId, network, bundleSize, bundleValidity, phone, status, gbAmount, price, createdAt
- `transactions` — type, amount, description, reference, createdAt
- `wallet` — balance

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
