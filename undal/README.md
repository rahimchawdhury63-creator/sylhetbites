# Undal — Bengali Kitchen · Menu Portfolio

A fully static, ultra-responsive, SEO-optimized **menu portfolio website** for **Undal**
(authentic Bangladeshi restaurant, available on
[Foodpanda](https://www.foodpanda.com.bd/restaurant/cdo6/undal-cdo6)).

Standalone brand site — lives in `/undal/` and does not link to or from SylhetBites.
Deployed as its own site at **https://undal.bsdc.info.bd** (deploy the `undal/` folder
as the site root; e.g. Cloudflare Pages build command `node undal/tools/build.js`,
output directory `undal`).
No phone / address / contact info is shown by design (pure menu portfolio).

## Features

- **67 dishes across 11 categories** transcribed 1:1 from the official Foodpanda menu
  (Snacks, Dessert, Pasta & Noodles, Bhorta & Bhaji, Curry, Fish, Set Meal, Rice,
  Sides, Paratha, Special Combo & Platter) with discounted + regular prices.
- **Real dish photos** cropped from the Foodpanda menu screenshots (self-hosted WebP),
  plus a few AI-regenerated photos where the source thumbnail was missing/cropped.
- **Ultra SEO**: JSON-LD `@graph` (WebSite, Restaurant, Menu→MenuSection→MenuItem with
  Offers, BreadcrumbList, FAQPage), Open Graph / Twitter cards, semantic microdata on
  every dish card, image sitemap, canonical, lazy-loaded WebP.
- **Ultra interactive**: category chips with scrollspy, live search (`/`), veg-only
  filter, dish detail modal, scroll-reveal animations, marquee ticker, back-to-top,
  reduced-motion support. No external libraries — pure HTML/CSS/JS.

## Build

The dish grid + JSON-LD are generated from `data/menu.json` so prices/items stay
maintainable in one place:

```bash
node tools/build.js   # regenerates index.html from data/menu.json
```

## Structure

```
undal/
├── index.html          # generated static site (committed)
├── sitemap.xml
├── css/style.css
├── js/app.js
├── data/menu.json      # single source of truth for the menu
├── tools/build.js      # static site generator
├── tools/template.html # page shell used by the generator
└── img/
    ├── hero.webp
    ├── logo.svg
    └── dishes/*.webp   # one photo per dish
```

Menu source screenshots (reference only): `/undal-ref-images/` at repo root.
