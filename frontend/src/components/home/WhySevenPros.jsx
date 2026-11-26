import { Link } from "react-router-dom";
import MapPhone from "./MapPhone";

const FEATURES = [
  {
    title: "Verified Professionals",
    body: "Background checked & reviewed",
    icon: (
      <path d="M12 3l7 3v6c0 5-3 8-7 9-4-1-7-4-7-9V6l7-3z" stroke="currentColor" strokeWidth="1.7" fill="none" />
    ),
  },
  {
    title: "AI-Powered Matching",
    body: "The right pro for your job",
    icon: (
      <path
        d="M12 3v3M12 18v3M4.9 6.5l2.2 2.2M16.9 16.3l2.2 2.2M3 12h3M18 12h3M4.9 17.5l2.2-2.2M16.9 7.7l2.2-2.2M9 12a3 3 0 106 0 3 3 0 00-6 0z"
        stroke="currentColor"
        strokeWidth="1.7"
        fill="none"
        strokeLinecap="round"
      />
    ),
  },
  {
    title: "Transparent Pricing",
    body: "See quotes before you book",
    icon: (
      <path
        d="M12 4v16M16 8c0-1.7-1.8-3-4-3s-4 1.3-4 3 1.8 3 4 3 4 1.3 4 3-1.8 3-4 3-4-1.3-4-3"
        stroke="currentColor"
        strokeWidth="1.7"
        fill="none"
        strokeLinecap="round"
      />
    ),
  },
  {
    title: "Secure Payments",
    body: "Pay only when the job is done",
    icon: (
      <path
        d="M4 8h16v10H4V8zm0 0l8-4 8 4M8 13h.01M12 13h4"
        stroke="currentColor"
        strokeWidth="1.7"
        fill="none"
        strokeLinecap="round"
      />
    ),
  },
  {
    title: "Fast Booking",
    body: "Schedule in a few clicks",
    icon: (
      <path
        d="M7 4v3M17 4v3M5 9h14M6 7h12a2 2 0 012 2v9a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2z"
        stroke="currentColor"
        strokeWidth="1.7"
        fill="none"
        strokeLinecap="round"
      />
    ),
  },
  {
    title: "Real-Time Tracking",
    body: "Know when your pro is on the way",
    icon: (
      <path
        d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11zM12 10.2a1.8 1.8 0 110-3.6 1.8 1.8 0 010 3.6z"
        stroke="currentColor"
        strokeWidth="1.7"
        fill="none"
      />
    ),
  },
];

const PRO_PERKS = [
  "Get quality leads",
  "Lower commission fees",
  "Business management tools",
  "Build your reputation",
];

export default function WhySevenPros() {
  return (
    <section className="bg-white py-14 md:py-20 text-[#14181d]">
      <div className="container-page">
        <div className="grid lg:grid-cols-[minmax(0,1.15fr)_auto_minmax(280px,360px)] gap-10 xl:gap-12 items-center">
          <div className="min-w-0">
            <p className="text-cyan text-xs font-bold tracking-[0.18em]">WHY SEVENPROS?</p>
            <h2 className="mt-2 text-[1.5rem] sm:text-3xl md:text-[34px] font-bold text-[#14181d] [text-wrap:pretty]">
              Built for Trust. Designed for You.
            </h2>
            <p className="mt-2 text-slate max-w-md text-pretty">
              A smarter, faster, and safer way to hire local professionals.
            </p>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-7">
              {FEATURES.map((item) => (
                <div key={item.title} className="flex gap-3 min-w-0">
                  <div className="size-11 rounded-full bg-overlay text-[#14181d] grid place-items-center shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      {item.icon}
                    </svg>
                  </div>
                  <div className="min-w-0 pt-0.5">
                    <h3 className="font-bold text-[#14181d] text-[15px] leading-snug">{item.title}</h3>
                    <p className="mt-0.5 text-sm text-slate">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden lg:flex justify-center -mx-2 xl:mx-0">
            <MapPhone />
          </div>

          <div className="relative overflow-hidden rounded-[28px] bg-navy text-white px-7 py-8 shadow-[0_24px_50px_rgba(7,26,58,0.22)]">
            <div className="flex items-start gap-4">
              <div className="min-w-0 flex-1">
                <h3 className="text-xl font-bold leading-snug [text-wrap:pretty]">For Service Professionals</h3>
                <p className="mt-2 text-white/70 text-sm text-pretty">
                  Grow your business with more jobs, less hassle.
                </p>
              </div>
              <img
                src="/for-pros.jpg?v=1"
                alt="Service professional at work in a workshop"
                width={960}
                height={720}
                className="hidden sm:block w-[112px] h-[92px] rounded-2xl object-cover object-center shrink-0 shadow-[0_8px_20px_rgba(0,0,0,0.28)]"
              />
            </div>

            <ul className="mt-6 space-y-3">
              {PRO_PERKS.map((perk) => (
                <li key={perk} className="flex items-center gap-2.5 text-sm">
                  <span
                    className="size-5 rounded-full bg-[#22C55E] text-white grid place-items-center shrink-0"
                    aria-hidden="true"
                  >
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2.5 6.2l2.2 2.3 4.8-5"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  {perk}
                </li>
              ))}
            </ul>

            <Link
              to="/become-a-pro"
              className="mt-7 flex w-full items-center justify-center min-h-12 rounded-xl bg-white px-5 text-sm font-semibold text-[#071A3A] hover:bg-[#F5F8FC] active:scale-[0.98] transition-[transform,background-color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)]"
            >
              Join as a Pro →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
