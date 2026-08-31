import { useEffect, useRef, useState } from "react";

function Arrow({ side, disabled, onClick }) {
  const isLeft = side === "left";
  return (
    <button
      type="button"
      aria-label={isLeft ? "Previous" : "Next"}
      disabled={disabled}
      onClick={onClick}
      className={`absolute top-[42%] z-10 size-10 rounded-full bg-white text-navy shadow-[0_8px_24px_rgba(7,26,58,0.16)] grid place-items-center hover:bg-[#F5F8FC] disabled:opacity-0 disabled:pointer-events-none ${
        isLeft ? "left-0 sm:-left-3" : "right-0 sm:-right-3"
      }`}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path
          d={isLeft ? "M10 3L5 8l5 5" : "M6 3l5 5-5 5"}
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

export default function Carousel({ children, ariaLabel }) {
  const scroller = useRef(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const update = () => {
    const el = scroller.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 12);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 12);
  };

  useEffect(() => {
    const el = scroller.current;
    if (!el) return undefined;
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [children]);

  const go = (dir) => {
    const el = scroller.current;
    if (!el) return;
    const card = el.firstElementChild;
    const gap = 16;
    const step = card ? card.getBoundingClientRect().width + gap : el.clientWidth * 0.75;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * step * 2, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <div className="relative">
      <div
        ref={scroller}
        aria-label={ariaLabel}
        className="hide-scrollbar flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-3 px-1"
      >
        {children}
      </div>
      <Arrow side="left" disabled={!canPrev} onClick={() => go(-1)} />
      <Arrow side="right" disabled={!canNext} onClick={() => go(1)} />
    </div>
  );
}
