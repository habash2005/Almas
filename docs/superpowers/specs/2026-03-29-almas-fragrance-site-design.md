# ALMAS Fragrance E-Commerce Site — Design Spec

## Overview
Full e-commerce fragrance site for ALMAS (الماس), a luxury-inspired fragrance brand. 140+ products across For Him, For Her, and Unisex categories. Includes a 3-month auto-refill subscription service.

## Tech Stack
- **Frontend:** React 19 + Vite + Tailwind CSS 4
- **Routing:** React Router v7
- **State:** Context API (Cart, Wishlist, Auth, Toast, Subscription)
- **Fonts:** Cormorant Garamond (serif) + Inter (sans-serif)
- **Icons:** Lucide React
- **Build:** Vite

## Design Direction
**Approach A — Editorial Luxury:** Light, warm, magazine-style. Black/white dominant with warm stone (#E8E4DF) accents. Generous whitespace, large serif typography, scroll-driven fade-up animations. Bilingual English/Arabic branding.

### Color Palette
- Black: #0A0A0A
- White: #FAFAFA
- Stone: #E8E4DF
- Stone Dark: #D4CFC8
- Warm Gray: #9A948D
- Light Gray: #F5F3F0

### Typography
- Headlines: Cormorant Garamond, 300-700 weight
- Body: Inter, 300-500 weight
- Labels: Inter, 11px, tracking 0.15em, uppercase

## Pages

### 1. HomePage
- Announcement bar (scrolling marquee)
- Hero with bottle + CTAs (Shop Now, Scent Finder)
- Trust marquee
- Subscription promo banner (full-width split)
- Category cards (For Him, For Her, Unisex)
- Dual promotional banners (seasonal, best sellers, etc.)
- Best Sellers product grid (4-col)
- Full-width scent finder banner
- Subscription detail section (ALMAS Refill Club)
- Editorial — Our Story block
- New Arrivals product grid
- Second dual banner row (discovery sets, gift guides)
- Scent notes education (dark section)
- Testimonials (3-col cards)
- Newsletter signup
- Footer

### 2. ShopPage
- Category filter pills (All, For Him, For Her, Unisex)
- Scent family filter dropdown
- Badge filter (Best Seller, New, Popular)
- Sort (Featured, Price ASC/DESC, A-Z)
- Product grid (responsive 1/2/3/4 cols)
- Pagination or infinite scroll

### 3. ProductPage
- Product image gallery
- Sticky sidebar with name, price, inspired-by, description
- Size selector (50ml/100ml)
- Add to Bag / Subscribe & Save toggle
- Accord bars visualization
- Fragrance notes (Top/Heart/Base) with ingredient images
- Longevity, Sillage, Best For info
- Reviews section with write/sort
- Related products carousel

### 4. CartPage
- Full cart with quantity controls
- Promo code input
- Free shipping progress bar ($100 threshold)
- Subscription upsell
- Cart summary + checkout CTA

### 5. CheckoutPage
- Multi-step: Email → Shipping → Payment
- Guest checkout supported
- Order summary sidebar

### 6. SubscriptionPage
- How it works (3 steps)
- Benefits breakdown
- FAQ accordion
- Browse subscribable products
- Gift a subscription CTA

### 7. ScentFinderPage
- 5-step quiz wizard (Gender → Mood → Occasion → Intensity → Notes)
- Animated transitions between steps
- Personalized top-3 results with explanations

### 8. AboutPage (Our Story)
- Brand story editorial layout
- Diamond/craftsmanship narrative
- Values section

### 9. WishlistPage
- Grid of saved products
- Quick add-to-cart from wishlist

### 10. SearchResultsPage
- Real-time search results
- Filter integration

### 11-14. Auth Pages
- Login, Register, Forgot Password, Account/Orders

### 15-18. Legal/Info Pages
- FAQ (accordion), Shipping, Privacy, Terms, Refund Policy

### 19. NotFoundPage (404)

## Components
1. **Navbar** — Sticky, glass-blur, centered logo with الماس, split nav, search/account/wishlist/cart icons
2. **AnnouncementBar** — Dark scrolling marquee, dismissible
3. **Footer** — 5-col grid, newsletter, payment icons, socials
4. **ProductCard** — 3:4 image, quick-add on hover, wishlist heart, badge, size pills
5. **CartDrawer** — Slide-in from right, shipping progress bar
6. **SearchDropdown** — Real-time results dropdown
7. **AccordBar** — Horizontal scent strength visualization
8. **ReviewStars / ReviewCard / WriteReviewForm**
9. **Toast** — Notification system
10. **SubscriptionToggle** — One-time vs Subscribe & Save on product page

## Product Data Structure
```json
{
  "id": 1,
  "name": "Midnight Aventus",
  "inspiredBy": "Creed Aventus",
  "category": "men",
  "scentFamily": "Woody",
  "badge": "Best Seller",
  "prices": { "50ml": 120, "100ml": 180 },
  "accords": [
    { "name": "Musk", "strength": 85, "color": "#1A1A1A" }
  ],
  "notes": {
    "top": ["Bergamot", "Saffron"],
    "heart": ["Jasmine", "Amber"],
    "base": ["Musk", "Oakmoss", "Cedarwood"]
  },
  "longevity": "8-10 hours",
  "sillage": "Moderate-Strong",
  "bestFor": ["Evening", "Fall", "Winter"],
  "description": "A bold, sophisticated fragrance...",
  "image": "/products/midnight-aventus.jpg"
}
```

## Subscription Model
- 3-month auto-refill cycle
- 15% savings vs one-time purchase
- Free shipping on all subscription orders
- Skip, swap, or cancel anytime
- Exclusive early access to new releases
- Gift subscription option

## Key Interactions
- Scroll-driven fade-up animations
- Product card hover: scale image, reveal quick-add bar + wishlist heart
- Size pill toggle updates price
- Subscribe toggle on product page shows savings
- Cart drawer slide-in with shipping progress bar
- Navbar glass-blur on scroll
- Marquee scrolling text

## Banner System
- Announcement bar: editable rotating messages
- Full-width split banners (image + dark content)
- Dual side-by-side banners (seasonal, collections, promotions)
- Full-width centered banners (scent finder, sales)
- All banners are data-driven and swappable
