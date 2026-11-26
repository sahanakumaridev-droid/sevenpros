import { Link } from "react-router-dom";
import Logo from "./brand/Logo";

const COMPANY = [
  ["About us", "/info/about"],
  ["How it works", "/info/how-it-works"],
  ["Press", "/info/press"],
  ["Careers", "/info/about"],
  ["Contact", "/info/help-center"],
];

const CUSTOMERS = [
  ["Find a pro", "/search"],
  ["Browse categories", "/search"],
  ["Help center", "/info/help-center"],
  ["Safety", "/info/safety"],
  ["Reviews", "/search"],
];

const PROS = [
  ["Become a pro", "/become-a-pro"],
  ["Pro signup", "/services/pro"],
  ["Pricing & credits", "/credits"],
  ["Pro resources", "/info/help-center"],
  ["Success tips", "/info/press"],
];

const SERVICES = [
  ["Plumbing", "/categories/plumbing"],
  ["Electrical", "/categories/electrical"],
  ["House cleaning", "/categories/cleaning"],
  ["Handyman", "/categories/handyman"],
  ["HVAC", "/categories/hvac"],
  ["Painting", "/categories/painting"],
  ["Landscaping", "/categories/landscaping"],
  ["Appliance repair", "/categories/appliance-repair"],
];

const LEGAL = [
  ["Privacy", "/info/privacy"],
  ["Terms", "/info/terms"],
  ["Cookies", "/info/privacy"],
];

const SOCIAL = [
  {
    label: "Facebook",
    href: "https://facebook.com",
    className: "bg-[#1877F2]",
    path: "M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H9v3h2v7h3v-7h3l1-3h-4V9c0-.3.2-1 1-1z",
  },
  {
    label: "Instagram",
    href: "https://instagram.com",
    className: "bg-[linear-gradient(45deg,#f9ce34_0%,#ee2a7b_50%,#6228d7_100%)]",
    path: "M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm0 2a3 3 0 00-3 3v10a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H7zm5 3a5 5 0 110 10 5 5 0 010-10zm0 2a3 3 0 100 6 3 3 0 000-6zm5.5-3a1 1 0 110 2 1 1 0 010-2z",
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com",
    className: "bg-[#0A66C2]",
    path: "M6.5 8.5H3.5V20h3V8.5zM5 3.5A1.8 1.8 0 103.2 5.3 1.8 1.8 0 005 3.5zM20.5 20v-6.5c0-3.1-1.6-4.6-3.9-4.6a3.3 3.3 0 00-3 1.7V9H10.5v11h3v-6.1c0-1.6.3-3.2 2.3-3.2s1.9 1.8 1.9 3.3V20h3z",
  },
  {
    label: "YouTube",
    href: "https://youtube.com",
    className: "bg-[#FF0000]",
    path: "M23 8.5s-.2-1.6-.9-2.3c-.9-.9-1.9-.9-2.4-1C16.2 5 12 5 12 5h0s-4.2 0-7.7.2c-.5 0-1.5.1-2.4 1C1.2 6.9 1 8.5 1 8.5S.8 10.4.8 12.3v1.8c0 1.9.2 3.8.2 3.8s.2 1.6.9 2.3c.9.9 2.1.9 2.6 1 1.9.2 7.5.2 7.5.2s4.2 0 7.7-.2c.5 0 1.5-.1 2.4-1 .7-.7.9-2.3.9-2.3s.2-1.9.2-3.8v-1.8c0-1.9-.2-3.8-.2-3.8zM9.8 15.5v-6l6.2 3-6.2 3z",
  },
  {
    label: "X",
    href: "https://x.com",
    className: "bg-[#111111] ring-1 ring-black/10",
    path: "M4 4l7.5 8.5L4.5 20h2l6-6.8 4.5 6.8H20l-7.8-8.9L19 4h-2l-5.5 6.2L7 4H4z",
  },
];

function FooterCol({ title, links }) {
  return (
    <div>
      <h3 className="text-[13px] font-bold tracking-[-0.01em] text-[#0b1220]">{title}</h3>
      <ul className="mt-3.5 space-y-2.5">
        {links.map(([label, to]) => (
          <li key={label}>
            <Link
              to={to}
              className="text-[13px] text-[#64748b] transition-colors duration-160 ease-[cubic-bezier(0.23,1,0.32,1)] hover:text-[#0b1220]"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[#E8ECF1] bg-[#F7F8FA] text-[#0b1220] pb-[env(safe-area-inset-bottom)]">
      <div className="container-page py-12 md:py-14">
        <div className="grid gap-10 lg:grid-cols-[1.35fr_2.65fr] lg:gap-12">
          <div className="max-w-sm">
            <Logo compact showTagline taglineAlways tone="light" />
            <p className="mt-4 text-[14px] leading-relaxed text-[#64748b]">
              California&apos;s local service marketplace. Book verified plumbers, electricians,
              cleaners, and handymen — seven days a week.
            </p>

            <div className="mt-5 flex flex-wrap gap-2.5">
              <a
                href="https://apps.apple.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#0b1220] px-3.5 text-white transition-transform duration-160 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-[#1e293b] active:scale-[0.98]"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M16.7 12.7c0-2.1 1.7-3.1 1.8-3.2-1-1.4-2.5-1.6-3-1.7-1.3-.1-2.5.8-3.1.8s-1.6-.7-2.7-.7c-1.4 0-2.7.8-3.4 2.1-1.5 2.5-.4 6.3 1 8.3.7 1 1.5 2.1 2.6 2 1-.1 1.4-.7 2.7-.7s1.6.6 2.7.7c1.1 0 1.8-1 2.5-2 .8-1.1 1.1-2.2 1.1-2.2s-2.1-.8-2.2-3.1zM14.3 6.3c.6-.7 1-1.7.9-2.7-1 .1-2.1.6-2.7 1.4-.6.7-1.1 1.7-.9 2.7 1 0 2-.6 2.7-1.4z" />
                </svg>
                <span className="flex flex-col leading-none">
                  <span className="text-[9px] text-white/70">Download on the</span>
                  <span className="text-[13px] font-semibold">App Store</span>
                </span>
              </a>
              <a
                href="https://play.google.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#0b1220] px-3.5 text-white transition-transform duration-160 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-[#1e293b] active:scale-[0.98]"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M3.6 2.4c-.3.2-.5.6-.5 1.1v17c0 .5.2.9.5 1.1l.1.1 9.5-9.5v-.3L3.7 2.3l-.1.1zm11.1 6.3L11.5 12l3.2 3.3 3.8-2.2c.8-.4.8-1.2 0-1.7l-3.8-2.1zM11.5 12l-9.5 9.5c.2.1.4.1.6 0l11.2-6.4L11.5 12zm0 0l2.3 2.3 3.8 2.2L3.2 21.6c-.3.1-.6 0-.8-.1L11.5 12z" />
                </svg>
                <span className="flex flex-col leading-none">
                  <span className="text-[9px] text-white/70">Get it on</span>
                  <span className="text-[13px] font-semibold">Google Play</span>
                </span>
              </a>
            </div>

            <div className="mt-6">
              <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#94a3b8]">Follow us</p>
              <div className="mt-2.5 flex items-center gap-2.5">
                {SOCIAL.map((icon) => (
                  <a
                    key={icon.label}
                    href={icon.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={icon.label}
                    className={`grid size-9 place-items-center rounded-full text-white transition-transform duration-160 ease-[cubic-bezier(0.23,1,0.32,1)] hover:scale-[1.06] active:scale-[0.97] ${icon.className}`}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d={icon.path} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 sm:gap-6">
            <FooterCol title="Company" links={COMPANY} />
            <FooterCol title="Customers" links={CUSTOMERS} />
            <FooterCol title="For pros" links={PROS} />
            <FooterCol title="Popular services" links={SERVICES} />
          </div>
        </div>

        <div className="mt-10 rounded-2xl bg-white p-5 ring-1 ring-[#E8ECF1] sm:p-6 md:flex md:items-center md:justify-between md:gap-6">
          <div>
            <p className="text-[14px] font-bold text-[#0b1220]">Need help booking a pro?</p>
            <p className="mt-1 text-[13px] text-[#64748b]">
              Our support team is here 7 days a week across California.
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2.5 md:mt-0">
            <a
              href="mailto:hello@sevenpros.com"
              className="inline-flex h-10 items-center rounded-full bg-[#0b1220] px-4 text-[13px] font-semibold text-white transition-[transform,background-color] duration-160 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-[#1e293b] active:scale-[0.98]"
            >
              hello@sevenpros.com
            </a>
            <Link
              to="/info/help-center"
              className="inline-flex h-10 items-center rounded-full bg-[#F1F5F9] px-4 text-[13px] font-semibold text-[#0b1220] transition-[transform,background-color] duration-160 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-[#E2E8F0] active:scale-[0.98]"
            >
              Help center
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-[#E8ECF1] bg-white">
        <div className="container-page flex flex-col gap-3 py-5 text-[12px] text-[#64748b] sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} SevenPros. All rights reserved.
            <span className="mx-2 text-[#cbd5e1]">·</span>
            California, USA
          </p>
          <nav className="flex flex-wrap items-center gap-x-4 gap-y-2" aria-label="Legal">
            {LEGAL.map(([label, to]) => (
              <Link key={label} to={to} className="hover:text-[#0b1220]">
                {label}
              </Link>
            ))}
            <a href="/SevenPros-PRD.pdf" target="_blank" rel="noreferrer" className="hover:text-[#0b1220]">
              Document
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
