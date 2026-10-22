import type { Metadata } from "next";
import { Antonio, Hanken_Grotesk } from "next/font/google";
import Providers from "@/components/Providers";
import "./globals.css";

// Ochi uses Founders Grotesk X-Condensed + PP Neue Montreal (both paid licences).
// Closest free equivalents: Antonio (condensed display) + Hanken Grotesk (body).
const antonio = Antonio({ variable: "--font-antonio", weight: ["600", "700"], subsets: ["latin"] });
const hanken = Hanken_Grotesk({ variable: "--font-hanken", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://altheacarvalhomarketing.com"),
  title: "Althea Carvalho — Social Media Manager & Marketing Strategist",
  description:
    "Toronto-based social media manager. Full-funnel social strategy, organic content and email marketing for fashion & lifestyle brands.",
  openGraph: {
    title: "Althea Carvalho — Social Media Manager & Marketing Strategist",
    description: "Real stories, real growth. Organic social, paid media, email and event marketing.",
    url: "/",
    siteName: "Althea Carvalho",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: Preloader adds data-intro-seen to <html> at runtime
    <html lang="en" className={`${antonio.variable} ${hanken.variable} antialiased`} suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
