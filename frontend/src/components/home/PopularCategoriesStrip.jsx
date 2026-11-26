import { Link } from "react-router-dom";
import { POPULAR_CATEGORIES } from "../../data/popularCategories";

const TILES = [
  { slug: "plumbing", label: "Plumber" },
  { slug: "electrical", label: "Electrician" },
  { slug: "hvac", label: "HVAC" },
  { slug: "cleaning", label: "House Cleaning" },
  { slug: "handyman", label: "Handyman" },
  { slug: "landscaping", label: "Landscaping" },
  { slug: "painting", label: "Painting" },
];

export default function PopularCategoriesStrip() {
  const categories = TILES.map((tile) => {
    const category = POPULAR_CATEGORIES.find((c) => c.slug === tile.slug);
    return category ? { ...category, label: tile.label } : null;
  }).filter(Boolean);

  return (
    <section className="relative overflow-hidden bg-[#060d1f] py-12 text-white md:py-14">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-[-40%] h-[300px] w-[300px] rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.3)_0%,transparent_70%)]" />
        <div className="absolute bottom-[-45%] right-[-8%] h-[280px] w-[280px] rounded-full bg-[radial-gradient(circle,rgba(147,51,234,0.28)_0%,transparent_70%)]" />
      </div>
      <div className="relative container-page">
        <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="text-[1.4rem] font-bold tracking-[-0.03em] sm:text-[1.75rem]">Popular Categories</h2>
          <Link to="/search" className="text-[14px] font-semibold text-[#93c5fd] hover:text-white">
            View All Categories →
          </Link>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:grid sm:grid-cols-4 sm:gap-4 sm:overflow-visible lg:grid-cols-7 [&::-webkit-scrollbar]:hidden">
          {categories.map((category) => (
            <Link
              key={category.slug}
              to={`/categories/${category.slug}`}
              className="group relative h-[168px] w-[148px] shrink-0 overflow-hidden rounded-2xl ring-1 ring-white/10 sm:aspect-[4/5] sm:h-auto sm:w-auto"
            >
              <img
                src={category.image}
                alt={category.alt || category.label}
                className="size-full object-cover transition-transform duration-220 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#060d1f]/90 via-[#060d1f]/25 to-transparent" />
              <span className="absolute inset-x-2 bottom-2 text-center text-[12px] font-semibold text-white sm:inset-x-3 sm:bottom-3 sm:text-[13px]">
                {category.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
