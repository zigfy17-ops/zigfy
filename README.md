# FitConnect Hub (Zigfy)

A fitness coaching platform built with TanStack Router/Start, Vite, and Supabase.

## Features

- Client and trainer roles
- Trainer discovery and booking requests
- Workout logging and tracking
- Admin dashboard
- Supabase auth and database integration

## Tech Stack

- React + TypeScript
- TanStack Router / TanStack Start
- Vite
- Supabase
- Tailwind CSS + Radix UI

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create/update `.env` with your Supabase values:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Run in development

```bash
npm run dev
```

### 4. Build for production

```bash
npm run build
```

## Database Migrations

Supabase migrations are in:

- `supabase/migrations/`

Apply them with your preferred Supabase workflow (for example `supabase db push`).

## Deploy

This project includes `vercel.json` for Vercel routing.

After pushing to GitHub, import the repo into Vercel and set required environment variables.

## Project Structure

- `src/routes/` - application routes
- `src/components/` - reusable UI and feature components
- `src/lib/` - shared utilities and auth context
- `src/integrations/supabase/` - Supabase client/types
- `supabase/` - database config and migrations

## License

Private project.
