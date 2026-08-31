import { Link } from "react-router-dom";

export default function Logo({ showTagline = true, compact = false, taglineAlways = false, tone = "dark" }) {
  const mark = compact ? "h-8 w-8 sm:h-9 sm:w-9" : "h-9 w-9 sm:h-10 sm:w-10";
  const onLight = tone === "light";
  return (
    <Link to="/" aria-label="SEVENPROS home" className="flex items-center gap-2.5 min-w-0 shrink">
      <img src="/logo-mark.png" alt="" className={`${mark} rounded-[10px] object-cover shrink-0`} />
      <span className="flex flex-col min-w-0">
        <span
          className={`font-display font-bold uppercase tracking-[0.12em] leading-none ${
            onLight ? "text-navy" : "text-white"
          } ${compact ? "text-[13px] sm:text-[15px]" : "text-[15px] sm:text-[17px]"}`}
        >
          SEVEN<span className="text-brand-grad">PROS</span>
        </span>
        {showTagline && (
          <span
            className={`${taglineAlways ? "block" : "hidden sm:block"} mt-1 text-[8px] md:text-[9px] tracking-[0.16em] uppercase ${
              onLight ? "text-slate" : "text-white/55"
            }`}
          >
            The Right Pro. <span className="text-brand-grad font-semibold">7 Days</span> a Week
          </span>
        )}
      </span>
    </Link>
  );
}
