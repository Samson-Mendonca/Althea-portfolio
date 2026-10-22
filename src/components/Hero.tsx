"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useMotionValue, useScroll, useSpring, useTransform } from "motion/react";
import { site } from "@/data/site";
import { INTRO_SECONDS } from "./Preloader";
import { PillLink } from "./ui";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;
const EASE_IN_OUT = [0.77, 0, 0.175, 1] as const;

// Placeholder texture in Ochi's greens until a real photo is set in site.portrait.
const texture =
  "radial-gradient(circle at 30% 25%, #cdea68 0 14%, transparent 42%), radial-gradient(circle at 75% 75%, #2f7a6d 0 18%, transparent 48%), linear-gradient(160deg, #004d43, #002a25)";

export default function Hero() {
  const t = INTRO_SECONDS - 0.35; // start revealing as the loader card finishes growing
  const ref = useRef<HTMLElement>(null);

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
    <section ref={ref} id="top" className="relative overflow-hidden">
      <motion.div
        style={{ y, scale }}
        className="mx-auto flex min-h-svh max-w-[1600px] flex-col justify-between px-4 pt-24 md:px-10 md:pt-28"
      >
        <div className="flex items-start justify-between gap-6">
          <motion.div
            className="max-w-xs pt-2 md:max-w-sm"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE_OUT, delay: t + 0.3 }}
          >
            <p className="text-xs uppercase tracking-[0.25em] text-muted md:text-sm">{site.role}</p>
            <p className="mt-4 hidden text-sm uppercase tracking-wide md:block">Based in {site.location}</p>
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
              <span className="absolute inset-0 grid place-items-center font-script text-5xl text-lime md:text-8xl">
                AC
              </span>
            )}
          </motion.div>
        </div>

        {/* Name on ONE line. Anton measures ≈7.4em for "ALTHEA ▢ CARVALHO",
            so font-size = available width ÷ 7.4 (capped on very wide screens). */}
        <h1
          onPointerMove={onPointerMove}
          onPointerLeave={onPointerLeave}
          className="my-8 font-display text-[min(calc((100vw_-_2rem)/7.4),13.5rem)] uppercase leading-[0.86] tracking-tight [perspective:900px] md:text-[min(calc((100vw_-_5rem)/7.4),13.5rem)]"
        >
          <motion.span
            className="block whitespace-nowrap will-change-transform"
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          >
            <span className="block overflow-hidden pb-[0.04em]">
              <motion.span
                className="flex items-center gap-[0.12em]"
                initial={{ y: "105%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 1, ease: EASE_OUT, delay: t }}
              >
                {site.name.first}
                {/* Ochi's signature image chip that wipes open inside the headline */}
                <motion.span
                  aria-hidden
                  className="inline-block h-[0.66em] w-[0.9em] shrink-0 rounded-[0.08em]"
                  style={{ background: texture }}
                  initial={{ clipPath: "inset(0 100% 0 0 round 0.08em)" }}
                  animate={{ clipPath: "inset(0 0% 0 0 round 0.08em)" }}
                  transition={{ duration: 1, ease: EASE_IN_OUT, delay: t + 0.5 }}
                />
                {site.name.last}
              </motion.span>
            </span>
          </motion.span>
        </h1>

        <motion.div
          className="mb-6 grid gap-6 border-t border-ink/20 pt-5 md:mb-10 md:grid-cols-[1fr_auto] md:items-center"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE_OUT, delay: t + 0.45 }}
        >
          <p className="max-w-xl text-base md:text-lg">{site.tagline}</p>
          <div className="flex flex-wrap gap-3">
            <PillLink href="#portfolio">See my work</PillLink>
            <PillLink href="#inquiry" variant="light">
              Get in touch
            </PillLink>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
