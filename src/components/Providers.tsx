"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import Snap from "lenis/snap";
import { MotionConfig } from "motion/react";
import { introSeen } from "./Preloader";

// Client-only wrapper: Lenis smooth scrolling + section snapping + global Motion settings.
// Decision: full motion for everyone, even when the OS asks for reduced motion
// (matches the Ochi reference). To respect the OS setting instead, switch
// reducedMotion to "user" and skip Lenis when matchMedia reports "reduce".
export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // autoRaf: Lenis runs its own requestAnimationFrame loop.
    // anchors: clicks on href="#section" links glide instead of jumping.
    const lenis = new Lenis({ autoRaf: true, anchors: true, lerp: 0.08 });

    // Snap to the top of each section card. "proximity" only snaps when you stop
    // scrolling near a section's start, so long sections still scroll freely.
    // (CSS scroll-snap fights Lenis, which is why the Lenis snap add-on is used.)
    // Parent effects run after children mount, so every [data-snap] is in the DOM.
    const snap = new Snap(lenis, { type: "proximity", distanceThreshold: "30%", duration: 0.8 });
    snap.addElements([...document.querySelectorAll<HTMLElement>("[data-snap]")], {
      align: ["start"],
      ignoreTransform: true, // sections scale while entering; snap to their real position
    });

    // Locked while the preloader plays; Preloader fires "intro:done" when finished.
    // (Child effects run before parent effects, so an event is safer than a shared ref.)
    const start = () => lenis.start();
    if (!introSeen()) {
      window.scrollTo(0, 0);
      lenis.stop();
      window.addEventListener("intro:done", start, { once: true });
    }

    return () => {
      window.removeEventListener("intro:done", start);
      snap.destroy();
      lenis.destroy();
    };
  }, []);

  return <MotionConfig reducedMotion="never">{children}</MotionConfig>;
}
