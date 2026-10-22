"use client";

import { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "motion/react";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

// Every page section is a rounded card with a small gap around it (the dark page
// background shows through). As a card scrolls in it grows from 94% to full size,
// and `data-snap` registers it with the Lenis snap in Providers.
export function Section({
  id,
  label,
  className = "",
  children,
}: {
  id?: string;
  label?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 0.55"] });
  const scale = useTransform(scrollYProgress, [0, 1], [0.94, 1]);
  return (
    <motion.section
      ref={ref}
      id={id}
      aria-label={label}
      data-snap
      style={{ scale }}
      className={`relative mx-2.5 mt-2.5 origin-top overflow-hidden rounded-[1.75rem] ${className}`}
    >
      {children}
    </motion.section>
  );
}

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

// Ochi-style heading: small dotted label above a huge condensed title.
// Colours come from the section (currentColor), so it works on any background.
export function SectionTitle({ kicker, title }: { kicker: string; title: string }) {
  return (
    <h2>
      <span className="mb-3 flex items-center gap-2 text-sm uppercase tracking-[0.2em] opacity-70">
        <span className="size-2 rounded-full bg-current" />
        {kicker}
      </span>
      <Reveal>
        <span className="font-display text-[clamp(3.5rem,11vw,10rem)] font-semibold uppercase leading-[0.9] tracking-tight">
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

// Ochi-style pill button with the dot that grows on hover.
export function PillLink({
  href,
  children,
  variant = "dark",
}: {
  href: string;
  children: string;
  variant?: "dark" | "lime" | "outline";
}) {
  const [styles, dot] = {
    dark: ["bg-ink text-paper", "bg-ink"],
    lime: ["bg-lime text-ink", "bg-lime"],
    outline: ["border border-current", "bg-lime"],
  }[variant];
  return (
    <a
      href={href}
      className={`group inline-flex items-center gap-4 rounded-full py-2 pl-6 pr-2 text-sm uppercase tracking-wide ${styles}`}
    >
      <Roll text={children} />
      <span className="grid size-8 place-items-center rounded-full bg-current">
        <span className={`size-2 rounded-full ${dot} transition-transform duration-300 ease-(--ease-out) group-hover:scale-[2.2]`} />
      </span>
    </a>
  );
}
