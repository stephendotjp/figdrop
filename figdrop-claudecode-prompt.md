# FigDrop — Claude Code Build Prompt

Paste this entire prompt into Claude Code to build and deploy the app.

---

## THE BRIEF

Build **FigDrop** — a web app styled like Nike SNKRS but for anime figure preorders. Dark, premium, mobile-first. Think Korean mobile game meets sneaker drop app. Deploy to Vercel when done.

Use **Next.js 14 (App Router)** + **Tailwind CSS** + **TypeScript**. All data is dummy/hardcoded for now — no backend needed.

---

## PAGES TO BUILD

### 1. `/` — Home Feed (the SNKRS main screen)
- Sticky header: FigDrop logo (left), search icon + bell icon (right)
- Filter chips row (scrollable, horizontal): All · Scale · Nendoroid · Figma · SH Figuarts · Pop Up Parade · Bunny Ver.
- **Hero featured drop card** — full-width, tall, dark gradient background with the featured figure image prominent. Show: series name, figure name, price in JPY, retailer badge, animated pulsing "PREORDER OPEN" or "DROPPING [DATE]" pill
- **"New This Week" horizontal scroll row** — card per figure, tap to go to detail page
- **"Coming Soon" vertical feed** — list of upcoming drops, each with image, name, series, price, retailer chip, release month, + Wishlist heart button
- Each card should feel premium: dark bg, subtle border glow on hover, figure image prominent

### 2. `/drop/[id]` — Drop Detail Page (the SNKRS product page)
- Full bleed figure image at top (large, dark bg, centered)
- Animated countdown timer if preorder closes within 30 days
- Figure details: name, series, manufacturer, scale, height, release date, retailer
- Price in JPY with USD conversion shown smaller
- "PREORDER NOW" button — links to dummy `#` href (placeholder for affiliate link)
- "ADD TO WISHLIST" toggle button
- "Also from this series" horizontal scroll of related figures

### 3. `/calendar` — Release Calendar
- Month view grid
- Each day that has a drop shows a small colored dot + figure thumbnail on hover
- Color coded by status: gold = preorder open, pink = preorder closing soon, blue = releasing soon
- List view toggle below the calendar showing all upcoming drops sorted by date

### 4. `/wishlist` — Wishlist
- Grid of wishlisted figures (default empty state with illustration + "No figures wishlisted yet")
- Each card shows figure, price, release date, retailer, and "Preorder Now" CTA
- Wishlist state managed in localStorage

### 5. Bottom Nav (mobile) / Top Nav (desktop)
- Home (house icon) · Drops (flame icon) · Calendar (calendar icon) · Wishlist (heart icon)
- Active state: gold accent color underline/dot

---

## DUMMY DATA

Use these 12 real figures as your dataset. For images, use the MyFigureCollection CDN or direct Good Smile image URLs — if those don't work reliably, fall back to a dark placeholder div with the figure name as large styled text overlay. Do NOT use lorem ipsum for names — use these exact figures:

```js
const figures = [
  {
    id: "1",
    name: "Makima: Bunny Ver.",
    series: "Chainsaw Man",
    manufacturer: "Good Smile Company",
    type: "1/4 Scale",
    price_jpy: 44000,
    price_usd: 299,
    retailer: "Hobby Genki",
    retailer_color: "blue",
    status: "preorder_open",
    preorder_closes: "2026-07-15",
    release_date: "2026-12-01",
    scale: "1/4",
    height: "44cm",
    featured: true,
    image_url: "https://images.goodsmileus.com/product_images/images/001/234/567/medium/chainsaw-man-makima-bunny.jpg"
  },
  {
    id: "2",
    name: "Power: Bunny Ver.",
    series: "Chainsaw Man",
    manufacturer: "Good Smile Company",
    type: "1/4 Scale",
    price_jpy: 44000,
    price_usd: 299,
    retailer: "Mecha Japan",
    retailer_color: "pink",
    status: "preorder_open",
    preorder_closes: "2026-07-20",
    release_date: "2026-12-01",
    scale: "1/4",
    height: "44cm",
    featured: false,
    image_url: ""
  },
  {
    id: "3",
    name: "Frieren 1/7 Scale",
    series: "Frieren: Beyond Journey's End",
    manufacturer: "Alter",
    type: "1/7 Scale",
    price_jpy: 22800,
    price_usd: 155,
    retailer: "AmiAmi",
    retailer_color: "teal",
    status: "preorder_open",
    preorder_closes: "2026-08-01",
    release_date: "2027-02-01",
    scale: "1/7",
    height: "24cm",
    featured: false,
    image_url: ""
  },
  {
    id: "4",
    name: "Anya Forger Nendoroid #2241",
    series: "Spy × Family",
    manufacturer: "Good Smile Company",
    type: "Nendoroid",
    price_jpy: 6600,
    price_usd: 45,
    retailer: "Hobby Genki",
    retailer_color: "blue",
    status: "coming_soon",
    preorder_closes: "2026-09-01",
    release_date: "2027-03-01",
    scale: "Non-scale",
    height: "10cm",
    featured: false,
    image_url: ""
  },
  {
    id: "5",
    name: "Kitagawa Marin Knit Ver. 1/6",
    series: "My Dress-Up Darling",
    manufacturer: "Good Smile Company",
    type: "1/6 Scale",
    price_jpy: 19800,
    price_usd: 135,
    retailer: "Solaris Japan",
    retailer_color: "purple",
    status: "preorder_open",
    preorder_closes: "2026-07-30",
    release_date: "2026-11-01",
    scale: "1/6",
    height: "28cm",
    featured: false,
    image_url: ""
  },
  {
    id: "6",
    name: "Gojo Satoru Pop Up Parade L",
    series: "Jujutsu Kaisen",
    manufacturer: "Good Smile Company",
    type: "Pop Up Parade",
    price_jpy: 8800,
    price_usd: 60,
    retailer: "Mecha Japan",
    retailer_color: "pink",
    status: "coming_soon",
    preorder_closes: "2026-09-15",
    release_date: "2027-04-01",
    scale: "Non-scale",
    height: "17cm",
    featured: false,
    image_url: ""
  },
  {
    id: "7",
    name: "Hatsune Miku: Music & Fireworks Ver.",
    series: "Vocaloid",
    manufacturer: "Good Smile Company",
    type: "1/7 Scale",
    price_jpy: 27800,
    price_usd: 189,
    retailer: "Good Smile US",
    retailer_color: "teal",
    status: "preorder_closing",
    preorder_closes: "2026-06-25",
    release_date: "2026-10-01",
    scale: "1/7",
    height: "26cm",
    featured: false,
    image_url: ""
  },
  {
    id: "8",
    name: "Rem: Crystal Dress Ver. 1/7",
    series: "Re:Zero",
    manufacturer: "Kadokawa",
    type: "1/7 Scale",
    price_jpy: 24800,
    price_usd: 169,
    retailer: "Hobby Genki",
    retailer_color: "blue",
    status: "coming_soon",
    preorder_closes: "2026-10-01",
    release_date: "2027-05-01",
    scale: "1/7",
    height: "25cm",
    featured: false,
    image_url: ""
  },
  {
    id: "9",
    name: "Zero Two: Pilot Suit Ver. 1/7",
    series: "Darling in the FranXX",
    manufacturer: "Kotobukiya",
    type: "1/7 Scale",
    price_jpy: 21800,
    price_usd: 148,
    retailer: "Solaris Japan",
    retailer_color: "purple",
    status: "preorder_open",
    preorder_closes: "2026-08-15",
    release_date: "2027-01-01",
    scale: "1/7",
    height: "24cm",
    featured: false,
    image_url: ""
  },
  {
    id: "10",
    name: "Elaina DX Ver. 1/7",
    series: "Wandering Witch: The Journey of Elaina",
    manufacturer: "Good Smile Company",
    type: "1/7 Scale",
    price_jpy: 18700,
    price_usd: 127,
    retailer: "AmiAmi",
    retailer_color: "teal",
    status: "coming_soon",
    preorder_closes: "2026-10-15",
    release_date: "2027-06-01",
    scale: "1/7",
    height: "23cm",
    featured: false,
    image_url: ""
  },
  {
    id: "11",
    name: "Nami: Portrait of Pirates NEO-MAX",
    series: "One Piece",
    manufacturer: "MegaHouse",
    type: "1/8 Scale",
    price_jpy: 19800,
    price_usd: 135,
    retailer: "Mecha Japan",
    retailer_color: "pink",
    status: "preorder_open",
    preorder_closes: "2026-07-10",
    release_date: "2026-11-01",
    scale: "1/8",
    height: "22cm",
    featured: false,
    image_url: ""
  },
  {
    id: "12",
    name: "Asuka Shikinami: Jersey Ver. Nendoroid",
    series: "Rebuild of Evangelion",
    manufacturer: "Good Smile Company",
    type: "Nendoroid",
    price_jpy: 7800,
    price_usd: 53,
    retailer: "Good Smile US",
    retailer_color: "teal",
    status: "coming_soon",
    preorder_closes: "2026-11-01",
    release_date: "2027-07-01",
    scale: "Non-scale",
    height: "10cm",
    featured: false,
    image_url: ""
  }
]
```

---

## IMAGE HANDLING

For figure images, try fetching from MyFigureCollection using this pattern:
`https://static.myfigurecollection.net/upload/items/0/[id].jpg`

Since we can't guarantee those URLs, implement a **FigureCard image component** that:
1. Tries to load the `image_url` if provided
2. On error, renders a stylised dark gradient placeholder div with:
   - The series name in small caps at top
   - The figure name large and bold in the center
   - A subtle radial glow effect matching the retailer color
   - The manufacturer name small at bottom
   
This placeholder should look intentional and premium, not broken.

---

## DESIGN SYSTEM

```
Background:     #0A0A0F (deep void)
Card bg:        #12121A
Panel:          #1A1A28
Accent gold:    #F0C060  (primary CTA, featured, prices)
Accent pink:    #E8629A  (wishlist, alerts, closing soon)
Accent blue:    #4DA8FF  (Hobby Genki retailer tag)
Accent teal:    #3DE8C8  (AmiAmi, Good Smile tags)
Accent purple:  #9B6FE8  (Solaris Japan tag)
Text primary:   #F0EFF8
Text dim:       #8885A8
Text muted:     #4A4870
Border:         rgba(255,255,255,0.07)

Font: Inter for body, use font-weight 600/700 for display text
Display font: system-ui with wide letter-spacing for labels/badges
```

**Card styles:**
- Rounded corners: `rounded-2xl`
- Subtle border: `border border-white/5`  
- Hover: slight scale up `hover:scale-[1.02]` + border glow matching retailer color
- Featured card: gold border glow `shadow-[0_0_30px_rgba(240,192,96,0.2)]`
- Preorder closing soon: pink pulsing border animation

**Status badges:**
- `PREORDER OPEN` → gold bg, black text
- `CLOSING SOON` → pink bg, white text, pulse animation
- `COMING SOON` → dark bg, dim text, dashed border
- `LIVE NOW` → green pulse dot + text

**Retailer chips** — color coded small pill badges on every card:
- Hobby Genki → blue
- Mecha Japan → pink  
- AmiAmi → teal
- Solaris Japan → purple
- Good Smile US → gold

---

## ANIMATIONS & INTERACTIONS

- Wishlist heart: fill animation on toggle (empty → filled pink, with small pop scale)
- Featured card: subtle slow background shimmer/gradient shift loop
- Countdown timer on closing-soon drops: live ticking DD:HH:MM:SS in pink
- Filter chips: smooth underline slide transition on active change
- Page transitions: fade in on route change
- Cards: `transition-all duration-200` on hover

---

## MOBILE FIRST

Design for 390px width first. The app should feel like a native mobile app in the browser. Bottom navigation bar fixed at bottom on mobile. On desktop (>768px) switch to top nav and show a max-width container centered.

---

## VERCEL DEPLOYMENT

After building:
1. `git init` + `git add .` + `git commit -m "FigDrop v0.1"`
2. `npx vercel --yes` to deploy
3. Output the live URL

If Vercel CLI isn't installed: `npm i -g vercel` first.

---

## FOLDER STRUCTURE

```
figdrop/
├── app/
│   ├── layout.tsx          # Root layout with nav
│   ├── page.tsx            # Home feed
│   ├── calendar/page.tsx   # Release calendar
│   ├── wishlist/page.tsx   # Wishlist page
│   └── drop/[id]/page.tsx  # Drop detail page
├── components/
│   ├── FigureCard.tsx      # Reusable card with image fallback
│   ├── FeaturedDrop.tsx    # Hero featured card
│   ├── FilterChips.tsx     # Horizontal filter row
│   ├── RetailerBadge.tsx   # Color-coded retailer pill
│   ├── StatusBadge.tsx     # Preorder status badge
│   ├── CountdownTimer.tsx  # Live ticking countdown
│   ├── BottomNav.tsx       # Mobile bottom nav
│   └── TopNav.tsx          # Desktop top nav
├── lib/
│   └── data.ts             # All dummy figure data
├── hooks/
│   └── useWishlist.ts      # localStorage wishlist hook
└── tailwind.config.ts      # Extended with custom colors
```

---

## NOTES

- No auth needed, no backend, no DB — pure frontend with localStorage for wishlist
- All "Preorder Now" buttons link to `#` as placeholder
- Make it feel REAL — this should look like something you'd pay $9.99/month for
- The vibe is: expensive, dark, premium, slightly addictive. SNKRS energy in an anime figure skin.
- Mobile experience is THE priority — most users will be on their phone
- Do NOT sign up for any paid services or enter any billing information
- Do NOT pause and ask questions — make reasonable decisions and keep going
- Output the live Vercel URL and GitHub repo URL at the very end
