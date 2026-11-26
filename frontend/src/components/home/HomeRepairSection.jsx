import { Link } from "react-router-dom";
import Carousel from "../ui/Carousel";

const SERVICES = [
  {
    title: "Switch replace / install",
    image: "/premium/switch.jpg",
    rating: "4.83",
    reviews: "12.4K",
    mins: "30",
    price: 49,
    options: null,
    to: "/categories/electrical",
  },
  {
    title: "Book a handyman",
    image: "/premium/handyman.jpg",
    rating: "4.79",
    reviews: "9.1K",
    mins: "45",
    price: 59,
    options: "5 options",
    to: "/categories/handyman",
  },
  {
    title: "Tap / faucet repair",
    image: "/premium/faucet.jpg",
    rating: "4.85",
    reviews: "18.2K",
    mins: "40",
    price: 69,
    options: null,
    to: "/categories/plumbing",
  },
  {
    title: "Fan repair",
    image: "/premium/electrical.jpg",
    rating: "4.81",
    reviews: "7.6K",
    mins: "50",
    price: 79,
    options: null,
    to: "/categories/electrical",
  },
  {
    title: "Plumber consultation",
    image: "/premium/plumbing.jpg",
    rating: "4.88",
    reviews: "21.3K",
    mins: "30",
    price: 39,
    options: null,
    to: "/categories/plumbing",
  },
  {
    title: "Outlet / fixture install",
    image: "/premium/switch.jpg",
    rating: "4.80",
    reviews: "6.8K",
    mins: "35",
    price: 55,
    options: "3 options",
    to: "/categories/electrical",
  },
  {
    title: "Door & cabinet fix",
    image: "/premium/cabinet.jpg",
    rating: "4.77",
    reviews: "5.4K",
    mins: "60",
    price: 65,
    options: null,
    to: "/categories/handyman",
  },
];

function ServiceCard({ item }) {
  return (
    <article className="w-[188px] shrink-0 snap-start sm:w-[210px]">
      <div className="relative">
        <Link to={item.to} className="block overflow-hidden rounded-2xl bg-[#F1F5F9] ring-1 ring-[#E8ECF1]">
          <img
            src={item.image}
            alt=""
            className="aspect-[4/5] w-full object-cover transition-transform duration-220 ease-[cubic-bezier(0.23,1,0.32,1)] hover:scale-[1.03]"
          />
        </Link>
        <div className="absolute bottom-2 right-2 flex flex-col items-end gap-0.5">
          {item.options && (
            <span className="rounded-md bg-white/90 px-1.5 py-0.5 text-[9px] font-medium text-[#64748b] shadow-sm backdrop-blur-sm">
              {item.options}
            </span>
          )}
          <Link
            to={item.to}
            className="inline-flex h-8 items-center justify-center rounded-lg bg-white px-3 text-[12px] font-bold text-[#6d28d9] shadow-[0_4px_14px_rgba(15,23,42,0.14)] ring-1 ring-[#E8ECF1] transition-[transform,background-color] duration-160 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-[#F8F5FF] active:scale-[0.97]"
          >
            Add
          </Link>
        </div>
      </div>

      <Link to={item.to} className="mt-2.5 block">
        <h3 className="text-[13px] font-bold leading-snug tracking-[-0.01em] text-[#0b1220] [text-wrap:pretty]">
          {item.title}
        </h3>
        <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-[11px] font-medium text-[#475569]">
          <span className="inline-flex items-center gap-0.5">
            <svg width="11" height="11" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
              <path d="M6 1.2l1.4 2.9 3.2.4-2.4 2.2.7 3.1L6 8.2 3.1 9.8l.7-3.1L1.4 4.5l3.2-.4L6 1.2z" />
            </svg>
            {item.rating}
          </span>
          <span className="text-[#94a3b8]">({item.reviews})</span>
          <span className="text-[#cbd5e1]" aria-hidden="true">
            ·
          </span>
          <span>{item.mins} MINS</span>
        </p>
        <p className="mt-1.5 text-[11px] text-[#94a3b8]">
          Starts at <span className="text-[14px] font-bold text-[#0b1220]">${item.price}</span>
        </p>
      </Link>
    </article>
  );
}

export default function HomeRepairSection() {
  return (
    <section className="bg-white py-8 md:py-10">
      <div className="container-page">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-[1.35rem] font-bold tracking-[-0.03em] text-[#0b1220] sm:text-[1.55rem]">
              Home repair & installation
            </h2>
            <p className="mt-1 text-[13px] text-[#94a3b8] sm:text-[14px]">Quick fixes by trusted experts</p>
          </div>
          <Link
            to="/search"
            className="shrink-0 text-[13px] font-semibold text-[#6d28d9] transition-opacity duration-160 hover:opacity-80"
          >
            See all
          </Link>
        </div>

        <Carousel ariaLabel="Home repair and installation services">
          {SERVICES.map((item) => (
            <ServiceCard key={item.title} item={item} />
          ))}
        </Carousel>
      </div>
    </section>
  );
}
