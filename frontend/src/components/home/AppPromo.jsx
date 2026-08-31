import AppPhone from "../hero/AppPhone";
import MapPhone from "./MapPhone";

export default function AppPromo() {
  return (
    <section id="download" className="container-page py-8 md:py-12">
      <div className="relative overflow-hidden rounded-[28px] bg-blue text-white px-6 py-10 md:px-12 md:py-12">
        <div className="grid lg:grid-cols-[240px_minmax(0,1fr)_200px] gap-8 items-center">
          <div className="hidden lg:block relative h-[280px]">
            <div className="absolute left-2 bottom-[-40px] -rotate-6 origin-bottom scale-[0.58]">
              <MapPhone />
            </div>
            <div className="absolute left-20 bottom-[-24px] rotate-[8deg] origin-bottom scale-[0.58]">
              <AppPhone />
            </div>
          </div>

          <div className="text-center lg:text-left max-w-md mx-auto lg:mx-0">
            <h2 className="text-2xl md:text-[32px] font-bold leading-tight [text-wrap:pretty]">
              Take SevenPros Anywhere.
            </h2>
            <p className="mt-3 text-white/85">
              Download our mobile app and find local pros on the go.
            </p>
            <div className="mt-6 flex flex-wrap justify-center lg:justify-start gap-3">
              <StoreBadge store="apple" />
              <StoreBadge store="google" />
            </div>
          </div>

          <div className="flex flex-col items-center gap-3">
            <div className="rounded-2xl bg-white p-3 shadow-[0_12px_32px_rgba(7,26,58,0.2)]">
              <QrMark />
            </div>
            <p className="text-sm font-semibold text-white/90">Scan to Download</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function StoreBadge({ store }) {
  const isApple = store === "apple";
  return (
    <a
      href="#download"
      className="inline-flex items-center gap-2.5 rounded-xl bg-[#0b1220] px-4 h-12 min-w-[160px] hover:bg-black"
    >
      {isApple ? (
        <svg width="18" height="22" viewBox="0 0 18 22" fill="white" aria-hidden="true">
          <path d="M14.7 11.6c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.2-2.8.8-3.5.8-.7 0-1.9-.8-3.1-.8-1.6 0-3.1.9-3.9 2.4-1.7 2.9-.4 7.2 1.2 9.6.8 1.1 1.7 2.4 3 2.4 1.2 0 1.6-.8 3.1-.8s1.8.8 3.1.8c1.3 0 2.1-1.1 2.9-2.3.9-1.3 1.3-2.6 1.3-2.7-.1 0-2.5-1-2.5-3.9zM12.3 4.8c.6-.8 1.1-1.9.9-3-1 .1-2.1.7-2.8 1.5-.6.7-1.2 1.8-1 2.9 1.1.1 2.2-.6 2.9-1.4z" />
        </svg>
      ) : (
        <svg width="20" height="22" viewBox="0 0 24 26" aria-hidden="true">
          <path fill="#EA4335" d="M1 1.5l11 10.7L1 23V1.5z" />
          <path fill="#FBBC04" d="M1 23l11-10.8 3.4 3.3L4.2 25.2A2.6 2.6 0 011 23z" />
          <path fill="#4285F4" d="M22.4 11.3L18.4 9 15.4 12.2l3 2.9 4-2.3a2.4 2.4 0 000-4.1z" />
          <path fill="#34A853" d="M1 1.5A2.6 2.6 0 014.2.8l14.2 8.2-3 2.9L1 1.5z" />
        </svg>
      )}
      <span className="text-left leading-tight">
        <span className="block text-[9px] text-white/70">{isApple ? "Download on the" : "Get it on"}</span>
        <span className="block text-sm font-semibold">{isApple ? "App Store" : "Google Play"}</span>
      </span>
    </a>
  );
}

function QrMark() {
  const cells = [
    [1,1,1,1,1,0,1,0,1,1,1,1,1],
    [1,0,0,0,1,0,0,1,1,0,0,0,1],
    [1,0,1,0,1,0,1,0,1,0,1,0,1],
    [1,0,0,0,1,1,0,1,1,0,0,0,1],
    [1,1,1,1,1,0,1,0,1,1,1,1,1],
    [0,0,0,0,0,0,0,1,0,0,0,0,0],
    [1,0,1,1,0,1,1,0,1,0,1,1,0],
    [0,1,0,0,1,0,0,1,0,1,0,0,1],
    [1,1,1,1,1,0,1,0,1,0,1,0,1],
    [1,0,0,0,1,1,0,1,0,1,0,1,0],
    [1,0,1,0,1,0,1,0,1,1,1,0,1],
    [1,0,0,0,1,0,0,1,0,0,1,1,0],
    [1,1,1,1,1,0,1,0,1,1,0,1,1],
  ];
  return (
    <svg width="112" height="112" viewBox="0 0 13 13" aria-hidden="true">
      {cells.flatMap((row, y) =>
        row.map((on, x) => (on ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#071A3A" /> : null)),
      )}
    </svg>
  );
}
