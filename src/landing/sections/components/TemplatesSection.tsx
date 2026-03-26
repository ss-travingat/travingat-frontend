import Image from "next/image";

export default function TemplatesSection() {
  return (
    <section id="templates" className="px-3 py-12 md:px-12 md:py-16 xl:px-24 xl:py-20">
      <h2 className="text-[32px] leading-[1.2] font-bold text-white mb-8 text-center md:text-[42px] md:mb-10 xl:text-[48px] xl:text-center xl:max-w-[800px] xl:mx-auto xl:mb-16">
        Premium templates to elevate your profile
      </h2>

      {/* Desktop: Full composite SVG image */}
      <div className="hidden xl:block xl:max-w-[1200px] xl:mx-auto">
        <div className="relative w-full" style={{ aspectRatio: '1536 / 1464' }}>
          <Image src="/images/templates-desktop.svg" alt="Premium templates preview" fill className="object-contain" priority />
        </div>
      </div>

      {/* Mobile and iPad: Template 1 */}
      <div className="mb-4 xl:hidden">
        {/* 3D Laptop on stone with gold badge */}
        <div className="mb-4 relative w-full md:max-w-[600px] md:mx-auto">
          <Image src="/images/templates-desktop-pos1-figma.png" alt="Template preview on laptop" width={3000} height={2250} className="w-full h-auto" />
        </div>

        {/* Phone mockup */}
        <div className="md:max-w-[600px] md:mx-auto">
          <Image src="/images/templates-mockup2.png" alt="Template 1 phone preview" width={738} height={951} className="w-full h-auto" />
        </div>
      </div>

      {/* Mobile and iPad: Template 2 */}
      <div className="xl:hidden">
        {/* 3D Laptop on stone */}
        <div className="mb-4 relative w-full md:max-w-[600px] md:mx-auto">
          <Image src="/images/templates-laptop2-figma.png" alt="Pro template preview" width={3000} height={2250} className="w-full h-auto" />
        </div>

        {/* Phone mockup 2 */}
        <div className="md:max-w-[600px] md:mx-auto">
          <Image src="/images/templates-mobmock2.png" alt="Template 2 phone preview" width={738} height={951} className="w-full h-auto" />
        </div>
      </div>
    </section>
  );
}
