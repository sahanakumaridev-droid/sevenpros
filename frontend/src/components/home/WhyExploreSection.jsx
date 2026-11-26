import { Link } from "react-router-dom";
import { POPULAR_CATEGORIES } from "../../data/popularCategories";

const WHY_POINTS = [
  "Trusted & Verified Pros",
  "Transparent Pricing",
  "Easy Online Booking",
  "100% Satisfaction Guarantee",
];

const SERVICE_TILES = [
  { slug: "plumbing", label: "Plumber" },
  { slug: "electrical", label: "Electrician" },
  { slug: "hvac", label: "HVAC" },
  { slug: "cleaning", label: "House Cleaning" },
  { slug: "handyman", label: "Handyman" },
  { slug: "landscaping", label: "Landscaping" },
  { slug: "painting", label: "Painting" },
  { slug: "appliance-repair", label: "General Repairs" },
];

export default function WhyExploreSection() {
  const services = SERVICE_TILES.map((tile) => {
    const category = POPULAR_CATEGORIES.find((c) => c.slug === tile.slug);
    return category ? { ...category, label: tile.label } : null;
  }).filter(Boolean);

  return (
    <section className="bg-white py-12 md:py-16">
      <div className="container-page grid items-stretch gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-16">
        <div className="flex min-h-0 flex-col gap-7">
          <div>
            <p className="inline-flex rounded-full bg-[#ede9fe] px-3.5 py-1.5 text-[11px] font-bold tracking-[0.12em] text-[#6d28d9]">
              WHY SEVENPROS?
            </p>
            <h2 className="mt-4 text-[1.75rem] font-extrabold tracking-[-0.035em] text-[#0b1220] [text-wrap:pretty] sm:text-[2.15rem]">
              Professional Services Made Simple.
            </h2>
            <ul className="mt-6 space-y-3.5">
              {WHY_POINTS.map((item) => (
                <li key={item} className="flex items-center gap-3 text-[15px] font-medium text-[#334155]">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#2563eb] text-white">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <path d="M2.5 6.2l2.3 2.3 4.7-4.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <Link
              to="/info/how-it-works"
              className="mt-7 inline-flex h-12 items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-[#2563eb] via-[#4f46e5] to-[#7c3aed] px-6 text-[14px] font-semibold text-white shadow-[0_12px_28px_rgba(79,70,229,0.32)] transition-[transform,filter] duration-160 ease-[cubic-bezier(0.23,1,0.32,1)] hover:brightness-110 active:scale-[0.98]"
            >
              Learn More <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div
            className="min-h-[240px] flex-1 overflow-hidden rounded-[28px] p-[3px]"
            style={{
              background: "linear-gradient(135deg, #60a5fa 0%, #6366f1 50%, #a855f7 100%)",
              boxShadow: "0 0 40px rgba(99,102,241,0.28)",
            }}
          >
            <div className="size-full overflow-hidden rounded-[25px] bg-white">
              <img
                src="/hero-home.jpg"
                alt="Modern California home"
                className="size-full object-cover"
              />
            </div>
          </div>
        </div>

        <div className="flex min-h-0 flex-col">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="inline-flex rounded-full bg-[#dbeafe] px-3.5 py-1.5 text-[11px] font-bold tracking-[0.12em] text-[#1d4ed8]">
              POPULAR SERVICES
            </p>
            <Link to="/search" className="text-[13px] font-semibold text-[#2563eb] hover:underline">
              View All Categories →
            </Link>
          </div>
          <h2 className="mt-4 text-[1.75rem] font-extrabold tracking-[-0.035em] text-[#0b1220] [text-wrap:pretty] sm:text-[2.15rem]">
            Explore Our Top Categories
          </h2>

          <div className="mt-6 grid flex-1 grid-cols-2 gap-3 sm:gap-4">
            {services.map((service) => (
              <Link
                key={service.slug}
                to={`/categories/${service.slug}`}
                className="group relative min-h-[148px] overflow-hidden rounded-2xl shadow-[0_10px_28px_rgba(7,26,58,0.1)] ring-1 ring-[#E6EEF7] sm:min-h-[170px]"
              >
                <img
                  src={service.image}
                  alt={service.alt || service.label}
                  className="absolute inset-0 size-full object-cover transition-transform duration-220 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#060d1f]/85 via-[#060d1f]/15 to-transparent" />
                <span className="absolute inset-x-3 bottom-3 text-[13px] font-semibold text-white sm:text-sm">
                  {service.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
