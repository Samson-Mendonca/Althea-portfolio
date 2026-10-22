"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

// Ochi's signature entrance: text rises out of an invisible mask.
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  // Observe the mask, not the text: the text starts clipped by overflow:hidden,
  // and IntersectionObserver counts clipped elements as not visible.
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  return (
    <span ref={ref} className={`block overflow-hidden ${className}`}>
      <motion.span
        className="block"
        initial={{ y: "105%" }}
        animate={{ y: inView ? "0%" : "105%" }}
        transition={{ duration: 0.9, ease: EASE_OUT, delay }}
      >
        {children}
      </motion.span>
    </span>
  );
}

// Small script word + huge display title, e.g. "proof in / RESULTS".
export function SectionTitle({ kicker, title, light = false }: { kicker: string; title: string; light?: boolean }) {
  return (
    <h2 className={`relative ${light ? "text-paper" : "text-ink"}`}>
      <span className="font-script text-accent block text-[clamp(2rem,4vw,3.5rem)] leading-none -mb-[0.3em] relative z-10">
        {kicker}
      </span>
      <Reveal>
        <span className="font-display uppercase text-[clamp(3.5rem,11vw,10rem)] leading-[0.9] tracking-tight">
          {title}
        </span>
      </Reveal>
    </h2>
  );
}

// Rolling-text label: hover swaps in an identical copy from below.
export function Roll({ text }: { text: string }) {
  return (
    <span className="roll">
      <span data-text={text}>{text}</span>
    </span>
  );
}

// Ochi-style pill button with the arrow dot that grows on hover.
export function PillLink({
  href,
  children,
  variant = "dark",
}: {
  href: string;
  children: string;
  variant?: "dark" | "light" | "accent";
}) {
  const [styles, dot] = {
    dark: ["bg-ink text-paper", "bg-ink"],
    light: ["border border-ink text-ink", "bg-paper"],
    accent: ["bg-accent text-paper", "bg-accent"],
  }[variant];
  return (
    <a
      href={href}
      className={`group inline-flex items-center gap-4 rounded-full pl-6 pr-2 py-2 text-sm uppercase tracking-wide ${styles}`}
    >
      <Roll text={children} />
      <span className="grid size-8 place-items-center rounded-full bg-current">
        <span className={`size-2 rounded-full ${dot} transition-transform duration-300 ease-(--ease-out) group-hover:scale-[2.2]`} />
      </span>
    </a>
  );
}
