# Vercel Deployment & Google Integration Guide

This guide provides step-by-step instructions for deploying the **LeadGeeks IT SMART Goals 2026** platform to [Vercel](https://vercel.com), configuring the remote Aiven PostgreSQL database, and setting up Google OAuth for live synchronization and Google Drive file imports.

---

## 1. Prerequisites & Environment Variables

When deploying to Vercel, navigate to **Project Settings > Environment Variables** and configure the following variables:

| Variable Name | Description | Example / Format |
| :--- | :--- | :--- |
| `DATABASE_URL` | Remote Aiven PostgreSQL connection string | `postgres://avnadmin:<PASSWORD>@<HOST>:<PORT>/smart?sslmode=require` |
| `GOOGLE_CLIENT_ID` | Google Cloud OAuth 2.0 Client ID | `<YOUR_GOOGLE_CLIENT_ID>.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google Cloud OAuth 2.0 Client Secret | `<YOUR_GOOGLE_CLIENT_SECRET>` |
| `GOOGLE_SHEETS_ID` | Default master Google Spreadsheet ID | `1vWFuIU_LxCqyQ7Bn5N2K4gBDcIcnmogYA_ALiucWxbo` |
| `GOOGLE_SHEETS_URL` | Direct URL to the master spreadsheet | `https://docs.google.com/spreadsheets/d/1vWFuIU_LxCqyQ7Bn5N2K4gBDcIcnmogYA_ALiucWxbo` |
| `AUTH_SECRET` | 32+ character random key for session AES-256 encryption | `<32_CHAR_RANDOM_SECRET_KEY>` |
| `GOOGLE_REDIRECT_URI` | *(Optional)* Explicit OAuth redirect URI override | `https://<your-app>.vercel.app/api/auth/callback/google` |

> [!NOTE]
> `DATABASE_URL` connects the app to your remote Aiven PostgreSQL instance with SSL enabled (`rejectUnauthorized: false`). The database is already seeded with all 19 goals, 228 monthly logs, and 35 Big Six objectives.

---

## 2. Google Cloud Console OAuth 2.0 Setup

To enable Google sign-in and Google Drive/Sheets integration on your Vercel domain:

1. Open the [Google Cloud Console Credentials Page](https://console.cloud.google.com/apis/credentials).
2. Select your project and click on your OAuth 2.0 Web Client ID.
3. Under **Authorized JavaScript origins**, add:
   - `http://localhost:3000` (for local development)
   - `https://<your-project-name>.vercel.app` (your Vercel production domain)
   - `https://<your-custom-domain.com>` (if using a custom domain)
4. Under **Authorized redirect URIs**, add:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://<your-project-name>.vercel.app/api/auth/callback/google`
   - `https://<your-custom-domain.com>/api/auth/callback/google`
5. Click **Save**.

### Required Google OAuth Scopes
The platform uses the following scopes (already configured in [`src/lib/auth/config.ts`](file:///home/noah/project/smart/src/lib/auth/config.ts)):
- `openid`, `email`, `profile` — User identity and avatar.
- `https://www.googleapis.com/auth/spreadsheets` — Read & write Google Sheets.
- `https://www.googleapis.com/auth/drive.readonly` — Browse spreadsheets and download `.xlsx` files from Google Drive.

---

## 3. Deploying to Vercel

### Method A: Deploy via GitHub (Recommended)
1. Push your latest code to your GitHub repository:
   ```bash
   git add .
   git commit -m "feat: vercel deployment readiness, remote postgres, and google drive importer"
   git push origin main
   ```
2. In the Vercel Dashboard, click **Add New... > Project** and import the repository.
3. Framework Preset: **Next.js** (auto-detected).
4. Add the environment variables from Section 1 above.
5. Click **Deploy**.

### Method B: Deploy via Vercel CLI
```bash
# Install Vercel CLI if needed
npm i -g vercel

# Login and deploy
vercel
```

---

## 4. How Google Sheets & Drive Import Works

The app includes a dedicated **Google Sheets & Drive Integration Modal** accessible via the **Google Sheet** button in the header:

1. **Open Active Sheet**: Click the external link icon or "Open in Google Sheets" to open the live sheet directly in Google Docs.
2. **Browse Google Drive**:
   - Once connected with Google Auth, the modal lists recent Google Spreadsheets and `.xlsx` files from your Drive.
   - Click **Import** on any file to parse the `ITE` goals and `The BIG Six` strategic objectives directly into the remote PostgreSQL database.
3. **Paste URL or File ID**:
   - Paste any Google Sheet link (`https://docs.google.com/spreadsheets/d/...`), Drive share link, or raw ID.
   - Click **Import into Database** to run an instant sync.
4. **Auto-Seeding**:
   - If deployed to a fresh database, the serverless backend automatically seeds the tables on the first visit using the bundled template [`data/seed-template.xlsx`](file:///home/noah/project/smart/data/seed-template.xlsx).
