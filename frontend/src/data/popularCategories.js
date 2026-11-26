export const POPULAR_CATEGORIES = [
  {
    name: "Plumbing",
    slug: "plumbing",
    apiSlug: "plumbing-services",
    rating: 4.8,
    image: "/premium/plumbing.jpg",
    alt: "Professional plumbing work in a modern home",
  },
  {
    name: "Electrical",
    slug: "electrical",
    apiSlug: "electrical-services",
    rating: 4.9,
    image: "/premium/electrical.jpg",
    alt: "Verified electrician on a job site",
  },
  {
    name: "HVAC",
    slug: "hvac",
    apiSlug: "hvac-repair",
    rating: 4.8,
    image: "/premium/hvac.jpg",
    alt: "Heating and cooling service professional",
  },
  {
    name: "Cleaning",
    slug: "cleaning",
    apiSlug: "house-cleaning",
    rating: 4.8,
    image: "/premium/cleaning.jpg",
    alt: "Premium house cleaning in a bright home",
  },
  {
    name: "Furniture Assembly",
    slug: "furniture-assembly",
    apiSlug: "furniture-assembly",
    rating: 4.8,
    image: "/premium/furniture.jpg",
    alt: "Modern furniture ready for assembly",
  },
  {
    name: "Handyman",
    slug: "handyman",
    apiSlug: "handyman-services",
    rating: 4.9,
    image: "/premium/handyman.jpg",
    alt: "Skilled handyman completing home repairs",
  },
  {
    name: "Painting",
    slug: "painting",
    apiSlug: "painting-services",
    rating: 4.9,
    image: "/premium/painting.jpg",
    alt: "Interior painting by a local pro",
  },
  {
    name: "Appliance Repair",
    slug: "appliance-repair",
    apiSlug: "appliance-repair",
    rating: 4.8,
    image: "/premium/appliance.jpg",
    alt: "Modern kitchen ready for appliance repair",
  },
  {
    name: "Landscaping",
    slug: "landscaping",
    apiSlug: "landscaping",
    rating: 4.9,
    image: "/premium/landscaping.jpg",
    alt: "Landscaped outdoor living space",
  },
];

export const CATEGORY_SLUG_MAP = Object.fromEntries(
  POPULAR_CATEGORIES.flatMap((c) => [
    [c.slug, c.apiSlug],
    [c.apiSlug, c.apiSlug],
  ]),
);

export const HERO_IMAGES = {
  neighborhood:
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2000&q=80",
  technician:
    "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=900&q=80",
};

export const POPULAR_SEARCHES = [
  { label: "Plumber", to: "/categories/plumbing" },
  { label: "Electrician", to: "/categories/electrical" },
  { label: "HVAC", to: "/categories/hvac" },
  { label: "House Cleaning", to: "/categories/cleaning" },
  { label: "Handyman", to: "/categories/handyman" },
];
