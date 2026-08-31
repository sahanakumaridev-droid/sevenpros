import { Link } from "react-router-dom";
import Logo from "./brand/Logo";

const LINKS = [
  ["About", "/info/about"],
  ["Categories", "/search"],
  ["For Pros", "/become-a-pro"],
  ["Blog", "/info/press"],
  ["Help", "/info/help-center"],
  ["Contact", "/info/help-center"],
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
    className: "bg-[#111111] ring-1 ring-white/20",
    path: "M4 4l7.5 8.5L4.5 20h2l6-6.8 4.5 6.8H20l-7.8-8.9L19 4h-2l-5.5 6.2L7 4H4z",
  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-navy text-white pb-[env(safe-area-inset-bottom)]">
      <div className="container-page py-8 md:py-10 grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] items-center gap-6">
        <div className="justify-self-center lg:justify-self-start">
          <Logo compact showTagline taglineAlways />
        </div>

        <nav
          className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-sm text-white"
          aria-label="Footer"
        >
          {LINKS.map(([label, to]) => (
            <Link key={label} to={to} className="hover:text-white/80">
              {label}
            </Link>
          ))}
        </nav>

        <div className="justify-self-center lg:justify-self-end flex items-center gap-2.5">
          {SOCIAL.map((icon) => (
            <a
              key={icon.label}
              href={icon.href}
              target="_blank"
              rel="noreferrer"
              aria-label={icon.label}
              className={`size-9 rounded-full grid place-items-center text-white ${icon.className}`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d={icon.path} />
              </svg>
            </a>
          ))}
        </div>
      </div>

      <div className="container-page pb-6">
        <p className="text-center text-xs text-white/55">
          © {year} SevenPros. All rights reserved.
          <span className="mx-2 text-white/25">|</span>
          California, USA
          <span className="mx-2 text-white/25">|</span>
          <Link to="/info/privacy" className="hover:text-white">
            Privacy
          </Link>
          <span className="mx-2 text-white/25">|</span>
          <Link to="/info/terms" className="hover:text-white">
            Terms
          </Link>
        </p>
      </div>
    </footer>
  );
}
