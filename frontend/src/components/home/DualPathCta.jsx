import { Link } from "react-router-dom";

const PATHS = [
  {
    key: "customer",
    image: "/premium/customer-home.jpg?v=real2",
    imageAlt: "Real suburban home ready for local service",
    objectPos: "object-[center_45%]",
    title: "Find the Right Pro for Your Project.",
    points: ["Search & compare", "Read reviews", "Book instantly"],
    cta: "Get Started as a Customer",
    to: "/services/customer",
    accent: "customer",
  },
  {
    key: "pro",
    image: "/premium/pro-trade.jpg?v=real2",
    imageAlt: "Real tradespeople collaborating on a job site",
    objectPos: "object-[center_35%]",
    title: "Grow Your Business with SevenPros.",
    points: ["Get more leads", "Showcase expertise", "Manage bookings"],
    cta: "Join as a Pro",
    to: "/services/pro",
    accent: "pro",
  },
];

function PathCard({ path, index }) {
  const isPro = path.accent === "pro";

  return (
    <article
      className="group flex h-full flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_14px_40px_rgba(15,23,42,0.08)] ring-1 ring-[#E8ECF1] transition-[transform,box-shadow] duration-220 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-1 hover:shadow-[0_22px_48px_rgba(15,23,42,0.12)] motion-safe:[animation:rise-in_520ms_var(--ease-out)_both]"
      style={{ animationDelay: `${100 + index * 90}ms` }}
    >
      <div className="relative h-48 overflow-hidden sm:h-56">
        <img
          src={path.image}
          alt={path.imageAlt}
          className={`size-full object-cover ${path.objectPos} transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.04]`}
        />
        <div
          aria-hidden="true"
          className={`absolute inset-0 bg-gradient-to-t ${
            isPro ? "from-[#1e1b4b]/45 via-transparent to-transparent" : "from-[#0b1220]/40 via-transparent to-transparent"
          }`}
        />
        <span
          className={`absolute left-4 top-4 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-white backdrop-blur-md ${
            isPro ? "bg-[#4f46e5]/75" : "bg-[#0b1220]/65"
          }`}
        >
          {isPro ? "For pros" : "For customers"}
        </span>
      </div>

      <div className="flex flex-1 flex-col px-5 pb-6 pt-5 sm:px-6 sm:pb-7">
        <h2 className="text-[1.2rem] font-bold leading-tight tracking-[-0.03em] text-[#0b1220] sm:text-[1.35rem] [text-wrap:pretty]">
          {path.title}
        </h2>

        <ul className="mt-4 space-y-2.5">
          {path.points.map((item, i) => (
            <li
              key={item}
              className="flex items-center gap-2.5 text-[13px] font-medium text-[#475569] sm:text-[14px] motion-safe:[animation:rise-in_420ms_var(--ease-out)_both]"
              style={{ animationDelay: `${220 + index * 60 + i * 50}ms` }}
            >
              <span
                className={`flex size-5 shrink-0 items-center justify-center rounded-full text-white ${
                  isPro ? "bg-brand-grad" : "bg-[#0b1220]"
                }`}
              >
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

        <div className="mt-auto pt-6">
          <Link
            to={path.to}
            className={`inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-full px-5 text-[13px] font-semibold text-white transition-[transform,filter,box-shadow] duration-180 ease-[cubic-bezier(0.23,1,0.32,1)] hover:brightness-110 active:scale-[0.98] sm:h-12 sm:text-[14px] ${
              isPro
                ? "bg-brand-grad shadow-[0_12px_28px_rgba(79,70,229,0.28)]"
                : "bg-[#0b1220] shadow-[0_12px_28px_rgba(15,23,42,0.22)]"
            }`}
          >
            {path.cta} <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function DualPathCta() {
  return (
    <section className="bg-[#F7F8FA] py-8 md:py-10">
      <div className="container-page">
        <div className="mb-5 text-center motion-safe:[animation:rise-in_460ms_var(--ease-out)_both] md:mb-6">
          <h2 className="text-[1.3rem] font-bold tracking-[-0.03em] text-[#0b1220] sm:text-[1.5rem]">
            Built for customers and pros
          </h2>
          <p className="mx-auto mt-1.5 max-w-[42ch] text-[13px] text-[#64748b] sm:text-[14px]">
            Same marketplace. Two clear paths — book help, or grow your trade.
          </p>
        </div>

        <div className="grid items-stretch gap-4 lg:grid-cols-2 lg:gap-5">
          {PATHS.map((path, index) => (
            <PathCard key={path.key} path={path} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
