import LandingHeader from "@landing/components/LandingHeader";
import LandingFooter from "@landing/components/LandingFooter";

export default function LandingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen w-full bg-black text-white overflow-x-hidden">
      <LandingHeader />
      {children}
      <LandingFooter />
    </div>
  );
}
