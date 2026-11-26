import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import client from "../api/client";
import HeroSearch from "../components/search/HeroSearch";
import HeroVisual from "../components/hero/HeroVisual";
import UcHomeSplit from "../components/home/UcHomeSplit";
import SpotlightCarousel from "../components/home/SpotlightCarousel";
import DualPathCta from "../components/home/DualPathCta";
import HowItWorks from "../components/home/HowItWorks";
import HomeProCard from "../components/home/HomeProCard";
import AppPromo from "../components/home/AppPromo";
import ReadyBanner from "../components/home/ReadyBanner";
import ServicesPride from "../components/home/ServicesPride";
import HomeRepairSection from "../components/home/HomeRepairSection";
import RedServicesBand from "../components/home/RedServicesBand";
import Carousel from "../components/ui/Carousel";
import { POPULAR_SEARCHES } from "../data/popularCategories";

function ProviderSkeletons() {
  return (
    <div className="flex gap-4 overflow-hidden">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="w-[260px] shrink-0 rounded-2xl bg-white p-4 shadow-sm">
          <div className="skeleton size-[72px] rounded-xl" />
          <div className="mt-3 space-y-2">
            <div className="skeleton h-4 w-2/3" />
            <div className="skeleton h-3 w-1/3" />
            <div className="skeleton h-8 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

function TrustItem({ title, subtitle, icon }) {
  return (
    <div className="flex items-start gap-3 min-w-0 px-2 py-1 sm:items-center sm:justify-center">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-[#93c5fd]">
        {icon}
      </span>
      <div className="min-w-0">
        <div className="text-[13px] font-bold text-white sm:text-sm">{title}</div>
        <div className="mt-0.5 text-[11px] leading-snug text-white/65 sm:text-xs">{subtitle}</div>
      </div>
    </div>
  );
}

export default function LandingHome() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get("/search/providers?sort=best_match&limit=12").then((res) => {
      setFeatured(res.data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="overflow-x-clip bg-white">
      <section className="relative isolate overflow-hidden bg-[#050A30] text-white">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 top-[-10%] h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.42)_0%,transparent_68%)] blur-3xl" />
          <div className="absolute -right-20 top-[5%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,rgba(147,51,234,0.38)_0%,transparent_70%)] blur-3xl" />
          <div className="absolute left-[20%] top-[35%] h-[2px] w-[55%] rotate-[-18deg] bg-gradient-to-r from-transparent via-[#60a5fa]/50 to-transparent blur-[1px]" />
          <div className="absolute left-[10%] top-[48%] h-[2px] w-[65%] rotate-[-18deg] bg-gradient-to-r from-transparent via-[#a78bfa]/40 to-transparent blur-[1px]" />
          <div className="absolute left-[25%] top-[58%] h-[2px] w-[45%] rotate-[-18deg] bg-gradient-to-r from-transparent via-[#38bdf8]/35 to-transparent blur-[1px]" />
        </div>

        <div className="relative container-page pb-8 pt-8 sm:pt-10 lg:pb-10 lg:pt-12">
          <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-16">
            <div className="hero-enter relative max-w-xl">
              <p className="inline-flex max-w-full items-center gap-2 rounded-full border border-[#60a5fa]/35 bg-[#2563eb]/20 px-3.5 py-1.5 text-[11px] font-semibold text-white backdrop-blur-sm text-pretty sm:text-xs">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M12 3l7 3v6c0 5-3 8-7 9-4-1-7-4-7-9V6l7-3z"
                    stroke="#93c5fd"
                    strokeWidth="1.7"
                    fill="#3b82f6"
                    fillOpacity="0.5"
                  />
                  <path d="M9.2 12.1l2 2 4-4" stroke="white" strokeWidth="1.7" strokeLinecap="round" />
                </svg>
                California&apos;s Trusted Local Service Marketplace
              </p>

              <h1 className="mt-5 font-display text-[clamp(1.9rem,6.5vw,3.7rem)] font-extrabold leading-[1.05] tracking-[-0.04em] text-white [text-wrap:pretty] sm:mt-6">
                Your <span className="text-brand-grad">Local Pro.</span>
                <br />
                Just a Few Clicks Away.
              </h1>

              <p className="mt-5 max-w-[38ch] text-[15px] leading-relaxed text-white/80 text-pretty md:text-lg">
                Find verified, reviewed, and affordable service professionals for your home, business, or any project.
              </p>

              <div className="hero-search-enter mt-7 sm:mt-8">
                <HeroSearch />
                <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50">Popular</span>
                  {POPULAR_SEARCHES.map((item) => (
                    <Link
                      key={item.label}
                      to={item.to}
                      className="rounded-full border border-white/15 bg-white/[0.08] px-3.5 py-1.5 text-[13px] font-medium text-white/92 transition-[background-color,border-color,transform] duration-160 ease-[cubic-bezier(0.23,1,0.32,1)] hover:border-white/30 hover:bg-white/14 active:scale-[0.97]"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative w-full">
              <HeroVisual />
            </div>
          </div>
        </div>

        <div className="relative border-t border-white/10 bg-[#040824]/55">
          <div className="container-page py-5 md:py-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-2 lg:divide-x lg:divide-white/15">
              <TrustItem
                title="Verified Professionals"
                subtitle="Background-checked experts"
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M12 3l7 3v6c0 5-3 8-7 9-4-1-7-4-7-9V6l7-3z" stroke="currentColor" strokeWidth="1.7" />
                    <path d="M9.2 12.1l2 2 4-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                  </svg>
                }
              />
              <TrustItem
                title="Trusted Reviews"
                subtitle="Real customer feedback"
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M12 3.5l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 15.9 7.2 18.4l.9-5.4L4.2 9.2l5.4-.8L12 3.5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                  </svg>
                }
              />
              <TrustItem
                title="Instant Booking"
                subtitle="Book in minutes"
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M13 3L5 14h6l-1 7 9-12h-6l0-6z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                  </svg>
                }
              />
              <TrustItem
                title="Dedicated Support"
                subtitle="We're here to help"
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M4 12a8 8 0 1116 0v4a2 2 0 01-2 2h-2v-6h4M4 12v4a2 2 0 002 2h2v-6H4z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                  </svg>
                }
              />
            </div>
          </div>
        </div>
      </section>

      <UcHomeSplit />
      <HomeRepairSection />
      <SpotlightCarousel />
      <DualPathCta />
      <ServicesPride />
      <HowItWorks />

      <section className="bg-[#F7F8FA] py-10 md:py-12">
        <div className="container-page">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-[1.35rem] font-bold tracking-[-0.03em] text-[#0b1220] sm:text-[1.6rem]">
                Meet Our Professionals
              </h2>
              <p className="mt-1 text-[14px] text-[#64748b]">Skilled. Verified. Trusted.</p>
            </div>
            <Link to="/search" className="shrink-0 text-[13px] font-semibold text-[#2563eb] hover:underline">
              View All Pros →
            </Link>
          </div>
          {loading ? (
            <ProviderSkeletons />
          ) : (
            <Carousel ariaLabel="Top rated professionals">
              {featured.map((p) => (
                <div key={p.id} className="w-[min(280px,82vw)] shrink-0 snap-start sm:w-[252px] lg:w-[268px]">
                  <HomeProCard provider={p} />
                </div>
              ))}
            </Carousel>
          )}
        </div>
      </section>

      <AppPromo />
      <ReadyBanner />
      <RedServicesBand />
    </div>
  );
}
