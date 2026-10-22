"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useMotionValue, useScroll, useSpring, useTransform } from "motion/react";
import { site } from "@/data/site";
import { heroDelay } from "./Preloader";
import { PillLink, Section } from "./ui";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;
const EASE_IN_OUT = [0.77, 0, 0.175, 1] as const;

// Placeholder texture in Ochi's greens until a real photo is set in site.portrait.
const texture =
  "radial-gradient(circle at 30% 25%, #cdea68 0 14%, transparent 42%), radial-gradient(circle at 75% 75%, #2f7a6d 0 18%, transparent 48%), linear-gradient(160deg, #004d43, #002a25)";

export default function Hero() {
  const t = heroDelay(); // after the intro card on first load, almost immediately afterwards
  const ref = useRef<HTMLDivElement>(null);

  // Scroll parallax: the hero drifts down at half speed, so the next section
  // (rounded top, higher z-index) slides up over it — Ochi's overlap effect.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "45%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);

  // Hover tilt: pointer position over the name → rotateX/Y, smoothed by springs.
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const rotateX = useSpring(rx, { stiffness: 150, damping: 15 });
  const rotateY = useSpring(ry, { stiffness: 150, damping: 15 });

  function onPointerMove(e: React.PointerEvent<HTMLElement>) {
    const box = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - box.left) / box.width - 0.5; // -0.5 … 0.5
    const py = (e.clientY - box.top) / box.height - 0.5;
    ry.set(px * 16);
    rx.set(-py * 28);
  }
  function onPointerLeave() {
    rx.set(0);
    ry.set(0);
  }

  return (
    <Section id="top" className="mt-2.5 bg-forest text-paper">
      <div ref={ref}>
      <motion.div
        style={{ y, scale }}
        className="mx-auto flex min-h-[calc(100svh-1.25rem)] max-w-[1600px] flex-col justify-between px-4 pt-24 md:px-10 md:pt-28"
      >
        {/* items-end: credentials sit on the portrait's baseline, directly above the name */}
        <div className="flex items-end justify-between gap-6">
          <motion.div
            className="max-w-md md:max-w-3xl"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE_OUT, delay: t + 0.3 }}
          >
            <p className="text-base font-medium uppercase leading-snug tracking-[0.12em] md:text-2xl">{site.role}</p>
            <p className="mt-1 text-sm uppercase tracking-[0.12em] opacity-70 md:text-lg">Based in {site.location}</p>
          </motion.div>

          {/* Portrait, top right — wipes up into view */}
          <motion.div
            className="relative aspect-[4/5] w-[min(34vw,26svh)] shrink-0 overflow-hidden rounded-xl md:w-[min(22vw,36svh)] md:rounded-2xl"
            style={site.portrait ? undefined : { background: texture }}
            initial={{ clipPath: "inset(100% 0 0 0)" }}
            animate={{ clipPath: "inset(0% 0 0 0)" }}
            transition={{ duration: 1.2, ease: EASE_IN_OUT, delay: t + 0.15 }}
          >
            {site.portrait ? (
              <Image
                src={site.portrait}
                alt={`Portrait of ${site.name.first} ${site.name.last}`}
                fill
                priority
                sizes="(min-width: 768px) 22vw, 34vw"
                className="object-cover"
              />
            ) : (
              <span className="absolute inset-0 grid place-items-center font-display text-6xl font-semibold text-lime md:text-9xl">
                AC
              </span>
            )}
          </motion.div>
        </div>

        {/* Name on ONE line. Antonio Bold measures ≈6.1em for "ALTHEA CARVALHO",
            so font-size = (viewport − card gaps − padding − scrollbar) ÷ 6.3, capped on wide screens. */}
        <h1
          onPointerMove={onPointerMove}
          onPointerLeave={onPointerLeave}
          className="mb-8 mt-1 font-display font-bold text-[min(calc((100vw_-_4rem)/6.3),15rem)] uppercase leading-[0.86] tracking-tight [perspective:900px] md:text-[min(calc((100vw_-_7rem)/6.3),15rem)]"
        >
          <motion.span
            className="block whitespace-nowrap will-change-transform"
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          >
            <span className="block overflow-hidden pb-[0.04em]">
              <motion.span
                className="flex items-center gap-[0.22em]"
                initial={{ y: "105%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 1, ease: EASE_OUT, delay: t }}
              >
                <span>{site.name.first}</span>
                <span>{site.name.last}</span>
              </motion.span>
            </span>
          </motion.span>
        </h1>

        <motion.div
          className="mb-6 grid gap-6 border-t border-paper/20 pt-5 md:mb-10 md:grid-cols-[1fr_auto] md:items-center"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE_OUT, delay: t + 0.45 }}
        >
          <p className="max-w-3xl text-lg leading-snug md:text-xl xl:text-2xl">{site.tagline}</p>
          <div className="flex flex-wrap gap-3">
            <PillLink href="#portfolio" variant="lime">See my work</PillLink>
            <PillLink href="#inquiry" variant="outline">
              Get in touch
            </PillLink>
          </div>
        </motion.div>
      </motion.div>
      </div>
    </Section>
  );
}
