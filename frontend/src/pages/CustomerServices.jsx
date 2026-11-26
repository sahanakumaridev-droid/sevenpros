import { Link } from "react-router-dom";
import { POPULAR_CATEGORIES } from "../data/popularCategories";

const POINTS = [
  "Verified & background-checked pros",
  "Transparent pricing before you book",
  "Reviews from real California customers",
];

export default function CustomerServices() {
  return (
    <div className="bg-[#F7F8FA] text-[#0b1220]">
      <section className="relative overflow-hidden bg-[#F9F3F0]">
        <div className="container-page grid items-center gap-8 py-12 md:grid-cols-[1.05fr_0.95fr] md:py-16">
          <div className="motion-safe:[animation:rise-in_480ms_var(--ease-out)_both]">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#8B7355]">Customer services</p>
            <h1 className="mt-3 max-w-[16ch] text-[2.2rem] font-bold leading-[1.1] tracking-[-0.04em] sm:text-[2.7rem]">
              Book help for every room in your home.
            </h1>
            <p className="mt-4 max-w-[42ch] text-[15px] leading-relaxed text-[#5C5550]">
              Choose a category, compare local pros, and schedule service when you need it.
            </p>
            <ul className="mt-6 space-y-2.5">
              {POINTS.map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-[14px] font-medium text-[#3A322E]">
                  <span className="flex size-5 items-center justify-center rounded-full bg-[#4A342C] text-white">
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <path d="M2.5 6.2l2.3 2.3 4.7-4.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/signup?intent=hire"
                className="inline-flex h-12 items-center justify-center rounded-full bg-[#4A342C] px-6 text-[13px] font-bold uppercase tracking-[0.06em] text-white transition-transform duration-160 active:scale-[0.98]"
              >
                Create customer account
              </Link>
              <Link
                to="/login?intent=hire"
                className="inline-flex h-12 items-center justify-center rounded-full border border-[#4A342C]/30 bg-white px-6 text-[13px] font-bold uppercase tracking-[0.06em] text-[#4A342C] transition-transform duration-160 active:scale-[0.98]"
              >
                Sign in
              </Link>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-[28px] cream-slide-in">
            <img src="/premium/customer-home.jpg?v=real2" alt="Real suburban home ready for local service" className="aspect-[4/3] w-full object-cover object-[center_45%]" />
          </div>
        </div>
      </section>

      <section className="container-page py-10 md:py-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#64748b]">Browse categories</p>
            <h2 className="mt-1 text-[1.45rem] font-bold tracking-[-0.03em]">Services you can book</h2>
          </div>
          <Link to="/search" className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#5b46f5]">
            See all
          </Link>
        </div>

        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {POPULAR_CATEGORIES.map((cat, index) => (
            <li key={cat.slug} className="motion-safe:[animation:rise-in_460ms_var(--ease-out)_both]" style={{ animationDelay: `${60 + index * 40}ms` }}>
              <Link
                to={`/categories/${cat.slug}`}
                className="group relative block aspect-[5/4] overflow-hidden rounded-[22px] bg-[#0b1220] ring-1 ring-[#E8ECF1] transition-[transform,box-shadow] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(15,23,42,0.12)]"
              >
                <img
                  src={`${cat.image}${cat.image.includes("?") ? "&" : "?"}v=card2`}
                  alt=""
                  className="absolute inset-0 size-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                />
                <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#0b1220]/85 via-[#0b1220]/2 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 px-4 py-3.5">
                  <span className="text-[13px] font-bold uppercase tracking-[0.06em] text-white">{cat.name}</span>
                  <span className="text-white/70 transition-transform duration-160 group-hover:translate-x-0.5 group-hover:text-white">→</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
