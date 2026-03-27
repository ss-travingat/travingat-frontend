/* eslint-disable @next/next/no-img-element */

export default function CollectionsSection() {
  return (
    <section className="px-3 py-12 md:px-12 md:py-16 xl:hidden">
      <div>
        {/* Text */}
        <div>
          <h2 className="text-[32px] leading-[1.2] font-bold text-white mb-4 text-center md:text-[42px] md:mb-6 md:max-w-[600px] md:mx-auto">
            Create collections that tell a story
          </h2>
          <p className="text-[14px] leading-[1.6] text-gray-400 mb-8 text-center md:text-[16px] md:leading-[1.8] md:mb-10 md:max-w-[520px] md:mx-auto">
            Create collections for photography, journeys, moods—or anything you like.
          </p>
        </div>

        {/* Phone mockup image */}
        <div className="relative mx-auto md:max-w-[600px]">
          <img
            src="/images/collections-mobile-mockup.png"
            alt="Create collections that tell a story"
            width={369}
            height={369}
            className="w-full h-auto"
          />
        </div>
      </div>
    </section>
  );
}
