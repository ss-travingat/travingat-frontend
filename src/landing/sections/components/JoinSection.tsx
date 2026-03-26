import Image from "next/image";

export default function JoinSection() {
  return (
    <section id="join" className="px-3 py-12 md:px-12 md:py-16 text-center xl:px-24 xl:py-24">
      {/* Image collage */}
      <div className="flex justify-center gap-1 mb-8 md:gap-2 xl:gap-3 xl:mb-12">
        <div className="w-[55px] h-[55px] md:w-[65px] md:h-[65px] xl:w-[80px] xl:h-[80px] rounded-xl overflow-hidden rotate-[-3deg] relative">
          <Image src="/images/join-avatar1-figma.png" alt="Traveler" fill className="object-cover" />
        </div>
        <div className="w-[65px] h-[65px] md:w-[75px] md:h-[75px] xl:w-[90px] xl:h-[90px] rounded-xl overflow-hidden z-10 -mt-1 relative">
          <Image src="/images/join-avatar2-figma.png" alt="Traveler" fill className="object-cover" />
        </div>
        <div className="w-[55px] h-[55px] md:w-[65px] md:h-[65px] xl:w-[80px] xl:h-[80px] rounded-xl overflow-hidden rotate-[2deg] relative">
          <Image src="/images/join-avatar3-figma.png" alt="Traveler" fill className="object-cover" />
        </div>
        <div className="w-[60px] h-[60px] md:w-[70px] md:h-[70px] xl:w-[85px] xl:h-[85px] rounded-xl overflow-hidden rotate-[-1deg] -mt-0.5 relative">
          <Image src="/images/join-avatar4-figma.png" alt="Traveler" fill className="object-cover" />
        </div>
      </div>

      {/* Dotted world map decoration */}
      <div className="mb-6 relative h-8 md:h-10 xl:mb-8 xl:h-12">
        <Image src="/images/dotted-world-map.svg" alt="" fill className="object-contain opacity-20" />
      </div>

      {/* CTA content */}
      <h2 className="text-[32px] leading-[40px] font-semibold text-white mb-3 md:text-[42px] xl:text-[48px] xl:leading-[1.2] xl:mb-6 tracking-[-0.5px]">
        Join travelers from around the world.
      </h2>
      <p className="text-[18px] leading-[26px] text-gray-400 mb-8 md:text-[16px] xl:text-base xl:mb-10 tracking-[-0.2px]">
        Be first to build and share your travel profile.
      </p>

      {/* Email input + CTA - mobile and iPad stacked */}
      <div className="flex flex-col items-center gap-3 xl:hidden">
        <input
          type="email"
          placeholder="Enter your email"
          className="w-full max-w-[300px] md:max-w-[500px] h-12 md:h-[60px] rounded-full border border-[#3d3d3d] px-6 bg-black text-white text-[16px] font-medium placeholder:text-[#464646] focus:outline-none focus:border-gray-500 transition-colors"
        />
        <button className="w-full max-w-[300px] md:max-w-[500px] h-12 md:h-[52px] rounded-full bg-white text-black font-medium text-[16px] hover:bg-gray-200 transition-colors">
          Get early access
        </button>
      </div>

      {/* Email input + CTA - desktop inline */}
      <div className="hidden xl:flex items-center justify-center gap-0 max-w-[500px] mx-auto focus-within:border-gray-400 transition-colors">
        <div className="flex-1 h-14 rounded-full border border-gray-600 flex items-center px-6 bg-transparent rounded-r-none border-r-0">
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full bg-transparent text-white text-[15px] placeholder:text-gray-500 focus:outline-none"
          />
        </div>
        <button className="h-14 px-8 rounded-full bg-white text-black font-semibold text-[15px] hover:bg-gray-200 transition-colors rounded-l-none">
          Get early access
        </button>
      </div>
    </section>
  );
}
