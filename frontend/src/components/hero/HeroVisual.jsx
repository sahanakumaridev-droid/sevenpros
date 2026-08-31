import AppPhone from "./AppPhone";

function TestimonialCard({ className = "" }) {
  return (
    <aside
      className={`float-card rounded-2xl bg-white text-navy p-3 shadow-[0_16px_40px_rgba(7,26,58,0.22)] ${className}`}
    >
      <div className="flex items-start gap-2.5">
        <img
          src="/avatar-sarah.png"
          alt=""
          className="size-10 rounded-full object-cover object-top bg-[#E8EEF6] shrink-0"
        />
        <div className="min-w-0">
          <div className="flex items-center gap-1 text-[#F5B400] text-[11px] leading-none" aria-label="5 star rating">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} aria-hidden="true">
                ★
              </span>
            ))}
          </div>
          <p className="mt-1.5 text-[12px] leading-snug text-pretty">
            &ldquo;Found an amazing electrician in minutes. Super professional!&rdquo;
          </p>
          <div className="mt-1 text-[11px] font-semibold text-slate">Sarah M.</div>
        </div>
      </div>
    </aside>
  );
}

export default function HeroVisual() {
  return (
    <div className="relative h-[300px] sm:h-[380px] lg:h-[540px] xl:h-[580px]">
      <div className="absolute right-0 sm:right-4 lg:right-0 top-2 sm:top-6 z-10 origin-top-right scale-[0.62] sm:scale-[0.78] lg:scale-100 hero-visual-enter">
        <AppPhone />
      </div>

      <img
          src="/hero-pro.png?v=logo-shirt-no-hat"
        alt="SevenPros service professional ready for a home visit"
        className="hero-pro pointer-events-none absolute bottom-0 left-0 sm:left-[-2%] h-[112%] w-auto max-w-[58%] sm:max-w-[54%] lg:max-w-[62%] object-contain object-bottom object-left z-20 hero-visual-enter"
      />

      <TestimonialCard className="hidden sm:block absolute z-30 bottom-1 right-0 w-[min(240px,48%)]" />
    </div>
  );
}
