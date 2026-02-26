# 🚀 Free Deployment Guide — Goa Healers

Deploy your app for **$0/month** using Vercel + Render + MongoDB Atlas.

| Component   | Platform       | Free Tier                  |
|-------------|---------------|----------------------------|
| Frontend    | Vercel         | 100 GB bandwidth/mo       |
| Backend     | Render         | 750 hrs/mo (spins down after 15 min idle) |
| Database    | MongoDB Atlas  | 512 MB storage (M0 forever free) |

---

## Step 1: Push Code to GitHub

```bash
cd d:\goa-healers-final01
git init
git add .
git commit -m "Initial commit — Goa Healers"
```

Then create a repo on [github.com](https://github.com/new) and push:

```bash
git remote add origin https://github.com/YOUR_USERNAME/goa-healers.git
git branch -M main
git push -u origin main
```

> ⚠️ The `.gitignore` file will automatically exclude `.env` files with your credentials.

---

## Step 2: Set Up MongoDB Atlas (Free M0 Cluster)

1. Go to **[mongodb.com/atlas](https://www.mongodb.com/atlas)** → Sign up free
2. Click **"Build a Database"** → Choose **M0 FREE** → Select a region close to you
3. Create a **Database User** (username + password)
4. Under **Network Access** → Click **"Add IP Address"** → Select **"Allow Access from Anywhere"** (`0.0.0.0/0`)
5. Go to **"Connect"** → **"Drivers"** → Copy the connection string:
   ```
   mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. **Save this — you'll need it for Render.**

> You already have Atlas configured at `cluster0.g5mayra.mongodb.net`. You can reuse your existing cluster!

---

## Step 3: Deploy Backend on Render

1. Go to **[render.com](https://render.com)** → Sign up with GitHub
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repo (`goa-healers`)
4. Configure:
   - **Name**: `goa-healers-api`
   - **Root Directory**: `backend`
   - **Runtime**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn server:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: `Free`
5. Add **Environment Variables**:
   | Key           | Value                                                  |
   |---------------|--------------------------------------------------------|
   | `MONGO_URL`   | Your MongoDB Atlas connection string from Step 2       |
   | `DB_NAME`     | `goa_healers`                                          |
   | `CORS_ORIGINS`| `https://your-app.vercel.app` (update after Step 4)   |

6. Click **"Create Web Service"** → Wait for deploy ✅
7. Copy your Render URL (e.g., `https://goa-healers-api.onrender.com`)

---

## Step 4: Deploy Frontend on Vercel

1. Go to **[vercel.com](https://vercel.com)** → Sign up with GitHub
2. Click **"Add New Project"** → Import your `goa-healers` repo
3. Configure:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Create React App`
   - **Build Command**: `yarn build`  (should auto-detect)
   - **Output Directory**: `build`  (should auto-detect)
4. Add **Environment Variable**:
   | Key                       | Value                                       |
   |---------------------------|---------------------------------------------|
   | `REACT_APP_BACKEND_URL`   | `https://goa-healers-api.onrender.com`      |
   
   *(Use the actual Render URL from Step 3)*

5. Click **"Deploy"** → Wait for build ✅
6. Copy your Vercel URL (e.g., `https://goa-healers.vercel.app`)

---

## Step 5: Connect Everything

1. Go back to **Render Dashboard** → Your service → **Environment**
2. Update `CORS_ORIGINS` to your Vercel URL:
   ```
   https://goa-healers.vercel.app
   ```
3. Render will auto-redeploy.

**Your app is now live! 🎉**

---

## 🔄 Updating Your App

After making local changes:

```bash
git add .
git commit -m "Your change description"
git push
```

Both Vercel and Render will **auto-deploy** on every push to `main`.

---

## ⚠️ Important Notes

- **Render Free Tier Sleep**: The backend goes to sleep after 15 minutes of inactivity. The first request after sleeping takes ~30 seconds to wake up. This is expected behaviour on the free tier.
- **Ratings & Photos**: These are stored in MongoDB (primary) with a local JSON fallback. On Render, the local fallback files reset on each deploy, but MongoDB data persists.
- **Custom Domain**: Both Vercel and Render support free custom domains if you own one.
