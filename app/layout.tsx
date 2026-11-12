import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible, Inter } from "next/font/google";
import "./globals.css";

const atkinson = Atkinson_Hyperlegible({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-atkinson",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CareCompanion — Alzheimer's Care & Daily Routine",
  description:
    "A calm, structured daily companion for Alzheimer's patients and their caregivers.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CareCompanion",
  },
};

export const viewport: Viewport = {
  themeColor: "#2E7D32",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${atkinson.variable} ${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-[#FAF7F2] text-[#1F2937] antialiased">
        {children}
      </body>
    </html>
  );
}
