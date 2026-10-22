import type { Metadata } from "next";
import { Anton, Jost, Pinyon_Script } from "next/font/google";
import Providers from "@/components/Providers";
import "./globals.css";

const anton = Anton({ variable: "--font-anton", weight: "400", subsets: ["latin"] });
const jost = Jost({ variable: "--font-jost", subsets: ["latin"] });
const pinyon = Pinyon_Script({ variable: "--font-pinyon", weight: "400", subsets: ["latin"] });

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
    <html lang="en" className={`${anton.variable} ${jost.variable} ${pinyon.variable} antialiased`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
