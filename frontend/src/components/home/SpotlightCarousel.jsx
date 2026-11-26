import { Link } from "react-router-dom";
import Carousel from "../ui/Carousel";

const SPOTLIGHT = [
  {
    title: "Fix it fast with a local plumber",
    body: "Leaks, clogs, and installs — booked in minutes.",
    to: "/categories/plumbing",
    image: "/premium/spot-plumbing.jpg?v=uniq1",
    objectPos: "object-[center_40%]",
    cta: "Book now",
  },
  {
    title: "Bring back your home’s shine",
    body: "Trusted house cleaning pros near you.",
    to: "/categories/cleaning",
    image: "/premium/spot-cleaning.jpg?v=uniq1",
    objectPos: "object-[center_35%]",
    cta: "Book now",
  },
  {
    title: "Power up with a verified electrician",
    body: "Safe installs and repairs, background-checked.",
    to: "/categories/electrical",
    image: "/premium/spot-electrical.jpg?v=uniq1",
    objectPos: "object-[center_30%]",
    cta: "Book now",
  },
  {
    title: "Fresh walls, done right",
    body: "Interior and exterior painting by rated pros.",
    to: "/categories/painting",
    image: "/premium/spot-painting.jpg?v=uniq1",
    objectPos: "object-[center_45%]",
    cta: "Book now",
  },
  {
    title: "Handyman help, same week",
    body: "Mounting, fixes, and odd jobs done right.",
    to: "/categories/handyman",
    image: "/premium/spot-handyman.jpg?v=uniq1",
    objectPos: "object-[center_35%]",
    cta: "Book now",
  },
];

export default function SpotlightCarousel() {
  return (
    <section className="bg-[#F7F8FA] py-8 md:py-10">
      <div className="container-page">
        <div className="mb-5 flex items-end justify-between gap-4 motion-safe:[animation:rise-in_460ms_var(--ease-out)_both]">
          <div>
            <h2 className="text-[1.35rem] font-bold tracking-[-0.03em] text-[#0b1220] sm:text-[1.6rem]">
              In the spotlight
            </h2>
            <p className="mt-1 text-[13px] text-[#64748b] sm:text-[14px]">Premium pros. Real jobs. Booked fast.</p>
          </div>
          <Link
            to="/search"
            className="shrink-0 text-[13px] font-semibold text-[#6d28d9] transition-opacity duration-160 hover:opacity-80"
          >
            See all
          </Link>
        </div>

        <Carousel ariaLabel="Spotlight services" autoPlay>
          {SPOTLIGHT.map((item, index) => (
            <article
              key={item.title}
              className="group relative w-[min(320px,85vw)] shrink-0 snap-start overflow-hidden rounded-3xl bg-[#0b1220] shadow-[0_16px_40px_rgba(15,23,42,0.14)] transition-transform duration-220 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-1 sm:w-[360px] motion-safe:[animation:rise-in_500ms_var(--ease-out)_both]"
              style={{ animationDelay: `${80 + index * 60}ms` }}
            >
              <img
                src={item.image}
                alt=""
                loading="lazy"
                className={`absolute inset-0 size-full object-cover ${item.objectPos || "object-center"} transition-transform duration-[700ms] ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.05]`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b1220] via-[#0b1220]/50 to-[#0b1220]/10" />
              <div className="relative flex min-h-[300px] flex-col justify-end p-5 sm:min-h-[320px] sm:p-6">
                <h3 className="text-[1.2rem] font-bold leading-tight tracking-[-0.02em] text-white [text-wrap:pretty]">
                  {item.title}
                </h3>
                <p className="mt-2 text-[13px] text-white/85">{item.body}</p>
                <Link
                  to={item.to}
                  className="mt-4 inline-flex h-10 w-fit items-center justify-center rounded-full bg-white px-4 text-[13px] font-semibold text-[#0b1220] transition-[transform,background-color] duration-160 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-[#F8FAFF] active:scale-[0.98]"
                >
                  {item.cta}
                </Link>
              </div>
            </article>
          ))}
        </Carousel>
      </div>
    </section>
  );
}
