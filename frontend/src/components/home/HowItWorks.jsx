const STEPS = [
  {
    n: "1",
    title: "Search",
    body: "Enter your ZIP code & service",
    icon: (
      <>
        <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
        <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </>
    ),
  },
  {
    n: "2",
    title: "Compare",
    body: "View profiles, reviews & quotes",
    icon: (
      <path d="M8 7h12M8 12h12M8 17h8M5 7h.01M5 12h.01M5 17h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    ),
  },
  {
    n: "3",
    title: "Book",
    body: "Choose your pro & schedule",
    icon: (
      <path d="M7 4v3M17 4v3M5 9h14M6 7h12a2 2 0 012 2v9a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    ),
  },
  {
    n: "4",
    title: "Pay & Relax",
    body: "Secure payment & job done",
    icon: (
      <path d="M12 3l7 3v6c0 5-3 8-7 9-4-1-7-4-7-9V6l7-3z" stroke="currentColor" strokeWidth="1.8" fill="none" />
    ),
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-white py-14 md:py-20 text-[#14181d]">
      <div className="container-page text-center">
        <p className="text-cyan text-xs font-bold tracking-[0.18em]">SIMPLE STEPS</p>
        <h2 className="mt-2 text-[1.5rem] sm:text-3xl md:text-[34px] font-bold text-[#14181d]">How It Works</h2>
        <p className="mt-2 text-slate">Get your job done in 4 easy steps.</p>

        <ol className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-4">
          {STEPS.map((step, i) => (
            <li key={step.title} className="relative flex flex-col items-center text-center px-3">
              {i < STEPS.length - 1 && (
                <span
                  className="hidden lg:block absolute top-7 left-[calc(50%+36px)] right-[calc(-50%+36px)] h-px border-t border-dashed border-blue/35"
                  aria-hidden="true"
                />
              )}
              <div className="size-14 rounded-full bg-blue text-white grid place-items-center shadow-[0_10px_24px_rgba(8,121,249,0.28)]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  {step.icon}
                </svg>
              </div>
              <h3 className="mt-4 font-bold text-[#14181d]">
                {step.n}. {step.title}
              </h3>
              <p className="mt-1 text-sm text-slate max-w-[200px]">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
