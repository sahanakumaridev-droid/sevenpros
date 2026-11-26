/** Compact stroke icons for dashboard cards — 20×20, 1.5px stroke */

const stroke = { stroke: "currentColor", strokeWidth: 1.5, fill: "none" };

export function GlyphHeadset({ className = "size-5" }) {
  return (
    <svg className={className} viewBox="0 0 20 20" aria-hidden="true">
      <path
        {...stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 11v3a2 2 0 0 0 2 2h1.5M16 11v3a2 2 0 0 1-2 2H12.5M6 11H4.5a1.5 1.5 0 0 1-1.5-1.5V9a6.5 6.5 0 1 1 13 0v.5a1.5 1.5 0 0 1-1.5 1.5H14"
      />
    </svg>
  );
}

export function GlyphCrown({ className = "size-5" }) {
  return (
    <svg className={className} viewBox="0 0 20 20" aria-hidden="true">
      <path
        {...stroke}
        strokeLinejoin="round"
        d="M3 15h14M4 15l1.2-7.2 4.3 3.1L10 5l.5 5.9 4.3-3.1L16 15"
      />
      <path {...stroke} strokeLinecap="round" d="M6 15v2M10 15v2M14 15v2" />
    </svg>
  );
}

export function GlyphPlus({ className = "size-5" }) {
  return (
    <svg className={className} viewBox="0 0 20 20" aria-hidden="true">
      <path {...stroke} strokeLinecap="round" d="M10 4.5v11M4.5 10h11" />
    </svg>
  );
}

export function GlyphHeart({ className = "size-5", filled = false }) {
  return (
    <svg className={className} viewBox="0 0 20 20" aria-hidden="true">
      <path
        stroke="currentColor"
        strokeWidth={1.5}
        fill={filled ? "currentColor" : "none"}
        strokeLinejoin="round"
        d="M10 16.5s-5.5-3.3-5.5-7A3.2 3.2 0 0 1 10 7.2 3.2 3.2 0 0 1 15.5 9.5c0 3.7-5.5 7-5.5 7Z"
      />
    </svg>
  );
}

export function GlyphMail({ className = "size-5" }) {
  return (
    <svg className={className} viewBox="0 0 20 20" aria-hidden="true">
      <path
        {...stroke}
        strokeLinejoin="round"
        d="M3 5.5h14a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1Z"
      />
      <path {...stroke} strokeLinecap="round" d="m3.5 6.5 6.5 4.5L16.5 6.5" />
    </svg>
  );
}

export function GlyphStar({ className = "size-5" }) {
  return (
    <svg className={className} viewBox="0 0 20 20" aria-hidden="true">
      <path
        {...stroke}
        strokeLinejoin="round"
        d="M10 3.5 11.8 7H16l-3.8 2.8 1.5 4.7L10 12l-4.2 2.5 1.5-4.7L3.5 7h4.7L10 3.5Z"
      />
    </svg>
  );
}

const GLYPHS = {
  plus: GlyphPlus,
  heart: GlyphHeart,
  mail: GlyphMail,
  star: GlyphStar,
};

export function QuickActionGlyph({ name, className }) {
  const Icon = GLYPHS[name] || GlyphPlus;
  return <Icon className={className} />;
}