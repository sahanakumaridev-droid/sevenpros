import { Link } from "react-router-dom";

export default function CategoryCard({ category }) {
  return (
    <Link
      to={`/categories/${category.slug}`}
      viewTransition
      aria-label={`${category.name}, ${category.rating.toFixed(1)} stars`}
      className="category-card group relative block aspect-[4/5] overflow-hidden rounded-2xl bg-[#0b1220] shadow-[0_8px_24px_rgba(15,23,42,0.08)]"
    >
      <img
        src={category.image}
        alt={category.alt}
        width={1000}
        height={1250}
        loading="lazy"
        decoding="async"
        className="category-card-img absolute inset-0 size-full object-cover"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-[#0b1220]/85 via-[#0b1220]/2 to-transparent"
      />
      <p className="category-card-name absolute inset-x-3 bottom-3 text-[14px] font-bold leading-snug tracking-[-0.02em] text-white">
        {category.name}
      </p>
    </Link>
  );
}
