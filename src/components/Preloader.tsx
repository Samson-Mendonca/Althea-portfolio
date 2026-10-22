"use client";

import { useEffect, useRef, useState } from "react";
import { animate, AnimatePresence, motion, useMotionValue, useTransform } from "motion/react";

const COUNT_SECONDS = 1.8;
const GROW_SECONDS = 0.9;
const INTRO_SECONDS = COUNT_SECONDS + GROW_SECONDS;

// The intro plays once per page load. When it finishes it flags <html data-intro-seen>;
// that flag lives as long as the page, so remounts (hot reload, re-renders) never
// replay it, while a real reload starts with a fresh <html> and plays it again.
export function introSeen() {
  return typeof document !== "undefined" && "introSeen" in document.documentElement.dataset;
}

// When the hero should start revealing: as the card finishes growing, or right away.
export function heroDelay() {
  return introSeen() ? 0.15 : INTRO_SECONDS - 0.35;
}

// Hero card geometry (Section: 0.625rem gap, 1.75rem radius) — the loader card ends
// exactly there, so it hands over to the hero without a visible jump.
const GAP = 10;
const RADIUS = 28;

// Ochi's loader: a grey card inside a dark frame changes colour while the counter
// runs, then grows to become the hero card.
export default function Preloader() {
  const [done, setDone] = useState(false);
  const countRef = useRef<HTMLSpanElement>(null);

  // One motion value drives everything: 0→1 = counting, 1→2 = card grows into the hero.
  const p = useMotionValue(0);
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const top = useTransform(p, (v) =>
    v <= 1 ? `${lerp(34, 12, v)}%` : `calc(${lerp(12, 0, v - 1)}% + ${lerp(0, GAP, v - 1)}px)`,
  );
  const side = useTransform(p, (v) =>
    v <= 1 ? `${lerp(24, 7, v)}%` : `calc(${lerp(7, 0, v - 1)}% + ${lerp(0, GAP, v - 1)}px)`,
  );
  const bottom = useTransform(p, [1, 2], [0, GAP]);
  const radius = useTransform(p, [0, 1, 2], [16, 16, RADIUS]);
  const background = useTransform(p, [0, 1], ["#4b4b4b", "#004d43"]);
  const contentOpacity = useTransform(p, [1.15, 1.6], [1, 0]);

  useEffect(() => {
    if (introSeen()) return; // already played this session
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
        document.documentElement.dataset.introSeen = "";
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
          className="preloader fixed inset-0 z-[100] bg-void"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          <motion.div
            className="absolute overflow-hidden text-paper"
            style={{ top, left: side, right: side, bottom, borderRadius: radius, background }}
          >
            <motion.div className="flex h-full flex-col justify-between p-5 md:p-8" style={{ opacity: contentOpacity }}>
              <p className="font-display text-lg font-semibold uppercase tracking-wide">Althea Carvalho</p>
              <p className="font-display text-[clamp(2.5rem,7vw,6.5rem)] font-semibold uppercase leading-[0.92]">
                Elevate your
                <br />
                brand’s socials
                <br />
                <span className="text-lime">& marketing</span>
              </p>
              <div className="flex items-end justify-between gap-6">
                <span className="max-w-[16rem] text-sm leading-snug opacity-80">
                  Contact me to elevate your brand’s socials and marketing experience.
                </span>
                <span className="font-display text-[clamp(3.5rem,9vw,8rem)] font-semibold leading-none">
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
