import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { POPULAR_CATEGORIES } from "../../data/popularCategories";

const TILES = [
  { slug: "plumbing", label: "Plumber", badge: "Fast" },
  { slug: "electrical", label: "Electrician", badge: "Verified" },
  { slug: "hvac", label: "HVAC", badge: null },
  { slug: "cleaning", label: "House Cleaning", badge: "Popular" },
  { slug: "handyman", label: "Handyman", badge: null },
  { slug: "painting", label: "Painting", badge: null },
  { slug: "landscaping", label: "Landscaping", badge: null },
  { slug: "appliance-repair", label: "Appliance Repair", badge: null },
];

const FEATURED = [
  { slug: "furniture-assembly", label: "Furniture Assembly" },
  { slug: "handyman", label: "Same-day Handyman" },
];

const PROMISES = [
  "Trained & experienced professionals",
  "Vetted & background-verified",
  "Transparent & fixed pricing",
  "Dedicated support on every job",
];

const PROMO_SLIDES = [
  {
    id: "ondemand",
    kind: "promo",
    title: "Your local pro, on demand",
    subtitle: "Book verified help in a few taps",
    cta: "Find a pro",
    to: "/search",
    image: "/premium/customer-home.jpg",
    accent: "#2563eb",
  },
  {
    id: "clean",
    kind: "promo",
    title: "Sparkling home, booked fast",
    subtitle: "Trusted house cleaning near you",
    cta: "Book cleaning",
    to: "/categories/cleaning",
    image: "/premium/cleaning.jpg",
    accent: "#0ea5e9",
  },
  {
    id: "plumb",
    kind: "promo",
    title: "Leaks fixed today",
    subtitle: "Background-checked plumbers, same-day slots",
    cta: "Find a plumber",
    to: "/categories/plumbing",
    image: "/hero/plumb-clean.jpg",
    accent: "#6366f1",
  },
];

const SLIDE_MS = 5200;

function ServiceTile({ slug, label, badge, index }) {
  const category = POPULAR_CATEGORIES.find((c) => c.slug === slug);
  if (!category) return null;
  return (
    <Link
      to={`/categories/${slug}`}
      className="group flex flex-col items-center rounded-2xl px-2 py-3 text-center transition-[background-color,transform] duration-160 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-[#F7F8FA] active:scale-[0.98] motion-safe:[animation:rise-in_420ms_var(--ease-out)_both]"
      style={{ animationDelay: `${80 + index * 45}ms` }}
    >
      <div className="relative size-[72px] overflow-hidden rounded-2xl bg-[#F1F5F9] sm:size-[80px]">
        <img
          src={category.image}
          alt=""
          className="uc-float size-full object-cover transition-transform duration-220 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.05]"
          style={{ animationDelay: `${index * 180}ms` }}
        />
        {badge && (
          <span className="absolute left-1 top-1 rounded-full bg-[#16a34a] px-1.5 py-0.5 text-[9px] font-bold text-white">
            {badge}
          </span>
        )}
      </div>
      <span className="mt-2 text-[12px] font-semibold leading-snug text-[#0b1220] sm:text-[13px]">{label}</span>
    </Link>
  );
}

function PromoCard({ slide }) {
  return (
    <Link
      to={slide.to}
      className="relative flex size-full overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${slide.accent} 0%, #0b1220 72%)` }}
    >
      <img
        src={slide.image}
        alt=""
        className="absolute inset-0 size-full object-cover opacity-55 transition-transform duration-[8s] ease-[cubic-bezier(0.23,1,0.32,1)] hover:scale-[1.02]"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0b1220]/85 via-[#0b1220]/45 to-transparent" />
      <div className="relative z-[1] flex size-full flex-col justify-end p-5 sm:p-6">
        <p className="max-w-[14rem] text-[1.2rem] font-bold leading-tight tracking-[-0.02em] text-white sm:text-[1.35rem]">
          {slide.title}
        </p>
        <p className="mt-1.5 max-w-[16rem] text-[13px] text-white/85">{slide.subtitle}</p>
        <span className="mt-4 inline-flex h-10 w-fit items-center rounded-full bg-white px-4 text-[13px] font-semibold text-[#0b1220] transition-transform duration-160 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.98]">
          {slide.cta}
        </span>
      </div>
    </Link>
  );
}

function PromoCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (paused || reduceMotion) return undefined;
    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % PROMO_SLIDES.length);
    }, SLIDE_MS);
    return () => window.clearInterval(id);
  }, [paused, reduceMotion, index]);

  const goTo = (next) => {
    setIndex(next);
  };

  return (
    <div
      className="relative overflow-hidden rounded-3xl bg-[#0b1220] shadow-[0_16px_40px_rgba(15,23,42,0.18)]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false);
      }}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        <div
          className="flex size-full transition-transform duration-[480ms] ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
          style={{ transform: `translate3d(-${index * 100}%, 0, 0)` }}
        >
          {PROMO_SLIDES.map((slide) => (
            <div key={slide.id} className="relative h-full w-full shrink-0 grow-0 basis-full">
              <PromoCard slide={slide} />
            </div>
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[4] flex justify-end p-3 sm:p-4">
        <div className="pointer-events-auto flex items-center gap-1.5 rounded-full bg-black/35 px-2.5 py-2 backdrop-blur-md">
          {PROMO_SLIDES.map((slide, i) => {
            const active = i === index;
            return (
              <button
                key={slide.id}
                type="button"
                aria-label={`Show promo ${i + 1}`}
                aria-current={active ? "true" : undefined}
                onClick={() => goTo(i)}
                className="relative h-[3px] overflow-hidden rounded-full bg-white/35 transition-[width] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]"
                style={{ width: active ? 28 : 12 }}
              >
                {active && !reduceMotion && !paused ? (
                  <span
                    key={`${slide.id}-${index}`}
                    className="uc-progress-fill absolute inset-y-0 left-0 rounded-full bg-white"
                    style={{ ["--uc-slide-ms"]: `${SLIDE_MS}ms` }}
                  />
                ) : (
                  <span
                    className="absolute inset-y-0 left-0 rounded-full bg-white"
                    style={{ width: active ? "100%" : "0%" }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function UcHomeSplit() {
  return (
    <section className="bg-[#F7F8FA] pb-8 pt-6 md:pb-10 md:pt-7">
      <div className="container-page grid items-start gap-5 lg:grid-cols-[1.15fr_0.85fr] lg:gap-6">
        <div className="rounded-[28px] bg-white p-4 shadow-[0_8px_30px_rgba(15,23,42,0.06)] ring-1 ring-[#E8ECF1] sm:p-5 motion-safe:[animation:rise-in_460ms_var(--ease-out)_both]">
          <div className="grid grid-cols-2 gap-1 sm:grid-cols-4 sm:gap-2">
            {TILES.map((tile, index) => (
              <ServiceTile key={tile.slug + tile.label} {...tile} index={index} />
            ))}
          </div>

          <div className="mt-5 border-t border-[#E8ECF1] pt-4">
            <p className="px-2 text-[14px] font-bold text-[#0b1220]">Popular for home</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {FEATURED.map((item, index) => {
                const category = POPULAR_CATEGORIES.find((c) => c.slug === item.slug);
                if (!category) return null;
                return (
                  <Link
                    key={item.label}
                    to={`/categories/${item.slug}`}
                    className="flex items-center gap-3 rounded-2xl bg-[#F7F8FA] px-3 py-3 ring-1 ring-[#E8ECF1] transition-[background-color,transform] duration-160 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-[#EEF2F7] active:scale-[0.99] motion-safe:[animation:rise-in_480ms_var(--ease-out)_both]"
                    style={{ animationDelay: `${420 + index * 70}ms` }}
                  >
                    <img
                      src={category.image}
                      alt=""
                      className="uc-float size-12 rounded-xl object-cover"
                      style={{ animationDelay: `${index * 220}ms`, animationDuration: "4s" }}
                    />
                    <span className="text-[13px] font-semibold text-[#0b1220]">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 motion-safe:[animation:rise-in_500ms_var(--ease-out)_120ms_both]">
          <PromoCarousel />

          <div className="rounded-[28px] bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] ring-1 ring-[#E8ECF1] sm:p-6">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-full bg-[#ede9fe] text-[#6d28d9]">
                <svg width="14" height="14" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M2.5 6.2l2.3 2.3 4.7-4.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <h2 className="text-[1.05rem] font-bold text-[#0b1220]">Our promises</h2>
            </div>
            <ul className="mt-4 space-y-3">
              {PROMISES.map((item, index) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-[14px] font-medium text-[#334155] motion-safe:[animation:rise-in_420ms_var(--ease-out)_both]"
                  style={{ animationDelay: `${220 + index * 70}ms` }}
                >
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#F1F5F9] text-[#4f46e5]">
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <path d="M2.5 6.2l2.3 2.3 4.7-4.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
