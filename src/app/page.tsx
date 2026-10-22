import Preloader from "@/components/Preloader";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import About from "@/components/About";
import Eyes from "@/components/Eyes";
import Portfolio from "@/components/Portfolio";
import Results from "@/components/Results";
import Toolbox from "@/components/Toolbox";
import Pricing from "@/components/Pricing";
import Inquiry from "@/components/Inquiry";
import Footer from "@/components/Footer";

// Server Component: composes the page. Each interactive section opts into
// the client with its own "use client", so only those ship JavaScript.
export default function Home() {
  return (
    <>
      <Preloader />
      <Navbar />
      <main>
        <Hero />
        <Marquee />
        <About />
        <Eyes />
        <Portfolio />
        <Results />
        <Toolbox />
        <Pricing />
        <Inquiry />
      </main>
      <Footer />
    </>
  );
}
