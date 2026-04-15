# CivicPulse v2 - Vercel Deployment Setup Guide

## Quick Start: Deploy to Vercel in 5 Minutes

### Step 1: Connect Your GitHub Repository to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **Add New** → **Project**
3. Click **Import Git Repository**
4. Search for and select: `hallamohamad1-design/civic-final`
5. Click **Import**

### Step 2: Configure Environment Variables

Vercel will ask for environment variables. Add these **9 required variables**:

| Variable | Where to Find It | Example |
|----------|------------------|---------|
| `DATABASE_URL` | Manus → Settings → Database | `mysql://user:pass@host/db` |
| `JWT_SECRET` | Manus → Settings → Secrets | Long random string |
| `VITE_APP_ID` | Manus → Settings → Secrets | UUID format |
| `OAUTH_SERVER_URL` | Manus → Settings → Secrets | `https://api.manus.im` |
| `VITE_OAUTH_PORTAL_URL` | Manus → Settings → Secrets | `https://oauth.manus.im` |
| `BUILT_IN_FORGE_API_URL` | Manus → Settings → Secrets | `https://forge.manus.im` |
| `BUILT_IN_FORGE_API_KEY` | Manus → Settings → Secrets | Bearer token |
| `VITE_FRONTEND_FORGE_API_URL` | Manus → Settings → Secrets | `https://forge.manus.im` |
| `VITE_FRONTEND_FORGE_API_KEY` | Manus → Settings → Secrets | Bearer token |

### Step 3: How to Get Values from Manus

**For each variable:**

1. Open your Manus project dashboard
2. Look for **Settings** or **⚙️ icon**
3. Go to **Secrets** tab
4. Find the variable name
5. Click on the value to reveal it
6. Copy the full value (not the masked version)
7. Paste into Vercel

### Step 4: Deploy

1. In Vercel, after adding all variables, click **Deploy**
2. Wait for the build to complete (usually 2-3 minutes)
3. Once deployed, you'll get a live URL like: `https://civic-final.vercel.app`

---

## Environment Variables Explained

### **Required Variables (Must Have)**

#### `DATABASE_URL`
- **What it is:** Your MySQL/TiDB database connection string
- **Format:** `mysql://username:password@hostname:port/database`
- **Where to find:** Manus project → Settings → Database section
- **Example:** `mysql://admin:securepass@db.example.com:3306/civicpulse`

#### `JWT_SECRET`
- **What it is:** Secret key for signing session cookies
- **Format:** Long random string (at least 32 characters)
- **Where to find:** Manus project → Settings → Secrets
- **Example:** `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0`

#### `VITE_APP_ID`
- **What it is:** Your Manus OAuth application ID
- **Format:** UUID or alphanumeric ID
- **Where to find:** Manus project → Settings → Secrets
- **Example:** `550e8400-e29b-41d4-a716-446655440000`

#### `OAUTH_SERVER_URL`
- **What it is:** Manus OAuth server endpoint
- **Format:** HTTPS URL
- **Where to find:** Manus project → Settings → Secrets
- **Default:** `https://api.manus.im`

#### `VITE_OAUTH_PORTAL_URL`
- **What it is:** Manus OAuth login portal URL
- **Format:** HTTPS URL
- **Where to find:** Manus project → Settings → Secrets
- **Default:** `https://oauth.manus.im`

#### `BUILT_IN_FORGE_API_URL`
- **What it is:** Manus built-in APIs endpoint (for LLM, storage, etc.)
- **Format:** HTTPS URL
- **Where to find:** Manus project → Settings → Secrets
- **Default:** `https://forge.manus.im`

#### `BUILT_IN_FORGE_API_KEY`
- **What it is:** Server-side API key for Manus services
- **Format:** Bearer token (long string)
- **Where to find:** Manus project → Settings → Secrets
- **Example:** `Bearer sk_live_abc123xyz...`

#### `VITE_FRONTEND_FORGE_API_URL`
- **What it is:** Frontend endpoint for Manus APIs
- **Format:** HTTPS URL
- **Where to find:** Manus project → Settings → Secrets
- **Default:** `https://forge.manus.im`

#### `VITE_FRONTEND_FORGE_API_KEY`
- **What it is:** Frontend API key for Manus services
- **Format:** Bearer token (long string)
- **Where to find:** Manus project → Settings → Secrets
- **Example:** `Bearer pk_live_abc123xyz...`

---

### **Optional Variables**

These are optional but recommended:

- `OWNER_NAME` - Your name or organization
- `OWNER_OPEN_ID` - Your Manus user ID
- `VITE_ANALYTICS_ENDPOINT` - Analytics service URL
- `VITE_ANALYTICS_WEBSITE_ID` - Analytics website ID
- `VITE_APP_TITLE` - Application title (default: `CivicPulse`)
- `VITE_APP_LOGO` - Application logo URL

---

## Step-by-Step: Adding Variables to Vercel

### In Vercel Dashboard:

1. **Go to your project** → Click **Settings**
2. **Click Environment Variables** in the left sidebar
3. **For each variable:**
   - Click **Add New**
   - Enter the variable name (e.g., `DATABASE_URL`)
   - Paste the value from Manus
   - Select which environments: ✓ Production ✓ Preview ✓ Development
   - Click **Save**
4. **After adding all 9 variables**, go to **Deployments**
5. **Click the three dots** on the latest deployment
6. **Select Redeploy** to apply the variables

---

## Troubleshooting

### "Build failed" or "Deployment error"
- **Check:** All 9 required variables are added
- **Check:** No typos in variable names
- **Check:** Values are not empty or truncated

### "Database connection failed"
- **Check:** `DATABASE_URL` is correct
- **Check:** Your database allows connections from Vercel's IP
- **Solution:** Contact your database provider to whitelist Vercel IPs

### "OAuth login not working"
- **Check:** `VITE_APP_ID` is correct
- **Check:** `OAUTH_SERVER_URL` is correct
- **Check:** `VITE_OAUTH_PORTAL_URL` is correct

### "API calls failing"
- **Check:** `BUILT_IN_FORGE_API_KEY` is correct
- **Check:** `BUILT_IN_FORGE_API_URL` is correct

---

## After Deployment

Once deployed, you can:

1. **View your live site** at the Vercel-provided URL
2. **Monitor logs** in Vercel → Deployments → Function Logs
3. **Set up custom domain** in Vercel → Settings → Domains
4. **Enable auto-deployments** from GitHub (automatic on every push)

---

## Need Help?

- **Vercel Docs:** https://vercel.com/docs
- **Manus Docs:** https://docs.manus.im
- **Support:** https://help.manus.im

Good luck with your deployment! 🚀
