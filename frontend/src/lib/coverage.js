const KEY = "sevenpros_place";
const LANG = "sevenpros_lang";

export const COVERAGE = {
  US: {
    label: "California",
    regions: {
      California: {
        "Los Angeles County": ["Los Angeles", "Long Beach", "Pasadena", "Glendale", "Santa Clarita"],
        "San Diego County": ["San Diego", "Chula Vista", "Oceanside", "Escondido", "Carlsbad"],
        "Orange County": ["Anaheim", "Santa Ana", "Irvine", "Huntington Beach", "Garden Grove"],
        "San Francisco County": ["San Francisco"],
        "Santa Clara County": ["San Jose", "Sunnyvale", "Santa Clara", "Mountain View"],
        "Alameda County": ["Oakland", "Fremont", "Hayward", "Berkeley"],
        "Sacramento County": ["Sacramento", "Elk Grove", "Roseville"],
        "Riverside County": ["Riverside", "Moreno Valley", "Corona"],
        "San Bernardino County": ["San Bernardino", "Fontana", "Rancho Cucamonga"],
        "Fresno County": ["Fresno", "Clovis"],
        "Kern County": ["Bakersfield"],
        "Ventura County": ["Oxnard", "Thousand Oaks", "Ventura"],
      },
    },
  },
  CA: {
    label: "Canada",
    regions: {
      Ontario: { Ontario: ["Toronto", "Ottawa", "Mississauga", "Hamilton", "London"] },
      "British Columbia": { "British Columbia": ["Vancouver", "Victoria", "Surrey", "Burnaby", "Kelowna"] },
      Alberta: { Alberta: ["Calgary", "Edmonton", "Red Deer"] },
      Quebec: { Quebec: ["Montreal", "Quebec City", "Laval", "Gatineau"] },
      Manitoba: { Manitoba: ["Winnipeg", "Brandon"] },
      Saskatchewan: { Saskatchewan: ["Saskatoon", "Regina"] },
      "Nova Scotia": { "Nova Scotia": ["Halifax", "Dartmouth"] },
      "New Brunswick": { "New Brunswick": ["Moncton", "Saint John", "Fredericton"] },
      "Newfoundland and Labrador": { "Newfoundland and Labrador": ["St. John's"] },
      "Prince Edward Island": { "Prince Edward Island": ["Charlottetown"] },
    },
  },
};

export const COORDS = {
  "Los Angeles": [34.05, -118.24],
  "Long Beach": [33.77, -118.19],
  Pasadena: [34.15, -118.14],
  Glendale: [34.14, -118.25],
  "Santa Clarita": [34.39, -118.54],
  "San Diego": [32.72, -117.16],
  "Chula Vista": [32.64, -117.08],
  Oceanside: [33.2, -117.38],
  Escondido: [33.12, -117.09],
  Carlsbad: [33.16, -117.35],
  Anaheim: [33.84, -117.91],
  "Santa Ana": [33.75, -117.87],
  Irvine: [33.68, -117.83],
  "Huntington Beach": [33.66, -118],
  "Garden Grove": [33.77, -117.94],
  "San Francisco": [37.77, -122.42],
  "San Jose": [37.34, -121.89],
  Sunnyvale: [37.37, -122.04],
  "Santa Clara": [37.35, -121.95],
  "Mountain View": [37.39, -122.08],
  Oakland: [37.8, -122.27],
  Fremont: [37.55, -121.99],
  Hayward: [37.67, -122.08],
  Berkeley: [37.87, -122.27],
  Sacramento: [38.58, -121.49],
  "Elk Grove": [38.41, -121.37],
  Roseville: [38.75, -121.29],
  Riverside: [33.98, -117.37],
  "Moreno Valley": [33.94, -117.23],
  Corona: [33.88, -117.57],
  "San Bernardino": [34.11, -117.29],
  Fontana: [34.09, -117.44],
  "Rancho Cucamonga": [34.11, -117.59],
  Fresno: [36.74, -119.79],
  Clovis: [36.83, -119.7],
  Bakersfield: [35.37, -119.02],
  Oxnard: [34.2, -119.18],
  "Thousand Oaks": [34.17, -118.84],
  Ventura: [34.27, -119.25],
  Toronto: [43.65, -79.38],
  Ottawa: [45.42, -75.7],
  Mississauga: [43.59, -79.64],
  Hamilton: [43.26, -79.87],
  London: [42.98, -81.25],
  Vancouver: [49.28, -123.12],
  Victoria: [48.43, -123.37],
  Surrey: [49.19, -122.85],
  Burnaby: [49.25, -122.98],
  Kelowna: [49.89, -119.5],
  Calgary: [51.05, -114.07],
  Edmonton: [53.55, -113.49],
  "Red Deer": [52.27, -113.81],
  Montreal: [45.5, -73.57],
  "Quebec City": [46.81, -71.21],
  Laval: [45.61, -73.71],
  Gatineau: [45.48, -75.7],
  Winnipeg: [49.9, -97.14],
  Brandon: [49.85, -99.95],
  Saskatoon: [52.13, -106.67],
  Regina: [50.45, -104.62],
  Halifax: [44.65, -63.57],
  Dartmouth: [44.67, -63.57],
  Moncton: [46.09, -64.78],
  "Saint John": [45.27, -66.06],
  Fredericton: [45.96, -66.64],
  "St. John's": [47.56, -52.71],
  Charlottetown: [46.24, -63.13],
};

export const DEFAULT_PLACE = { country: "US", region: "California", county: "", city: "", miles: 25 };

export function placePoint(place) {
  return COORDS[place.city] || COORDS[place.region] || (place.country === "CA" ? [56.13, -106.35] : [36.78, -119.42]);
}

export function placeOptions() {
  const rows = [];
  Object.entries(COVERAGE).forEach(([country, pack]) => {
    Object.entries(pack.regions).forEach(([region, counties]) => {
      Object.entries(counties).forEach(([county, cities]) => {
        cities.forEach((city) => rows.push({ country, region, county, city, label: `${city}, ${country === "CA" ? "Canada" : "CA"}` }));
      });
    });
  });
  return rows;
}

export function shortPlace(place) {
  return place.city || place.county || place.region || "California";
}

export function readPlace() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || "null");
    if (saved && COVERAGE[saved.country]) return { ...DEFAULT_PLACE, ...saved };
  } catch {
    /* ignore broken storage */
  }
  return { ...DEFAULT_PLACE };
}

export function writePlace(place) {
  const next = { ...DEFAULT_PLACE, ...place };
  localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("sevenpros-place", { detail: next }));
  return next;
}

export function placeLabel(place) {
  return [place.city, place.county, place.region, place.country === "CA" ? "Canada" : "USA"].filter(Boolean).join(", ");
}

export function placeParams(place) {
  return {
    country: place.country,
    region: place.region,
    county: place.county || undefined,
    city: place.city || undefined,
  };
}

export function readLang() {
  return localStorage.getItem(LANG) === "es" ? "es" : "en";
}

export function writeLang(lang) {
  const next = lang === "es" ? "es" : "en";
  localStorage.setItem(LANG, next);
  window.dispatchEvent(new CustomEvent("sevenpros-lang", { detail: next }));
  return next;
}

const COPY = {
  en: {
    location: "LOCATION",
    language: "LANGUAGE",
    country: "Country",
    state: "State or province",
    county: "County or area",
    city: "City",
    allAreas: "All areas",
    allCities: "All cities",
    results: "results in",
    customerPosts: "Customer posts",
    publicMap: "Public map listings",
    leadsNote: "Requests in",
    search: "Search for services, pros, or offers",
    local: "Local pros and offers",
  },
  es: {
    location: "UBICACIÓN",
    language: "IDIOMA",
    country: "País",
    state: "Estado o provincia",
    county: "Condado o zona",
    city: "Ciudad",
    allAreas: "Todas las zonas",
    allCities: "Todas las ciudades",
    results: "resultados en",
    customerPosts: "Publicaciones de clientes",
    publicMap: "Lugares del mapa público",
    leadsNote: "Solicitudes en",
    search: "Busca servicios, profesionales u ofertas",
    local: "Profesionales y ofertas locales",
  },
};

export function copy(lang) {
  return COPY[lang] || COPY.en;
}
