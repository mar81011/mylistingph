# ListingPH

Real estate listings for the Philippines — admin panel, Supabase database, Vercel hosting.

## Setup

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. **Database** → Settings → Connection string:
   - `DATABASE_URL` = Transaction pooler (port **6543**, `?pgbouncer=true`)
   - `DIRECT_URL` = Direct connection (port **5432**)
3. **API** → copy `URL` and `anon` key, and `service_role` key
4. **Storage** → create public bucket `listing-photos`

### 2. Environment

```bash
cp .env.example .env
```

Fill in all values in `.env`.

### 3. Database

```bash
npm install
npx prisma db push
npm run db:seed
```

### 4. Run locally

```bash
npm run dev
```

- Site: http://localhost:3000
- Admin: http://localhost:3000/admin (PIN from `ADMIN_PIN`, default `1234`)

## Deploy to Vercel

1. Push this repo to [github.com/mar81011/mylistingph](https://github.com/mar81011/mylistingph)
2. Import project in [vercel.com](https://vercel.com)
3. Add all env vars from `.env`
4. Set `NEXT_PUBLIC_SITE_URL` to your Vercel URL (e.g. `https://listingph.vercel.app`)
5. Deploy — Vercel runs `prisma generate` on build
6. After first deploy, run locally against production DB:

```bash
npx prisma db push
npm run db:seed
```

## GitHub

```bash
# Create repo (after gh auth login), or create empty repo at github.com/new
git remote add origin https://github.com/mar81011/mylistingph.git
git push -u origin master
```

## Live site

Production: **https://realestate-seven-neon.vercel.app**

Admin: **https://realestate-seven-neon.vercel.app/admin**
