"use client";

import Image from "next/image";
import { useState, useEffect, useCallback, useRef } from "react";

interface Testimonial {
  id: string;
  name: string;
  location: string;
  quote: string;
  photo: string;
  socials: {
    instagram: string;
    tiktok: string;
    linkedin: string;
  };
}

export default function TestimonialSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<"left" | "right">("right");
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch("/api/testimonials")
      .then((res) => res.json())
      .then((data) => setTestimonials(data))
      .catch(() => {
        import("@/data/testimonials.json").then((mod) =>
          setTestimonials(mod.default as Testimonial[])
        );
      });
  }, []);

  const goTo = useCallback(
    (dir: "prev" | "next") => {
      if (isAnimating || testimonials.length <= 1) return;
      setDirection(dir === "next" ? "right" : "left");
      setIsAnimating(true);
      setTimeout(() => {
        setCurrent((prev) =>
          dir === "next"
            ? (prev + 1) % testimonials.length
            : (prev - 1 + testimonials.length) % testimonials.length
        );
        setIsAnimating(false);
      }, 300);
    },
    [isAnimating, testimonials.length]
  );

  // Auto-advance every 5 seconds (infinite scroll)
  useEffect(() => {
    if (testimonials.length <= 1 || paused) return;
    timerRef.current = setInterval(() => {
      goTo("next");
    }, 5000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [testimonials.length, paused, goTo]);

  if (testimonials.length === 0) {
    return (
      <section className="bg-[#5A45F9] py-12 md:py-16 xl:px-24 xl:py-40 relative min-h-[400px]" />
    );
  }

  const t = testimonials[current];

  return (
    <section
      className="bg-[#5A45F9] py-12 md:py-16 xl:px-24 xl:py-40 relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Navigation arrows */}
      <div className="absolute top-12 right-5 md:top-16 md:right-12 flex items-center gap-3 xl:top-10 xl:right-24 z-10">
        <button
          onClick={() => goTo("prev")}
          className="w-[36px] h-[36px] xl:w-12 xl:h-12 flex items-center justify-center rotate-180 opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
        >
          <Image
            src="/arrow-right.svg"
            alt="Previous"
            width={48}
            height={48}
            className="w-full h-full"
          />
        </button>
        <button
          onClick={() => goTo("next")}
          className="w-[36px] h-[36px] xl:w-12 xl:h-12 flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
        >
          <Image
            src="/arrow-right.svg"
            alt="Next"
            width={48}
            height={48}
            className="w-full h-full"
          />
        </button>
      </div>

      {/* Slide content */}
      <div
        className={`px-3 flex flex-col gap-8 xl:px-0 xl:flex-row xl:gap-16 xl:items-start xl:max-w-[1200px] transition-all duration-300 ease-in-out ${
          isAnimating
            ? direction === "right"
              ? "opacity-0 translate-x-8"
              : "opacity-0 -translate-x-8"
            : "opacity-100 translate-x-0"
        }`}
      >
        {/* Photo */}
        <div className="w-[134px] h-[204px] rounded-2xl overflow-hidden flex-shrink-0 xl:w-[354px] xl:h-[540px] xl:rounded-[20px]">
          <Image
            src={t.photo}
            alt={t.name}
            width={354}
            height={540}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Quote content */}
        <div className="flex-1 flex flex-col justify-between xl:py-2 xl:min-h-[540px]">
          <div>
            {/* Quote mark */}
            <div className="w-[35px] h-[30px] mb-4 xl:w-16 xl:h-14 xl:mb-6">
              <Image
                src="/quote-mark.svg"
                alt=""
                width={64}
                height={56}
                className="w-full h-full"
              />
            </div>

            {/* Quote text */}
            <p className="text-[24px] leading-[1.3] text-white font-medium tracking-[-0.5px] xl:text-[52px] xl:leading-[60px] xl:tracking-[-1px]">
              {t.quote}
            </p>
          </div>

          {/* Author info */}
          <div className="flex items-center justify-between border-t border-white/20 pt-8 mt-8 xl:pt-12 xl:mt-0">
            <p className="text-[20px] text-white font-medium tracking-[-0.5px] xl:text-[32px] xl:leading-[40px]">
              {t.name}, {t.location}
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-2.5">
              {t.socials.instagram && (
                <a href={t.socials.instagram} target="_blank" rel="noopener noreferrer">
                  <Image
                    src="/social-instagram.svg"
                    alt="Instagram"
                    width={32}
                    height={32}
                    className="w-8 h-8 xl:w-8 xl:h-8"
                  />
                </a>
              )}
              {t.socials.tiktok && (
                <a href={t.socials.tiktok} target="_blank" rel="noopener noreferrer">
                  <Image
                    src="/social-tiktok.svg"
                    alt="TikTok"
                    width={32}
                    height={32}
                    className="w-8 h-8 xl:w-8 xl:h-8"
                  />
                </a>
              )}
              {t.socials.linkedin && (
                <a href={t.socials.linkedin} target="_blank" rel="noopener noreferrer">
                  <Image
                    src="/social-linkedin.svg"
                    alt="LinkedIn"
                    width={32}
                    height={32}
                    className="w-8 h-8 xl:w-8 xl:h-8"
                  />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Slide indicators */}
      {testimonials.length > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8 xl:mt-12">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                if (i === current || isAnimating) return;
                setDirection(i > current ? "right" : "left");
                setIsAnimating(true);
                setTimeout(() => {
                  setCurrent(i);
                  setIsAnimating(false);
                }, 300);
              }}
              className={`rounded-full transition-all duration-300 cursor-pointer ${
                i === current
                  ? "w-8 h-2 bg-white"
                  : "w-2 h-2 bg-white/40 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
