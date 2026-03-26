import {
  HeroSection,
  OrganizeSection,
  CollectionsSection,
  WorldMapSection,
  TestimonialSection,
  FeaturedProfiles,
  TemplatesSection,
  PricingSection,
  JoinSection,
} from "@landing/sections";

export default function LandingPage() {
  return (
    <main>
      <HeroSection />
      <OrganizeSection />
      <CollectionsSection />
      <WorldMapSection />
      <TestimonialSection />
      <FeaturedProfiles />
      <TemplatesSection />
      <PricingSection />
      <JoinSection />
    </main>
  );
}
