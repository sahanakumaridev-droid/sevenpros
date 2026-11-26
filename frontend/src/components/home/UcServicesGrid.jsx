import { Link } from "react-router-dom";
import { POPULAR_CATEGORIES } from "../../data/popularCategories";

const TILES = [
  { slug: "plumbing", label: "Plumber" },
  { slug: "electrical", label: "Electrician" },
  { slug: "hvac", label: "HVAC" },
  { slug: "cleaning", label: "House Cleaning" },
  { slug: "handyman", label: "Handyman" },
  { slug: "painting", label: "Painting" },
  { slug: "landscaping", label: "Landscaping" },
  { slug: "appliance-repair", label: "Appliance Repair" },
];

export default function UcServicesGrid() {
  const services = TILES.map((tile) => {
    const category = POPULAR_CATEGORIES.find((c) => c.slug === tile.slug);
    return category ? { ...category, label: tile.label } : null;
  }).filter(Boolean);

  return (
    <section className="bg-[#F7F8FA] pb-8 pt-6 md:pb-10 md:pt-7">
      <div className="container-page">
        <div className="mb-4 flex items-end justify-between gap-3">
          <h2 className="text-[1.35rem] font-bold tracking-[-0.03em] text-[#0b1220] sm:text-[1.6rem]">
            Most booked services
          </h2>
          <Link to="/search" className="shrink-0 text-[13px] font-semibold text-[#2563eb] hover:underline">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
          {services.map((service) => (
            <Link
              key={service.slug}
              to={`/categories/${service.slug}`}
              className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#0b1220] shadow-[0_8px_24px_rgba(15,23,42,0.08)] ring-1 ring-[#E8ECF1] transition-[transform,box-shadow] duration-180 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(15,23,42,0.14)] active:scale-[0.99]"
            >
              <img
                src={`${service.image}${service.image.includes("?") ? "&" : "?"}v=card2`}
                alt={service.alt || service.label}
                className="absolute inset-0 size-full object-cover transition-transform duration-280 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.05]"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-[#0b1220]/88 via-[#0b1220]/25 to-transparent"
              />
              <span className="absolute inset-x-3 bottom-3 text-[13px] font-bold tracking-[-0.02em] text-white sm:inset-x-3.5 sm:bottom-3.5 sm:text-[14px]">
                {service.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
