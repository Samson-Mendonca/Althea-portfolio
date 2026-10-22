"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { site } from "@/data/site";
import { INTRO_SECONDS } from "./Preloader";
import { PillLink } from "./ui";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;
const EASE_IN_OUT = [0.77, 0, 0.175, 1] as const;

// Placeholder "floral" texture until a real photo is set in site.portrait.
const floral =
  "radial-gradient(circle at 30% 25%, #f2c9a8 0 18%, transparent 40%), radial-gradient(circle at 75% 70%, #e58b62 0 15%, transparent 45%), radial-gradient(circle at 60% 20%, #f6eee2 0 10%, transparent 30%), linear-gradient(160deg, #c4451c, #8f2f12)";

function Line({ children, delay }: { children: React.ReactNode; delay: number }) {
  return (
    <span className="block overflow-hidden pb-[0.04em]">
      <motion.span
        className="flex items-center gap-[0.08em]"
        initial={{ y: "105%" }}
        animate={{ y: "0%" }}
        transition={{ duration: 1, ease: EASE_OUT, delay }}
      >
        {children}
      </motion.span>
    </span>
  );
}

export default function Hero() {
  const t = INTRO_SECONDS - 0.3;

  return (
    <section id="top" className="relative flex min-h-svh flex-col justify-between px-4 pt-24 md:px-10 md:pt-32">
      <div className="mx-auto grid w-full max-w-[1600px] grid-cols-[1fr_auto] items-start gap-4 md:gap-10">
        <div>
          <motion.p
            className="mb-4 max-w-[16rem] text-xs uppercase tracking-[0.25em] text-muted md:mb-6 md:max-w-none md:text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: t }}
          >
            {site.role}
          </motion.p>

          <h1 className="font-display text-[clamp(4.5rem,17vw,15rem)] uppercase leading-[0.86] tracking-tight md:text-[min(13vw,15rem)]">
            <Line delay={t}>{site.name.first}</Line>
            <Line delay={t + 0.1}>
              {/* Ochi's signature image chip that wipes open inside the headline */}
              <motion.span
                aria-hidden
                className="inline-block h-[0.66em] w-[0.9em] shrink-0 rounded-[0.08em]"
                style={{ background: floral }}
                initial={{ clipPath: "inset(0 100% 0 0 round 0.08em)" }}
                animate={{ clipPath: "inset(0 0% 0 0 round 0.08em)" }}
                transition={{ duration: 1, ease: EASE_IN_OUT, delay: t + 0.6 }}
              />
              {site.name.last}
            </Line>
          </h1>
        </div>

        <motion.div
          className="relative aspect-[4/5] w-28 overflow-hidden rounded-xl sm:w-40 md:w-[24vw] md:max-w-[380px] md:rounded-2xl"
          style={site.portrait ? undefined : { background: floral }}
          initial={{ clipPath: "inset(100% 0 0 0)" }}
          animate={{ clipPath: "inset(0% 0 0 0)" }}
          transition={{ duration: 1.2, ease: EASE_IN_OUT, delay: t + 0.2 }}
        >
          {site.portrait ? (
            <Image
              src={site.portrait}
              alt={`Portrait of ${site.name.first} ${site.name.last}`}
              fill
              priority
              sizes="(min-width: 768px) 24vw, 160px"
              className="object-cover"
            />
          ) : (
            <span className="absolute inset-0 grid place-items-center font-script text-5xl text-cream md:text-8xl">
              AC
            </span>
          )}
        </motion.div>
      </div>

      <motion.div
        className="mx-auto mb-6 mt-10 grid w-full max-w-[1600px] gap-6 border-t border-ink/20 pt-5 md:mb-10 md:grid-cols-[1fr_1.4fr_auto] md:items-center"
        initial={{ opacity: 0, y: "16px" }}
        animate={{ opacity: 1, y: "0px" }}
        transition={{ duration: 0.8, ease: EASE_OUT, delay: t + 0.5 }}
      >
        <p className="text-sm uppercase tracking-wide text-muted">Based in {site.location}</p>
        <p className="max-w-xl text-base md:text-lg">{site.tagline}</p>
        <div className="flex flex-wrap gap-3">
          <PillLink href="#portfolio">See my work</PillLink>
          <PillLink href="#inquiry" variant="light">
            Get in touch
          </PillLink>
        </div>
      </motion.div>
    </section>
  );
}
