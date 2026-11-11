# The Source — Private Fragrance House & Admin Command Matrix

A quiet luxury fragrance platform and administrative command console tailored for private fragrance acquisition and bespoke perfume sourcing across Nigeria (Benin, Warri, Asaba, Lagos, Abuja, and Abraka).

## Features

### Public Luxury Storefront (`/` / `index.html`)
- **Curated Archive**: 104+ luxury fragrances across heritage houses (Clive Christian, Creed, Tom Ford, Byredo, Le Labo, MFK, Diptyque, Frederic Malle, Amouage, Xerjoff, Kilian, etc.).
- **Interactive Scent Kiosk**: Guided fragrance discovery powered by serverless intelligence (`/api/kiosk`) returning personalized archive recommendations based on mood, note, or occasion.
- **Dynamic Search & Filtering**: Client-side filtering by vault availability, house name, and fragrance notes with interactive pagination and thumbnail strip.
- **Private Sourcing & Acquisition Modal**: Dual-channel submission leveraging **Netlify Forms** with honeypot spam protection and persistent storage via **Netlify Database** (`/api/requests`).
- **Dark / Light Quiet Luxury Theme**: Persistent theme switcher with custom typography and warm gold/ink palette.

### Administrative Command Matrix (`/admin` / `admin.html`)
- **System Diagnostics**: Real-time stats (`/api/stats`) tracking total sourcing inquiries, pending reviews, physical vault inventory, and kiosk interaction metrics.
- **Inventory & Sourcing Management**: Full CRUD (`/api/products`) with house branding, pricing in Naira / On Request, notes, visibility toggling (hide/unhide), and inline editing.
- **Sourcing Desk**: Incoming client request triage with status management (Pending, In Progress, Fulfilled), priority badging, and reply notes recording.
- **AI Assistant Core**: Scent curation and market intelligence engine (`/api/ai`) utilizing Netlify AI Gateway for luxury copy generation, market trend analysis, and collector correspondence.

## Architecture & Technology Stack

- **Platform**: Netlify Serverless Architecture
- **Database**: Netlify Database (Postgres) managed via Drizzle ORM (`drizzle-orm@beta`, `drizzle-kit@beta`)
- **Serverless API**: Netlify Functions v2 (`.mts`)
  - `netlify/functions/products.mts` — Catalog query, filter, create, update, delete
  - `netlify/functions/requests.mts` — Sourcing request queue, status updates, desk notes
  - `netlify/functions/kiosk.mts` — Olfactory note matching and interaction logging
  - `netlify/functions/stats.mts` — Live diagnostic metrics aggregation
  - `netlify/functions/ai.mts` — AI copy & intelligence via `@google/genai` on Netlify AI Gateway
- **Forms**: Netlify Forms with static build-time skeleton detection in `public/__forms.html`
- **Styling**: Tailwind CSS CDN with custom luxury configuration (Playfair Display, Cormorant Garamond, Inter)

## Local Development

To run locally with the Netlify CLI and test functions, database, and forms emulation:

```bash
# Install dependencies
npm install

# Start Netlify development server
npx netlify dev --port 8889
```

Visit:
- Storefront: `http://localhost:8889`
- Admin Matrix: `http://localhost:8889/admin`
