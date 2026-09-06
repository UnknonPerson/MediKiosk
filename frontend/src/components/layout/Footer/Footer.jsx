import React from "react";

import {
  HeartPulse,
  Mail,
  Phone,
  MapPin,
  ArrowUpRight,
  Circle,
  LampCeilingIcon,
} from "lucide-react";

const Footer = () => {
  const footerLinks = {
    Platform: [
      { name: "How It Works", href: "#how-it-works" },
      { name: "Features", href: "#features" },
      { name: "For Hospitals", href: "#hospitals" },
      { name: "For Patients", href: "#patients" },
      { name: "AYUSH Mode", href: "#ayush" },
    ],

    Company: [
      { name: "About Us", href: "#about" },
      { name: "Our Mission", href: "#mission" },
      { name: "Contact", href: "#contact" },
      { name: "Careers", href: "#careers" },
    ],

    Support: [
      { name: "Help Center", href: "#help" },
      { name: "Privacy Policy", href: "#privacy" },
      { name: "Terms of Service", href: "#terms" },
      { name: "Accessibility", href: "#accessibility" },
    ],
  };

  return (
    <footer className="bg-[#102c32] text-white">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        
        {/* TOP SECTION */}
        <div className="grid gap-12 py-14 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:py-20">
          
          {/* BRAND */}
          <div className="max-w-sm">
            <a
              href="#home"
              className="inline-flex items-center gap-3 no-underline"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#dff1ec] text-[#176b5b]">
                 <img src="/images/loggo.png" alt="vaidyam" className="h-full w-full object-contain" />
              </div>

              <span className="text-2xl font-bold tracking-tight">
                Vaidyam
              </span>
            </a>

            <p className="mt-6 text-sm leading-7 text-slate-300">
              Your health story, organized and ready when it matters most.
              MediKiosk helps patients record, understand, and share their
              medical history with confidence.
            </p>

            {/* CONTACT */}
            <div className="mt-7 space-y-3 text-sm text-slate-300">
              <a
                href="mailto:hello@medikiosk.in"
                className="flex items-center gap-3 transition hover:text-[#8ed8c7] no-underline"
              >
                <Mail size={17} />
                contact@vaidyaam.in
              </a>

              <a
                href="tel:+910000000000"
                className="flex items-center gap-3 transition hover:text-[#8ed8c7] no-underline"
              >
                <Phone size={17} />
                +91 00000 00000
              </a>

              <div className="flex items-start gap-3">
                <MapPin size={17} className="mt-0.5 shrink-0" />
                <span>India</span>
              </div>
            </div>
          </div>

          {/* FOOTER LINKS */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="mb-5 text-base font-semibold text-white no-underline">
                {title}
              </h3>

              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="group inline-flex items-center gap-1 text-sm text-slate-300 no-underline transition hover:text-[#8ed8c7]"
                    >
                      {link.name}

                      <ArrowUpRight
                        size={13}
                        className="opacity-0 transition group-hover:opacity-100"
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* NEWSLETTER */}
        <div className="border-t border-white/10 py-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            
            <div>
              <h3 className="text-lg font-semibold">
                Stay informed about MediKiosk
              </h3>

              <p className="mt-2 text-sm text-slate-400">
                Get product updates and healthcare insights.
              </p>
            </div>

            <form className="flex w-full max-w-md flex-col gap-3 sm:flex-row">
              <input
                type="email"
                placeholder="Enter your email"
                className="min-h-[48px] flex-1 rounded-lg border border-white/10 bg-white/5 px-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#63b9a8]"
              />

              <button
                type="submit"
                className="min-h-[48px] rounded-lg bg-[#176b5b] px-6 text-sm font-medium text-white transition hover:bg-[#0f594b]"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* BOTTOM SECTION */}
        <div className="flex flex-col gap-6 border-t border-white/10 py-8 sm:flex-row sm:items-center sm:justify-between">
          
          <p className="text-sm text-slate-400">
            © {new Date().getFullYear()} MediKiosk. All rights reserved.
          </p>

          <div className="flex items-center gap-3">
            <a
              href="#"
              aria-label="LinkedIn"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-slate-300 transition hover:border-[#63b9a8] hover:text-[#8ed8c7] no-underline"
            >
              <LampCeilingIcon size={17} />
            </a>

            <a
              href="#"
              aria-label="Twitter"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-slate-300 transition hover:border-[#63b9a8] hover:text-[#8ed8c7] no-underline"
            >
              <Circle size={17} />
            </a>

            <a
              href="#"
              aria-label="Instagram"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-slate-300 transition hover:border-[#63b9a8] hover:text-[#8ed8c7] no-underline"
            >
              <Circle size={17} />
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;