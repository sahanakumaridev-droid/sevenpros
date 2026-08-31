const CATS = [
  {
    name: "Plumbing",
    color: "#0879F9",
    icon: (
      <path d="M7 10h4v8H7v-2H5v-3h2v-3zm6-4h3v4h2v3h-2v5h-3V6z" fill="currentColor" />
    ),
  },
  {
    name: "Electrical",
    color: "#F5B400",
    icon: <path d="M13 2L6 13h5l-1 9 8-12h-5l0-8z" fill="currentColor" />,
  },
  {
    name: "HVAC",
    color: "#0879F9",
    icon: (
      <path
        d="M12 7a5 5 0 100 10 5 5 0 000-10zm0 2.2a2.8 2.8 0 110 5.6 2.8 2.8 0 010-5.6zM12 3v2M12 19v2M3 12h2M19 12h2"
        stroke="currentColor"
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
      />
    ),
  },
  {
    name: "Cleaning",
    color: "#0879F9",
    icon: (
      <path
        d="M8 20h8l1-7H7l1 7zM12 4v5M9 9h6"
        stroke="currentColor"
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
      />
    ),
  },
  {
    name: "Handyman",
    color: "#0879F9",
    icon: (
      <path
        d="M8 16l8-8M7 9l2-2 3 3-2 2-3-3zm8 8l2-2-3-3-2 2 3 3z"
        stroke="currentColor"
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
      />
    ),
  },
  {
    name: "Painting",
    color: "#0879F9",
    icon: (
      <path
        d="M7 6h10v4H7V6zm2 4v9h3v-9"
        stroke="currentColor"
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
      />
    ),
  },
];

export default function AppPhone() {
  return (
    <div className="phone-frame pointer-events-none select-none" aria-hidden="true">
      <div className="phone-island" />
      <div className="phone-screen">
        <div className="flex items-center justify-between px-4 pt-7 text-[9px] text-white/70">
          <span className="tabular-nums">9:41</span>
          <span className="flex gap-0.5">
            <span className="w-2.5 h-1 rounded-[1px] bg-white/80" />
            <span className="w-3.5 h-1 rounded-[1px] bg-white/80" />
          </span>
        </div>

        <div className="px-4 mt-2 flex items-center gap-1.5">
          <img src="/logo-mark.png" alt="" className="h-6 w-6 rounded-md" />
          <span className="text-[9px] font-display font-bold tracking-[0.12em] text-white">
            SEVEN<span className="text-brand-grad">PROS</span>
          </span>
        </div>

        <div className="px-4 mt-3">
          <p className="text-[15px] font-bold text-white leading-tight">Good Morning! 👋</p>
          <p className="text-[10px] text-white/60 mt-0.5">Find the right pro for your project.</p>
        </div>

        <div className="mx-4 mt-3 flex items-center gap-2 rounded-full bg-white/10 px-3 h-8">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="6.5" stroke="white" strokeOpacity="0.7" strokeWidth="1.7" />
            <path d="M16.5 16.5L21 21" stroke="white" strokeOpacity="0.7" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
          <span className="text-[10px] text-white/45">Search services...</span>
        </div>

        <div className="grid grid-cols-3 gap-y-3 gap-x-1 px-3 mt-4">
          {CATS.map((cat) => (
            <div key={cat.name} className="flex flex-col items-center gap-1">
              <div
                className="size-9 rounded-full flex items-center justify-center"
                style={{ background: `${cat.color}22`, color: cat.color }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24">
                  {cat.icon}
                </svg>
              </div>
              <span className="text-[8px] text-white/80 font-medium">{cat.name}</span>
            </div>
          ))}
        </div>

        <div className="mx-3 mt-4 rounded-xl bg-white p-2.5 text-navy">
          <div className="text-[8px] font-semibold text-slate uppercase tracking-wide">Top Rated Pros</div>
          <div className="mt-1.5 flex items-center gap-2">
            <img src="/avatar-mike.png" alt="" className="size-8 rounded-full object-cover object-top bg-[#E8EEF6]" />
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-bold truncate">Mike&apos;s Plumbing</div>
              <div className="text-[9px] text-slate tabular-nums">
                <span className="text-[#F5B400]">★</span> 4.8 (133)
              </div>
            </div>
            <span className="shrink-0 rounded-md bg-blue text-white text-[8px] font-semibold px-2 py-1">
              Book Now
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
