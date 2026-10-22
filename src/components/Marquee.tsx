"use client";

import { useRef } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
  useVelocity,
} from "motion/react";
import { site } from "@/data/site";

const wrap = (min: number, max: number, v: number) => {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
};

// Ochi's "WE ARE OCHI" band: drifts left, flips direction when you scroll up,
// and speeds up with scroll velocity.
export default function Marquee() {
  const reduce = useReducedMotion();
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const direction = useRef(-1);

  useAnimationFrame((_, delta) => {
    if (reduce) return;
    const v = velocity.get();
    if (v < 0) direction.current = 1;
    else if (v > 0) direction.current = -1;
    const boost = 1 + Math.min(Math.abs(v) / 800, 4);
    baseX.set(baseX.get() + direction.current * 2.2 * boost * (delta / 1000));
  });

  // Content is rendered twice, so wrapping at -50% loops seamlessly.
  const transform = useTransform(baseX, (v) => `translateX(${wrap(-50, 0, v)}%)`);
  const words = site.marquee.flatMap((w) => [w, "•"]);

  return (
    <section aria-label="Services" className="overflow-hidden rounded-t-3xl bg-accent py-8 text-paper md:py-14">
      <motion.div className="flex w-max whitespace-nowrap" style={{ transform }} aria-hidden>
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 items-center">
            {words.map((w, i) => (
              <span
                key={i}
                className="px-[0.18em] font-display text-[clamp(5rem,16vw,15rem)] uppercase leading-[0.85] tracking-tight"
              >
                {w}
              </span>
            ))}
          </div>
        ))}
      </motion.div>
      <p className="sr-only">{site.marquee.join(", ")}</p>
    </section>
  );
}
