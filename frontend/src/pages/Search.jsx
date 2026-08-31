import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import client from "../api/client";
import ProviderCard from "../components/ProviderCard";

const SORT_OPTIONS = [
  { value: "best_match", label: "Best Match (AI Ranked)" },
  { value: "highest_rated", label: "Highest Rated" },
  { value: "cheapest", label: "Price: Low to High" },
  { value: "closest", label: "Closest" },
  { value: "fastest", label: "Fastest Response" },
];

const FIELD =
  "!bg-white !text-navy !border !border-[#D7E3F0] rounded-xl px-3 py-2.5 text-sm w-full";

const CAT_CHIPS = [
  { name: "Plumbing", to: "/categories/plumbing", color: "#0879F9" },
  { name: "Electrical", to: "/categories/electrical", color: "#F59E0B" },
  { name: "HVAC", to: "/categories/hvac", color: "#06B6D4" },
  { name: "Cleaning", to: "/categories/cleaning", color: "#22C55E" },
  { name: "Moving", to: "/categories/moving", color: "#FB923C" },
  { name: "Handyman", to: "/categories/handyman", color: "#3B82F6" },
  { name: "Furniture", to: "/categories/furniture-assembly", color: "#8B5CF6" },
  { name: "Painting", to: "/categories/painting", color: "#EC4899" },
];

export default function Search() {
  const [params, setParams] = useSearchParams();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(params.get("q") || "");
  const [view, setView] = useState("grid");

  const [filters, setFilters] = useState({
    q: params.get("q") || "",
    category_slug: params.get("category") || "",
    group: params.get("group") || "",
    sort: "best_match",
    verified: false,
    licensed: false,
    insured: false,
    background_checked: false,
    emergency: params.get("emergency") === "true",
    instant_booking: false,
    free_estimate: false,
    min_rating: "4",
    max_price: "500",
  });

  const runSearch = (next = filters) => {
    setLoading(true);
    const q = {};
    Object.entries(next).forEach(([k, v]) => {
      if (v === "" || v === false) return;
      if (k === "max_price" && (v === "500" || v === 500)) return;
      q[k] = v;
    });
    client.get("/search/providers", { params: q }).then((res) => {
      setProviders(res.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    runSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.sort, filters.q, filters.category_slug, filters.group]);

  useEffect(() => {
    const q = params.get("q") || "";
    setQuery(q);
    setFilters((f) => ({
      ...f,
      q,
      category_slug: params.get("category") || "",
      group: params.get("group") || "",
    }));
  }, [params]);

  const applyFilters = (e) => {
    e?.preventDefault();
    runSearch();
  };

  const resetFilters = () => {
    const next = {
      ...filters,
      verified: false,
      licensed: false,
      insured: false,
      background_checked: false,
      emergency: false,
      instant_booking: false,
      free_estimate: false,
      min_rating: "",
      max_price: "500",
    };
    setFilters(next);
    runSearch(next);
  };

  const toggle = (key) => setFilters((f) => ({ ...f, [key]: !f[key] }));

  const submitHeroSearch = (e) => {
    e.preventDefault();
    setParams((p) => {
      const n = new URLSearchParams(p);
      if (query) n.set("q", query);
      else n.delete("q");
      return n;
    });
    setFilters((f) => ({ ...f, q: query }));
  };

  const renderFilters = () => (
    <form onSubmit={applyFilters} className="space-y-5 text-[#071A3A]">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Filters</h2>
        <button type="button" onClick={resetFilters} className="text-sm font-semibold text-blue">
          Reset All
        </button>
      </div>

      <div>
        <p className="text-[11px] font-semibold tracking-wide uppercase text-slate">Trust & Verification</p>
        <div className="mt-2 space-y-2 text-sm">
          {[
            ["verified", "Verified Pro"],
            ["licensed", "Licensed"],
            ["insured", "Insured"],
            ["background_checked", "Background Checked"],
          ].map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 min-h-10">
              <input type="checkbox" checked={filters[key]} onChange={() => toggle(key)} />
              {label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[11px] font-semibold tracking-wide uppercase text-slate">Availability</p>
        <div className="mt-2 space-y-2 text-sm">
          {[
            ["emergency", "Emergency Service"],
            ["instant_booking", "Instant Booking"],
            ["free_estimate", "Free Estimate"],
          ].map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 min-h-10">
              <input type="checkbox" checked={filters[key]} onChange={() => toggle(key)} />
              {label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="text-[11px] font-semibold tracking-wide uppercase text-slate">Minimum Rating</label>
        <select
          value={filters.min_rating}
          onChange={(e) => setFilters((f) => ({ ...f, min_rating: e.target.value }))}
          className={`${FIELD} mt-1`}
        >
          <option value="">Any</option>
          <option value="4.5">4.5+</option>
          <option value="4">4.0+</option>
          <option value="3">3.0+</option>
        </select>
      </div>

      <div>
        <label className="text-[11px] font-semibold tracking-wide uppercase text-slate">
          Price Range · ${filters.max_price === "500" ? "500+" : filters.max_price}
        </label>
        <input
          type="range"
          min="0"
          max="500"
          step="10"
          value={filters.max_price || 500}
          onChange={(e) => setFilters((f) => ({ ...f, max_price: e.target.value }))}
          className="mt-2 w-full accent-[#00AEEF]"
        />
        <div className="flex justify-between text-[11px] text-slate">
          <span>$0</span>
          <span>$500+</span>
        </div>
      </div>

      <div>
        <label className="text-[11px] font-semibold tracking-wide uppercase text-slate">Distance</label>
        <select className={`${FIELD} mt-1`} defaultValue="">
          <option value="">Any Distance</option>
          <option value="10">Within 10 miles</option>
          <option value="25">Within 25 miles</option>
          <option value="50">Within 50 miles</option>
        </select>
      </div>

      <button type="submit" className="btn btn-primary inline-flex w-full min-h-11 rounded-xl">
        Apply Filters
      </button>

      <div className="rounded-2xl bg-[#EEF4FB] p-4 flex items-start gap-3">
        <img src="/avatar-sarah.png" alt="" className="size-11 rounded-full object-cover object-top bg-white shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-bold text-navy">Need Help?</p>
          <p className="mt-0.5 text-[12px] text-slate">Let our AI find the right pro for you.</p>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("sevenpros:open-ai"))}
            className="mt-2 text-sm font-semibold text-blue"
          >
            Ask AI Assistant →
          </button>
        </div>
      </div>
    </form>
  );

  return (
    <div className="bg-[#F4F7FB] text-[#071A3A] min-h-full">
      <div className="container-page py-6 md:py-8 grid lg:grid-cols-[260px_minmax(0,1fr)] gap-6 md:gap-8 items-start">
        <aside className="lg:sticky lg:top-24">
          <details className="lg:hidden rounded-2xl border border-[#E6EEF7] bg-white">
            <summary className="min-h-12 px-4 flex items-center font-semibold cursor-pointer">Filters</summary>
            <div className="px-4 pb-4">{renderFilters()}</div>
          </details>
          <div className="hidden lg:block rounded-2xl border border-[#E6EEF7] bg-white p-5">{renderFilters()}</div>
        </aside>

        <div className="min-w-0">
          <section className="rounded-[28px] bg-white border border-[#E6EEF7] p-5 md:p-8 grid lg:grid-cols-[1fr_280px] gap-6 items-center shadow-[0_12px_40px_rgba(7,26,58,0.05)]">
            <div>
              <h1 className="font-bold tracking-[-0.03em] leading-[1.12] text-[clamp(1.75rem,4vw,2.75rem)]">
                Find <span className="text-blue">Trusted</span> Professionals Near You
              </h1>
              <p className="mt-2 text-slate">Verified. Reviewed. Ready to help — whenever you need.</p>
              <form onSubmit={submitHeroSearch} className="mt-5 flex items-center gap-2 rounded-full border border-[#D7E3F0] bg-white shadow-[0_8px_24px_rgba(7,26,58,0.06)] p-1.5 pl-5">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="11" cy="11" r="6.5" stroke="#64748B" strokeWidth="1.7" />
                  <path d="M16.5 16.5L21 21" stroke="#64748B" strokeWidth="1.7" strokeLinecap="round" />
                </svg>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for a service, e.g., 'Plumbing', 'HVAC', 'Furniture Assembly'"
                  className="flex-1 !bg-transparent !border-0 !text-navy min-w-0 py-2.5 text-sm"
                />
                <button type="submit" className="h-11 shrink-0 rounded-full bg-brand-grad text-white font-semibold text-sm px-6">
                  Search
                </button>
              </form>
              <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-[12px] font-semibold text-navy/80">
                {[
                  ["Verified Pros", "M12 3l7 3v6c0 5-3 8-7 9-4-1-7-4-7-9V6l7-3z"],
                  ["Background Checked", "M9 12l2 2 4-4M12 3l7 3v6c0 5-3 8-7 9-4-1-7-4-7-9V6l7-3z"],
                  ["Instant Booking", "M12 8v5l3 2M12 21a9 9 0 110-18 9 9 0 010 18z"],
                  ["Secure & Reliable", "M12 3l7 3v6c0 5-3 8-7 9-4-1-7-4-7-9V6l7-3z"],
                ].map(([item, d]) => (
                  <div key={item} className="flex items-center gap-1.5">
                    <span className="size-7 rounded-full bg-[#E8F7FE] text-blue grid place-items-center shrink-0">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d={d} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="relative hidden lg:block h-[280px]">
              <div className="absolute inset-0 rounded-[24px] bg-[#D7EBFA] overflow-hidden">
                <img
                  src="/hero-pro.png?v=logo-shirt-no-hat"
                  alt="SevenPros service professional"
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[118%] w-auto object-contain"
                />
              </div>
              <div className="absolute -left-3 top-8 rounded-2xl bg-white px-3 py-2 shadow-[0_10px_24px_rgba(7,26,58,0.12)]">
                <div className="text-[#F5B400] text-xs">★★★★★</div>
                <div className="text-sm font-bold tabular-nums">4.9</div>
                <div className="text-[11px] text-slate">10k+ Happy Customers</div>
              </div>
              <div className="absolute right-2 bottom-4 rounded-full bg-brand-grad text-white text-[11px] font-semibold px-3 py-1.5 shadow-lg">
                Quality Service, Every Time!
              </div>
            </div>
          </section>

          <div className="mt-6 flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            {CAT_CHIPS.map((cat) => (
              <Link
                key={cat.name}
                to={cat.to}
                className="shrink-0 rounded-full bg-white border border-[#E6EEF7] px-3 h-9 inline-flex items-center gap-2 text-[13px] font-semibold text-navy hover:border-blue"
              >
                <span className="size-2.5 rounded-full" style={{ background: cat.color }} />
                {cat.name}
              </Link>
            ))}
            <Link
              to="/search"
              className="shrink-0 rounded-full bg-navy text-white px-3.5 h-9 inline-flex items-center text-[13px] font-semibold"
            >
              View All
            </Link>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="text-lg font-bold">
              {loading ? "Searching..." : `${providers.length} Professionals Found`}
            </h2>
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex rounded-xl border border-[#E6EEF7] bg-white p-1">
                <button
                  type="button"
                  onClick={() => setView("grid")}
                  className={`size-8 rounded-lg ${view === "grid" ? "bg-[#EEF4FB] text-navy" : "text-slate"}`}
                  aria-label="Grid view"
                >
                  ▦
                </button>
                <button
                  type="button"
                  onClick={() => setView("list")}
                  className={`size-8 rounded-lg ${view === "list" ? "bg-[#EEF4FB] text-navy" : "text-slate"}`}
                  aria-label="List view"
                >
                  ☰
                </button>
              </div>
              <select
                value={filters.sort}
                onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value }))}
                className={`${FIELD} sm:w-auto min-h-11`}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading && (
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl bg-white overflow-hidden border border-[#E6EEF7]">
                  <div className="skeleton h-40 rounded-none" />
                  <div className="p-4 space-y-3">
                    <div className="skeleton h-4 w-2/3" />
                    <div className="skeleton h-3 w-1/3" />
                    <div className="skeleton h-8 w-full" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && providers.length === 0 && (
            <div className="text-center text-slate py-20">No pros found matching your filters.</div>
          )}

          {!loading && (
            <div
              className={`stagger-in mt-5 grid gap-5 ${
                view === "list" ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
              }`}
            >
              {providers.map((p) => (
                <ProviderCard key={p.id} provider={p} detailed />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
