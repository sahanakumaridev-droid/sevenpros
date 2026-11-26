import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import client from "../api/client";
import { POPULAR_CATEGORIES } from "../data/popularCategories";

const PHOTOS = {
  Plumbing: "/premium/plumbing.jpg",
  Electrical: "/premium/electrical.jpg",
  HVAC: "/premium/hvac.jpg",
  Cleaning: "/premium/cleaning.jpg",
  Handyman: "/premium/handyman.jpg",
  "Home Services": "/premium/handyman.jpg",
  Painting: "/premium/painting.jpg",
  "Appliance Repair": "/premium/appliance.jpg",
  Landscaping: "/premium/landscaping.jpg",
  Moving: "/premium/furniture.jpg",
};

const FALLBACK_GROUPS = [
  {
    group: "Popular",
    icon: "⭐",
    categories: POPULAR_CATEGORIES.map((c, index) => ({
      id: `local-${index}`,
      name: c.name,
      slug: c.slug,
      group: "Popular",
      is_popular: true,
    })),
  },
];

let cachedGroups = null;
let prefetchPromise = null;

function normalizeGroups(data) {
  if (!Array.isArray(data) || data.length === 0) return null;
  return data
    .filter((g) => g?.group && Array.isArray(g.categories))
    .map((g) => ({
      group: g.group,
      icon: g.icon || "🔧",
      categories: g.categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        group: c.group || g.group,
        is_popular: Boolean(c.is_popular),
      })),
    }));
}

function preferredActive(groups) {
  const preferred = ["Plumbing", "Cleaning", "Home Services", "Electrical", "HVAC"];
  return preferred.find((name) => groups.some((g) => g.group === name)) || groups[0]?.group || null;
}

export function prefetchCategories() {
  if (cachedGroups || prefetchPromise) return prefetchPromise;
  prefetchPromise = client
    .get("/categories/grouped")
    .then((res) => {
      const next = normalizeGroups(res.data);
      if (next) cachedGroups = next;
      return cachedGroups;
    })
    .catch(() => null);
  return prefetchPromise;
}

export default function CategoryMegaMenu({ onNavigate, variant = "desktop", darkMobile = true }) {
  const [groups, setGroups] = useState(() => cachedGroups || FALLBACK_GROUPS);
  const [loading, setLoading] = useState(!cachedGroups);
  const [active, setActive] = useState(() =>
    variant === "mobile" ? null : preferredActive(cachedGroups || FALLBACK_GROUPS),
  );

  useEffect(() => {
    let cancelled = false;
    if (cachedGroups) {
      setGroups(cachedGroups);
      setLoading(false);
      if (variant !== "mobile") setActive((curr) => curr || preferredActive(cachedGroups));
      return undefined;
    }

    setLoading(true);
    client
      .get("/categories/grouped")
      .then((res) => {
        if (cancelled) return;
        const next = normalizeGroups(res.data);
        if (!next) return;
        cachedGroups = next;
        setGroups(next);
        if (variant !== "mobile") setActive(preferredActive(next));
      })
      .catch(() => {
        /* keep fallback */
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [variant]);

  const activeGroup = useMemo(() => groups.find((g) => g.group === active) || groups[0], [groups, active]);
  const categories = activeGroup?.categories ?? [];
  const popular = categories.filter((c) => c.is_popular);
  const rest = categories.filter((c) => !c.is_popular);
  const list = (popular.length ? [...popular, ...rest] : categories).slice(0, 12);
  const photo = PHOTOS[activeGroup?.group] || "/categories/handyman.jpg?v=3";

  const categoryTo = (c) => `/search?category=${encodeURIComponent(c.slug)}&q=${encodeURIComponent(c.name)}`;

  if (variant === "mobile") {
    const label = darkMobile ? "text-white" : "text-[#0b1220]";
    const muted = darkMobile ? "text-white/55" : "text-[#64748b]";
    const chip = darkMobile ? "bg-white/10 text-white/70" : "bg-[#F1F5F9] text-[#64748b]";
    const row = darkMobile ? "border-white/10" : "border-[#E8ECF1]";
    const link = darkMobile
      ? "text-white/85 hover:bg-white/10 hover:text-white"
      : "text-[#334155] hover:bg-[#F8FAFC] hover:text-[#0b1220]";

    return (
      <div className="px-1">
        <p className={`px-3 pb-2 pt-1 text-[11px] font-bold uppercase tracking-[0.14em] ${muted}`}>
          Browse categories
        </p>
        {loading && !cachedGroups && (
          <p className={`px-3 pb-2 text-[12px] ${muted}`}>Loading full list…</p>
        )}
        {groups.map((g) => {
          const open = active === g.group;
          return (
            <div key={g.group} className={`border-b ${row}`}>
              <button
                type="button"
                aria-expanded={open}
                onClick={() => setActive(open ? null : g.group)}
                className="flex min-h-12 w-full items-center gap-3 px-3 py-3 text-left"
              >
                <span className={`flex-1 text-[13px] font-bold uppercase tracking-[0.08em] ${label}`}>
                  {g.group}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums ${chip}`}>
                  {g.categories.length}
                </span>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  aria-hidden="true"
                  className={`${muted} transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                >
                  <path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
              {open && (
                <ul className="space-y-1 pb-3 pl-3 pr-3">
                  {g.categories.map((c) => (
                    <li key={c.id}>
                      <Link
                        to={categoryTo(c)}
                        onClick={onNavigate}
                        className={`flex min-h-11 items-center rounded-xl px-3 text-[14px] font-medium transition-colors duration-150 ${link}`}
                      >
                        {c.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-[28px] border border-[#E8ECF1] bg-white text-[#0b1220] shadow-[0_24px_64px_rgba(7,26,58,0.16)]">
      <div className="flex max-h-[min(640px,72vh)] min-h-[440px]">
        <div className="w-[260px] shrink-0 overflow-y-auto border-r border-[#EEF2F7] py-5">
          <div className="px-5 pb-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#64748b]">Browse by category</p>
            <p className="mt-1.5 text-[13px] leading-snug text-[#94a3b8]">
              {loading ? "Loading categories…" : "Find the right pro for your needs"}
            </p>
          </div>
          <ul className="space-y-1 px-2">
            {groups.map((g) => {
              const selected = active === g.group || (!active && g === activeGroup);
              return (
                <li key={g.group}>
                  <button
                    type="button"
                    onMouseEnter={() => setActive(g.group)}
                    onFocus={() => setActive(g.group)}
                    onClick={() => setActive(g.group)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-[background-color,color] duration-160 ease-[cubic-bezier(0.23,1,0.32,1)] ${
                      selected ? "bg-[#0b1220] text-white" : "text-[#0b1220] hover:bg-[#F8FAFC]"
                    }`}
                  >
                    <span className="min-w-0 flex-1 text-[12px] font-bold uppercase tracking-[0.08em]">
                      {g.group}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums ${
                        selected ? "bg-white/15 text-white" : "bg-[#F1F5F9] text-[#64748b]"
                      }`}
                    >
                      {g.categories.length}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="min-w-0 flex-1 overflow-y-auto p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#64748b]">Selected</p>
              <h3 className="mt-1 text-[1.5rem] font-bold tracking-[-0.03em] text-[#0b1220]">
                {activeGroup?.group || "Categories"}
              </h3>
              <p className="mt-1 text-[13px] text-[#64748b]">
                {categories.length} services · California & Canada
              </p>
            </div>
            {activeGroup && (
              <Link
                to={`/search?q=${encodeURIComponent(activeGroup.group)}`}
                onClick={onNavigate}
                className="shrink-0 rounded-full bg-[#0b1220] px-4 py-2 text-[12px] font-bold uppercase tracking-[0.06em] text-white transition-transform duration-160 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-[#1e293b] active:scale-[0.98]"
              >
                View all
              </Link>
            )}
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl bg-[#F7F8FA] ring-1 ring-[#E8ECF1]">
            <div className="grid items-center gap-4 p-4 sm:grid-cols-[1fr_auto]">
              <div className="px-1">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#64748b]">
                  {activeGroup?.group} services
                </p>
                <p className="mt-1 max-w-sm text-[14px] font-medium text-[#334155]">
                  Book a verified local pro for {activeGroup?.group?.toLowerCase() || "this trade"}.
                </p>
              </div>
              <img src={photo} alt="" className="hidden h-24 w-40 rounded-xl object-cover sm:block" />
            </div>
          </div>

          <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.14em] text-[#64748b]">
            Service list
          </p>
          <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {list.map((c) => (
              <li key={c.id}>
                <Link
                  to={categoryTo(c)}
                  onClick={onNavigate}
                  className="group flex min-h-[48px] items-center justify-between gap-3 rounded-2xl border border-[#E8ECF1] bg-white px-4 py-3 transition-[border-color,background-color,transform] duration-160 ease-[cubic-bezier(0.23,1,0.32,1)] hover:border-[#CBD5E1] hover:bg-[#F8FAFC] active:scale-[0.99]"
                >
                  <span className="min-w-0 text-[14px] font-semibold tracking-[-0.01em] text-[#0b1220]">
                    {c.name}
                  </span>
                  <span
                    aria-hidden="true"
                    className="text-[#94a3b8] transition-transform duration-160 group-hover:translate-x-0.5 group-hover:text-[#0b1220]"
                  >
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-[#EEF2F7] px-6 py-3.5">
        <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#94a3b8]">
          California & Canada
        </p>
        <Link
          to="/search"
          onClick={onNavigate}
          className="text-[13px] font-bold text-[#5b46f5] transition-opacity duration-160 hover:opacity-80"
        >
          Browse all categories →
        </Link>
      </div>
    </div>
  );
}
