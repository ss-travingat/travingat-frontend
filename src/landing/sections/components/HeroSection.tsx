/* eslint-disable @next/next/no-img-element */

export default function HeroSection() {
  return (
    <section className="px-3 py-12 md:px-12 md:pt-16 md:pb-10 xl:px-24 xl:pt-16 xl:pb-8">
      {/* Text content */}
      <div className="mb-6 md:mb-8 xl:mb-10 xl:text-center xl:max-w-[1000px] xl:mx-auto">
        <h1 className="text-[32px] leading-[1.2] font-bold text-white mb-3 text-center md:text-[42px] xl:text-[64px] xl:leading-[1.15] xl:mb-4">
          Build your travel profile
        </h1>
        <p className="text-[16px] leading-normal text-gray-400 text-center md:text-[18px] xl:text-[20px]">
          Turn your journeys into a beautiful personal archive.
        </p>
      </div>

      {/* Email input + CTA */}
      <div className="flex flex-col items-center gap-3 mb-12 px-2 md:mb-14 xl:mb-16">
        {/* Mobile: stacked */}
        <input
          type="email"
          placeholder="Enter your email"
          className="w-full max-w-[340px] h-12 rounded-full border border-[#3d3d3d] px-6 bg-black text-white text-[16px] font-medium placeholder:text-[#464646] focus:outline-none focus:border-gray-500 transition-colors md:hidden"
        />
        <button className="w-full max-w-[340px] h-12 rounded-full bg-white text-black font-medium text-[16px] hover:bg-gray-200 transition-colors md:hidden">
          Get early access
        </button>

        {/* Tablet/Desktop: inline input with button (matches Figma 500x60 field) */}
        <div className="hidden md:flex items-center w-full max-w-[500px] h-[60px] rounded-full border border-[#3d3d3d] bg-transparent pl-6 pr-1 focus-within:border-gray-400 transition-colors">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 bg-transparent text-white text-[16px] placeholder:text-gray-500 focus:outline-none"
          />
          <button className="h-[52px] px-8 rounded-full bg-white text-black font-semibold text-[15px] hover:bg-gray-200 transition-colors">
            Get early access
          </button>
        </div>
      </div>

      {/* Phone mockups — iPad: single composed image */}
      <div className="hidden md:block md:mx-auto md:max-w-[738px] xl:hidden">
        <img
          src="/assets/ipad_hero.png"
          alt="Travingat hero preview"
          width={1472}
          height={898}
          className="w-full h-auto"
        />
      </div>

      {/* Phone mockups — Desktop: single SVG composite */}
      <div className="hidden xl:block xl:max-w-[1256px] xl:mx-auto">
        <div className="relative w-full" style={{ aspectRatio: '1256 / 802' }}>
          <img
            src="/images/hero-phones.svg"
            alt="Phone mockups showing travel profiles"
            className="object-contain"
            sizes="(min-width: 1280px) 1256px, 100vw"
          />
        </div>
      </div>

      {/* Phone mockups — Mobile: single image from Figma */}
      <div className="relative mx-auto overflow-hidden md:hidden xl:hidden">
        <img
          src="/images/hero-mobile-mockup.png"
          alt="Phone mockups showing travel profiles"
          width={369}
          height={351}
          className="w-full h-auto"
        />
      </div>
    </section>
  );
}
