export const homeBanners = [
  {
    id: 1,
    title: "The Art of Scent",
    subtitle: "Luxury-inspired fragrances crafted with the finest ingredients. Discover your signature scent.",
    cta: "Shop Collection",
    link: "/shop",
    image: "/banners/hero-collection.jpg",
    theme: "dark",
  },
  {
    id: 2,
    title: "New Arrivals",
    subtitle: "Explore our latest additions, inspired by the world's most coveted designer fragrances.",
    cta: "Discover New",
    link: "/shop?badge=New",
    image: "/banners/new-arrivals.jpg",
    theme: "light",
  },
  {
    id: 3,
    title: "ALMAS Refill Club",
    subtitle: "Subscribe & save 15%. Fresh fragrance delivered every 3 months. Skip or cancel anytime.",
    cta: "Learn More",
    link: "/subscribe",
    image: "/banners/subscription-promo.jpg",
    theme: "dark",
  },
  {
    id: 4,
    title: "Find Your Signature",
    subtitle: "Take our scent quiz and discover the perfect fragrance for your personality and lifestyle.",
    cta: "Start Quiz",
    link: "/scent-finder",
    image: "/banners/scent-finder.jpg",
    theme: "light",
  },
  {
    id: 5,
    title: "Free Shipping Over $100",
    subtitle: "Complimentary shipping on all orders over $100. Every order beautifully gift-wrapped.",
    cta: "Shop Now",
    link: "/shop",
    image: "/banners/free-shipping.jpg",
    theme: "dark",
  },
];

export const dualBanners = [
  {
    id: "dual-1",
    banners: [
      {
        id: "dual-1a",
        title: "Best Sellers",
        subtitle: "Our most loved fragrances, chosen by thousands",
        cta: "Shop Best Sellers",
        link: "/shop?badge=Best+Seller",
        image: "/banners/best-sellers.jpg",
        theme: "dark",
      },
      {
        id: "dual-1b",
        title: "For Him",
        subtitle: "Bold, sophisticated scents for the modern man",
        cta: "Shop For Him",
        link: "/shop/men",
        image: "/banners/for-him.jpg",
        theme: "light",
      },
    ],
  },
  {
    id: "dual-2",
    banners: [
      {
        id: "dual-2a",
        title: "Discovery Sets",
        subtitle: "Can't decide? Try our curated sample collections",
        cta: "Explore Sets",
        link: "/shop?category=sets",
        image: "/banners/discovery-sets.jpg",
        theme: "light",
      },
      {
        id: "dual-2b",
        title: "Gift Guide",
        subtitle: "The perfect fragrance gift for every occasion",
        cta: "Find a Gift",
        link: "/shop?badge=Popular",
        image: "/banners/gift-guide.jpg",
        theme: "dark",
      },
    ],
  },
  {
    id: "dual-3",
    banners: [
      {
        id: "dual-3a",
        title: "For Her",
        subtitle: "Elegant florals, rich orientals, and fresh favorites",
        cta: "Shop For Her",
        link: "/shop/women",
        image: "/banners/for-her.jpg",
        theme: "dark",
      },
      {
        id: "dual-3b",
        title: "Unisex Collection",
        subtitle: "Boundary-breaking scents for everyone",
        cta: "Shop Unisex",
        link: "/shop/unisex",
        image: "/banners/unisex.jpg",
        theme: "light",
      },
    ],
  },
  {
    id: "dual-4",
    banners: [
      {
        id: "dual-4a",
        title: "Spring Edit",
        subtitle: "Fresh, floral fragrances perfect for the new season",
        cta: "Shop Spring",
        link: "/shop?scentFamily=Fresh",
        image: "/banners/spring-edit.jpg",
        theme: "light",
      },
      {
        id: "dual-4b",
        title: "Oud Collection",
        subtitle: "Premium oud fragrances inspired by Middle Eastern royalty",
        cta: "Explore Ouds",
        link: "/shop?scentFamily=Oud",
        image: "/banners/oud-collection.jpg",
        theme: "dark",
      },
    ],
  },
];

export default { homeBanners, dualBanners };
