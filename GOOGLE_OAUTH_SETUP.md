# Google OAuth Setup Guide

## Error: 400 invalid_request

This error occurs when Google OAuth credentials are missing or incorrectly configured.

## Step-by-Step Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google+ API** (or **Google Identity API**)

### 2. Create OAuth 2.0 Credentials

1. Navigate to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. If prompted, configure the OAuth consent screen:
   - Choose **External** (unless you have a Google Workspace)
   - Fill in required fields:
     - App name: "Approval"
     - User support email: Your email
     - Developer contact: Your email
   - Add scopes: `email`, `profile`
   - Add test users (if in testing mode)

### 3. Configure OAuth Client

1. Application type: **Web application**
2. Name: "Approval Web Client"
3. **Authorized redirect URIs**: Add these:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
   For production, also add:
   ```
   https://yourdomain.com/api/auth/callback/google
   ```

### 4. Copy Credentials

1. After creating, you'll see:
   - **Client ID** (looks like: `123456789-abc.apps.googleusercontent.com`)
   - **Client Secret** (looks like: `GOCSPX-abc123...`)

### 5. Add to `.env.local`

Create or update `.env.local` in your project root:

```bash
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000

GOOGLE_CLIENT_ID=your-client-id-here
GOOGLE_CLIENT_SECRET=your-client-secret-here
```

### 6. Restart Dev Server

```bash
npm run dev
```

## Troubleshooting

### Error: 400 invalid_request

**Causes:**
- Missing `GOOGLE_CLIENT_ID` or `GOOGLE_CLIENT_SECRET` in `.env.local`
- Redirect URI doesn't match exactly: `http://localhost:3000/api/auth/callback/google`
- OAuth consent screen not configured
- Credentials copied incorrectly (extra spaces, wrong values)

**Solutions:**
1. Verify `.env.local` exists and has both `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
2. Check redirect URI in Google Console matches exactly: `http://localhost:3000/api/auth/callback/google`
3. Make sure there are no extra spaces in the env variables
4. Restart the dev server after updating `.env.local`
5. Clear browser cache and try again

### Error: redirect_uri_mismatch

- The redirect URI in Google Console must match exactly: `http://localhost:3000/api/auth/callback/google`
- Check for trailing slashes or http vs https mismatches
- Make sure you're using the correct port (3000, not 3001)

### Testing Without Google OAuth

If you don't want to set up Google OAuth right now, you can:
- Use email/password authentication (credentials provider)
- Leave `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` empty
- The Google button will automatically be hidden when credentials are not configured

## Quick Check

Run this to verify your environment variables are loaded:

```bash
node -e "console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Missing')"
```

If it shows "Missing", your `.env.local` file isn't being loaded. Make sure:
- File is named exactly `.env.local` (starts with a dot)
- File is in the project root (same directory as `package.json`)
- You've restarted the dev server after creating/updating it

