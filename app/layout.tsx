import type { Metadata } from "next";
import "./globals.css";
import "./landing.css";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://build-ai-lime-theta.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "Build Ai — From Idea to Building",
    template: "%s · Build Ai",
  },
  description: "AI-native building intelligence, site analysis, regulatory feasibility and design platform.",
  applicationName: "Build Ai",
  keywords: ["AEC", "architecture", "building design", "site intelligence", "regulatory feasibility", "India"],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return <html lang="en"><body>{children}</body></html>;
}
