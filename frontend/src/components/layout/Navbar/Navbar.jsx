import React, { useState } from "react";
import {
  Menu,
  X,
  ChevronDown,
  ArrowRight,
  HeartPulse,
} from "lucide-react";

import Button from '../../ui/button/Button';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: "Home", href: "#home" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "Features", href: "#features" },
    { name: "For Hospitals", href: "#hospitals" },
    { name: "For Patients", href: "#patients" },
    { name: "About", href: "#about" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-gray-100">
      <div className="mx-auto flex h-[70px] max-w-[1440px] items-center justify-between px-5 md:px-8 lg:px-12">
        
        {/* ================= LOGO ================= */}
        <a
          href="#home"
          className="flex items-center gap-2"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E6F4F0] text-[#0F6B5B]">
            <HeartPulse size={22} strokeWidth={2.2} />
          </div>

          <span className="text-xl font-bold tracking-tight text-[#1F3445]">
            Vaidyam
          </span>
        </a>

        {/* ================= DESKTOP NAVIGATION ================= */}
        <nav className="hidden lg:flex items-center gap-7">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-[#526171] transition-colors duration-200 hover:text-[#0F6B5B]"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* ================= DESKTOP ACTIONS ================= */}
        <div className="hidden lg:flex items-center gap-4">
          
          {/* Language */}
          <button className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#526171] hover:bg-gray-50">
            English
            <ChevronDown size={16} />
          </button>

          {/* CTA */}
          <Button
            variant="primary"
            size="sm"
            rightIcon={<ArrowRight size={16} />}
          >
            Get Started
          </Button>
        </div>

        {/* ================= MOBILE ACTIONS ================= */}
        <div className="flex items-center gap-3 lg:hidden">
          
          {/* Language */}
          <button className="hidden sm:flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#526171]">
            English
            <ChevronDown size={15} />
          </button>

          {/* Mobile Menu */}
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-[#1F3445] transition hover:bg-gray-100"
            aria-label="Toggle navigation menu"
          >
            {isMenuOpen ? (
              <X size={24} />
            ) : (
              <Menu size={24} />
            )}
          </button>
        </div>
      </div>

      {/* ================= MOBILE MENU ================= */}
      <div
        className={`
          lg:hidden overflow-hidden border-t border-gray-100 bg-white
          transition-all duration-300 ease-in-out
          ${isMenuOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"}
        `}
      >
        <nav className="flex flex-col px-5 py-5">
          
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setIsMenuOpen(false)}
              className="border-b border-gray-100 py-4 text-base font-medium text-[#1F3445] transition hover:text-[#0F6B5B]"
            >
              {link.name}
            </a>
          ))}

          <div className="mt-5">
            <Button
              variant="primary"
              size="md"
              fullWidth
              rightIcon={<ArrowRight size={18} />}
              onClick={() => setIsMenuOpen(false)}
            >
              Get Started
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;