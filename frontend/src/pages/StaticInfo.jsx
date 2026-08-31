import { useParams, Link } from "react-router-dom";

const PAGES = {
  "how-it-works": {
    title: "How SevenPros Works",
    body: "Search or browse a category, compare verified local pros by price, rating and response time, then book instantly or request a quote. Pay securely once the job is done.",
  },
  "trust-safety": {
    title: "Trust & Safety",
    body: "Every SevenPros pro can display license, insurance and background-check status directly on their profile. Payments are held securely until you confirm the work is complete.",
  },
  "help-center": {
    title: "Help Center",
    body: "Need help with a booking, payment, or your account? Reach out any time and our support team will get back to you.",
  },
  "gift-cards": {
    title: "Gift Cards",
    body: "SevenPros gift cards are coming soon -- check back for updates.",
  },
  "pro-success-stories": {
    title: "Pro Success Stories",
    body: "Real stories from SevenPros professionals who grew their business through the platform.",
  },
  community: {
    title: "Pro Community",
    body: "Connect with other SevenPros professionals, share tips, and get advice on growing your business.",
  },
  "pro-subscription": {
    title: "Pro Subscription Plans",
    body: "Free, Pro and Premium plans give you more visibility in search results and lower service fees. Manage your plan from your Business Profile.",
  },
  "provider-resources": {
    title: "Provider Resources",
    body: "Guides on pricing your services, writing a great profile, and responding quickly to booking requests.",
  },
  business: {
    title: "SevenPros for Business",
    body: "Facility managers and property owners can manage recurring service bookings across multiple locations.",
  },
  "bulk-booking": {
    title: "Bulk Booking",
    body: "Book the same service across multiple properties or units in one request. Coming soon.",
  },
  careers: {
    title: "Careers",
    body: "We're not actively hiring right now, but check back soon.",
  },
  press: {
    title: "Press & News",
    body: "No press coverage yet -- SevenPros is just getting started.",
  },
  terms: {
    title: "Terms of Service",
    body: "By using SevenPros, you agree to our terms of service. Full legal terms will be published here.",
  },
  privacy: {
    title: "Privacy Policy",
    body: "SevenPros respects your privacy. A full privacy policy detailing data collection and usage will be published here.",
  },
  "investor-relations": {
    title: "Investor Relations",
    body: "SevenPros is privately held. Investor information will be published here as the company grows.",
  },
};

const VALUES = [
  {
    title: "Local first",
    body: "We only match jobs with California-based professionals who serve your ZIP code — not a national call center.",
  },
  {
    title: "Trust you can check",
    body: "License, insurance, background-check, and review history sit on every profile so you can decide before you book.",
  },
  {
    title: "Clear pricing",
    body: "See starting prices and quotes up front. Pay after the work is done, not before a stranger shows up.",
  },
  {
    title: "Seven days a week",
    body: "Homes and businesses do not wait for Monday. Emergency and same-week booking are built into how we rank pros.",
  },
];

const STATS = [
  { value: "500+", label: "Service categories" },
  { value: "CA", label: "California only — on purpose" },
  { value: "4.8★", label: "Typical customer rating" },
  { value: "7", label: "Days a week you can book" },
];

function AboutPage() {
  return (
    <div className="bg-[#F4F7FB] text-[#071A3A]">
      <section className="container-page py-10 md:py-14 grid lg:grid-cols-[minmax(0,1.1fr)_minmax(240px,400px)] gap-10 items-center">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-blue">About SevenPros</p>
          <h1 className="mt-2 font-bold tracking-[-0.03em] leading-[1.12] text-[clamp(1.75rem,4.5vw,3rem)]">
            The right local pro. <span className="text-blue">7 days a week.</span>
          </h1>
          <p className="mt-4 text-lg text-slate max-w-xl text-pretty">
            SevenPros is a California marketplace that connects homeowners, renters, and businesses with verified
            plumbers, electricians, cleaners, and hundreds of other local specialists — without the guesswork of a
            random search.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/search" className="btn btn-primary h-11 px-5 rounded-xl text-sm">
              Find a Pro
            </Link>
            <Link
              to="/become-a-pro"
              className="h-11 px-5 rounded-xl border border-[#D7E3F0] bg-white text-sm font-semibold inline-flex items-center"
            >
              Join as a Pro
            </Link>
          </div>
        </div>
        <div className="rounded-[28px] overflow-hidden bg-[#D7EBFA] min-h-[260px] shadow-[0_18px_40px_rgba(7,26,58,0.1)]">
          <img
            src="/hero-pro.png?v=logo-shirt-no-hat"
            alt="SevenPros service professional"
            className="w-full h-[300px] object-contain object-bottom"
          />
        </div>
      </section>

      <section className="container-page grid grid-cols-2 lg:grid-cols-4 gap-3 pb-4">
        {STATS.map((s) => (
          <div key={s.label} className="rounded-2xl border border-[#E6EEF7] bg-white p-4">
            <p className="text-2xl font-bold tabular-nums">{s.value}</p>
            <p className="mt-1 text-sm text-slate">{s.label}</p>
          </div>
        ))}
      </section>

      <section className="container-page py-10 md:py-14 max-w-3xl">
        <h2 className="font-bold text-2xl tracking-[-0.03em]">Our story</h2>
        <div className="mt-4 space-y-4 text-slate leading-relaxed text-pretty">
          <p>
            Finding a trustworthy tradesperson in California should not mean scrolling through ads, hoping a stranger
            shows up, and arguing about the bill afterward. SevenPros started from a simple idea: put licensed, reviewed
            local professionals in one place, make pricing and availability obvious, and let customers book in a few
            clicks.
          </p>
          <p>
            We built the marketplace around how real jobs work — quotes, emergency visits, instant booking, and a
            booking lifecycle from pending through completed — so both sides know where they stand. Pros get leads in
            their service area. Customers get a paper trail, reviews, and a way to pay only when the work is done.
          </p>
          <p>
            We stay California-focused on purpose. Licensing, insurance, and neighborhood knowledge do not travel well
            across state lines. The Right Pro. 7 Days a Week. is not a slogan we bolted on later — it is how the product
            is designed.
          </p>
        </div>
      </section>

      <section className="container-page pb-10 md:pb-14">
        <h2 className="font-bold text-2xl tracking-[-0.03em]">What we believe</h2>
        <div className="mt-5 grid sm:grid-cols-2 gap-4">
          {VALUES.map((v) => (
            <div key={v.title} className="rounded-2xl border border-[#E6EEF7] bg-white p-5">
              <h3 className="font-bold">{v.title}</h3>
              <p className="mt-2 text-sm text-slate text-pretty">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page pb-10 md:pb-14 grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-[#E6EEF7] bg-white p-6">
          <h2 className="font-bold text-xl">For customers</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate">
            <li>Search 500+ categories by ZIP, filters, and Best Match ranking.</li>
            <li>Compare ratings, starting prices, and verification badges.</li>
            <li>Book, track status, and review the job from your account.</li>
          </ul>
          <Link to="/search" className="inline-flex mt-5 text-sm font-semibold text-blue">
            Browse professionals →
          </Link>
        </div>
        <div className="rounded-2xl border border-[#E6EEF7] bg-white p-6">
          <h2 className="font-bold text-xl">For professionals</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate">
            <li>List services, set prices, and show license and insurance.</li>
            <li>Accept jobs, manage bookings, and build public reviews.</li>
            <li>Keep more of what you earn with tools built for local trades.</li>
          </ul>
          <Link to="/become-a-pro" className="inline-flex mt-5 text-sm font-semibold text-blue">
            Grow your business →
          </Link>
        </div>
      </section>

      <section className="container-page pb-16">
        <div className="rounded-[28px] bg-navy text-white px-6 py-10 md:px-10">
          <h2 className="font-bold text-2xl tracking-[-0.03em]">Based in California. Built for California.</h2>
          <p className="mt-3 max-w-2xl text-white/75 text-pretty">
            From plumbing in the Central Valley to HVAC on the coast, SevenPros is for people who need a real human with
            the right tools — this week, not next quarter. Questions? Visit our help center or start with a search in
            your ZIP code.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/info/help-center" className="h-11 px-5 rounded-xl bg-white text-navy text-sm font-semibold inline-flex items-center">
              Help Center
            </Link>
            <Link to="/info/trust-safety" className="h-11 px-5 rounded-xl border border-white/25 text-sm font-semibold inline-flex items-center">
              Trust & Safety
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function StaticInfo() {
  const { slug } = useParams();

  if (slug === "about") return <AboutPage />;

  const page = PAGES[slug] || { title: slug.replace(/-/g, " "), body: "Content coming soon." };

  return (
    <div className="bg-[#F4F7FB] text-[#071A3A] min-h-full">
      <div className="container-page py-12 md:py-16 max-w-2xl">
        <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-blue">SevenPros</p>
        <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em]">{page.title}</h1>
        <p className="mt-4 text-slate leading-relaxed text-pretty">{page.body}</p>
        <Link to="/" className="inline-block mt-8 text-sm font-semibold text-blue">
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
