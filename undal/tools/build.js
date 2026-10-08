#!/usr/bin/env node
/* ==========================================================================
   Undal Menu Portfolio — static site generator
   Reads data/menu.json and emits a fully static, SEO-optimized index.html.
   Usage: node tools/build.js
   ========================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'menu.json'), 'utf8'));
const SITE_URL = 'https://undal.bsdc.info.bd/';
const ORDER_URL = DATA.restaurant.url;

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

const totalItems = DATA.categories.reduce((n, c) => n + c.items.length, 0);

/* ---------- helpers ---------- */
function priceLabel(item) {
  return (item.from ? 'from ' : '') + 'Tk ' + item.price;
}
function savePct(item) {
  return Math.round((1 - item.price / item.regular) * 100);
}

/* ---------- dish card (static, crawler-visible) ---------- */
function cardHTML(cat, item) {
  const tags = item.tags || [];
  const tagBadges =
    (tags.includes('spicy') ? '<span class="badge badge-spicy" title="Spicy">🌶 Spicy</span>' : '') +
    (tags.includes('veg') ? '<span class="badge badge-veg" title="Vegetarian">🌿 Veg</span>' : '');
  const alt = `${item.name} at Undal — ${item.desc.split(' - ')[1] || item.desc}`;
  return `
          <article class="dish" id="${item.slug}" data-cat="${cat.id}" data-name="${esc(item.name.toLowerCase())}" itemscope itemtype="https://schema.org/MenuItem">
            <div class="dish-media">
              <img src="img/dishes/${item.img}.webp" alt="${esc(alt)}" width="600" height="450" loading="lazy" decoding="async" itemprop="image">
              <span class="dish-save" title="You save ${savePct(item)}%">-${savePct(item)}%</span>
              ${tagBadges ? `<div class="dish-tags">${tagBadges}</div>` : ''}
            </div>
            <div class="dish-body">
              <h3 class="dish-name" itemprop="name">${esc(item.name)}</h3>
              <p class="dish-desc" itemprop="description">${esc(item.desc)}</p>
              <div class="dish-foot">
                <div class="dish-price">
                  <meta itemprop="name" content="${esc(item.name)}">
                  <span class="now" itemprop="offers" itemscope itemtype="https://schema.org/Offer">
                    <span class="cur" itemprop="priceCurrency" content="BDT">Tk</span>
                    <span itemprop="price" content="${item.price}">${item.price}</span>
                  </span>
                  ${item.from ? '<i class="from">from</i>' : ''}
                  <s class="was" aria-label="Regular price Tk ${item.regular}">Tk ${item.regular}</s>
                </div>
                <a class="dish-order" href="${ORDER_URL}" target="_blank" rel="noopener nofollow sponsored">Order<span aria-hidden="true"> →</span></a>
              </div>
            </div>
          </article>`;
}

/* ---------- category section ---------- */
function sectionHTML(cat) {
  const cards = cat.items.map((it) => cardHTML(cat, it)).join('\n');
  return `
      <section class="cat" id="cat-${cat.id}" data-cat="${cat.id}" aria-labelledby="h-${cat.id}">
        <header class="cat-head">
          <div>
            <h2 id="h-${cat.id}">${esc(cat.name)} <span class="count">${cat.items.length}</span></h2>
            <p class="cat-blurb">${esc(cat.blurb)}</p>
          </div>
        </header>
        <div class="grid">${cards}
        </div>
      </section>`;
}

/* ---------- category chips ---------- */
function chipsHTML() {
  const all = `        <button class="chip active" data-filter="all" aria-pressed="true">All <b>${totalItems}</b></button>\n`;
  return all + DATA.categories.map((c) =>
    `        <button class="chip" data-filter="${c.id}" aria-pressed="false">${esc(c.name)} <b>${c.items.length}</b></button>`
  ).join('\n');
}

/* ---------- ticker ---------- */
function tickerHTML() {
  const names = DATA.categories.flatMap((c) => c.items.map((i) => i.name));
  const half = names.map((n) => `<span>${esc(n)}</span><i>✦</i>`).join('');
  return `      <div class="ticker" aria-hidden="true"><div class="ticker-track">${half}${half}</div></div>`;
}

/* ---------- JSON-LD ---------- */
function jsonLD() {
  const menuSections = DATA.categories.map((c) => ({
    '@type': 'MenuSection',
    name: c.name,
    description: c.blurb,
    hasMenuItem: c.items.map((it) => ({
      '@type': 'MenuItem',
      name: it.name,
      description: it.desc,
      image: `${SITE_URL}img/dishes/${it.img}.webp`,
      suitableForDiet: (it.tags || []).includes('veg') ? 'https://schema.org/VegetarianDiet' : undefined,
      offers: {
        '@type': 'Offer',
        price: it.price,
        priceCurrency: 'BDT',
        url: ORDER_URL,
        availability: 'https://schema.org/InStock'
      }
    }))
  }));

  const graph = [
    {
      '@type': 'WebSite',
      '@id': SITE_URL + '#website',
      name: 'Undal Menu',
      url: SITE_URL,
      inLanguage: 'en',
      publisher: { '@id': SITE_URL + '#restaurant' }
    },
    {
      '@type': 'Restaurant',
      '@id': SITE_URL + '#restaurant',
      name: 'Undal',
      alternateName: ['Undal Restaurant', 'Undal Sylhet'],
      description: DATA.restaurant.tagline,
      url: SITE_URL,
      image: SITE_URL + 'img/hero.webp',
      logo: SITE_URL + 'img/logo.svg',
      servesCuisine: DATA.restaurant.cuisines,
      priceRange: '৳',
      hasMenu: { '@id': SITE_URL + '#menu' },
      sameAs: [ORDER_URL]
    },
    {
      '@type': 'Menu',
      '@id': SITE_URL + '#menu',
      name: 'Undal Full Menu',
      description: 'Complete menu of Undal — snacks, bhorta & bhaji, curry, fish, set meals, rice, paratha, desserts and special combo platters.',
      inLanguage: 'en',
      hasMenuSection: menuSections
    },
    {
      '@type': 'BreadcrumbList',
      '@id': SITE_URL + '#breadcrumb',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Menu', item: SITE_URL + '#menu' }
      ]
    },
    {
      '@type': 'FAQPage',
      '@id': SITE_URL + '#faq',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What kind of food does Undal serve?',
          acceptedAnswer: { '@type': 'Answer', text: 'Undal serves authentic Bangladeshi and Asian home cooking — crispy snacks, traditional bhorta & bhaji, slow-cooked bhuna curries, fresh river fish, set meals, rice, paratha, desserts and special combo platters.' }
        },
        {
          '@type': 'Question',
          name: 'How can I order from Undal?',
          acceptedAnswer: { '@type': 'Answer', text: 'Browse the full menu on this site, then place your order through the official Undal restaurant page on Foodpanda for fast delivery.' }
        },
        {
          '@type': 'Question',
          name: 'Does Undal have vegetarian options?',
          acceptedAnswer: { '@type': 'Answer', text: 'Yes. Undal offers a wide range of vegetarian dishes including alu, begun, dal and tomato bhorta, mixed vegetable, fried and plain rice, lachha & plain paratha, and traditional pitha and desserts. Vegetarian dishes are marked with a 🌿 badge.' }
        },
        {
          '@type': 'Question',
          name: 'Are there discounts on the Undal menu?',
          acceptedAnswer: { '@type': 'Answer', text: 'Yes — menu prices shown already reflect discounted rates off the regular price, and a 20% off deal is auto-applied on all items when ordering via Foodpanda.' }
        }
      ]
    }
  ];

  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2);
}

/* ---------- assemble ---------- */
const sections = DATA.categories.map(sectionHTML).join('\n');
const template = fs.readFileSync(path.join(__dirname, 'template.html'), 'utf8');

const html = template
  .replace(/<!--\[\[TITLE_META\]\]-->/, headMeta())
  .replace('<!--[["CHIPS"]]-->', chipsHTML())
  .replace('<!--[["TICKER"]]-->', tickerHTML())
  .replace('<!--[["SECTIONS"]]-->', sections)
  .replace('<!--[["JSONLD"]]-->', `<script type="application/ld+json">\n${jsonLD()}\n</script>`);

fs.writeFileSync(path.join(ROOT, 'index.html'), html);
console.log(`✔ index.html written — ${totalItems} dishes across ${DATA.categories.length} categories.`);

function headMeta() {
  const catNames = DATA.categories.map((c) => c.name).join(', ');
  const title = 'Undal Menu | Authentic Bangladeshi Food — Bhorta, Bhuna, Fish Curry & Set Meals';
  const desc = `Explore the full Undal menu online: ${totalItems} authentic Bangladeshi dishes across ${DATA.categories.length} categories — ${catNames}. Discounted prices, veg & spicy filters, photos of every dish. Order on Foodpanda.`;
  return `    <title>${title}</title>
    <meta name="description" content="${desc}">
    <meta name="keywords" content="Undal, Undal menu, Undal restaurant, Undal Sylhet, Bangladeshi food, bhorta, bhuna khichuri, fish curry, set meal, patishapta, mughlai paratha, foodpanda Undal, order food online">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${desc}">
    <meta property="og:image" content="${SITE_URL}img/hero.webp">
    <meta property="og:url" content="${SITE_URL}">
    <meta property="og:type" content="restaurant.menu">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${desc}">
    <meta name="twitter:image" content="${SITE_URL}img/hero.webp">`;
}
