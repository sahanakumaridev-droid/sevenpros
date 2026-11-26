const PROMISES = [
  {
    title: "Trained professionals",
    body: "Experienced pros for every home job",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 3l7 3v6c0 5-3 8-7 9-4-1-7-4-7-9V6l7-3z" stroke="currentColor" strokeWidth="1.7" />
        <path d="M9.2 12.1l2 2 4-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Background verified",
    body: "Vetted local experts you can trust",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.7" />
        <path d="M5 19c1.4-3.2 3.8-4.8 7-4.8S17.6 15.8 19 19" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Transparent pricing",
    body: "Clear quotes before you book",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 3v18M16.5 7.5c0-1.7-2-3-4.5-3s-4.5 1.3-4.5 3 2 3 4.5 3 4.5 1.3 4.5 3-2 3-4.5 3-4.5-1.3-4.5-3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Easy booking",
    body: "Book in minutes, relax after",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M13 3L5 14h6l-1 7 9-12h-6l0-6z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function OurPromises() {
  return (
    <section className="bg-white py-8 md:py-10">
      <div className="container-page">
        <div className="mb-5 flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-full bg-[#ede9fe] text-[#6d28d9]">
            <svg width="14" height="14" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M2.5 6.2l2.3 2.3 4.7-4.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <h2 className="text-[1.35rem] font-bold tracking-[-0.03em] text-[#0b1220] sm:text-[1.6rem]">Our promises</h2>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
          {PROMISES.map((item) => (
            <div
              key={item.title}
              className="flex items-start gap-3 rounded-2xl bg-[#F7F8FA] px-4 py-4 ring-1 ring-[#E8ECF1]"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#4f46e5] ring-1 ring-[#E8ECF1]">
                {item.icon}
              </span>
              <div>
                <p className="text-[14px] font-semibold text-[#0b1220]">{item.title}</p>
                <p className="mt-1 text-[13px] leading-snug text-[#64748b]">{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
