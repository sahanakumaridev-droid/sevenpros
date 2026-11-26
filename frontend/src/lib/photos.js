const PHOTO_POOLS = [
  ["plumb", ["/thumbs/trades/plumb-1.webp", "/thumbs/trades/plumb-2.webp", "/thumbs/categories/plumbing.webp"]],
  ["elec", ["/thumbs/trades/elec-1.webp", "/thumbs/trades/elec-2.webp", "/thumbs/trades/elec-3.webp", "/thumbs/categories/electrical.webp"]],
  ["hvac", ["/thumbs/trades/hvac-1.webp", "/thumbs/categories/hvac.webp"]],
  ["clean", ["/thumbs/trades/clean-1.webp", "/thumbs/trades/clean-2.webp", "/thumbs/trades/clean-3.webp", "/thumbs/trades/clean-4.webp", "/thumbs/trades/clean-5.webp", "/thumbs/trades/clean-6.webp", "/thumbs/categories/cleaning.webp"]],
  ["paint", ["/thumbs/trades/paint-1.webp", "/thumbs/categories/painting.webp"]],
  ["garden", ["/thumbs/trades/garden-1.webp", "/thumbs/trades/garden-2.webp", "/thumbs/categories/landscaping.webp"]],
  ["landscap", ["/thumbs/trades/garden-1.webp", "/thumbs/trades/garden-2.webp", "/thumbs/categories/landscaping.webp"]],
  ["floor", ["/thumbs/trades/floor-1.webp", "/thumbs/trades/floor-2.webp"]],
  ["handy", ["/thumbs/trades/handy-1.webp", "/thumbs/trades/handy-2.webp", "/thumbs/trades/handy-3.webp", "/thumbs/categories/handyman.webp"]],
  ["appliance", ["/thumbs/categories/appliance-repair.webp"]],
];

const ALL_PHOTOS = [...new Set(PHOTO_POOLS.flatMap(([, files]) => files))];

export function photoForItem(item, used = new Set()) {
  if (item.image) return item.image;
  const text = `${item.category || ""} ${item.title || ""} ${item.name || ""} ${item.craft || ""} ${item.business_name || ""}`.toLowerCase();
  const match = PHOTO_POOLS.find(([word]) => text.includes(word));
  const pool = match ? match[1] : ALL_PHOTOS;
  const next = pool.find((file) => !used.has(file)) || ALL_PHOTOS.find((file) => !used.has(file));
  if (next) {
    used.add(next);
    return next;
  }
  return pool[0];
}
