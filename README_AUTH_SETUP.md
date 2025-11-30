# Authentication Setup Guide

## Quick Fix for Server Error

If you're seeing a "Server error - There is a problem with the server configuration", it's likely because `NEXTAUTH_SECRET` is not set.

### Step 1: Create `.env.local` file

Create a `.env.local` file in the root directory with the following:

```bash
# Generate a secret: openssl rand -base64 32
NEXTAUTH_SECRET=your-generated-secret-here
NEXTAUTH_URL=http://localhost:3000

# Google OAuth (optional for now, can be empty)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

### Step 2: Generate NEXTAUTH_SECRET

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

Copy the output and paste it as the value for `NEXTAUTH_SECRET` in `.env.local`.

### Step 3: Restart the dev server

After creating `.env.local`, restart your Next.js dev server:

```bash
npm run dev
```

## Full Setup Instructions

1. **Copy the example env file:**
   ```bash
   cp .env.local.example .env.local
   ```

2. **Generate NEXTAUTH_SECRET:**
   ```bash
   openssl rand -base64 32
   ```

3. **Update `.env.local`** with your generated secret

4. **For Google OAuth (optional):**
   - Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
   - Copy Client ID and Client Secret to `.env.local`

5. **Restart the server:**
   ```bash
   npm run dev
   ```

## Troubleshooting

- **"Server error"**: Make sure `NEXTAUTH_SECRET` is set in `.env.local`
- **"Invalid credentials"**: Check that your database is migrated (`npx prisma migrate dev`)
- **Google OAuth not working**: Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set correctly

