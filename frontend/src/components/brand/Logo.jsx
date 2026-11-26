import { Link } from "react-router-dom";

export default function Logo({ showTagline = true, compact = false, taglineAlways = false, tone = "dark", nav = false }) {
  const mark = compact || nav ? "h-8 w-8 sm:h-9 sm:w-9" : "h-9 w-9 sm:h-10 sm:w-10";
  const onLight = tone === "light" || nav;
  if (nav) {
    return (
      <Link to="/" aria-label="SevenPros home" className="flex items-center gap-2 min-w-0 shrink">
        <img src="/logo-mark.png?v=clear" alt="" className="h-8 w-8 object-contain shrink-0" />
        <span className="text-[18px] font-semibold tracking-[-0.03em] text-[#1c2130]">
          Seven<span className="bg-[linear-gradient(90deg,#5b46f5,#3b82f6)] bg-clip-text text-transparent">Pros</span>
        </span>
      </Link>
    );
  }
  return (
    <Link to="/" aria-label="SEVENPROS home" className="flex items-center gap-2.5 min-w-0 shrink">
      <img src="/logo-mark.png?v=clear" alt="" className={`${mark} object-contain shrink-0`} />
      <span className="flex flex-col min-w-0">
        <span
          className={`font-display font-extrabold uppercase tracking-[0.14em] leading-none ${
            onLight ? "text-navy" : "text-white"
          } ${compact ? "text-[13px] sm:text-[15px]" : "text-[15px] sm:text-[17px]"}`}
        >
          SEVEN<span className={onLight ? "text-brand-grad" : "text-[#7ec8f5]"}>PROS</span>
        </span>
        {showTagline && (
          <span
            className={`${taglineAlways ? "block" : "hidden sm:block"} mt-1 text-[8px] md:text-[9px] tracking-[0.16em] uppercase ${
              onLight ? "text-slate" : "text-white/55"
            }`}
          >
            The Right Pro. <span className={onLight ? "text-brand-grad font-semibold" : "text-[#7ec8f5] font-semibold"}>7 Days</span> a Week
          </span>
        )}
      </span>
    </Link>
  );
}
