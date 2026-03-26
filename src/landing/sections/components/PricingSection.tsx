"use client";

import { useMemo, useState } from "react";

type PlanVariant = {
  price: number;
  description: string;
};

type Plan = {
  name: "Explorer" | "Traveller" | "Nomad";
  monthly: PlanVariant;
  annual: PlanVariant;
  buttonClass: string;
  features: string[];
};

const plans: Plan[] = [
  {
    name: "Explorer",
    monthly: {
      price: 0,
      description: "For casual travelers starting their journey.",
    },
    annual: {
      price: 0,
      description: "Great for trying out Frames X component and templates.",
    },
    buttonClass: "bg-white text-black hover:bg-[#ececec]",
    features: [
      "Unlimited country flags",
      "Upload photos to 3 countries",
      "Max 10 photos per country",
      "Create folders for unlimited countries (photos locked)",
      "Public profile link",
      '"Built with Travingat" badge on all pages',
    ],
  },
  {
    name: "Traveller",
    monthly: {
      price: 7,
      description: "For serious travelers building their travel identity.",
    },
    annual: {
      price: 9,
      description: "Best for professional freelancers and small teams.",
    },
    buttonClass: "bg-[#5a45f9] text-white hover:bg-[#6956ff]",
    features: [
      "Everything in Explorer",
      "Unlimited countries",
      "Unlimited photos and videos per country",
      "Drag & drop reorder of countries and collections",
      "Remove Travingat badge",
      "1 premium template (2 total)",
    ],
  },
  {
    name: "Nomad",
    monthly: {
      price: 15,
      description: "For creators, storytellers, and travel personalities.",
    },
    annual: {
      price: 19,
      description: "Best for growing large company or enterprise design team.",
    },
    buttonClass: "bg-[#fda221] text-white hover:bg-[#ffb33e]",
    features: [
      "Everything in Traveller",
      "6 premium profile templates (total)",
      "Password-protected collections",
      'Featured on Travingat "Featured Profiles" page',
      "Early access to new features",
      "Public sharable links for countries and collections",
    ],
  },
];

function FeatureItem({ feature }: { feature: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-px inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1e1e1e] text-white">
        <span
          className="material-symbols-rounded text-[14px]"
          style={{ fontVariationSettings: "'FILL' 1, 'wght' 700, 'GRAD' 0, 'opsz' 20" }}
          aria-hidden="true"
        >
          check
        </span>
      </span>
      <span className="text-[16px] leading-6 tracking-[-0.096px] text-white">{feature}</span>
    </li>
  );
}

export default function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false);
  const onboardingUrl = "/onboarding";

  const cardData = useMemo(
    () =>
      plans.map((plan) => {
        const variant = isAnnual ? plan.annual : plan.monthly;
        return {
          ...plan,
          price: variant.price,
          description: variant.description,
        };
      }),
    [isAnnual],
  );

  return (
    <section id="pricing" className="px-4 py-14 md:px-12 md:py-16 xl:px-24 xl:py-20">
      <div className="mx-auto w-full max-w-[738px] space-y-12 xl:max-w-[1200px]">
        <div className="flex flex-col items-center gap-8 text-center">
          <div className="space-y-4 text-white">
            <h2 className="text-[40px] font-semibold leading-[1.12] tracking-[-0.5px] md:text-[44px]">Pricing</h2>
            <p className="text-[18px] leading-[1.45] tracking-[-0.198px] text-white">
              Built for travelers at every stage: from first trips to premium profile presence.
            </p>
          </div>

          <div className="inline-flex items-center rounded-full bg-[#1e1e1e] p-1">
            <button
              type="button"
              onClick={() => setIsAnnual(false)}
              className={`rounded-full px-4 py-2.5 text-[14px] font-medium leading-5 tracking-[-0.084px] transition ${!isAnnual ? "bg-white text-black" : "text-white"
                }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setIsAnnual(true)}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-[14px] font-medium leading-5 tracking-[-0.084px] transition ${isAnnual ? "bg-white text-black" : "text-white"
                }`}
            >
              Annual
              <span className="rounded-full bg-[#2a9919] px-2 py-0.5 text-[10px] font-medium leading-4 text-white">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        <div className="space-y-6 xl:grid xl:grid-cols-3 xl:gap-6 xl:space-y-0">
          {cardData.map((plan) => (
            <article key={plan.name} className="rounded-[24px] border border-[#212121] bg-[#111111] p-6 md:p-8 xl:min-w-[340px]">
              <div className="space-y-8">
                <div className="flex flex-col gap-6 xl:min-h-[236px]">
                  <div className="space-y-4 xl:min-h-[160px]">
                    <h3 className="text-[24px] font-semibold leading-8 tracking-[-0.5px] text-white">{plan.name}</h3>

                    <div className="flex items-baseline gap-1">
                      <span className="text-[44px] font-semibold leading-[1.1] tracking-[-0.5px] text-white">${plan.price}</span>
                      <span className="text-[18px] font-medium leading-[26px] tracking-[-0.198px] text-[#656565]">/per month</span>
                    </div>

                    <p className="text-[18px] leading-[26px] tracking-[-0.198px] text-white">{plan.description}</p>
                  </div>

                  <a
                    href={onboardingUrl}
                    className={`mt-auto inline-flex w-full items-center justify-center rounded-full px-[18px] py-[10px] text-[16px] font-medium leading-6 tracking-[-0.096px] transition ${plan.buttonClass}`}
                  >
                    Get Started
                  </a>
                </div>

                <div className="border border-dashed border-[#303030]" />

                <ul className="space-y-5">
                  {plan.features.map((feature) => (
                    <FeatureItem key={`${plan.name}-${feature}`} feature={feature} />
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
