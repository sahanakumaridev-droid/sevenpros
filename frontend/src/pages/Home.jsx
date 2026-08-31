import { Link } from "react-router-dom";
import client from "../api/client";
import HeroSearch from "../components/search/HeroSearch";
import CategoryCard from "../components/categories/CategoryCard";
import HeroVisual from "../components/hero/HeroVisual";
import WhySevenPros from "../components/home/WhySevenPros";
import HowItWorks from "../components/home/HowItWorks";
import HomeProCard from "../components/home/HomeProCard";
import AppPromo from "../components/home/AppPromo";
import ProjectCta from "../components/home/ProjectCta";
import Carousel from "../components/ui/Carousel";
import { HERO_IMAGES, POPULAR_CATEGORIES, POPULAR_SEARCHES } from "../data/popularCategories";
import { useEffect, useState } from "react";

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

function TrustStat({ value, label, icon }) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className="size-8 sm:size-10 rounded-full bg-white/10 text-blue flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-white font-bold text-base sm:text-lg leading-none tabular-nums">{value}</div>
        <div className="text-white/70 text-[11px] sm:text-xs mt-1 leading-snug break-words">{label}</div>
      </div>
    </div>
  );
}

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get("/search/providers?sort=best_match&limit=12").then((res) => {
      setFeatured(res.data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="bg-canvas overflow-x-clip">
      <section className="relative isolate min-h-[min(650px,100dvh)] md:min-h-[680px] overflow-hidden bg-navy text-white">
        <img
          src={HERO_IMAGES.neighborhood}
          alt="California neighborhood at dusk with a modern home and palm trees"
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#071A3A]/92 via-[#071A3A]/78 to-[#071A3A]/55 md:bg-gradient-to-r md:from-[#071A3A] md:via-[#071A3A]/86 md:to-[#071A3A]/20" />

        <div className="relative container-page pt-[5.5rem] sm:pt-24 md:pt-28 pb-6 md:pb-8 grid lg:grid-cols-[minmax(0,1fr)_minmax(min(100%,380px),520px)] gap-6 items-end">
          <div className="max-w-xl min-w-0">
            <div className="hero-enter">
              <p className="inline-flex max-w-full items-center gap-2 rounded-full bg-blue/20 border border-blue/40 px-3 py-1 text-[11px] sm:text-xs font-semibold text-white text-pretty">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M12 3l7 3v6c0 5-3 8-7 9-4-1-7-4-7-9V6l7-3z"
                    stroke="#0879F9"
                    strokeWidth="1.7"
                    fill="#0879F9"
                    fillOpacity="0.25"
                  />
                  <path d="M9.2 12.1l2 2 4-4" stroke="white" strokeWidth="1.7" strokeLinecap="round" />
                </svg>
                California&apos;s Trusted Local Service Marketplace
              </p>
              <h1 className="mt-4 sm:mt-5 font-bold tracking-[-0.03em] leading-[1.1] text-[clamp(1.625rem,7.2vw,4rem)] [text-wrap:pretty]">
                Your <span className="text-brand-grad">Local Pro.</span>
                <br />
                Just a Few Clicks Away.
              </h1>
              <p className="mt-4 text-white/80 text-pretty max-w-md text-base md:text-lg">
                Find verified, reviewed, and affordable service professionals for your home, business, or any project.
              </p>
            </div>

            <div className="hero-search-enter mt-7">
              <HeroSearch />
              <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                <span className="text-white/60">Popular:</span>
                {POPULAR_SEARCHES.map((item) => (
                  <Link
                    key={item.label}
                    to={item.to}
                    className="rounded-full bg-white/10 px-3 py-1 text-white/90 hover:bg-white/20"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <HeroVisual />
        </div>

        <div className="relative border-t border-white/10 bg-[#071A3A]/55">
          <div className="container-page py-4 md:py-5 grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
            <TrustStat
              value="500+"
              label="Service Categories"
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="4" y="4" width="7" height="7" rx="1.4" stroke="#0879F9" strokeWidth="1.6" />
                  <rect x="13" y="4" width="7" height="7" rx="1.4" stroke="#0879F9" strokeWidth="1.6" />
                  <rect x="4" y="13" width="7" height="7" rx="1.4" stroke="#0879F9" strokeWidth="1.6" />
                  <rect x="13" y="13" width="7" height="7" rx="1.4" stroke="#0879F9" strokeWidth="1.6" />
                </svg>
              }
            />
            <TrustStat
              value="100%"
              label={
                <>
                  <span className="lg:hidden">Verified Pros</span>
                  <span className="hidden lg:inline">Verified Professionals</span>
                </>
              }
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 3l7 3v6c0 5-3 8-7 9-4-1-7-4-7-9V6l7-3z" stroke="#0879F9" strokeWidth="1.6" />
                </svg>
              }
            />
            <TrustStat
              value="4.8★"
              label="Average Rating"
              icon={<span className="text-orange text-lg leading-none">★</span>}
            />
            <TrustStat
              value="CA"
              label="California, USA"
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z" stroke="#0879F9" strokeWidth="1.6" />
                </svg>
              }
            />
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-b from-[#F7F9FC] to-white py-14 md:py-16">
        <div className="container-page">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
            <div>
              <p className="text-cyan text-xs font-bold tracking-[0.18em]">EXPLORE</p>
              <h2 className="mt-2 text-[1.375rem] sm:text-2xl md:text-[32px] font-bold text-navy [text-wrap:pretty]">
                Popular Service Categories
              </h2>
              <p className="mt-2 text-slate text-pretty">
                From home repairs to business needs — we&apos;ve got you covered.
              </p>
            </div>
            <Link to="/search" className="text-blue font-semibold text-sm shrink-0 hover:underline">
              View All Categories →
            </Link>
          </div>

          <Carousel ariaLabel="Popular service categories">
            {POPULAR_CATEGORIES.map((category) => (
              <CategoryCard key={category.slug} category={category} />
            ))}
          </Carousel>
        </div>
      </section>

      <WhySevenPros />

      <HowItWorks />

      <section className="bg-[#F7F9FC] py-14 md:py-16">
        <div className="container-page">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
            <div>
              <p className="text-cyan text-xs font-bold tracking-[0.18em]">TOP RATED</p>
              <h2 className="mt-2 text-[1.5rem] sm:text-3xl md:text-[34px] font-bold text-navy [text-wrap:pretty]">
                Meet Our Professionals
              </h2>
              <p className="mt-2 text-slate">Skilled. Verified. Trusted.</p>
            </div>
            <Link to="/search" className="text-blue font-semibold text-sm shrink-0 hover:underline">
              View All Pros →
            </Link>
          </div>
          {loading ? (
            <ProviderSkeletons />
          ) : (
            <Carousel ariaLabel="Top rated professionals">
              {featured.map((p) => (
                <div key={p.id} className="w-[min(280px,82vw)] sm:w-[252px] lg:w-[268px] shrink-0 snap-start">
                  <HomeProCard provider={p} />
                </div>
              ))}
            </Carousel>
          )}
        </div>
      </section>

      <AppPromo />
      <ProjectCta />
    </div>
  );
}
