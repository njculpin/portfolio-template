---
name: setup-shop
description: Set up an online store for your portfolio. Use this when the artist wants to sell prints, originals, digital downloads, or merchandise through their site with Stripe or Shopify payments.
---

# Setup Shop

You are helping an artist set up an online store on their portfolio site. The store supports **Stripe** or **Shopify** for payments and follows the same auto-discovery pattern as portfolio projects. Walk them through each step conversationally.

## How the store works

Products live in a `store/` directory at the project root. Each product is a folder containing a `product.json` config and images. The template auto-discovers products the same way it discovers portfolio projects.

**Directory structure:**

```
store/
  art-print-01/
    product.json       ← product metadata & pricing
    cover.jpg           ← thumbnail (optional, falls back to first image)
    images/
      01-front.jpg      ← auto-discovered, natural-sorted
      02-detail.jpg
      03-packaging.jpg
```

**product.json (all fields optional except price):**

```json
{
  "title": "Art Print #1",
  "description": "Limited edition giclée print on archival paper.",
  "price": 45,
  "compareAtPrice": 60,
  "category": "prints",
  "tags": ["limited-edition", "giclée"],
  "stripePriceId": "price_abc123",
  "shopifyVariantId": "12345678",
  "inStock": true,
  "edition": "1/50",
  "variants": [
    {
      "name": "8×10",
      "price": 45,
      "stripePriceId": "price_abc123",
      "shopifyVariantId": "12345678"
    },
    {
      "name": "16×20",
      "price": 85,
      "stripePriceId": "price_def456",
      "shopifyVariantId": "87654321"
    }
  ],
  "draft": false,
  "order": 1
}
```

**What's automatic:**

- Images in `images/` are discovered and displayed in filename order
- Cover image is discovered from `cover.{jpg,png,webp,...}` at the product root
- If no cover exists, the first image is used
- Title is generated from the folder name if not in config
- Products with `"draft": true` are hidden from the shop

## Step 1: Payment Provider

Ask the artist which payment provider they want to use:

### Option A: Stripe

- Best for: Direct sales, one-time payments, simple setup
- Requires: Stripe account + API keys
- How it works: Cart redirects to Stripe-hosted checkout page

### Option B: Shopify

- Best for: Artists already using Shopify, complex inventory management
- Requires: Shopify store + Storefront API access token
- How it works: Cart creates a Shopify checkout and redirects to their Shopify store

## Step 2: Provider Setup

### If Stripe:

Ask the artist:

- Do they already have a Stripe account? If not, direct them to https://dashboard.stripe.com/register
- They'll need two keys from Stripe Dashboard → Developers → API Keys:
  - **Publishable key** (starts with `pk_test_` or `pk_live_`)
  - **Secret key** (starts with `sk_test_` or `sk_live_`)

Recommend starting with test keys.

Create or update `.env` at the project root:

```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

Install the server-side Stripe package:

```bash
npm install stripe
```

### If Shopify:

Ask the artist:

- Their Shopify store domain (e.g., `my-store.myshopify.com`)
- They need a Storefront API access token:
  1. Shopify Admin → Settings → Apps and sales channels → Develop apps
  2. Create a new app → Configure Storefront API scopes (needs `unauthenticated_read_checkouts`, `unauthenticated_write_checkouts`, `unauthenticated_read_product_listings`)
  3. Install the app and copy the Storefront access token

Create or update `.env`:

```
VITE_SHOPIFY_DOMAIN=my-store.myshopify.com
VITE_SHOPIFY_STOREFRONT_TOKEN=your-storefront-access-token
```

**Note:** Shopify checkout is entirely client-side (Storefront API is designed for public use), so no serverless function is needed.

**Important:** Add `.env` to `.gitignore` if not already there.

## Step 3: Store Configuration

Ask the artist for:

- **Currency**: What currency they sell in (e.g., `usd`, `eur`, `gbp`)
- **Ship from location**: Where they ship from (optional)

Update `portfolio.config.json` store section:

```json
{
  "store": {
    "enabled": true,
    "provider": "stripe",
    "currency": "usd",
    "layout": "grid",
    "shipFrom": "New York, NY"
  }
}
```

Set `provider` to `"stripe"` or `"shopify"` based on Step 1.

## Step 4: Deployment Platform (Stripe only)

If using **Stripe**, the checkout needs a serverless function. Ask which platform they're deploying to:

- **Vercel** — Uses `api/checkout.js` (already included). No extra config needed.
- **Netlify** — Uses `netlify/functions/checkout.js` (already included). No extra config needed.
- **Other platforms** (Firebase, Supabase, Cloudflare Workers, AWS, Railway, etc.):
  - Create a serverless/edge function for their platform
  - The function accepts POST with `{ items: [{ stripePriceId, quantity }] }`
  - Import shared logic: `const { createCheckoutSession } = require("../src/checkout");`
  - Return `{ sessionId: "cs_..." }`
  - Update the checkout URL in `src/components/Cart/Cart.tsx` if the endpoint path differs

If using **Shopify**, skip this step — no serverless function needed.

## Step 5: Create Products

### If Stripe:

Walk them through creating products in the Stripe Dashboard:

1. Go to Products → Add Product
2. Set name, description, and price
3. Copy the **Price ID** (`price_...`) → goes in `product.json` as `stripePriceId`
4. For variants, create a separate price for each and note all Price IDs

### If Shopify:

Walk them through finding variant IDs:

1. Products are created in the Shopify Admin as usual
2. To find Variant IDs: Shopify Admin → Products → select product → Variants
3. The variant ID is in the URL or can be found via the Shopify API
4. Put the numeric ID in `product.json` as `shopifyVariantId`

## Step 6: Add First Product

Help the artist add their first product:

1. Ask for product details:
   - **Title**: Product name
   - **Description**: Brief description
   - **Price**: Selling price (for display; actual charge comes from Stripe/Shopify)
   - **Category**: For filtering (e.g., prints, originals, digital, merch)
   - **Provider ID**: `stripePriceId` or `shopifyVariantId` from Step 5
   - **Variants**: Optional — different sizes/options with their own IDs
   - **Edition info**: Optional — e.g., "1/50" for limited editions

2. Generate a slug from the title
3. Create `store/<slug>/`
4. Create `store/<slug>/images/`
5. Create `store/<slug>/product.json` with the metadata

## Step 7: Tell the Artist What to Do Next

1. Drop a `cover.jpg` into `store/<slug>/` for the shop thumbnail
2. Drop product photos into `store/<slug>/images/` — name them `01-front.jpg`, `02-detail.jpg`, etc.
3. Run `npm run dev` to preview the shop at `/shop`
4. The "Shop" link appears automatically in the navigation
5. To add more products, create new folders in `store/` or use `/setup-shop` again
6. To hide a product, add `"draft": true` to `product.json`
7. To control order, add `"order": 1` (lower numbers first)
8. When ready to go live:
   - Replace test keys with live keys in `.env`
   - Set environment variables on the hosting platform dashboard
   - Deploy!

## Important Notes

- Environment variables prefixed with `VITE_` are exposed to the browser — only use for public keys/tokens
- `STRIPE_SECRET_KEY` is server-side only, never exposed to the browser
- Shopify Storefront tokens are designed to be public — safe in `VITE_` vars
- The checkout logic is provider-agnostic: switching between Stripe and Shopify only requires changing `store.provider` in config and updating the env vars and product IDs
- Products are auto-discovered at build time — restart dev server after adding new products
