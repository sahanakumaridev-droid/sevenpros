import { Link } from "react-router-dom";

const VARIANTS = {
  orange:
    "bg-brand-grad text-white shadow-[0_8px_20px_rgba(46,49,146,0.35)]",
  brand: "bg-brand-grad text-white shadow-[0_8px_20px_rgba(46,49,146,0.35)]",
  blue: "bg-cyan text-navy hover:bg-[#33c4f4]",
  ghost: "bg-transparent text-white hover:bg-white/10",
  outline: "bg-transparent text-white border border-white/35 hover:bg-white/10",
};

export default function Button({
  children,
  variant = "brand",
  to,
  type = "button",
  className = "",
  ...props
}) {
  const classes = `btn inline-flex items-center justify-center rounded-xl px-5 h-11 text-sm font-semibold ${VARIANTS[variant] || VARIANTS.brand} ${className}`;

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
}
