"use client";

import { useEffect, useRef, useState } from "react";
import { animate, AnimatePresence, motion } from "motion/react";

// How long the intro takes, so the hero can start right as the curtain lifts.
export const INTRO_SECONDS = 1.9;

export default function Preloader() {
  const [done, setDone] = useState(false);
  const countRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // Reduced-motion users never see the overlay (motion-reduce:hidden below).
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Update the DOM directly each frame instead of setState → no 60 re-renders/sec.
    const controls = animate(0, 100, {
      duration: INTRO_SECONDS - 0.4,
      ease: [0.77, 0, 0.175, 1],
      onUpdate: (v) => {
        if (countRef.current) countRef.current.textContent = String(Math.round(v)).padStart(2, "0");
      },
      onComplete: () => setDone(true),
    });
    return () => controls.stop();
  }, []);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          aria-hidden
          className="fixed inset-0 z-[100] flex flex-col justify-between bg-ink p-6 text-paper motion-reduce:hidden md:p-10"
          exit={{ y: "-100%" }}
          transition={{ duration: 0.8, ease: [0.77, 0, 0.175, 1] }}
        >
          <p className="text-sm">
            <span className="font-script text-2xl text-accent-soft">Althea</span>{" "}
            <span className="font-display tracking-wide">CARVALHO</span>
          </p>
          <p className="font-display text-[clamp(3rem,9vw,8rem)] uppercase leading-[0.9]">
            Real stories,
            <br />
            real growth.
          </p>
          <div className="flex items-end justify-between">
            <span className="text-sm uppercase tracking-widest text-paper/60">Loading</span>
            <span className="font-display text-[clamp(4rem,12vw,10rem)] leading-none">
              <span ref={countRef}>00</span>%
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
