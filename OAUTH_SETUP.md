# GitHub OAuth Setup for Vote Feature

## 1. Create GitHub OAuth App

1. Go to https://github.com/settings/developers
2. Click "OAuth Apps" → "New OAuth App"
3. Fill in:
   - **Application name**: `OpenChaos Voting`
   - **Homepage URL**: `http://localhost:3000` (or your production domain)
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback`
4. Click "Register application"
5. Copy the **Client ID**
6. Click "Generate a new client secret" and copy the **Client Secret**

## 2. Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
GITHUB_CLIENT_ID=your_client_id_here
GITHUB_CLIENT_SECRET=your_client_secret_here
```

For production deployment (Vercel):
- Add `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` as environment variables in Vercel dashboard
- Update callback URL to: `https://openchaos.dev/api/auth/callback`

## 3. How It Works

- User clicks "🔐 Login with GitHub" → Redirects to GitHub OAuth
- User authorizes app → GitHub redirects back with code
- Server exchanges code for access token
- Token stored in HTTP-only cookie (secure)
- User profile stored in client cookie (readable by UI)
- Vote buttons use the token to add reactions via GitHub API

## Security Notes

- Access token is stored in `HttpOnly` cookie (not accessible to JavaScript)
- User profile is in regular cookie (for UI display)
- Tokens expire in 30 days
- User can logout anytime (clears cookies)
- Only `public_repo` scope requested (minimal permissions)

## Testing Locally

1. Ensure `.env.local` is configured
2. Run: `npm run dev`
3. Visit http://localhost:3000
4. Click "🔐 Login with GitHub"
5. Authorize the app
6. You should see your avatar and username
7. Try voting on PRs!

## Troubleshooting

**"redirect_uri mismatch" error:**
- Check callback URL in GitHub OAuth app matches exactly
- Include trailing slash or not as needed

**"GITHUB_CLIENT_ID not configured" error:**
- Ensure `.env.local` exists and has correct values
- Restart dev server after creating `.env.local`

**Rate limiting issues:**
- Each user gets 5,000 API requests/hour with OAuth token
- Much higher than anonymous 60/hour
- Should not be an issue
