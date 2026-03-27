"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useRef, useEffect, useState } from "react";
import { demoProfiles } from "@/data/demo-profiles";

function TravellerCard({
  profile,
  className,
}: {
  profile: (typeof demoProfiles)[0];
  className?: string;
}) {
  return (
    <div
      className={`bg-black border border-[#262626] flex flex-col gap-[17px] xl:gap-[26px] items-center pb-[19px] xl:pb-7 pt-[5px] xl:pt-2 px-[5px] xl:px-2 rounded-[20px] w-[240px] xl:w-[360px] flex-shrink-0 ${className || ""}`}
    >
      {/* Cover + Avatar */}
      <div className="flex flex-col items-center w-full">
        <div className="flex flex-col items-center pb-9 w-full">
          <div className="h-[107px] xl:h-[160px] -mb-9 relative rounded-[14px] w-full overflow-hidden">
            <img
              src={profile.cover}
              alt={`${profile.name} cover`}
              className="object-cover rounded-[14px]"
            />
          </div>
          <div className="border-[5px] xl:border-8 border-black -mb-9 relative rounded-2xl w-[53px] h-[53px] xl:w-[80px] xl:h-[80px] overflow-hidden z-10">
            <img
              src={profile.avatar}
              alt={profile.name}
              className="object-cover rounded-2xl"
            />
          </div>
        </div>
      </div>

      {/* Info + Stats + Buttons */}
      <div className="flex flex-col gap-6 items-start px-3 w-full">
        {/* Name, country, handle */}
        <div className="flex flex-col gap-3 items-center w-full">
          <div className="flex gap-1.5 items-center justify-center w-full">
            <span className="text-sm leading-none">{profile.flag}</span>
            <p className="font-normal leading-5 text-[#696969] text-sm tracking-[-0.5px] whitespace-nowrap">
              {profile.country}
            </p>
          </div>
          <p className="font-semibold leading-normal text-xl text-center text-white tracking-[-0.41px] w-full">
            {profile.name}
          </p>
          <p className="font-normal leading-normal text-[#a8a8a8] text-base text-center tracking-[-0.5px] w-full">
            {profile.handle}
          </p>
        </div>

        {/* Stats row */}
        <div className="bg-[#111] flex gap-10 items-center justify-center px-5 py-4 rounded-xl w-full">
          <div className="flex flex-1 flex-col gap-1 items-center">
            <p className="font-semibold leading-normal text-xl text-white tracking-[-0.41px]">
              {profile.countries}
            </p>
            <p className="font-normal leading-[1.5] text-[#8c8c8c] text-xs tracking-[-0.5px]">
              Countries
            </p>
          </div>
          <div className="flex flex-1 flex-col gap-1 items-center">
            <p className="font-semibold leading-normal text-xl text-white tracking-[-0.41px]">
              {profile.media}
            </p>
            <p className="font-normal leading-[1.5] text-[#8c8c8c] text-xs tracking-[-0.5px]">
              All media
            </p>
          </div>
          <div className="flex flex-1 flex-col gap-1 items-center">
            <p className="font-semibold leading-normal text-xl text-white tracking-[-0.41px]">
              {profile.collections}
            </p>
            <p className="font-normal leading-[1.5] text-[#8c8c8c] text-xs tracking-[-0.5px]">
              Collections
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 items-center w-full">
          <button className="bg-white flex-1 items-center justify-center overflow-hidden p-2.5 rounded-full">
            <p className="font-medium leading-normal text-sm text-black text-center tracking-[-0.408px] whitespace-nowrap">
              Follow
            </p>
          </button>
          <button className="bg-[#181818] border border-[#363636] flex-1 items-center justify-center overflow-hidden p-2.5 rounded-full">
            <p className="font-medium leading-normal text-sm text-center text-white tracking-[-0.408px] whitespace-nowrap">
              Connect
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FeaturedProfiles() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const animationRef = useRef<number | null>(null);
  const scrollPositionRef = useRef(0);
  const speedRef = useRef(0.5); // pixels per frame

  const allCards = [...demoProfiles, ...demoProfiles]; // duplicate for seamless loop

  useEffect(() => {
    const tick = () => {
      if (!scrollRef.current) return;
      const el = scrollRef.current;
      const singleSetWidth = el.scrollWidth / 2;

      if (!isPaused) {
        scrollPositionRef.current += speedRef.current;
        if (scrollPositionRef.current >= singleSetWidth) {
          scrollPositionRef.current -= singleSetWidth;
        }
        el.scrollLeft = scrollPositionRef.current;
      }

      animationRef.current = requestAnimationFrame(tick);
    };

    animationRef.current = requestAnimationFrame(tick);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPaused]);

  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => {
    if (scrollRef.current) {
      scrollPositionRef.current = scrollRef.current.scrollLeft;
    }
    setIsPaused(false);
  };

  return (
    <section id="featured" className="py-12 md:py-16 xl:py-28 overflow-hidden">
      {/* Title */}
      <div className="flex items-start justify-center px-3 md:px-12 mb-8 md:mb-12 xl:mb-[108px]">
        <h2 className="max-w-[800px] font-semibold leading-[1.1] xl:leading-[72px] text-[32px] md:text-[42px] xl:text-[64px] text-center text-white tracking-[-1px]">
          Featured travel profiles — a look at what&apos;s coming
        </h2>
      </div>

      {/* Scrolling cards */}
      <div
        ref={scrollRef}
        className="overflow-x-hidden overflow-y-hidden hide-scrollbar"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="flex gap-4 xl:gap-8 items-center w-max px-4">
          {allCards.map((profile, i) => (
            <Link
              href={`/demo/profile/${profile.id}`}
              key={i}
              className={`flex flex-col h-[390px] xl:h-[600px] items-center flex-shrink-0 ${profile.align === "end" ? "justify-end" : "justify-start"
                }`}
            >
              <TravellerCard profile={profile} />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
