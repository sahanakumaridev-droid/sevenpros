export default function MapPhone({ className = "" }) {
  return (
    <div className={`phone-frame phone-frame-sm pointer-events-none select-none ${className}`} aria-hidden="true">
      <div className="phone-island" />
      <div className="phone-screen relative bg-[#dbe8f4]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(180,204,226,0.55) 1px, transparent 1px), linear-gradient(90deg, rgba(180,204,226,0.55) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />
        <svg className="absolute inset-0 size-full" viewBox="0 0 200 420" fill="none" preserveAspectRatio="none">
          <path d="M-10 92 C40 78, 70 128, 118 108 S168 72, 210 96" stroke="#c5d4e4" strokeWidth="14" strokeLinecap="round" />
          <path d="M-8 168 C48 148, 86 198, 132 176 S176 214, 210 198" stroke="#b7c9db" strokeWidth="18" strokeLinecap="round" />
          <path d="M72 8 C78 90, 64 170, 86 250 S118 340, 96 430" stroke="#c9d7e6" strokeWidth="12" strokeLinecap="round" />
          <path d="M-10 268 C50 248, 96 292, 148 264 S186 310, 210 292" stroke="#adc2d6" strokeWidth="16" strokeLinecap="round" />
        </svg>

        {[
          [22, 18],
          [58, 14],
          [38, 32],
          [74, 28],
          [48, 48],
        ].map(([x, y], i) => (
          <span
            key={i}
            className="absolute size-[18px] -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            <span className="block size-[18px] rounded-full bg-blue shadow-[0_0_0_6px_rgba(8,121,249,0.2)]" />
          </span>
        ))}

        <div className="absolute left-2.5 right-2.5 bottom-4 rounded-2xl bg-white p-2.5 text-navy shadow-[0_14px_32px_rgba(7,26,58,0.18)]">
          <div className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue">Pro Matched!</div>
          <div className="mt-1.5 flex items-center gap-2">
            <img src="/avatar-mike.png" alt="" className="size-8 rounded-full object-cover object-top bg-[#E8EEF6]" />
            <div className="min-w-0">
              <div className="text-[11px] font-bold truncate">John&apos;s Electri...</div>
              <div className="text-[9px] text-slate tabular-nums">
                <span className="text-[#F5B400]">★</span> 4.9 · 2.1 mi away
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
