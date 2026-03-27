/* eslint-disable @next/next/no-img-element */

export default function WorldMapSection() {
  return (
    <section className="py-12 md:py-16 xl:px-0 xl:py-20">
      {/* Title */}
      <h2 className="text-center text-[32px] leading-[1.2] font-semibold text-white mb-8 md:text-[42px] md:mb-10 md:max-w-[700px] md:mx-auto xl:px-0 xl:text-[48px] xl:text-center xl:max-w-[800px] xl:mx-auto xl:mb-12 tracking-[-1px]">
        One place for everywhere you&apos;ve explored
      </h2>

      {/* Illustration area */}
      <div className="relative mx-0 xl:max-w-[1300px] xl:mx-auto xl:h-[550px] overflow-hidden">
        {/* Mobile and iPad: single image with gradient + text overlay */}
        <div className="xl:hidden relative">
          <img
            src="/images/travel-mobile-mockup.png"
            alt="One place for everywhere you've explored"
            width={393}
            height={450}
            className="w-full h-auto block"
          />
          {/* Gradient overlay */}
          <div
            className="absolute inset-x-0 bottom-0 h-[45%] pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(180deg, rgba(10,10,10,0) 0%, rgba(10,10,10,0.75) 55%, rgba(10,10,10,1) 100%)",
            }}
          />
          {/* Text */}
          <div className="absolute inset-x-0 bottom-0 pb-7 flex flex-col items-center gap-1">
            <p className="text-[28px] font-bold text-white tracking-[-0.5px] leading-none">
              Rachel, 28
            </p>
            <p className="text-[15px] font-medium">
              <span className="text-[#a8a8a8]">From </span>
              <span className="text-white">Switzerland</span>
            </p>
          </div>
        </div>

        {/* Desktop: full illustration */}
        <div className="hidden xl:block relative w-full h-[550px]">
        {/* World map background */}
        <div className="absolute inset-0">
          <img
            src="/images/dotted-world-map.svg"
            alt=""
            className="object-contain opacity-[0.18]"
          />
        </div>

        {/* Central explore.png image (already contains tags + pins) */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-[320px] xl:w-[660px] h-full z-10">
          <img
            src="/images/traveler-rachel-figma.png"
            alt="Traveler exploring the world"
            className="object-contain object-bottom"
          />
        </div>

        {/* Gradient overlay at bottom for name */}
        <div
          className="absolute left-1/2 -translate-x-1/2 bottom-0 w-[320px] xl:w-[550px] h-[200px] flex flex-col items-center justify-end z-20 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgba(10,10,10,0) 0%, rgba(10,10,10,0.7) 60%, rgba(10,10,10,1) 100%)",
          }}
        >
          <div className="flex flex-col items-center gap-1 pb-1">
            <div className="flex items-center gap-1 text-white">
              <span className="text-[24px] xl:text-[32px] font-bold tracking-[-0.5px]">
                Rachel,
              </span>
              <span className="text-[24px] xl:text-[32px] font-bold tracking-[-0.5px]">
                28
              </span>
            </div>
            <div className="flex items-center gap-1 text-[14px] xl:text-[16px] font-medium tracking-[-0.1px]">
              <span className="text-[#a8a8a8]">From</span>
              <span className="text-white">Switzerland</span>
            </div>
          </div>
        </div>

        {/* 28 Countries card - left side */}
        <div className="absolute top-[20%] left-[4.6%] bg-[#111] border border-[#2a2a2a] rounded-[20px] p-6 w-[320px] overflow-hidden z-20 hidden xl:flex flex-col gap-6">
          <p className="text-[20px] font-medium text-white tracking-[-0.5px]">
            28 Countries
          </p>
          <div className="flex flex-col gap-2">
            {/* Row 1 */}
            <div className="flex gap-2">
              <div className="flex-1 aspect-square rounded-[10px] overflow-hidden relative">
                <img
                  src="/images/country-greece-figma.png"
                  alt="Greece"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent from-70% to-black/50" />
                <span className="absolute bottom-1.5 left-1.5 text-[12px] font-black text-white drop-shadow-sm">
                  Greece
                </span>
              </div>
              <div className="flex-1 aspect-square rounded-[10px] overflow-hidden relative">
                <img
                  src="/images/country-thailand-figma.png"
                  alt="Thailand"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent from-70% to-black/50" />
                <span className="absolute bottom-1.5 left-1.5 text-[12px] font-black text-white drop-shadow-sm">
                  Thailand
                </span>
              </div>
              <div className="flex-1 aspect-square rounded-[10px] overflow-hidden relative">
                <img
                  src="/images/country-switzerland-figma.png"
                  alt="Switzerland"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent from-70% to-black/50" />
                <span className="absolute bottom-1.5 left-1.5 text-[12px] font-black text-white drop-shadow-sm">
                  Switzerland
                </span>
              </div>
            </div>
            {/* Row 2 */}
            <div className="flex gap-2">
              <div className="flex-1 aspect-square rounded-[10px] overflow-hidden relative">
                <img
                  src="/images/map-italy.jpg"
                  alt="Italy"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent from-70% to-black/50" />
                <span className="absolute bottom-1.5 left-1.5 text-[12px] font-black text-white drop-shadow-sm">
                  Italy
                </span>
              </div>
              <div className="flex-1 aspect-square rounded-[10px] overflow-hidden relative">
                <img
                  src="/images/map-nepal.jpg"
                  alt="Nepal"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent from-70% to-black/50" />
                <span className="absolute bottom-1.5 left-1.5 text-[12px] font-black text-white drop-shadow-sm">
                  Nepal
                </span>
              </div>
              <div className="flex-1 aspect-square rounded-[10px] overflow-hidden relative">
                <img
                  src="/images/map-france.jpg"
                  alt="France"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent from-70% to-black/50" />
                <span className="absolute bottom-1.5 left-1.5 text-[12px] font-black text-white drop-shadow-sm">
                  France
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 16 Collections card - right side */}
        <div className="absolute top-[33%] right-[4.6%] bg-[#111] border border-[#2a2a2a] rounded-[20px] p-6 w-[320px] overflow-hidden z-20 hidden xl:flex flex-col gap-6">
          <p className="text-[20px] font-medium text-white tracking-[-0.5px]">
            16 Collections
          </p>
          <div className="flex flex-col gap-2">
            {/* Row 1 */}
            <div className="flex gap-2">
              <div className="flex-1 h-[85px] rounded-[10px] overflow-hidden relative">
                <img
                  src="/images/collection-streetshots.jpg"
                  alt="Street Shots"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent from-70% to-black/50" />
                <span className="absolute bottom-2 left-2 text-[12px] font-black text-white drop-shadow-sm">
                  Street Shots
                </span>
              </div>
              <div className="flex-1 h-[85px] rounded-[10px] overflow-hidden relative">
                <img
                  src="/images/collection-nightportraits.jpg"
                  alt="Night Portraits"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent from-70% to-black/50" />
                <span className="absolute bottom-2 left-2 text-[12px] font-black text-white drop-shadow-sm">
                  Night Portraits
                </span>
              </div>
            </div>
            {/* Row 2 */}
            <div className="flex gap-2">
              <div className="flex-1 h-[88px] rounded-[10px] overflow-hidden relative">
                <img
                  src="/images/collection-skiing.jpg"
                  alt="Swiss Skiing"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent from-70% to-black/50" />
                <span className="absolute bottom-2 left-2 text-[12px] font-black text-white drop-shadow-sm">
                  Swiss Skiing
                </span>
              </div>
              <div className="flex-1 h-[88px] rounded-[10px] overflow-hidden relative">
                <img
                  src="/images/collection-franceroadtrip.jpg"
                  alt="France Road Trip"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent from-70% to-black/50" />
                <span className="absolute bottom-2 left-2 text-[12px] font-black text-white drop-shadow-sm">
                  France Road Trip
                </span>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}
