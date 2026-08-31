export const POPULAR_CATEGORIES = [
  {
    name: "Plumbing",
    slug: "plumbing",
    apiSlug: "plumbing-services",
    rating: 4.8,
    image: "/categories/plumbing.jpg?v=2",
    alt: "Plumber in a navy cap and polo repairing pipes in a wall",
  },
  {
    name: "Electrical",
    slug: "electrical",
    apiSlug: "electrical-services",
    rating: 4.9,
    image: "/categories/electrical.jpg?v=2",
    alt: "Electrician in a yellow hard hat working on an open circuit panel",
  },
  {
    name: "HVAC",
    slug: "hvac",
    apiSlug: "hvac-repair",
    rating: 4.8,
    image: "/categories/hvac.jpg?v=2",
    alt: "HVAC technician inspecting an outdoor air conditioning unit",
  },
  {
    name: "Cleaning",
    slug: "cleaning",
    apiSlug: "house-cleaning",
    rating: 4.8,
    image: "/categories/cleaning.jpg?v=2",
    alt: "Professional cleaner in a navy uniform holding supplies and yellow gloves",
  },
  {
    name: "Handyman",
    slug: "handyman",
    apiSlug: "handyman-services",
    rating: 4.9,
    image: "/categories/handyman.jpg?v=2",
    alt: "Handyman in a navy polo holding a power drill",
  },
  {
    name: "Painting",
    slug: "painting",
    apiSlug: "painting-services",
    rating: 4.9,
    image: "/categories/painting.jpg?v=2",
    alt: "Painter rolling paint onto an interior wall",
  },
  {
    name: "Appliance Repair",
    slug: "appliance-repair",
    apiSlug: "appliance-repair",
    rating: 4.8,
    image: "/categories/appliance-repair.jpg?v=2",
    alt: "Technician repairing a refrigerator in a kitchen",
  },
  {
    name: "Landscaping",
    slug: "landscaping",
    apiSlug: "landscaping",
    rating: 4.9,
    image: "/categories/landscaping.jpg?v=2",
    alt: "Landscaper trimming a hedge in a California garden",
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
