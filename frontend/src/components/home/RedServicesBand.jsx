import { Link } from "react-router-dom";

const POINTS = [
  "Verified local professionals in every category",
  "Transparent pricing before you book",
  "Same-week scheduling across California",
];

export default function RedServicesBand() {
  return (
    <section className="relative overflow-hidden bg-[#E11D2E]" aria-labelledby="red-services-heading">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle at 18% 30%, rgba(255,255,255,0.28), transparent 34%), radial-gradient(circle at 78% 20%, rgba(0,0,0,0.12), transparent 36%)",
        }}
      />

      <div className="container-page relative grid items-end gap-8 pt-12 md:grid-cols-[1.05fr_0.95fr] md:gap-10 md:pt-14 lg:pt-16">
        <div className="pb-12 text-white md:pb-16 lg:pb-20 motion-safe:[animation:rise-in_480ms_var(--ease-out)_both]">
          <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-white/75">Our services</p>
          <h2
            id="red-services-heading"
            className="mt-3 max-w-[16ch] text-[1.85rem] font-bold leading-[1.12] tracking-[-0.035em] sm:text-[2.15rem] lg:text-[2.4rem]"
          >
            Home help that shows up ready to work.
          </h2>
          <p className="mt-4 max-w-[42ch] text-[15px] leading-relaxed text-white/90 sm:text-base">
            From cleaning and plumbing to electrical and handyman jobs, SevenPros connects you with
            background-checked pros who treat your home like their own.
          </p>
          <ul className="mt-6 space-y-3">
            {POINTS.map((item, index) => (
              <li
                key={item}
                className="flex items-start gap-3 text-[14px] font-medium text-white/95 sm:text-[15px] motion-safe:[animation:rise-in_420ms_var(--ease-out)_both]"
                style={{ animationDelay: `${160 + index * 70}ms` }}
              >
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-white/20 ring-1 ring-white/30">
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path
                      d="M2.5 6.2l2.3 2.3 4.7-4.8"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/search"
              className="inline-flex h-12 items-center justify-center rounded-full bg-white px-6 text-[14px] font-semibold text-[#E11D2E] transition-[transform,background-color] duration-160 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-[#FFF5F5] active:scale-[0.98]"
            >
              Browse services
            </Link>
            <Link
              to="/get-started"
              className="inline-flex h-12 items-center justify-center rounded-full border border-white/40 bg-white/10 px-6 text-[14px] font-semibold text-white backdrop-blur-sm transition-[transform,background-color] duration-160 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-white/18 active:scale-[0.98]"
            >
              Get started
            </Link>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[520px] md:mx-0 md:max-w-none">
          <div className="pointer-events-none absolute -left-6 top-10 size-24 rounded-full bg-white/10 blur-2xl sm:size-32" />
          <div className="pointer-events-none absolute right-4 top-0 size-20 rounded-full bg-[#FFB4A8]/35 blur-xl" />
          <img
            src="/services-red-illustration.png"
            alt="SevenPros service professionals ready to help"
            className="uc-float relative z-[1] mx-auto w-[min(100%,420px)] origin-bottom select-none drop-shadow-[0_28px_50px_rgba(0,0,0,0.28)] md:w-full md:max-w-[480px] motion-safe:[animation:rise-in_560ms_var(--ease-out)_120ms_both]"
            style={{ marginBottom: "-18%" }}
          />
        </div>
      </div>

      {/* White ledge so the illustration overlaps past the red, like the reference */}
      <div className="relative z-0 h-16 bg-white sm:h-20 md:h-24" aria-hidden="true" />
    </section>
  );
}
