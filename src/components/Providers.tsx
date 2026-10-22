"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { MotionConfig } from "motion/react";

// Client-only wrapper: smooth scrolling + global reduced-motion policy.
export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    let lenis: Lenis | null = null;

    // Lenis takes over scrolling, so it must be off for reduced-motion users.
    const sync = () => {
      if (mq.matches) {
        lenis?.destroy();
        lenis = null;
      } else if (!lenis) {
        lenis = new Lenis({ autoRaf: true, anchors: true });
      }
    };

    sync();
    mq.addEventListener("change", sync);
    return () => {
      mq.removeEventListener("change", sync);
      lenis?.destroy();
    };
  }, []);

  // reducedMotion="user": Motion drops transform animations, keeps opacity fades.
  // Only works for shorthand props (y, scale, scaleX), not raw `transform` strings,
  // which is why every component animates with shorthands.
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
