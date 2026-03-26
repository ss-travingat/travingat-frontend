import LandingRootLayout from "@landing/LandingLayout";

export default function LandingGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <LandingRootLayout>{children}</LandingRootLayout>;
}
