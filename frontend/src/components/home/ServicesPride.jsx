import { useState } from "react";
import { Link } from "react-router-dom";

const SERVICES = [
  {
    title: "House Cleaning",
    body: "Professional cleans, on time and done right.",
    image: "/premium/pride-cleaning.jpg?v=uniq1",
    to: "/categories/cleaning",
  },
  {
    title: "Plumbing",
    body: "Leaks, taps, and installs by verified pros.",
    image: "/premium/pride-plumbing.jpg?v=uniq1",
    to: "/categories/plumbing",
  },
  {
    title: "Electrical",
    body: "Safe repairs and upgrades, background-checked.",
    image: "/premium/pride-electrical.jpg?v=uniq1",
    to: "/categories/electrical",
  },
  {
    title: "Painting",
    body: "Fresh walls finished with care.",
    image: "/premium/pride-painting.jpg?v=uniq1",
    to: "/categories/painting",
  },
  {
    title: "Handyman",
    body: "Mounting, fixes, and odd jobs done well.",
    image: "/premium/pride-handyman.jpg?v=uniq1",
    to: "/categories/handyman",
  },
  {
    title: "HVAC",
    body: "Heating and cooling tune-ups near you.",
    image: "/premium/pride-hvac.jpg?v=uniq1",
    to: "/categories/hvac",
  },
];

export default function ServicesPride() {
  const [active, setActive] = useState(0);

  return (
    <section className="relative overflow-hidden bg-white py-8 md:py-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-16 top-0 size-[260px] rounded-full bg-[radial-gradient(circle,rgba(20,83,45,0.06)_0%,transparent_70%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 bottom-0 size-[280px] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.05)_0%,transparent_72%)]"
      />

      <div className="container-page relative">
        <div className="text-center motion-safe:[animation:rise-in_480ms_var(--ease-out)_both]">
          <h2 className="text-[1.35rem] font-bold tracking-[-0.03em] text-[#0b1220] sm:text-[1.55rem]">
            We take pride in our services
          </h2>
          <p className="mx-auto mt-1.5 max-w-[40ch] text-[13px] text-[#64748b] sm:text-[14px] motion-safe:[animation:rise-in_480ms_var(--ease-out)_80ms_both]">
            Real pros. Clear pricing. Jobs done the way you expect.
          </p>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-3.5">
          {SERVICES.map((item, index) => {
            const isActive = active === index;
            return (
              <Link
                key={item.title}
                to={item.to}
                onMouseEnter={() => setActive(index)}
                onFocus={() => setActive(index)}
                className={`group flex flex-col overflow-hidden rounded-[22px] transition-[background-color,transform,box-shadow] duration-220 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.99] motion-safe:[animation:rise-in_460ms_var(--ease-out)_both] ${
                  isActive
                    ? "bg-[#14532d] text-white shadow-[0_14px_32px_rgba(20,83,45,0.24)]"
                    : "bg-[#F4F1EA] text-[#0b1220] hover:bg-[#EEE9DF]"
                }`}
                style={{ animationDelay: `${100 + index * 70}ms` }}
              >
                <div className="relative aspect-[16/11] overflow-hidden">
                  <img
                    src={item.image}
                    alt=""
                    className="uc-float size-full object-cover transition-transform duration-280 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.04]"
                    style={{ animationDelay: `${index * 160}ms` }}
                  />
                  <span
                    className={`absolute right-2.5 top-2.5 flex size-8 items-center justify-center rounded-full transition-[background-color,color,transform] duration-180 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.06] group-active:scale-[0.96] ${
                      isActive
                        ? "bg-[#F97316] text-white"
                        : "bg-white/95 text-[#F97316] shadow-sm"
                    }`}
                    aria-hidden="true"
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M5 11L11 5M11 5H6.5M11 5V9.5"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </div>

                <div className="flex items-start justify-between gap-2 px-3.5 py-3.5 sm:px-4">
                  <div className="min-w-0">
                    <h3 className="text-[15px] font-bold tracking-[-0.02em]">{item.title}</h3>
                    <p
                      className={`mt-1 text-[12px] leading-snug ${
                        isActive ? "text-white/80" : "text-[#64748b]"
                      }`}
                    >
                      {item.body}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
