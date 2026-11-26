import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import client from "../api/client";
import WhySevenPros from "../components/home/WhySevenPros";
import HowItWorks from "../components/home/HowItWorks";
import ProjectCta from "../components/home/ProjectCta";
import HomeProCard from "../components/home/HomeProCard";
import Carousel from "../components/ui/Carousel";
import { POPULAR_CATEGORIES } from "../data/popularCategories";
import { photoForItem } from "../lib/photos";
import { copy, placeLabel, placeParams, readLang, readPlace, shortPlace } from "../lib/coverage";
import LocationPicker from "../components/home/LocationPicker";
import PublicPeek from "../components/PublicPeek";
import OfferMap from "../components/OfferMap";
import LandingHome from "./LandingHome";
function kindLabel(value) {
  if (!value || /^service$/i.test(String(value).trim())) return "Services";
  return value;
}

const PILLS = [
  { id: "services", label: "Services" },
  { id: "jobs", label: "Jobs" },
  { id: "rentals", label: "Rentals" },
];
const CITIES = [
  ["San Diego, CA", "Los Angeles, CA", "San Francisco, CA", "Sacramento, CA", "San Jose, CA"],
  ["Oakland, CA", "Fresno, CA", "Long Beach, CA", "Bakersfield, CA", "Anaheim, CA"],
  ["Riverside, CA", "Irvine, CA", "Santa Ana, CA", "Stockton, CA", "Chula Vista, CA"],
  ["Fremont, CA", "Modesto, CA", "Fontana, CA", "Moreno Valley, CA", "Glendale, CA"],
  ["Huntington Beach, CA", "Santa Clarita, CA", "Garden Grove, CA", "Oceanside, CA", "Rancho Cucamonga, CA"],
];

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [featured, setFeatured] = useState([]);
  const [publicListings, setPublicListings] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pill, setPill] = useState("services");
  const [trade, setTrade] = useState("");
  const [sort, setSort] = useState("relevant");
  const [view, setView] = useState("grid");
  const [showAll, setShowAll] = useState(false);
  const [peek, setPeek] = useState(null);
  const [place, setPlace] = useState(readPlace);
  const [placeOpen, setPlaceOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [lang, setLang] = useState(readLang);
  const text = copy(lang);

  useEffect(() => {
    const onPlace = () => setPlace(readPlace());
    const onLang = () => setLang(readLang());
    window.addEventListener("sevenpros-place", onPlace);
    window.addEventListener("sevenpros-lang", onLang);
    return () => {
      window.removeEventListener("sevenpros-place", onPlace);
      window.removeEventListener("sevenpros-lang", onLang);
    };
  }, []);

  useEffect(() => {
    const q = submitted.trim();
    const where = placeParams(place);
    setLoading(true);
    Promise.allSettled([
      client.get(`/search/providers?sort=best_match&limit=24${q ? `&q=${encodeURIComponent(q)}` : ""}`),
      client.get("/search/public", { params: { limit: 80, q: q || undefined, ...where } }),
      client.get("/credits/posts", { params: where }),
    ]).then(([pros, pub, jobs]) => {
      if (pros.status === "fulfilled") setFeatured(pros.value.data || []);
      if (pub.status === "fulfilled") setPublicListings(pub.value.data.listings || []);
      if (jobs.status === "fulfilled") setPosts(jobs.value.data || []);
      setLoading(false);
    });
  }, [submitted, place]);

  const nearbyUsed = new Set();

  const needle = query.trim().toLowerCase();
  const market = [];
  const photos = new Set();
  if (pill === "services") {
    featured.forEach((pro) => {
      const proState = (pro.state || "CA").toUpperCase();
      if (place.country === "CA" && proState === "CA") return;
      if (place.city && !(pro.city || "").toLowerCase().includes(place.city.toLowerCase())) return;
      const category = kindLabel(pro.services?.[0]?.category_name || pro.services?.[0]?.name);
      market.push({
        id: pro.id,
        name: pro.business_name,
        line: category,
        category,
        city: [pro.city, pro.state || "CA"].filter(Boolean).join(", "),
        rating: pro.avg_rating,
        reviews: pro.review_count,
        photo: photoForItem({ category, name: pro.business_name }, photos),
        href: `/providers/${pro.id}`,
      });
    });
  } else if (pill === "jobs") {
    posts.filter((item) => item.kind !== "sale").forEach((item) => {
      market.push({
        id: item.id,
        name: item.title,
        line: item.category || "Request",
        category: item.category || "Jobs",
        city: [item.city, "CA"].filter(Boolean).join(", "),
        photo: photoForItem(item, photos),
        href: `/listings/${item.id}`,
      });
    });
  } else {
    const rows = pill === "sale" ? posts.filter((item) => item.kind === "sale") : posts.filter((item) => /rent/i.test(item.category || item.title || ""));
    rows.forEach((item) => {
      market.push({
        id: item.id,
        name: item.title,
        line: item.category || "For sale",
        category: item.category || "For sale",
        city: [item.city, "CA"].filter(Boolean).join(", "),
        photo: item.image || photoForItem(item, photos),
        href: `/listings/${item.id}`,
      });
    });
    if (pill !== "rentals") {
      publicListings.forEach((item) => {
        market.push({
          id: item.id,
          name: item.name,
          line: kindLabel(item.category),
          category: kindLabel(item.category),
          city: [item.city, item.state || "CA"].filter(Boolean).join(", "),
          photo: photoForItem(item, photos),
          lat: Number(item.lat),
          lng: Number(item.lng),
          publicItem: item,
        });
      });
    }
  }
  const filtered = market.filter((item) => {
    if (trade && !`${item.category} ${item.name}`.toLowerCase().includes(trade.toLowerCase())) return false;
    if (needle && !`${item.name} ${item.line} ${item.city}`.toLowerCase().includes(needle)) return false;
    return true;
  });
  if (sort === "name") filtered.sort((a, b) => a.name.localeCompare(b.name));
  if (sort === "rating") filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  const shown = showAll ? filtered : filtered.slice(0, 12);

  if (user) {
    const openCard = (item) => {
      if (item.publicItem) setPeek(item.publicItem);
      else if (item.href) navigate(item.href);
    };
    return (
      <div className="bg-[linear-gradient(180deg,#f6f3ff_0%,#ffffff_220px)] text-[#14181d]">
        <div className="container-page py-5">
          <form
            className="flex h-14 items-center gap-2 rounded-full border border-[#e7e2f5] bg-white px-2 shadow-[0_10px_30px_rgba(76,29,149,0.06)]"
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(query.trim());
              setShowAll(false);
            }}
          >
            <label className="hidden h-10 shrink-0 items-center rounded-full bg-[#f4f6f8] px-3 text-sm font-semibold text-[#14181d] sm:flex">
              <select value={pill} onChange={(e) => setPill(e.target.value)} className="bg-transparent outline-none">
                {PILLS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            </label>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search services" className="h-10 min-w-0 flex-1 bg-transparent px-2 text-[15px] text-[#14181d] outline-none" />
            <button type="button" onClick={() => setPlaceOpen(true)} className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-[#0b7c73]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z" stroke="currentColor" strokeWidth="1.8"/><circle cx="12" cy="10" r="2.2" fill="currentColor"/></svg>
              {shortPlace(place)}
            </button>
          </form>
          {placeOpen && <LocationPicker place={place} onClose={() => setPlaceOpen(false)} />}
          <div className="mt-4 flex w-full flex-wrap items-center gap-2">
              {PILLS.map((item) => (
                <button key={item.id} type="button" onClick={() => { setPill(item.id); setShowAll(false); }} className={`h-9 shrink-0 rounded-full px-4 text-sm font-bold ${pill === item.id ? "bg-[#6d28d9] text-white" : "border border-[#e4e7eb] bg-white"}`}>
                  {item.label}
                </button>
              ))}
              {POPULAR_CATEGORIES.slice(0, 8).map((cat) => (
                <button key={cat.slug} type="button" onClick={() => setTrade(trade === cat.name ? "" : cat.name)} className={`h-9 shrink-0 rounded-full px-3 text-sm font-semibold ${trade === cat.name ? "bg-[#ede9fe] text-[#6d28d9]" : "border border-[#e4e7eb] bg-white"}`}>
                  {cat.name}
                </button>
              ))}
            <label className="ml-auto shrink-0 text-sm font-semibold text-[#5c6770]">
              Sort
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="ml-2 h-9 rounded-full border border-[#e4e7eb] bg-white px-3 text-sm font-semibold text-[#14181d]">
                <option value="relevant">Most relevant</option>
                <option value="rating">Highest rated</option>
                <option value="name">Name</option>
              </select>
            </label>
          </div>
          <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-[28px] font-semibold tracking-[-0.03em]">{text.local}</h1>
              <p className="text-sm text-[#5c6770]">{filtered.length} {text.results} {placeLabel(place)} · {place.miles || 25} miles</p>
            </div>
            <div className="flex rounded-full bg-[#f3eefe] p-1">
              {["grid", "map"].map((mode) => (
                <button key={mode} type="button" onClick={() => setView(mode)} className={`h-9 rounded-full px-4 text-sm font-bold capitalize ${view === mode ? "bg-[#6d28d9] text-white" : "text-[#6d28d9]"}`}>{mode}</button>
              ))}
            </div>
          </div>
          <p className="mt-3 text-sm text-[#5c6770]">{text.customerPosts}: {posts.length} · {text.publicMap}: {publicListings.length} · {placeLabel(place)} · {PILLS.find((item) => item.id === pill)?.label}{trade ? ` · ${trade}` : ""}</p>
          {loading ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }, (_, index) => <div key={index} className="shimmer h-72 rounded-2xl" />)}
            </div>
          ) : view === "map" ? (
            <div className="mt-4">
              <OfferMap items={filtered} onOpen={openCard} />
              <p className="mt-2 text-xs text-[#5c6770]">Map data © OpenStreetMap contributors. Pins are public businesses that include a location.</p>
            </div>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {shown.map((item, index) => (
                <article key={item.id} className="overflow-hidden rounded-2xl border border-[#efeaf8] bg-white shadow-[0_8px_24px_rgba(76,29,149,0.05)]">
                  <button type="button" onClick={() => openCard(item)} className="block w-full text-left">
                    <span className="relative block bg-[#efeaf8]">
                      <img src={item.photo} alt="" width="640" height="360" decoding="async" loading={index < 4 ? "eager" : "lazy"} fetchPriority={index < 4 ? "high" : "low"} className="h-40 w-full object-cover object-top" />
                      <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-[#14181d]">{item.category}</span>
                    </span>
                    <span className="block px-4 py-3">
                      <span className="block truncate text-[16px] font-bold">{item.name}</span>
                      <span className="block truncate text-sm text-[#5c6770]">{item.line}</span>
                      {item.rating ? <span className="mt-2 block text-sm font-semibold text-[#14181d]">★ {Number(item.rating).toFixed(1)}{item.reviews ? ` (${item.reviews} reviews)` : ""}</span> : null}
                      <span className="mt-1 block text-sm text-[#5c6770]">{item.city}</span>
                    </span>
                  </button>
                  <div className="px-4 pb-4">
                    <button type="button" onClick={() => openCard(item)} className="h-9 rounded-full border border-[#ddd6fe] px-3 text-sm font-bold text-[#6d28d9]">
                      {item.publicItem ? "View offer" : "View details"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
          {!loading && !showAll && filtered.length > 12 && (
            <div className="mt-6 text-center">
              <button type="button" onClick={() => setShowAll(true)} className="h-11 rounded-full bg-[#6d28d9] px-6 text-sm font-bold text-white">View more</button>
            </div>
          )}
        </div>
        {peek && <PublicPeek item={peek} onClose={() => setPeek(null)} />}
      </div>
    );
  }

  return <LandingHome />;
}
