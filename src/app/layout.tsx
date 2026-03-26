import type { Metadata } from "next";
import { Geist_Mono, Inter_Tight } from "next/font/google";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const interDisplay = Inter_Tight({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
});

export const metadata: Metadata = {
  title: "Travingat - Build Your Travel Profile",
  description: "Turn your journeys into a beautiful personal archive. Build your travel profile with Travingat.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" />
      </head>
      <body
        className={`${geistMono.variable} ${interDisplay.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
