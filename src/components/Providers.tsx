"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { MotionConfig } from "motion/react";

// Client-only wrapper: Lenis smooth scrolling + global Motion settings.
// Decision: full motion for everyone, even when the OS asks for reduced motion
// (matches the Ochi reference). To respect the OS setting instead, switch
// reducedMotion to "user" and skip Lenis when matchMedia reports "reduce".
export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // autoRaf: Lenis runs its own requestAnimationFrame loop.
    // anchors: clicks on href="#section" links glide instead of jumping.
    const lenis = new Lenis({ autoRaf: true, anchors: true, lerp: 0.08 });

    // Locked while the preloader plays; Preloader fires "intro:done" when finished.
    // (Child effects run before parent effects, so an event is safer than a shared ref.)
    window.scrollTo(0, 0);
    lenis.stop();
    const start = () => lenis.start();
    window.addEventListener("intro:done", start, { once: true });

    return () => {
      window.removeEventListener("intro:done", start);
      lenis.destroy();
    };
  }, []);

  return <MotionConfig reducedMotion="never">{children}</MotionConfig>;
}
