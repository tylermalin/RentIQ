# Deployment Guide for RentIQ

## Pre-Deployment Checklist

- [x] Git repository initialized
- [x] Remote configured to https://github.com/tylermalin/RentIQ.git
- [x] .gitignore configured (includes .env files, node_modules, .next, database files)
- [x] README.md created with setup instructions
- [x] .env.example created with required environment variables

## Steps to Deploy

### 1. Commit and Push to GitHub

```bash
# Review changes
git status

# Commit all changes
git commit -m "Initial commit: RentIQ rental approval platform"

# Push to GitHub
git push -u origin main
```

If the branch is named `master` instead of `main`:
```bash
git branch -M main
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your GitHub repository: `tylermalin/RentIQ`
4. Vercel will auto-detect Next.js settings

### 3. Configure Environment Variables in Vercel

In the Vercel project settings, add these environment variables:

**Required:**
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
- `NEXTAUTH_URL` - Your Vercel deployment URL (e.g., `https://rentiq.vercel.app`)

**Optional (for Google OAuth):**
- `GOOGLE_CLIENT_ID` - From Google Cloud Console
- `GOOGLE_CLIENT_SECRET` - From Google Cloud Console

**Database:**
- `DATABASE_URL` - For production, use a PostgreSQL database (recommended)
  - Options: Vercel Postgres, Supabase, Railway, etc.
  - Format: `postgresql://user:password@host:port/database`

### 4. Database Setup for Production

**Option A: Vercel Postgres (Recommended)**
1. In Vercel dashboard, go to Storage → Create Database → Postgres
2. Copy the connection string
3. Add as `DATABASE_URL` environment variable
4. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
5. Run migrations: `npx prisma migrate deploy`

**Option B: Supabase**
1. Create a project at [supabase.com](https://supabase.com)
2. Get connection string from Settings → Database
3. Add as `DATABASE_URL` environment variable
4. Update Prisma schema and run migrations

**Option C: Keep SQLite (Not Recommended for Production)**
- SQLite files don't persist on Vercel's serverless functions
- Only use for development/testing

### 5. Update Prisma Schema for Production

If using PostgreSQL, update `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Then regenerate Prisma client:
```bash
npx prisma generate
```

### 6. Run Database Migrations

After setting up the production database:

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy
```

Or add a build script in `package.json`:
```json
{
  "scripts": {
    "postinstall": "prisma generate",
    "vercel-build": "prisma migrate deploy && next build"
  }
}
```

### 7. Update Google OAuth Redirect URI

If using Google OAuth:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to APIs & Services → Credentials
3. Edit your OAuth 2.0 Client ID
4. Add authorized redirect URI: `https://your-domain.vercel.app/api/auth/callback/google`

### 8. Verify Deployment

After deployment, verify:
- [ ] Homepage loads correctly
- [ ] Authentication works (sign up/sign in)
- [ ] Google OAuth works (if configured)
- [ ] Search page loads listings
- [ ] Profile page saves data
- [ ] Database connections work

## Troubleshooting

### Build Errors

- **Prisma Client not found**: Add `prisma generate` to build process
- **Environment variables missing**: Check Vercel environment variables
- **Database connection failed**: Verify `DATABASE_URL` format

### Runtime Errors

- **NextAuth errors**: Check `NEXTAUTH_SECRET` and `NEXTAUTH_URL`
- **Database errors**: Verify database is accessible and migrations ran
- **OAuth errors**: Check redirect URIs match your domain

## Post-Deployment

1. Test all features end-to-end
2. Monitor Vercel logs for errors
3. Set up error tracking (Sentry, etc.)
4. Configure custom domain (optional)
5. Set up CI/CD for automatic deployments

## Useful Commands

```bash
# Local development
npm run dev

# Build locally
npm run build

# Check for issues
npm run lint

# Database operations
npx prisma studio          # Open database GUI
npx prisma migrate dev     # Create new migration
npx prisma migrate deploy  # Run migrations in production
npx prisma generate        # Regenerate Prisma client
```

