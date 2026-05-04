# Nakisha Empire Storefront

Multi-page Next.js ecommerce frontend for Nakisha Empire skincare, rebuilt from the provided HTML direction.

## Pages

- Home
- Shop
- Product detail pages
- Routines
- Ingredients
- About
- Cart

## Stack

- Next.js App Router
- React
- Global CSS design system
- Local cart state with `localStorage`

## Run locally

Use a modern Node + npm setup. The machine this was built on has a working Node 20 toolchain at:

```bash
/Users/geraldolumide/.nvm/versions/node/v20.19.4/bin/node
/Users/geraldolumide/.nvm/versions/node/v20.19.4/bin/npm
```

Then install and start:

```bash
/bin/zsh -lc 'PATH=/Users/geraldolumide/.nvm/versions/node/v20.19.4/bin:$PATH npm install'
/bin/zsh -lc 'PATH=/Users/geraldolumide/.nvm/versions/node/v20.19.4/bin:$PATH npm run dev'
```

## Notes

- Cart state persists in the browser with `localStorage`.
- Checkout now includes Paystack and Flutterwave gateway selection in the cart summary.
- Add the keys in `.env.local` using `.env.example` before testing payments:

```bash
cp .env.example .env.local
```

- Required variables:
  - `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`
  - `PAYSTACK_SECRET_KEY`
  - `NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY`
  - `FLUTTERWAVE_SECRET_KEY`

- Payment is launched in the provider popup and then verified server-side before the cart is cleared.
- The original HTML reference remains in the repo as `luminesce_skincare_homepage.html`.
# nakisha_empire
