import { Link } from "react-router-dom";

export default function ProjectCta() {
  return (
    <section className="relative isolate overflow-hidden py-16 md:py-24 text-center text-white">
      <img
        src="https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=2000&q=80"
        alt=""
        className="absolute inset-0 size-full object-cover"
      />
      <div className="absolute inset-0 bg-[#071A3A]/60" />
      <div className="relative container-page">
        <h2 className="text-2xl sm:text-3xl md:text-[40px] font-bold">
          Let&apos;s Get Your Project Done!
        </h2>
        <p className="mt-3 text-white/85">Join customers across California.</p>
        <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/search"
            className="inline-flex items-center justify-center min-h-12 px-7 rounded-xl bg-white text-[#071A3A] font-semibold"
          >
            Find a Pro
          </Link>
          <Link
            to="/become-a-pro"
            className="inline-flex items-center justify-center min-h-12 px-7 rounded-xl border border-white text-white font-semibold"
          >
            Join as a Pro
          </Link>
        </div>
      </div>
    </section>
  );
}
