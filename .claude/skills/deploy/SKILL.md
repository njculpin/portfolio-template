---
name: deploy
description: Deploy your portfolio site. Use this when the artist wants to put their site live, connect a custom domain, add a new hosting provider, or troubleshoot deployment.
---

# Deploy

You are helping an artist deploy their portfolio site. Be conversational and patient — they may have never deployed a website before.

## Step 1: Choose a platform

Ask which platform they'd like to use. Explain the trade-offs simply:

- **Vercel** (recommended) — Free, automatic deploys when you push to GitHub, custom domains, fast
- **Netlify** — Free, very similar to Vercel, good if you want a contact form later
- **GitHub Pages** — Free, no extra account needed, slightly more setup
- **Other** — If they have a different provider in mind, you'll help them set it up

If they say "other," ask:

1. What provider? (e.g., Cloudflare Pages, Render, Railway, DigitalOcean, AWS Amplify, Surge, etc.)
2. Do they already have an account?
3. Look up the provider's documentation for deploying a Vite/React SPA. Key things to find:
   - How to connect a GitHub repo
   - What build command to set (`npm run build`)
   - What output/publish directory to set (`dist`)
   - How to configure SPA fallback routing (all routes → `index.html`)
   - How to add a custom domain

Then walk them through the setup step by step, just like the built-in providers below.

For any provider, the deployment requirements are always the same:

- **Build command:** `npm run build`
- **Output directory:** `dist`
- **SPA routing:** All paths should serve `index.html` (needed for client-side routing)

## Step 2: Platform-specific instructions

### Vercel

1. Ask if they have a Vercel account. If not, direct them to vercel.com to sign up with their GitHub account.
2. Tell them to:
   - Go to vercel.com/new
   - Import their GitHub repository
   - Vercel auto-detects the Vite config — no settings to change
   - Click "Deploy"
3. The `vercel.json` in the repo handles SPA routing automatically.
4. Their site will be live at `<project-name>.vercel.app` within a minute.

### Netlify

1. Ask if they have a Netlify account. If not, direct them to netlify.com to sign up with their GitHub account.
2. Tell them to:
   - Go to app.netlify.com/start
   - Connect their GitHub repository
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Click "Deploy site"
3. The `netlify.toml` in the repo handles SPA routing automatically.
4. Their site will be live at a random `<name>.netlify.app` URL.

### GitHub Pages

1. Tell them to:
   - Go to their repo on GitHub → Settings → Pages
   - Under "Source", select "GitHub Actions"
   - The workflow file `.github/workflows/deploy-gh-pages.yml` is already in the repo
   - Push any change to `main` to trigger the first deploy
2. Their site will be live at `<username>.github.io/<repo-name>/`
3. Note: GitHub Pages builds may take 1-2 minutes. Check the "Actions" tab for progress.

## Step 3: Custom domain

Ask if they have a custom domain they'd like to use.

If yes, ask which registrar they use (GoDaddy, Namecheap, Google Domains, Cloudflare, etc.) — the DNS settings interface varies but the records are the same.

### For Vercel:

1. Go to the project dashboard → Settings → Domains
2. Add their domain
3. Add DNS records at their registrar:
   - Apex domain (`example.com`): `A` record → `76.76.21.21`
   - `www`: `CNAME` record → `cname.vercel-dns.com`
4. Vercel handles HTTPS automatically

### For Netlify:

1. Go to Site settings → Domain management → Add custom domain
2. Add DNS records at their registrar:
   - Easiest: Point nameservers to Netlify's DNS
   - Or: `A` record for apex, `CNAME` for www
3. Netlify handles HTTPS automatically

### For GitHub Pages:

1. Go to repo Settings → Pages → Custom domain, enter the domain
2. Add DNS records at their registrar:
   - Apex domain: `A` records for `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `www`: `CNAME` record → `<username>.github.io`
3. Create `public/CNAME` containing just the domain name
4. With a custom domain, update the GitHub Actions workflow to remove the `BASE_PATH` env variable (custom domains serve from root)
5. Check "Enforce HTTPS" once DNS propagates

### For other providers:

Look up their custom domain documentation and walk the artist through it. The DNS records will vary but the pattern is always:

- Add the domain in the provider's dashboard
- Set `A` or `CNAME` records at the registrar
- Wait for propagation (can take up to 24 hours)
- Enable HTTPS

## Step 4: Verify

Tell them to:

1. Push their changes to GitHub
2. Wait for the deploy to complete
3. Visit their site URL
4. Check that project pages work (click through from the homepage)
5. If using a custom domain, verify HTTPS works

## Troubleshooting

If they report issues, ask what they see and diagnose:

- **Blank page**: Check browser console. 404 on JS/CSS = wrong base path.
- **Routes return 404**: SPA redirect isn't configured. Check platform-specific routing config.
- **Images not loading**: Portfolio assets may not be in the build output.
- **Custom domain not working**: DNS takes up to 24 hours. Suggest checking with a DNS lookup tool.
- **Build failing**: Ask them to check the build logs. Common issues: missing dependencies (run `npm install`), Node version mismatch.
