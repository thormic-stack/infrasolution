# AGENTS.md

This document provides architectural guidance and system design context for autonomous agents and developers maintaining **The Source**.

## Project Architecture

The Source is organized as a unified Netlify serverless application with a static frontend and TypeScript serverless backend connected to Netlify Database (PostgreSQL).

```
.
├── db/
│   ├── index.ts              # Netlify Database Drizzle client initialization
│   ├── schema.ts             # Drizzle PostgreSQL schema definitions
│   └── seed-data.ts          # Baseline data for 104 luxury perfumes & initial sourcing requests
├── netlify/
│   ├── database/
│   │   └── migrations/       # Drizzle kit generated SQL migrations
│   └── functions/
│       ├── products.mts      # Product inventory REST API (/api/products & /api/products/:id)
│       ├── requests.mts      # Sourcing desk requests REST API (/api/requests & /api/requests/:id)
│       ├── kiosk.mts         # Scent kiosk recommendation engine (/api/kiosk)
│       ├── stats.mts         # Admin matrix diagnostics endpoint (/api/stats)
│       └── ai.mts            # AI Assistant powered by Netlify AI Gateway / @google/genai (/api/ai)
├── public/
│   ├── index.html            # Public luxury storefront
│   ├── admin.html            # Admin Command Matrix console
│   └── __forms.html          # Netlify Forms build-time detection skeleton
├── drizzle.config.ts         # Drizzle configuration outputting to netlify/database/migrations
└── netlify.toml              # Netlify build, redirects, and security headers configuration
```

## Key Architectural Decisions

1. **Database Persistence**:
   - Uses `@netlify/database` with `drizzle-orm@beta` and `drizzle-kit@beta` per Netlify Database requirements.
   - Database tables: `products`, `sourcing_requests`, and `kiosk_interactions`.
   - Migration file is created at `netlify/database/migrations/20260922231829_create_source_tables/migration.sql`. Migrations are applied automatically on deploy by Netlify.
   - Built-in defensive fallback to `db/seed-data.ts` ensures zero-downtime resilience even during initial database warm-up.

2. **Dual-Channel Sourcing Form**:
   - The inquiry modal on the storefront dispatches to both `/api/requests` (persisting to Netlify Database for admin desk management) and `/__forms.html` (for Netlify Forms email notifications and submissions view).

3. **Netlify AI Gateway**:
   - `netlify/functions/ai.mts` leverages the official `@google/genai` SDK using `gemini-2.5-flash` with zero-config credentials provided by Netlify AI Gateway (`GEMINI_API_KEY` / `NETLIFY_AI_GATEWAY_KEY`).
   - Includes fallback luxury copy heuristics if gateway credentials are in a pre-provisioned or cold state.

4. **Routing**:
   - `netlify.toml` defines a 200 rewrite for `/admin` -> `/admin.html`.
