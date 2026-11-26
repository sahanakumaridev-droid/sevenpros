import { Link } from "react-router-dom";
import { POPULAR_CATEGORIES } from "../data/popularCategories";

const POINTS = [
  "Get more local leads in your trade",
  "Showcase reviews and expertise",
  "Manage bookings from one dashboard",
];

export default function ProServices() {
  return (
    <div className="bg-[#0b1220] text-white">
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 20%, rgba(79,70,229,0.45), transparent 40%), radial-gradient(circle at 85% 70%, rgba(0,174,239,0.2), transparent 42%)",
          }}
        />
        <div className="container-page relative grid items-center gap-8 py-12 md:grid-cols-[1.05fr_0.95fr] md:py-16">
          <div className="motion-safe:[animation:rise-in_480ms_var(--ease-out)_both]">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/55">Pro services</p>
            <h1 className="mt-3 max-w-[16ch] text-[2.2rem] font-bold leading-[1.1] tracking-[-0.04em] sm:text-[2.7rem]">
              Grow your trade with SevenPros.
            </h1>
            <p className="mt-4 max-w-[42ch] text-[15px] leading-relaxed text-white/75">
              Pick the categories you serve, get matched with nearby jobs, and build a trusted profile.
            </p>
            <ul className="mt-6 space-y-2.5">
              {POINTS.map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-[14px] font-medium text-white/90">
                  <span className="flex size-5 items-center justify-center rounded-full bg-[#4f46e5] text-white">
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
                to="/signup?intent=offer"
                className="inline-flex h-12 items-center justify-center rounded-full bg-[linear-gradient(90deg,#5b46f5,#3b82f6)] px-6 text-[13px] font-bold uppercase tracking-[0.06em] text-white shadow-[0_12px_28px_rgba(91,70,245,0.35)] transition-transform duration-160 active:scale-[0.98]"
              >
                Join as a pro
              </Link>
              <Link
                to="/login?intent=offer"
                className="inline-flex h-12 items-center justify-center rounded-full border border-white/25 bg-white/10 px-6 text-[13px] font-bold uppercase tracking-[0.06em] text-white backdrop-blur-sm transition-transform duration-160 active:scale-[0.98]"
              >
                Sign in
              </Link>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-[28px] cream-slide-in ring-1 ring-white/10">
            <img src="/premium/pro-trade.jpg?v=real2" alt="Real tradespeople collaborating on a job site" className="aspect-[4/3] w-full object-cover object-[center_35%]" />
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-[#111827]">
        <div className="container-page py-10 md:py-12">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/50">Offer categories</p>
              <h2 className="mt-1 text-[1.45rem] font-bold tracking-[-0.03em]">Services you can provide</h2>
            </div>
            <Link to="/become-a-pro" className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#a5b4fc]">
              Become a pro
            </Link>
          </div>

          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {POPULAR_CATEGORIES.map((cat, index) => (
              <li key={cat.slug} className="motion-safe:[animation:rise-in_460ms_var(--ease-out)_both]" style={{ animationDelay: `${60 + index * 40}ms` }}>
                <Link
                  to={`/signup?intent=offer&next=${encodeURIComponent(`/become-a-pro`)}`}
                  className="group flex h-full flex-col overflow-hidden rounded-[24px] bg-white/5 ring-1 ring-white/10 transition-[transform,background-color] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-0.5 hover:bg-white/10"
                >
                  <img src={cat.image} alt="" className="aspect-[16/10] w-full object-cover opacity-90 transition-transform duration-300 group-hover:scale-[1.03]" />
                  <div className="flex items-center justify-between gap-3 px-4 py-3.5">
                    <span className="text-[13px] font-bold uppercase tracking-[0.06em] text-white">{cat.name}</span>
                    <span className="text-white/50 transition-transform duration-160 group-hover:translate-x-0.5 group-hover:text-white">→</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
