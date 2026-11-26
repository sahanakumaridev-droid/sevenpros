import { Link } from "react-router-dom";

export default function ReadyBanner() {
  return (
    <section className="bg-[#F4F7FC] py-10 md:py-14">
      <div className="container-page">
        <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-[#2563eb] via-[#4f46e5] to-[#7c3aed] px-6 py-7 text-white shadow-[0_24px_60px_rgba(79,70,229,0.3)] sm:px-8 sm:py-8 md:px-10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-35"
            style={{
              backgroundImage:
                "radial-gradient(circle at 12% 40%, rgba(255,255,255,0.35), transparent 28%), radial-gradient(circle at 88% 60%, rgba(255,255,255,0.22), transparent 30%)",
            }}
          />
          <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4 md:items-center">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25 backdrop-blur-sm">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M4 14l7-10v7h6l-7 10v-7H4z" stroke="white" strokeWidth="1.8" strokeLinejoin="round" />
                </svg>
              </span>
              <div>
                <p className="text-[1.05rem] font-bold tracking-[-0.02em] sm:text-xl">Ready to get started?</p>
                <p className="mt-1 max-w-[44ch] text-[14px] text-white/85 sm:text-[15px]">
                  Join thousands of satisfied customers and professionals.
                </p>
              </div>
            </div>
            <Link
              to="/get-started"
              className="inline-flex h-12 shrink-0 items-center justify-center gap-1.5 rounded-full bg-white px-6 text-[14px] font-semibold text-[#312e81] transition-[transform,background-color] duration-160 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-[#F8FAFF] active:scale-[0.98]"
            >
              Get Started Today <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
