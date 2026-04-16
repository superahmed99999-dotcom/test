# CivicPulse v2 - Vercel Environment Variables Setup

## ⚡ Quick Copy-Paste Setup for Vercel

Below are all the environment variables your CivicPulse application needs to run on Vercel. Follow the steps below to add them.

---

## 📋 Required Environment Variables (9 Total)

### **1. DATABASE_URL**
```
mysql://4PTA97vjLkqkTH5.root:sRvJI98i6m0xFL7ZK9qo@gateway05.us-east-1.prod.aws.tidbcloud.com:4000/7cQU5NWhYfCBMMiBo65Nh3?ssl={"rejectUnauthorized":true}
```
**What it is:** Your TiDB MySQL database connection string
**Status:** ✅ Ready to use

---

### **2. JWT_SECRET**
```
KzJXrwMGBQGApfTiS8YdvL
```
**What it is:** Secret key for signing session cookies
**Status:** ✅ Ready to use

---

### **3. VITE_APP_ID**
```
7cQU5NWhYfCBMMiBo65Nh3
```
**What it is:** Your Manus OAuth application ID
**Status:** ✅ Ready to use

---

### **4. OAUTH_SERVER_URL**
```
https://api.manus.im
```
**What it is:** Manus OAuth server endpoint
**Status:** ✅ Ready to use

---

### **5. VITE_OAUTH_PORTAL_URL**
```
https://manus.im
```
**What it is:** Manus OAuth login portal URL
**Status:** ✅ Ready to use

---

### **6. BUILT_IN_FORGE_API_URL**
```
https://forge.manus.ai
```
**What it is:** Manus built-in APIs endpoint (LLM, storage, etc.)
**Status:** ✅ Ready to use

---

### **7. BUILT_IN_FORGE_API_KEY**
```
DNFvRA2m8q3pymSvzskUwy
```
**What it is:** Server-side API key for Manus services
**Status:** ✅ Ready to use

---

### **8. VITE_FRONTEND_FORGE_API_URL**
```
https://forge.manus.ai
```
**What it is:** Frontend endpoint for Manus APIs
**Status:** ✅ Ready to use

---

### **9. VITE_FRONTEND_FORGE_API_KEY**
```
eLeBveZmcxRqkVspqHaD8h
```
**What it is:** Frontend API key for Manus services
**Status:** ✅ Ready to use

---

## 🚀 How to Add These to Vercel

### **Step 1: Go to Vercel Dashboard**
1. Open https://vercel.com
2. Go to your project: **civic-final**
3. Click **Settings** in the top menu

### **Step 2: Add Environment Variables**
1. Click **Environment Variables** in the left sidebar
2. For each variable below, click **Add New**:

### **Step 3: Copy & Paste Each Variable**

**Variable 1:**
- **Name:** `DATABASE_URL`
- **Value:** Copy from above (the long mysql:// string)
- **Environments:** ✓ Production ✓ Preview ✓ Development
- Click **Save**

**Variable 2:**
- **Name:** `JWT_SECRET`
- **Value:** `KzJXrwMGBQGApfTiS8YdvL`
- **Environments:** ✓ Production ✓ Preview ✓ Development
- Click **Save**

**Variable 3:**
- **Name:** `VITE_APP_ID`
- **Value:** `7cQU5NWhYfCBMMiBo65Nh3`
- **Environments:** ✓ Production ✓ Preview ✓ Development
- Click **Save**

**Variable 4:**
- **Name:** `OAUTH_SERVER_URL`
- **Value:** `https://api.manus.im`
- **Environments:** ✓ Production ✓ Preview ✓ Development
- Click **Save**

**Variable 5:**
- **Name:** `VITE_OAUTH_PORTAL_URL`
- **Value:** `https://manus.im`
- **Environments:** ✓ Production ✓ Preview ✓ Development
- Click **Save**

**Variable 6:**
- **Name:** `BUILT_IN_FORGE_API_URL`
- **Value:** `https://forge.manus.ai`
- **Environments:** ✓ Production ✓ Preview ✓ Development
- Click **Save**

**Variable 7:**
- **Name:** `BUILT_IN_FORGE_API_KEY`
- **Value:** `DNFvRA2m8q3pymSvzskUwy`
- **Environments:** ✓ Production ✓ Preview ✓ Development
- Click **Save**

**Variable 8:**
- **Name:** `VITE_FRONTEND_FORGE_API_URL`
- **Value:** `https://forge.manus.ai`
- **Environments:** ✓ Production ✓ Preview ✓ Development
- Click **Save**

**Variable 9:**
- **Name:** `VITE_FRONTEND_FORGE_API_KEY`
- **Value:** `eLeBveZmcxRqkVspqHaD8h`
- **Environments:** ✓ Production ✓ Preview ✓ Development
- Click **Save**

---

## 📊 Optional Environment Variables

These are optional but recommended for better functionality:

| Variable | Value |
|----------|-------|
| `OWNER_NAME` | `oudao3188` |
| `OWNER_OPEN_ID` | `jfpe8jVTgEMozyAQ8wAD29` |
| `VITE_ANALYTICS_ENDPOINT` | `https://manus-analytics.com` |
| `VITE_ANALYTICS_WEBSITE_ID` | `a651e352-f580-4973-8251-ad77b250b4a8` |
| `VITE_APP_TITLE` | `CivicPulse` |
| `VITE_APP_LOGO` | `https://files.manuscdn.com/user_upload_by_module/web_dev_logo/310519663555490764/wJgNEIfSnylXuKdJ.png` |

---

## ✅ After Adding All Variables

1. **Go to Deployments** tab
2. **Find your latest deployment** (the one with the 404 error)
3. **Click the three dots (⋯)** on the right
4. **Select "Redeploy"**
5. **Wait 2-3 minutes** for the build to complete
6. **Visit your site** at: https://civic-final-odic.vercel.app

---

## 🔍 Verify It's Working

Once redeployed, you should see:
- ✅ Status: **Ready** (not 404)
- ✅ Your CivicPulse homepage loads
- ✅ You can sign in
- ✅ You can report issues
- ✅ You can view the map

---

## ⚠️ Important Notes

- **DATABASE_URL** contains special characters and SSL settings - copy it exactly as shown
- **API Keys** are sensitive - don't share them publicly
- All variables should be added to all environments (Production, Preview, Development)
- If you change any variable, you must redeploy for changes to take effect

---

## 🆘 Troubleshooting

### Still seeing 404 error?
1. Make sure all 9 variables are added
2. Check that no variables are empty
3. Redeploy the latest deployment
4. Wait a few minutes and refresh

### Database connection error?
- The DATABASE_URL is correct and ready to use
- TiDB Cloud is configured to accept connections from Vercel

### OAuth login not working?
- All OAuth variables are correct
- Make sure you're using the correct app ID

---

## 📞 Need Help?

If something still doesn't work:
1. Check Vercel Function Logs for error messages
2. Verify all 9 variables are present
3. Try redeploying
4. Contact Manus support: https://help.manus.im

Good luck! Your CivicPulse app is almost live! 🚀
