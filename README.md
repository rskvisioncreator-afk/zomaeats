# Zomaeats 🍜

A Zomato-inspired food delivery web app built with **React 19 + TypeScript + Vite**, with a **customer storefront** and a full **admin dashboard**. Images upload to **Firebase Storage**, data lives in **Firestore**, and auth uses **Firebase Authentication**.

> Demo mode included: bina kisi Firebase key ke app chalta hai (localStorage + demo login). Keys add karte hi same UI live Firebase par switch ho jata hai.

---

## ✨ Features

**Customer**
- Home page with hero search, categories, offers, collections and 20 kitchens / 134 dishes (including Pani Puri)
- Delivery locations: Delhi NCR, Mumbai, Bengaluru and **Bihar** (Patna, Gaya, Bhagalpur, …); saved addresses pick up the selected city automatically
- Search with cuisine, rating, price, delivery-time, pure-veg and sort filters
- Restaurant pages with sticky menu nav, veg-only toggle, dish search and a live mini-cart
- Single-restaurant cart with conflict handling (`Start fresh` / `Keep existing`)
- Coupons: `WELCOME50`, `TASTY125`, `FREEDEL` + transparent bill breakdown
- Checkout with saved addresses, UPI / card / COD options and order placement
- Live-style order tracking timeline, order history and reorder
- Wishlist, profile, saved addresses, demo-data reset
- Responsive design with a mobile bottom nav and sticky cart bar

**Admin** (`/admin`)
- Overview KPIs (revenue, orders, kitchens, dishes)
- Restaurant CRUD with cover-image upload
- Menu/dish CRUD with image upload
- Order list with status updates (`placed → confirmed → preparing → out for delivery → delivered`)
- One-click demo catalog seeding (writes to Firestore in live mode)
- Demo/live mode visibility

---

## 🧱 Tech stack

| Layer | Choice |
| --- | --- |
| UI | React 19, React Router 7 |
| Language | TypeScript (strict) |
| Build | Vite 6 |
| Backend | Firebase Auth, Firestore, Storage |
| Icons | lucide-react |
| Styling | Hand-written CSS design system (`src/styles`) |
| Data layer | `DataProvider` interface with Firebase + localStorage implementations |

---

## 🚀 Quick start (demo mode)

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

Demo accounts (password `demo1234`, any password works in demo):

| Role | Email |
| --- | --- |
| Customer | `foodie@zomaeats.com` |
| Admin | `admin@zomaeats.com` |

Demo data is seeded automatically on first run and stored in `localStorage` under `zomaeats:db:v1`. Use **Profile → Reset demo data** to start fresh.

---

## 🔥 Connect Firebase

### 1. Create a project

1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a project.
2. Add a **Web app** (`</>` icon) and copy the config values.

### 2. Enable services

- **Authentication** → Sign-in method → enable **Email/Password** (and **Google** if you want Google login).
- **Firestore Database** → Create database (production mode is fine; rules are deployed below).
- **Storage** → Get started (production mode is fine; rules are deployed below).

### 3. Add env keys

```bash
copy .env.example .env.local
```

Fill in `.env.local`:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_ADMIN_EMAILS=admin@zomaeats.com
```

Restart `npm run dev`. The header badge changes from **DEMO** to live Firebase mode.

### 4. Set the project id

Edit `.firebaserc`:

```json
{
  "projects": {
    "default": "your-project-id"
  }
}
```

Or run `firebase use --add`.

### 5. Deploy rules + indexes

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules,firestore:indexes,storage
```

> The `orders` composite index (`userId ASC`, `createdAt DESC`) is included. If Firestore asks for an index the first time you load orders, the console link will create it automatically — this file already contains the required definition.

### 6. Seed the catalog

1. Sign up / log in with your admin email.
2. Promote yourself once in **Firestore → `users` → your uid → `role`**: change `customer` to `admin`.
3. Open `/admin` → **Seed demo data**.

> Why manual promotion? Security rules forbid self-promotion, so nobody can make themselves admin from the browser. `VITE_ADMIN_EMAILS` only unlocks the admin UI hint; Firestore's `users/{uid}.role` is the real gate.

### 7. Deploy hosting

```bash
npm run build
firebase deploy --only hosting
```

Or in one shot:

```bash
npm run deploy
```

`firebase.json` already sets SPA rewrites (`/** → /index.html`) and long-term caching for hashed assets.

---

## 🖼 Images

- Admin uploads are compressed in the browser (`compressImage`) before hitting Firebase Storage.
- Files go to `restaurants/…jpg` or `dishes/…jpg`; download URLs are stored on the Firestore document.
- In demo mode the same flow produces compressed data URLs saved to localStorage.
- Storage rules: public read, admin-only write, images only, max 5 MB.

---

## 📜 Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | Type-check + production build into `dist/` |
| `npm run preview` | Preview the production build |
| `npm run typecheck` | `tsc -b --noEmit` |
| `npm run seed` | Regenerate `src/data/seed.json` from `scripts/build-seed.mjs` |
| `npm run fetch-images` | Re-download the demo food photos into `public/images/` |
| `npm run deploy` | Build + `firebase deploy` (needs Firebase CLI) |

---

## 📁 Project structure

```
src/
├─ components/
│  ├─ admin/        # RestaurantForm, DishForm, ImageUploader
│  ├─ auth/         # RequireAuth, RequireAdmin
│  ├─ cart/         # BillDetails, CouponBox, CartItemRow, conflict modal
│  ├─ checkout/     # AddressForm
│  ├─ home/         # Hero, CategoryRail, Collections, Offers, HowItWorks
│  ├─ layout/       # Layout, Navbar, Logo, Footer, MobileNav, ErrorBoundary
│  ├─ orders/       # StatusPill, OrderTimeline
│  ├─ restaurant/   # RestaurantCard, DishRow, MenuNav, VegToggle
│  └─ ui/           # Button, Field, Modal, SmartImage, Feedback, …
├─ context/         # Auth, Cart, Location, Toast
├─ data/            # catalog constants, seed data, demo accounts
├─ hooks/           # useAsyncData, domain data hooks, wishlist
├─ lib/             # firebase, utils (currency, coupons, image compression)
├─ pages/           # Home, Search, Restaurant, Cart, Checkout, Orders, …
├─ services/        # DataProvider interface + firebase/local implementations
├─ styles/          # base.css, components.css, pages.css
└─ types/           # domain models and provider contracts
```

---

## 🔐 Security model

- **Firestore**
  - `restaurants`, `dishes`: public read, admin write.
  - `orders`: a signed-in user can create only their own order; read own orders; admins read/update/delete all.
  - `users`: read/update own profile, cannot change their own `role`; admin can manage anyone.
- **Storage**: public read for menu images, admin-only writes, image content type + 5 MB limit.
- Client checks are UX only — rules are the source of truth.

---

## 🧪 Demo / live switching

`src/services/index.ts` picks the provider at runtime:

```ts
export const dataProvider = isFirebaseConfigured ? firebaseProvider : localProvider
```

Both implement the same `DataProvider` interface (`src/services/types.ts`), so no page knows or cares which backend is active.

---

## 📝 Notes

- Prices use `Intl.NumberFormat('en-IN')`; delivery ₹39 (free above ₹499), 5% tax, ₹6 platform fee.
- Coupons: `WELCOME50` (50% off up to ₹100, min ₹199), `TASTY125` (₹125 off, min ₹499), `FREEDEL` (free delivery, min ₹199).
- All UI copy is English with light Hinglish accents.
- Build output is code-split into `react`, `firebase` and app chunks.

Made with ❤️ and a lot of chai.
