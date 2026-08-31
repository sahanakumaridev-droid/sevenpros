import { Link } from "react-router-dom";

export default function CategoryCard({ category }) {
  return (
    <Link
      to={`/categories/${category.slug}`}
      viewTransition
      aria-label={`${category.name}, ${category.rating.toFixed(1)} stars`}
      className="category-card group shrink-0 snap-start w-[156px] sm:w-[176px] lg:w-[188px] overflow-hidden rounded-[16px] bg-white shadow-[0_10px_28px_rgba(7,26,58,0.10)]"
    >
      <div className="relative h-[196px] sm:h-[224px] lg:h-[240px] overflow-hidden bg-[#E8EEF6]">
        <img
          src={category.image}
          alt={category.alt}
          width={960}
          height={1280}
          loading="lazy"
          decoding="async"
          className="category-card-img absolute inset-0 size-full object-cover object-[center_18%]"
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/[0.12] to-transparent"
          aria-hidden="true"
        />
      </div>
      <div className="px-3 py-3 text-center">
        <div className="category-card-name text-[13px] sm:text-[15px] font-bold text-navy leading-snug">
          {category.name}
        </div>
        <div className="mt-1 flex items-center justify-center gap-1 text-[13px] text-slate tabular-nums">
          <span className="text-[#F5B400]" aria-hidden="true">
            ★
          </span>
          <span>{category.rating.toFixed(1)}</span>
        </div>
      </div>
    </Link>
  );
}
