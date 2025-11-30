# RentIQ

A modern rental approval platform that helps renters find properties they're pre-approved for and helps landlords verify tenant eligibility.

## Features

- 🔐 **Authentication**: Email/password and Google OAuth login
- 🏠 **Smart Search**: Filter listings by income, credit score, and preferences
- 📊 **Approval Scoring**: Real-time calculation of approval chances for each listing
- 📝 **Pre-approval Letters**: Generate verified proof of funds for landlords
- 💾 **Profile Management**: Save search preferences and profile information
- 🖼️ **Image Gallery**: Full-screen slideshow for property images

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js (Auth.js)
- **Database**: Prisma with SQLite (dev) / PostgreSQL (production)
- **Icons**: Lucide React, React Icons

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/tylermalin/RentIQ.git
cd RentIQ
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your configuration:
- Generate `NEXTAUTH_SECRET` with: `openssl rand -base64 32`
- Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` if using Google OAuth (optional)

4. Set up the database:
```bash
npx prisma generate
npx prisma migrate dev
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── listing/           # Listing detail pages
│   ├── profile/           # User profile page
│   ├── search/            # Search page
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── Navbar.tsx         # Navigation bar
│   ├── Footer.tsx         # Footer component
│   ├── Logo.tsx           # RentIQ logo component
│   └── HowItWorks.tsx     # How it works section
├── lib/                   # Utility functions
│   ├── auth.ts            # NextAuth configuration
│   ├── prisma.ts          # Prisma client
│   ├── listings.ts        # Listing data and types
│   └── eligibility.ts     # Approval scoring logic
├── prisma/                # Database schema
│   └── schema.prisma      # Prisma schema
└── scripts/               # Utility scripts
    └── scrapeCraigslistLa.ts  # Craigslist scraper
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXTAUTH_SECRET` | Secret key for NextAuth sessions | Yes |
| `NEXTAUTH_URL` | Base URL of your application | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | No |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | No |
| `DATABASE_URL` | Database connection string | Yes |

## Deployment

### Vercel

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

Vercel will automatically:
- Detect Next.js
- Run `npm install` and `npm run build`
- Deploy your application

### Database Setup for Production

For production, consider using PostgreSQL instead of SQLite:

1. Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. Add `DATABASE_URL` to your Vercel environment variables
3. Run migrations: `npx prisma migrate deploy`

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run scrape` - Run Craigslist scraper (development)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

