# The Watchlist — Vercel + Postgres version

## What changed from the local version
Instead of one Express server writing to a `data.json` file, this version uses:
- `/api/items.js` and `/api/items/[id].js` — small serverless functions Vercel runs on demand
- A real Postgres database (via Vercel's built-in Storage) to actually save your data permanently

## Step-by-step deployment

### 1. Push this folder to GitHub
```
git init
git add .
git commit -m "Watchlist for Vercel"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/watchlist-vercel.git
git push -u origin main
```

### 2. Import the project into Vercel
1. Go to **https://vercel.com** and sign in (GitHub sign-in is easiest)
2. Click **Add New...** → **Project**
3. Select your `watchlist-vercel` repo → click **Import**
4. Leave all settings as default → click **Deploy**
5. It'll deploy, but the site won't work yet — you still need the database (next step)

### 3. Add a free Postgres database
1. In your project on Vercel, click the **Storage** tab
2. Click **Create Database** → choose **Postgres** (powered by Neon) → pick the **Free** plan
3. Click **Connect** to link it to your project — Vercel automatically adds the required
   environment variables (`POSTGRES_URL`, etc.) for you. No manual config needed.
4. Go to **Deployments** → click the **...** menu on the latest deployment → **Redeploy**
   (this makes sure your app picks up the new database connection)

### 4. Load your existing list into the database (one-time)
This step runs the `seed.js` script against your live database from your computer.

1. Install the Vercel CLI:
   ```
   npm install -g vercel
   ```
2. Inside this project folder, log in and link it to your Vercel project:
   ```
   vercel login
   vercel link
   ```
   (follow the prompts — pick the same project you just deployed)
3. Pull down the database connection details:
   ```
   vercel env pull .env.development.local
   ```
4. Install dependencies and run the seed script:
   ```
   npm install
   node seed.js
   ```
   You should see: `Seeded 37 items.`

### 5. Visit your site
Vercel gives you a URL like `https://watchlist-vercel.vercel.app` — open it, and your
37 titles should already be there. Adding and deleting will now persist for real,
since it's backed by an actual database instead of a temporary file.

## Local testing (optional)
```
vercel dev
```
This runs the same serverless functions + database locally at `http://localhost:3000`,
using the `.env.development.local` file created in step 4.
