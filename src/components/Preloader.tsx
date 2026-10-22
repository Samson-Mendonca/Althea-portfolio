"use client";

import { useEffect, useRef, useState } from "react";
import { animate, AnimatePresence, motion, useMotionValue, useTransform } from "motion/react";
import { site } from "@/data/site";

const COUNT_SECONDS = 1.8;
const GROW_SECONDS = 0.9;
// Total intro length, so the hero can start its reveal as the card fills the screen.
export const INTRO_SECONDS = COUNT_SECONDS + GROW_SECONDS;

// Ochi's loader: a grey card inside a dark frame brightens to white while the
// counter runs, then grows to fill the screen — becoming the page itself.
export default function Preloader() {
  const [done, setDone] = useState(false);
  const countRef = useRef<HTMLSpanElement>(null);

  // One motion value drives everything: 0→1 = counting, 1→2 = card grows to fullscreen.
  const p = useMotionValue(0);
  const top = useTransform(p, [0, 1, 2], ["34%", "12%", "0%"]);
  const side = useTransform(p, [0, 1, 2], ["26%", "7%", "0%"]);
  const radius = useTransform(p, [0, 1.6, 2], [16, 16, 0]);
  const background = useTransform(p, [0, 1], ["#6b6b6b", "#f1f1f1"]);
  const contentOpacity = useTransform(p, [1.2, 1.7], [1, 0]);

  useEffect(() => {
    let cancelled = false;
    const count = animate(p, 1, {
      duration: COUNT_SECONDS,
      ease: [0.65, 0, 0.35, 1],
      onUpdate: (v) => {
        // Write straight to the DOM: no React re-render per frame.
        if (countRef.current) countRef.current.textContent = String(Math.round(v * 100)).padStart(2, "0");
      },
    });
    count.then(() => {
      if (cancelled) return;
      animate(p, 2, { duration: GROW_SECONDS, ease: [0.77, 0, 0.175, 1] }).then(() => {
        if (cancelled) return;
        window.dispatchEvent(new Event("intro:done")); // tells Providers to unlock scrolling
        setDone(true);
      });
    });
    return () => {
      cancelled = true;
      count.stop();
    };
  }, [p]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          aria-hidden
          className="fixed inset-0 z-[100] bg-ink"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="absolute bottom-0 overflow-hidden text-ink"
            style={{ top, left: side, right: side, borderTopLeftRadius: radius, borderTopRightRadius: radius, background }}
          >
            <motion.div className="flex h-full flex-col justify-between p-5 md:p-8" style={{ opacity: contentOpacity }}>
              <p className="flex items-baseline gap-1.5">
                <span className="font-script text-2xl text-forest">{site.name.first}</span>
                <span className="font-display text-sm tracking-wide">{site.name.last.toUpperCase()}</span>
              </p>
              <p className="font-display text-[clamp(2.5rem,7vw,6.5rem)] uppercase leading-[0.9]">
                Social media
                <br />
                that stops
                <br />
                the scroll
              </p>
              <div className="flex items-end justify-between">
                <span className="text-xs uppercase tracking-widest">Loading</span>
                <span className="font-display text-[clamp(3.5rem,9vw,8rem)] leading-none">
                  <span ref={countRef}>00</span>%
                </span>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
