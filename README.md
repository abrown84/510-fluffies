# C.D. Certified Frenchies

Bay Area breeder site for **C.D. Certified Frenchies** — premium fluffy French Bulldogs. Visitors can browse dogs and litters, explore the family tree and gallery, and submit puppy applications. Breeders manage content through a protected admin dashboard.

Built with **Next.js**, **Supabase**, and **Tailwind CSS**.

## Features

### Public site

- **Home** — Featured dogs, available litters, and brand story
- **Our Dogs** — Dog profiles with photos, details, and health info
- **Litters & puppies** — Litter pages with parent info and individual puppy listings
- **Family tree** — Interactive pedigree / lineage view
- **Gallery** — Photos across dogs, litters, and puppies
- **Pricing** — Ownership and service options from the database
- **Health standards** — Breeding and health-testing commitments
- **Testimonials & blog** — Customer stories and posts
- **Contact** — Message form stored in Supabase
- **Puppy application** — Full application form with status workflow
- **Waitlist** — Interest signup when no matching puppy is available

### Admin (`/admin`)

Protected by Supabase Auth (unauthenticated users are redirected to `/login`).

- Dashboard overview (dogs, litters, applications, messages, puppies)
- CRUD for dogs, litters, puppies (including weight tracking), pricing, testimonials, and blog posts
- Image galleries and uploads to Supabase Storage
- Editable family tree / pedigree layout
- Application review with status updates and email notifications (via Resend)
- Contact message inbox
- Site settings (brand info, social links, SEO-related fields)

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js (App Router) |
| UI | React, Tailwind CSS |
| Backend / auth / DB / storage | Supabase (`@supabase/ssr`, `@supabase/supabase-js`) |
| Forms & validation | React Hook Form, Zod |
| Email | Resend |
| Analytics | Vercel Analytics |
| Deploy | Compatible with Vercel; `netlify.toml` also included for Netlify |

## Getting started

### Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project
- (Optional) A [Resend](https://resend.com) API key for application status emails

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env.local` file in the project root:

```bash
# Required — Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Recommended — absolute site URL (sitemap, robots, Open Graph)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Optional — email notifications for application status changes
RESEND_API_KEY=re_xxxxxxxx
RESEND_FROM_EMAIL=onboarding@resend.dev
BREEDER_EMAIL=hello@cdcertifiedfrenchies.com
```

| Variable | Required | Used for |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase client (browser, server, middleware) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase client (browser, server, middleware) |
| `NEXT_PUBLIC_SITE_URL` | No* | `metadataBase`, sitemap, and robots (`http://localhost:3000` by default) |
| `RESEND_API_KEY` | No | Sending application status emails (skipped with a warning if unset) |
| `RESEND_FROM_EMAIL` | No | From address (defaults to `onboarding@resend.dev`) |
| `BREEDER_EMAIL` | No | Breeder notification address (defaults to the public site email) |

\*Set this to your production URL when deploying.

### 3. Set up the database

1. In the Supabase SQL Editor, run [`supabase/schema.sql`](supabase/schema.sql) for the base schema, RLS policies, and seed data.
2. Apply any additional migrations under [`supabase/migrations/`](supabase/migrations/) in chronological order (pricing, settings, puppies, gallery, testimonials, blog, lineage, pedigree layouts, ownership fields, etc.).
3. Create public Storage buckets used by the admin uploads: `dogs`, `litters`, and `puppies` (see comments in `schema.sql` for related bucket setup notes).

### 4. Create an admin user

In the Supabase dashboard, create an Auth user. That account can sign in at `/login` and access `/admin`.

### 5. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | Run ESLint |

## Project structure

```
src/
  app/           # App Router pages (public + /admin + API routes)
  components/    # UI, layout, dogs, litters, pedigree, etc.
  lib/           # Supabase clients, email helpers, utilities
  types/         # Shared TypeScript types
supabase/
  schema.sql     # Base schema + RLS
  migrations/    # Incremental SQL migrations
```

## License

Private project (`"private": true` in `package.json`).

---

Built by [Brown Industries](https://brwnindustries.com)
