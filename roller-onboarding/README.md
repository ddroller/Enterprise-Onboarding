# ROLLER Enterprise Onboarding Journey

A customer-facing web app that guides enterprise customers through their ROLLER software implementation. Built with React + Vite, styled with Tailwind CSS, persisted with Supabase.

---

## Quick Start (15 minutes)

### Prerequisites
- [Node.js](https://nodejs.org/) v18+ installed
- A free [Supabase](https://supabase.com/) account
- A free [Vercel](https://vercel.com/) account (for deployment)
- A [GitHub](https://github.com/) account

---

### Step 1: Clone and install

```bash
git clone <your-repo-url>
cd roller-onboarding
npm install
```

### Step 2: Set up Supabase

1. Go to [supabase.com](https://supabase.com/) and create a new project (free tier is fine).
2. Once the project is created, go to **SQL Editor** in the left sidebar.
3. Paste the contents of `supabase/schema.sql` (included in this repo) and click **Run**.
4. Go to **Settings → API** and copy:
   - **Project URL** (looks like `https://abcdefg.supabase.co`)
   - **anon public key** (a long JWT string)

### Step 3: Configure environment variables

Copy the example env file and fill in your Supabase credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 4: Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Step 5: Deploy to Vercel

1. Push this repo to GitHub.
2. Go to [vercel.com](https://vercel.com/) → **Add New Project** → Import your GitHub repo.
3. In the **Environment Variables** section, add:
   - `VITE_SUPABASE_URL` = your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
4. Click **Deploy**.

Your app will be live at `https://your-project.vercel.app`. You can add a custom domain in Vercel settings.

---

## How It Works

### Architecture

```
Browser (React SPA)
    ↓
Supabase (Postgres DB)
    ├── customers table     → stores setup config (name, model, logo)
    └── custom_documents table → stores template overrides (URL, name)
```

### Data Flow

1. **T&I Manager** opens the app → completes setup (model, customer name, logo)
2. Setup is saved to Supabase with a unique **customer slug** (e.g., `wrts`)
3. The app URL becomes `https://yourapp.vercel.app/?c=wrts`
4. **T&I Manager** customizes templates → overrides saved to `custom_documents` table
5. **Customer** opens the same URL → sees their branded experience with customized docs
6. No login required — the URL slug determines which customer config to load

### Per-Customer URLs

Each customer gets a unique URL:
- `https://yourapp.vercel.app/?c=wrts` → We Rock the Spectrum
- `https://yourapp.vercel.app/?c=skyzone` → Sky Zone
- `https://yourapp.vercel.app/?c=urbanair` → Urban Air

The T&I Manager shares this URL with the customer. The slug is set during setup.

### Manager Mode

- Toggle manager mode via the lock icon in the header
- Manager mode shows the amber banner and document edit controls
- Customer view hides all management UI
- Manager mode state is stored locally (not in the database) so customers never see it

---

## Project Structure

```
roller-onboarding/
├── public/
│   └── favicon.svg            # ROLLER favicon
├── src/
│   ├── App.jsx                # Main app component (all UI logic)
│   ├── main.jsx               # React entry point
│   ├── supabase.js            # Supabase client + data helpers
│   └── index.css              # Tailwind imports + global styles
├── supabase/
│   └── schema.sql             # Database schema (run in Supabase SQL Editor)
├── .env.example               # Environment variable template
├── index.html                 # HTML entry point
├── package.json               # Dependencies and scripts
├── postcss.config.js          # PostCSS config for Tailwind
├── tailwind.config.js         # Tailwind configuration
├── vite.config.js             # Vite build configuration
├── vercel.json                # Vercel deployment config (SPA routing)
└── README.md                  # This file
```

---

## Customization

### Adding new templates
Edit the `ALL_TEMPLATES` array in `src/App.jsx`. Each template needs:
```js
{ id: "unique-id", name: "Display Name", url: "https://...", type: "document|spreadsheet|presentation", phase: 1 }
```

### Changing process content
Edit the `getPhases()` function in `src/App.jsx`. Each step can reference templates via `templateId` (single) or `templateIds` (multiple).

### Updating brand colors
Edit the `B` object at the top of `src/App.jsx` and the corresponding Tailwind config in `tailwind.config.js`.

---

## Tech Stack

| Tool | Purpose |
|------|---------|
| [Vite](https://vitejs.dev/) | Build tool and dev server |
| [React](https://react.dev/) | UI framework |
| [Tailwind CSS](https://tailwindcss.com/) | Utility-first CSS |
| [Supabase](https://supabase.com/) | Postgres database + JS client |
| [Lucide React](https://lucide.dev/) | Icons |
| [Vercel](https://vercel.com/) | Hosting and deployment |
