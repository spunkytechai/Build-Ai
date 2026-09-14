import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Build Ai — From Idea to Building",
  description: "AI-native building intelligence and design platform.",
};

export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return <html lang="en"><body>{children}</body></html>;
}
