"use client";
import { useState } from "react";
import Link from "next/link";

type HeaderProps = {
  variant?: "landing" | "app";
};

export default function Header({ variant = "app" }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const onboardingUrl = "/onboarding";

  if (variant === "landing") {
    return (
      <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-sm">
        <div className="mx-auto w-full max-w-[1488px] px-5 md:px-12 xl:px-24 py-6 md:py-8 flex items-center justify-between">
          <Link href="/" className="text-white text-[22px] md:text-[24px] font-semibold tracking-[-0.41px]">
            travingat
          </Link>

          <nav className="hidden md:flex items-center gap-7">
            <a href="#featured" className="text-[#d8d8d8] hover:text-white text-sm transition">Featured Profiles</a>
            <a href="#templates" className="text-[#d8d8d8] hover:text-white text-sm transition">Templates</a>
            <a href="#pricing" className="text-[#d8d8d8] hover:text-white text-sm transition">Pricing</a>
            <a href="#blog" className="text-[#d8d8d8] hover:text-white text-sm transition">Blog</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/signin" className="rounded-full border border-[#2a2a2a] px-4 py-2 text-sm text-[#d8d8d8] hover:text-white hover:border-[#444] transition">
              Already traveler? Sign in
            </Link>
            <Link href={onboardingUrl} className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black hover:bg-[#ececec] transition">
              Join now
            </Link>
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className="md:hidden flex items-center justify-center rounded-xl border border-[#1e1e1e] bg-[#0b0b0b] p-2"
              aria-label="Toggle navigation menu"
            >
              <span className="material-symbols-rounded text-[#e3e3e3] text-[21px]">dehaze</span>
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="mx-auto w-full max-w-[1488px] px-5 pb-5 md:hidden">
            <div className="rounded-2xl border border-[#252525] bg-[#101010] p-2 shadow-[0_12px_40px_rgba(0,0,0,0.45)]">
              <a href="#featured" onClick={() => setMenuOpen(false)} className="block rounded-xl px-3 py-2 text-sm text-[#d8d8d8] hover:bg-[#1b1b1b]">Featured Profiles</a>
              <a href="#templates" onClick={() => setMenuOpen(false)} className="block rounded-xl px-3 py-2 text-sm text-[#d8d8d8] hover:bg-[#1b1b1b]">Templates</a>
              <a href="#pricing" onClick={() => setMenuOpen(false)} className="block rounded-xl px-3 py-2 text-sm text-[#d8d8d8] hover:bg-[#1b1b1b]">Pricing</a>
              <a href="#blog" onClick={() => setMenuOpen(false)} className="block rounded-xl px-3 py-2 text-sm text-[#d8d8d8] hover:bg-[#1b1b1b]">Blog</a>
              <Link href="/signin" onClick={() => setMenuOpen(false)} className="block rounded-xl px-3 py-2 text-sm text-[#d8d8d8] hover:bg-[#1b1b1b]">Already traveler? Sign in</Link>
              <Link href={onboardingUrl} onClick={() => setMenuOpen(false)} className="block rounded-xl px-3 py-2 text-sm text-[#d8d8d8] hover:bg-[#1b1b1b]">Join now</Link>
            </div>
          </nav>
        )}
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-sm">
      <div className="mx-auto w-full max-w-[1488px] px-5 md:px-12 xl:px-24 py-6 md:py-8 flex items-center justify-between">
        <Link href="/" className="text-white text-[22px] md:text-[24px] font-semibold tracking-[-0.41px]">
          travingat
        </Link>

        <div className="flex items-center gap-3 md:gap-5">
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 rounded-xl border border-[#1e1e1e] bg-[#0b0b0b] px-3 py-2"
            aria-label="Toggle navigation menu"
          >
            <span className="material-symbols-rounded text-[#e3e3e3] text-[21px]">dehaze</span>
            <div className="h-7 w-7 overflow-hidden rounded-lg bg-[#191919]">
              <div className="h-full w-full bg-[#2a2a2a]" />
            </div>
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="mx-auto w-full max-w-[1488px] px-5 md:px-12 xl:px-24 pb-5">
          <div className="max-w-[260px] ml-auto rounded-2xl border border-[#252525] bg-[#101010] p-2 shadow-[0_12px_40px_rgba(0,0,0,0.45)]">
            <Link href="/profile" onClick={() => setMenuOpen(false)} className="block rounded-xl px-3 py-2 text-sm text-[#d8d8d8] hover:bg-[#1b1b1b]">Profile</Link>
            <Link href="/signin" onClick={() => setMenuOpen(false)} className="block rounded-xl px-3 py-2 text-sm text-[#d8d8d8] hover:bg-[#1b1b1b]">Sign in</Link>
          </div>
        </nav>
      )}
    </header>
  );
}
