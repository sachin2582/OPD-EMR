## Deploy OPD-EMR to Vercel

This guide explains how to deploy the React frontend to Vercel and connect it to a backend. Vercel hosts the static build of Create React App. For the backend, use an external host (recommended) or refactor into Vercel serverless functions.

### Prerequisites
- **GitHub repo connected**: `sachin2582/OPD-EMR` (already pushed)
- **Vercel account** with access to GitHub
- **Node.js** 18.x or 20.x for builds

### Vercel Project Settings
- **Framework Preset**: Create React App
- **Build Command**: `npm run vercel-build` (falls back to `npm run build`)
- **Output Directory**: `build`
- **Install Command**: (auto) or `npm ci`
- **Node Version**: 18.x or 20.x (Project → Settings → General → Node.js Version)

### Environment Variables (Production and Preview)
- **Application**
  - `NODE_ENV=production`
  - `REACT_APP_API_BASE_URL=https://<your-backend-or-vercel-url>`
  - `CORS_ORIGIN=https://<your-vercel-domain>`
- **Security**
  - `JWT_SECRET=<strong-random-string>`
  - `BCRYPT_ROUNDS=12` (optional)
- **Rate limiting (optional)**
  - `RATE_LIMIT_WINDOW_MS=900000`
  - `RATE_LIMIT_MAX_REQUESTS=1000`
- **Database**
  - Prefer a managed DB in production (e.g., Postgres on Neon/Supabase/Railway):
    - `DATABASE_URL=postgresql://user:pass@host:port/db`
  - Avoid SQLite on Vercel (ephemeral filesystem means data won’t persist): the default `file:./opd-emr.db` is only for local usage.
- **Other**
  - `MAX_FILE_SIZE=10mb` (optional)
  - `PORT`, `HOST` are not used by static hosting on Vercel

See `production.env.example` for full variable descriptions.

### Backend Options
- **Option A (Recommended): Host backend elsewhere** (Railway, Render, Fly.io, EC2, etc.)
  - Deploy `backend/server.js` on a server/PAAS
  - Set `REACT_APP_API_BASE_URL` to that backend’s public URL
  - Optional: add a `vercel.json` rewrite to keep same-origin `/api` calls:

```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "https://your-backend-host/:path*" }
  ]
}
```

- **Option B: Convert backend to Vercel Serverless**
  - Move your API routes into `api/` functions
  - Use an external database (no SQLite persistence)
  - Avoid long-lived processes/websockets and filesystem writes

### One-time Setup on Vercel
1. Go to `https://vercel.com` → New Project → Import `OPD-EMR`
2. Confirm settings:
   - Framework: Create React App
   - Build Command: `npm run vercel-build`
   - Output Directory: `build`
   - Node Version: 18 or 20
3. Add Environment Variables (Production and Preview) from the list above
4. Deploy

### Verify Deployment
1. Open the deployed URL and ensure the homepage loads
2. Run automated smoke tests from your machine:

```powershell
$env:DEPLOYMENT_URL = 'https://<your-vercel-domain>'
node test-deployment.js
```

Expected:
- Frontend `/` returns 200
- If your backend is protected, unauthenticated `/api/*` calls should 401/400 as defined

### Common Issues & Fixes
- **Data not persisting**: Using SQLite on Vercel will not persist. Switch to external Postgres and update `DATABASE_URL`.
- **CORS errors**: Ensure `CORS_ORIGIN` matches your Vercel domain, and your backend allows it.
- **API 404s from frontend**: If using external backend, add `vercel.json` rewrite or set `REACT_APP_API_BASE_URL` correctly.
- **Build failures**: Use Node 18/20; try `npm ci`; clear lockfile issues.

### Local Production Run (optional)
You can simulate a production build locally:

```bash
npm run build
npx serve -s build -l 3000
```

Or start both frontend and backend locally:

```bash
npm run start:production
```

### Useful Scripts
- `npm run vercel-build` → CRA production build
- `npm run start:production` → runs `start-production.js` to boot backend and serve `build/`
- `node test-deployment.js` → post-deploy smoke tests (set `DEPLOYMENT_URL`)

---

For quick CLI-driven prep, see `deploy-to-vercel.bat` or `deploy-to-vercel.ps1`.


