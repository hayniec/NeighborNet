# Deployment Guide for KithGrid

KithGrid is designed to be easily self-hosted or deployed to cloud providers. This guide covers the two most common methods: Docker (recommended) and manual Node.js deployment.

## Option 1: Docker (Recommended)

This method works on any system with Docker installed (Linux VPS, DigitalOcean, AWS, local machine, etc.).

### Prerequisites
- Docker
- Docker Compose

### Quick Start
1.  **Clone the repository** (or copy the files to your server).
2.  **Configure Environment**:
    Open `docker-compose.yml` and adjust the environment variables to set your initial community settings.
    ```yaml
    environment:
      - NEXT_PUBLIC_COMMUNITY_NAME=My Awesome HOA
      - NEXT_PUBLIC_DEFAULT_THEME=Ocean
    ```
3.  **Run the application**:
    ```bash
    docker-compose up -d --build
    ```
4.  **Access the app**:
    Open `http://localhost:3000` (or your server's IP).

### Persistent Data
Currently, user settings and theme references are stored in the browser (localStorage) for this strict frontend version.
Environment variables in `docker-compose.yml` serve as the **default** for new users.

---

## Option 2: Cloud Platform Deployment (Automated)

The easiest way to host KithGrid is to connect your GitHub repository to a modern cloud provider.

### Step 1: Push to GitHub
1.  Initialize git: `git init`
2.  Add files: `git add .`
3.  Commit: `git commit -m "Initial commit"`
4.  Create a new repository on GitHub.
5.  Link and push:
    ```bash
    git remote add origin https://github.com/YOUR_USERNAME/kith-grid.git
    git push -u origin main
    ```

### Step 2: Connect to Provider
Choose one of the following providers. They all offer excellent free tiers for projects like this.

#### **Vercel (Recommended for Next.js)**
1.  Go to [vercel.com](https://vercel.com) and sign up with GitHub.
2.  Click **"Add New Project"**.
3.  Select your `kith-grid` repository.
4.  **Framework Preset**: It should auto-detect "Next.js".
5.  **Environment Variables**: Add the following (optional but recommended):
    *   `NEXT_PUBLIC_COMMUNITY_NAME`: Your HOA Name
    *   `NEXT_PUBLIC_DEFAULT_THEME`: "Ocean" (or any supported theme)
6.  Click **Deploy**.

#### **Netlify**
1.  Go to [netlify.com](https://netlify.com) and sign up with GitHub.
2.  Click **"Add new site"** > **"Import an existing project"**.
3.  Choose GitHub and select your repository.
4.  **Build Command**: `npm run build`
5.  **Publish Directory**: `.next` (Netlify's Next.js plugin usually handles this automatically).
6.  Click **Deploy Site**.

#### **Railway (Docker)**
1.  Go to [railway.app](https://railway.app) and login with GitHub.
2.  Click **"New Project"** > **"Deploy from GitHub repo"**.
3.  Select your repository.
4.  Railway will automatically detect the `Dockerfile` and build it.
5.  Go to **Variables** tab to set your `NEXT_PUBLIC_...` variables.
6.  A domain will be generated for you automatically.

### Firebase Hosting
1.  Install Firebase CLI: `npm install -g firebase-tools`
2.  Login: `firebase login`
3.  Initialize: `firebase init hosting`
    *   **Public directory**: `out` (for static export) or `.next` (for web frameworks)
    *   **Configure as single-page app**: Yes
4.  Deploy: `firebase deploy`
    *   *Note: For standard Firebase Hosting (free tier), you may need to add `output: 'export'` to `next.config.js` to create a purely static site.*

---

## Option 3: Backend & Database Configuration (Neon / Supabase)

While the app defaults to `localStorage` (Mock Data), we have prepared the initial configuration for migrating to a real Postgres database.

### Database Setup
1.  Create a project on **Neon** or **Supabase**.
2.  Go to the SQL Editor in your dashboard.
3.  Copy and paste the contents of `db/schema.sql`.
4.  Run the query to generate your initial tables (`neighbors`, `events`, `marketplace_items`, etc.).

### Data Connection (Future Steps)
To fully connect the app:
1.  Install the client library: `npm install @supabase/supabase-js` (or `pg` for Neon).
2.  Create a `lib/db.ts` file to initialize the client with your API keys.
3.  Replace the mock data calls in `lib/data.ts` with real database queries.
