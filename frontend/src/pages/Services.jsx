import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import client from "../api/client";
import { POPULAR_CATEGORIES } from "../data/popularCategories";
import { photoForItem } from "../lib/photos";

const BLURB = {
  Plumbing: "Leak repairs, drain cleaning, installations and more.",
  Electrical: "Wiring, lighting, panel upgrades and electrical repairs.",
  HVAC: "Heating, cooling, installation and maintenance.",
  Cleaning: "Reliable home and deep cleaning services.",
  "Furniture Assembly": "Furniture assembly and home setup.",
  Handyman: "General repairs, installations and home maintenance.",
  Painting: "Interior and exterior painting.",
  "Appliance Repair": "Repair and maintenance for major home appliances.",
  Landscaping: "Lawn care, trimming, planting and outdoor maintenance.",
};

const FILTERS = [
  { id: "all", label: "All Services" },
  { id: "Handyman", label: "Home Repair" },
  { id: "Plumbing", label: "Plumbing" },
  { id: "Electrical", label: "Electrical" },
  { id: "Cleaning", label: "Cleaning" },
  { id: "HVAC", label: "HVAC" },
  { id: "Landscaping", label: "Outdoor" },
];

function Catalog() {
  const navigate = useNavigate();
  const [service, setService] = useState("");
  const [zip, setZip] = useState("");
  const [filter, setFilter] = useState("all");

  const submit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (service.trim()) params.set("q", service.trim());
    if (zip.trim()) params.set("zip", zip.trim());
    navigate(`/search?${params.toString()}`);
  };

  const cards = filter === "all" ? POPULAR_CATEGORIES : POPULAR_CATEGORIES.filter((cat) => cat.name === filter);

  return (
    <div className="bg-[#f5f7fb] text-[#14181d]">
      <section className="relative overflow-hidden bg-[#071833] text-white">
        <img src="/hero-scene.jpg?v=house" alt="" className="absolute inset-0 size-full object-cover object-[72%_center]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#071833] from-30% via-[#071833]/75 to-[#071833]/20" />
        <div className="relative container-page grid items-center gap-8 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:py-16">
          <div className="max-w-xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold">
              California&apos;s Trusted Local Service Marketplace
            </p>
            <h1 className="mt-4 text-4xl font-bold tracking-[-0.03em] sm:text-5xl">
              Find the <span className="text-[#7ec8ff]">Right Pro</span>
              <br /> for Every Project
            </h1>
            <p className="mt-3 max-w-md text-white/80">
              Connect with verified local pros for home repairs, installations, cleaning, and more.
            </p>
            <form onSubmit={submit} className="mt-6 flex flex-col gap-2 rounded-2xl bg-white p-2 text-[#14181d] shadow-lg sm:flex-row sm:items-center">
              <label className="flex min-w-0 flex-1 items-center gap-2 px-3">
                <span className="text-[#0879F9]" aria-hidden="true">⌕</span>
                <input value={service} onChange={(e) => setService(e.target.value)} placeholder="What service do you need?" className="h-11 w-full bg-transparent outline-none" />
              </label>
              <label className="flex min-w-0 flex-1 items-center gap-2 border-t border-[#e6eef7] px-3 sm:border-t-0 sm:border-l">
                <span className="text-[#0879F9]" aria-hidden="true">⌖</span>
                <input value={zip} onChange={(e) => setZip(e.target.value)} inputMode="numeric" placeholder="Enter ZIP code" className="h-11 w-full bg-transparent outline-none" />
              </label>
              <button type="submit" className="h-12 rounded-xl bg-gradient-to-r from-[#2563eb] to-[#7c3aed] px-6 text-sm font-semibold text-white">
                Search →
              </button>
            </form>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/85">
              <span>Verified pros</span>
              <span>Quick response</span>
              <span>Flexible scheduling</span>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-10">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-3xl font-bold tracking-[-0.03em]">Explore Services</h2>
            <p className="mt-1 text-sm text-[#5c6770]">Browse popular services and find a pro in your area.</p>
          </div>
          <Link to="/search" className="text-sm font-semibold text-[#2563eb]">View all services →</Link>
        </div>
        <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map((item) => (
            <button key={item.id} type="button" onClick={() => setFilter(item.id)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${filter === item.id ? "bg-[#2563eb] text-white" : "bg-white text-[#3c4650] shadow-sm"}`}>
              {item.label}
            </button>
          ))}
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {cards.map((cat) => (
            <article key={cat.slug} className="overflow-hidden rounded-2xl bg-white shadow-[0_10px_30px_rgba(20,24,29,0.06)]">
              <img src={cat.image} alt="" className="h-36 w-full object-cover" />
              <div className="p-4">
                <h3 className="font-bold">{cat.name}</h3>
                <p className="mt-1 min-h-10 text-sm text-[#5c6770]">{BLURB[cat.name]}</p>
                <p className="mt-2 text-sm font-semibold text-[#b45309]">{cat.rating.toFixed(1)} average</p>
                <Link to={`/search?q=${encodeURIComponent(cat.name)}`} className="mt-3 inline-flex h-9 items-center rounded-full bg-[#2563eb] px-4 text-sm font-semibold text-white">
                  Find a Pro →
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 rounded-3xl bg-[#eef3ff] p-4 sm:p-6">
          <p className="text-lg font-bold">Featured services</p>
          <p className="text-sm text-[#5c6770]">Trades people search for most often.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {POPULAR_CATEGORIES.slice(0, 4).map((cat) => (
              <Link key={cat.slug} to={`/services?category=${encodeURIComponent(cat.name)}`} className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="font-bold">{cat.name}</p>
                <p className="mt-1 text-sm text-[#5c6770]">{BLURB[cat.name]}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

const JOBS = {
  Plumbing: ["Leak or drip", "Clogged drain", "Water heater", "Toilet repair", "Faucet install"],
  Electrical: ["Outlet not working", "Light fixture", "Panel upgrade", "Ceiling fan", "EV charger"],
  HVAC: ["No cooling", "No heat", "Thermostat", "Filter and tune-up", "New system"],
  Cleaning: ["Standard clean", "Deep clean", "Move-out", "After a project", "Recurring"],
  Handyman: ["Mount a TV", "Furniture assembly", "Drywall patch", "Door repair", "Odd jobs"],
  Painting: ["One room", "Whole home", "Cabinets", "Exterior", "Touch-up"],
  "Appliance Repair": ["Refrigerator", "Washer", "Dryer", "Dishwasher", "Oven"],
  Landscaping: ["Lawn care", "Hedge trim", "Sprinklers", "Cleanup", "Planting"],
};

export default function Services() {
  const [params] = useSearchParams();
  const active = params.get("category") || "";
  const category = POPULAR_CATEGORIES.find((item) => item.name === active) || null;
  const [pros, setPros] = useState([]);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!category) {
      setPros([]);
      setPlaces([]);
      return;
    }
    setLoading(true);
    Promise.allSettled([
      client.get(`/search/providers?category_slug=${encodeURIComponent(category.apiSlug)}&limit=8`),
      client.get(`/search/public?category_slug=${encodeURIComponent(category.slug)}&limit=9`),
    ]).then(([proRes, placeRes]) => {
      setPros(proRes.status === "fulfilled" ? proRes.value.data || [] : []);
      setPlaces(placeRes.status === "fulfilled" ? placeRes.value.data.listings || [] : []);
      setLoading(false);
    });
  }, [category]);

  if (!category) return <Catalog />;

  const jobs = JOBS[category.name] || [];
  const used = new Set();

  return (
    <div className="bg-[#f3f4f6] text-[#14181d]">
      <div className="relative min-h-[280px] overflow-hidden bg-[#111418]">
        <img src={category.image} alt="" className="absolute inset-0 h-full w-full object-cover object-top opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111418] via-[#111418]/40 to-transparent" />
        <div className="container-page relative flex min-h-[280px] flex-col justify-end py-8 text-white">
          <Link to="/services" className="mb-4 w-fit text-sm font-medium text-white/80">All services</Link>
          <h1 className="text-[40px] font-semibold tracking-[-0.045em]">{category.name}</h1>
          <p className="mt-2 max-w-md text-white/80">Tell us the job. Up to three pros can send a price. Your phone stays hidden until you open a contact.</p>
          <Link to={`/post?category=${encodeURIComponent(category.name)}&title=${encodeURIComponent(category.name)}`} className="mt-5 inline-flex h-12 w-fit items-center rounded-full bg-white px-5 font-semibold text-[#14181d] active:scale-[0.98]">
            Request {category.name.toLowerCase()}
          </Link>
        </div>
      </div>

      <div className="container-page py-8">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {POPULAR_CATEGORIES.map((cat) => (
            <Link key={cat.slug} to={`/services?category=${encodeURIComponent(cat.name)}`} className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${cat.name === category.name ? "bg-[#14181d] text-white" : "bg-white text-[#3c4650]"}`}>
              {cat.name}
            </Link>
          ))}
        </div>

        <h2 className="mt-8 text-lg font-semibold tracking-[-0.02em]">Common {category.name.toLowerCase()} jobs</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {jobs.map((job) => (
            <Link key={job} to={`/post?category=${encodeURIComponent(category.name)}&title=${encodeURIComponent(job)}`} className="rounded-full bg-white px-4 py-2 text-sm font-medium shadow-sm active:scale-[0.97]">
              {job}
            </Link>
          ))}
        </div>

        <h2 className="mt-10 text-lg font-semibold tracking-[-0.02em]">Pros you can book</h2>
        {loading && <p className="mt-3 text-sm text-[#5c6770]">Loading {category.name.toLowerCase()}…</p>}
        {!loading && pros.length === 0 && (
          <p className="mt-3 max-w-lg text-sm text-[#5c6770]">No SevenPros account is listed in this trade yet. Request the job and pros can bid.</p>
        )}
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {pros.map((pro) => (
            <Link key={pro.id} to={`/providers/${pro.id}`} className="flex gap-4 rounded-[24px] bg-white p-3 shadow-sm active:scale-[0.99]">
              <img src={photoForItem({ category: category.name, name: pro.business_name }, used)} alt="" className="size-24 shrink-0 rounded-2xl object-cover object-top" />
              <div className="min-w-0 py-1">
                <p className="truncate font-semibold">{pro.business_name}</p>
                <p className="mt-1 text-sm text-[#5c6770]">{pro.city || "California"}{pro.review_count > 0 ? ` · ${pro.avg_rating?.toFixed?.(1) || pro.avg_rating}★` : ""}</p>
                <p className="mt-3 text-sm font-semibold text-[#0b7c73]">View profile</p>
              </div>
            </Link>
          ))}
        </div>

        <h2 className="mt-10 text-lg font-semibold tracking-[-0.02em]">Nearby {category.name.toLowerCase()} businesses</h2>
        <p className="mt-1 text-sm text-[#5c6770]">Public listings. Request a quote instead of calling from this page.</p>
        {!loading && places.length === 0 && <p className="mt-3 text-sm text-[#5c6770]">No public {category.name.toLowerCase()} listings in this area yet.</p>}
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {places.map((place) => (
            <article key={place.id} className="overflow-hidden rounded-[24px] bg-white shadow-sm">
              <img src={photoForItem({ ...place, category: category.name }, used)} alt="" className="h-44 w-full object-cover object-top" />
              <div className="p-4">
                <h3 className="font-semibold tracking-[-0.02em]">{place.name}</h3>
                <p className="mt-1 text-sm text-[#5c6770]">{[place.city, place.state].filter(Boolean).join(", ") || "California"}</p>
                <Link to={`/post?category=${encodeURIComponent(category.name)}&title=${encodeURIComponent(place.name)}`} className="mt-3 inline-flex h-10 items-center rounded-full bg-[#14181d] px-4 text-sm font-semibold text-white">
                  Request a quote
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
