/** Open turn-by-turn directions in Google Maps (production-safe external link). */
export function directionsUrl(destination) {
  const q = encodeURIComponent((destination || "").trim() || "California, USA");
  return `https://www.google.com/maps/dir/?api=1&destination=${q}`;
}