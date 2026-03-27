/* eslint-disable @next/next/no-img-element */

export default function OrganizeSection() {
  return (
    <>
      {/* Desktop: Combined Organize + Collections with SVG */}
      <section className="hidden xl:block xl:px-24 xl:py-20">
        <div
          className="relative max-w-[1280px] mx-auto"
          style={{ aspectRatio: "1280 / 1360" }}
        >
          <img
            src="/images/organize-desktop.svg"
            alt="Organize travels by country and create collections"
            fill
            className="object-contain"
            priority
          />
          {/* Organize text — top left */}
          <div className="absolute left-0 top-[13.2%] max-w-[520px] z-10">
            <h2 className="text-[48px] leading-[1.2] font-bold text-white mb-6">
              Organize your travels by country
            </h2>
            <p className="text-[18px] leading-[1.8] text-gray-400">
              Add countries to your profile and neatly group photos and videos
              from each journey.
            </p>
          </div>
          {/* Collections text — bottom right */}
          <div className="absolute right-0 top-[69.1%] max-w-[520px] z-10">
            <h2 className="text-[48px] leading-[1.2] font-bold text-white mb-6">
              Create collections that tell a story
            </h2>
            <p className="text-[18px] leading-[1.8] text-gray-400">
              Create collections for photography, journeys, moods—or anything
              you like.
            </p>
          </div>
        </div>
      </section>

      {/* Mobile and iPad: Organize section */}
      <section className="px-3 py-12 md:px-12 md:py-16 xl:hidden">
        {/* Text */}
        <div>
          <h2 className="text-[32px] leading-[1.2] font-bold text-white mb-4 text-center md:text-[42px] md:mb-6 md:max-w-[600px] md:mx-auto">
            Organize your travels by country
          </h2>
          <p className="text-[14px] leading-[1.6] text-gray-400 mb-8 text-center md:text-[16px] md:leading-[1.8] md:mb-10 md:max-w-[520px] md:mx-auto">
            Add countries to your profile and neatly group photos and videos from each journey.
          </p>
        </div>

        {/* Phone mockup image */}
        <div className="relative mx-auto md:max-w-[600px]">
          <img
            src="/images/organize-mobile-mockup.png"
            alt="Organize travels by country"
            width={369}
            height={369}
            className="w-full h-auto"
          />
        </div>
      </section>
    </>
  );
}
