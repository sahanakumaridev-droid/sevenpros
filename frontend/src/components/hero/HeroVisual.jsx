import { useEffect, useRef, useState } from "react";

export default function HeroVisual() {
  const videoRef = useRef(null);
  const shellRef = useRef(null);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;
    video.muted = muted;
    const play = () => {
      video.play().catch(() => {});
    };
    play();
    video.addEventListener("loadeddata", play);
    video.addEventListener("canplay", play);
    const onVis = () => {
      if (document.visibilityState === "visible") play();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      video.removeEventListener("loadeddata", play);
      video.removeEventListener("canplay", play);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [muted]);

  const toggleSound = () => {
    const video = videoRef.current;
    if (!video) return;
    const next = !muted;
    video.muted = next;
    setMuted(next);
    if (!next) {
      video.currentTime = 0;
      video.play().catch(() => {});
    }
  };

  const toggleFullscreen = () => {
    const shell = shellRef.current;
    if (!shell) return;
    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {});
      return;
    }
    shell.requestFullscreen?.().catch(() => {});
  };

  return (
    <div
      ref={shellRef}
      className="relative h-[340px] w-full rounded-[32px] p-[3px] sm:h-[440px] lg:h-[560px]"
      style={{
        background: "linear-gradient(135deg, #60a5fa 0%, #6366f1 45%, #a855f7 100%)",
        boxShadow: "0 0 0 1px rgba(147,197,253,0.25), 0 0 48px rgba(99,102,241,0.45), 0 28px 80px rgba(3,12,36,0.55)",
      }}
    >
      <div className="relative size-full overflow-hidden rounded-[29px] bg-[#0a2048]">
        <img
          src="/hero-pro.png?v=logo-shirt-no-hat"
          alt="SevenPros local service professional"
          className="absolute inset-0 z-0 size-full object-cover object-[center_18%]"
        />
        <video
          ref={videoRef}
          className="absolute inset-0 z-[1] size-full object-cover object-[center_18%] brightness-[1.06] contrast-[1.04]"
          autoPlay
          muted={muted}
          loop
          playsInline
          preload="metadata"
          poster="/hero-pro.png?v=logo-shirt-no-hat"
          aria-label="SevenPros verified local pro ready for your home job"
        >
          <source src="/sevenpros-hero-voice.mp4" type="video/mp4" />
        </video>
        <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-t from-[#060d1f]/45 via-transparent to-transparent" />

        <div className="absolute bottom-4 right-4 z-[3] flex items-center gap-2">
          <button
            type="button"
            onClick={toggleSound}
            aria-pressed={!muted}
            aria-label={muted ? "Unmute voice" : "Mute voice"}
            className="inline-flex h-11 items-center gap-2 rounded-full border border-white/25 bg-[#060d1f]/78 px-3.5 text-[13px] font-semibold text-white backdrop-blur-md transition-[transform,background-color] duration-160 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-[#060d1f]/92 active:scale-[0.97]"
          >
            {muted ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M11 5L6 9H3v6h3l5 4V5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                <path d="M16 9.5l5 5M21 9.5l-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M11 5L6 9H3v6h3l5 4V5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                <path d="M15.5 8.5a5 5 0 010 7M18.5 6a8.5 8.5 0 010 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            )}
            <span className="hidden sm:inline">{muted ? "Tap for voice" : "Voice on"}</span>
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label="Fullscreen"
            className="inline-flex size-11 items-center justify-center rounded-full border border-white/25 bg-[#060d1f]/78 text-white backdrop-blur-md transition-[transform,background-color] duration-160 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-[#060d1f]/92 active:scale-[0.97]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M8 4H4v4M16 4h4v4M8 20H4v-4M16 20h4v-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
