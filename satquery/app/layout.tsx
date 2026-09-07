import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SatQuery AI | Multimodal SAR Intelligence & InSAR Analytics • SIH 2026",
  description:
    "Interactive Synthetic Aperture Radar (SAR) Multimodal Intelligence Platform for Smart India Hackathon 2026. Automated target extraction, backscatter profiling, and mission reporting.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full w-full overflow-hidden bg-[#f7f4ee] text-[#232220] font-claude flex flex-col">{children}</body>
    </html>
  );
}
