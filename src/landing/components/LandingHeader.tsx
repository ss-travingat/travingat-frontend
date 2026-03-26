"use client";

import { type MouseEvent, useState } from "react";
import Link from "next/link";

export default function LandingHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const onboardingUrl = "http://localhost:3000/onboarding";

  const scrollToSection = (event: MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    event.preventDefault();
    const section = document.getElementById(sectionId);
    if (!section) return;

    setMenuOpen(false);
    section.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <header className="sticky top-0 z-50 bg-black/90 backdrop-blur">
      <div className="mx-auto w-full max-w-[1728px] px-5 md:px-8 xl:px-24">
        <div className="h-[92px] xl:h-[132px] flex items-center justify-between">
          <Link href="/" className="text-white text-[28px] font-semibold leading-none tracking-[-0.41px]">
            travingat
          </Link>

          <div className="hidden xl:flex items-center justify-end gap-6">
            <nav className="flex items-center gap-3">
              <a
                href="#featured"
                onClick={(event) => scrollToSection(event, "featured")}
                className="rounded-full px-[18px] py-[10px] text-[16px] font-medium leading-6 tracking-[-0.096px] text-white hover:bg-white/5 transition"
              >
                Featured Profiles
              </a>
              <a
                href="#templates"
                onClick={(event) => scrollToSection(event, "templates")}
                className="rounded-full px-[18px] py-[10px] text-[16px] font-medium leading-6 tracking-[-0.096px] text-white hover:bg-white/5 transition"
              >
                Templates
              </a>
              <a
                href="#pricing"
                onClick={(event) => scrollToSection(event, "pricing")}
                className="rounded-full px-[18px] py-[10px] text-[16px] font-medium leading-6 tracking-[-0.096px] text-white hover:bg-white/5 transition"
              >
                Pricing
              </a>
              <a href="#blog" className="rounded-full px-[18px] py-[10px] text-[16px] font-medium leading-6 tracking-[-0.096px] text-white hover:bg-white/5 transition">
                Blog
              </a>
            </nav>

            <a href={onboardingUrl} className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-[14px] font-medium leading-5 tracking-[-0.084px] text-black hover:bg-[#ececec] transition">
              Join now
            </a>
          </div>

          <div className="flex xl:hidden items-center gap-2">
            <a href={onboardingUrl} className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black hover:bg-[#ececec] transition">
              Join now
            </a>
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-[#1e1e1e] bg-[#0b0b0b]"
              aria-label="Toggle navigation menu"
              aria-expanded={menuOpen}
            >
              <span
                className={`absolute h-[2px] w-5 rounded-full bg-[#e3e3e3] transition-all duration-300 ${
                  menuOpen ? "translate-y-0 rotate-45" : "-translate-y-[6px]"
                }`}
              />
              <span
                className={`absolute h-[2px] w-5 rounded-full bg-[#e3e3e3] transition-all duration-300 ${
                  menuOpen ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`absolute h-[2px] w-5 rounded-full bg-[#e3e3e3] transition-all duration-300 ${
                  menuOpen ? "translate-y-0 -rotate-45" : "translate-y-[6px]"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <nav
        className={`mx-auto w-full max-w-[1728px] overflow-hidden px-5 md:px-8 xl:hidden transition-all duration-300 ${
          menuOpen ? "max-h-[420px] pb-5 opacity-100" : "max-h-0 pb-0 opacity-0"
        }`}
      >
        <div
          className={`rounded-2xl border border-[#252525] bg-[#101010] p-2 shadow-[0_12px_40px_rgba(0,0,0,0.45)] transition-transform duration-300 ${
            menuOpen ? "translate-y-0" : "-translate-y-2"
          }`}
        >
          <a
            href="#featured"
            onClick={(event) => scrollToSection(event, "featured")}
            className="block rounded-xl px-3 py-2 text-sm text-[#d8d8d8] hover:bg-[#1b1b1b]"
          >
            Featured Profiles
          </a>
          <a
            href="#templates"
            onClick={(event) => scrollToSection(event, "templates")}
            className="block rounded-xl px-3 py-2 text-sm text-[#d8d8d8] hover:bg-[#1b1b1b]"
          >
            Templates
          </a>
          <a
            href="#pricing"
            onClick={(event) => scrollToSection(event, "pricing")}
            className="block rounded-xl px-3 py-2 text-sm text-[#d8d8d8] hover:bg-[#1b1b1b]"
          >
            Pricing
          </a>
          <a href="#blog" onClick={() => setMenuOpen(false)} className="block rounded-xl px-3 py-2 text-sm text-[#d8d8d8] hover:bg-[#1b1b1b]">
            Blog
          </a>
          <Link href="/signin" onClick={() => setMenuOpen(false)} className="block rounded-xl px-3 py-2 text-sm text-[#d8d8d8] hover:bg-[#1b1b1b]">
            Already traveler? Sign in
          </Link>
          <a href={onboardingUrl} onClick={() => setMenuOpen(false)} className="block rounded-xl px-3 py-2 text-sm text-[#d8d8d8] hover:bg-[#1b1b1b]">
            Join now
          </a>
        </div>
      </nav>
    </header>
  );
}
