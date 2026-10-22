"use client";

import { motion } from "motion/react";
import { site } from "@/data/site";
import { PillLink, Section } from "./ui";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: "24px" },
  show: { opacity: 1, y: "0px" },
};

export default function About() {
  return (
    <Section id="about" className="bg-lime px-4 py-20 text-ink md:px-10 md:py-28">
      <div className="mx-auto max-w-[1600px]">
        <p className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-ink/70">
          <span className="size-2 rounded-full bg-ink" />
          About me
        </p>
        <motion.p
          className="mt-4 max-w-[22ch] text-[clamp(1.9rem,4.2vw,4rem)] leading-[1.08] md:max-w-[28ch]"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.9, ease: EASE_OUT }}
        >
          {site.about.statement}
        </motion.p>

        <div className="mt-14 grid gap-10 border-t border-ink/20 pt-10 md:mt-20 md:grid-cols-2 md:gap-16">
          {/* Parent "show" cascades to children with staggerChildren */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            transition={{ staggerChildren: 0.12 }}
            className="space-y-5 text-xl leading-relaxed md:text-2xl"
          >
            <motion.p variants={fadeUp} transition={{ duration: 0.8, ease: EASE_OUT }} className="text-sm uppercase tracking-widest text-ink/60">
              What I bring
            </motion.p>
            {site.about.paragraphs.map((p) => (
              <motion.p key={p.slice(0, 20)} variants={fadeUp} transition={{ duration: 0.8, ease: EASE_OUT }}>
                {p}
              </motion.p>
            ))}
            <motion.div variants={fadeUp} transition={{ duration: 0.8, ease: EASE_OUT }} className="pt-4">
              <PillLink href="#results" variant="dark">
                See the results
              </PillLink>
            </motion.div>
          </motion.div>

          <div>
            <p className="text-sm uppercase tracking-widest text-ink/60">Services</p>
            <ul className="mt-4">
              {site.about.services.map((s, i) => (
                <li
                  key={s}
                  className="flex items-baseline justify-between border-b border-ink/20 py-4 font-display text-3xl font-semibold uppercase md:text-5xl"
                >
                  <span>{s}</span>
                  <span className="font-sans text-sm text-ink/60">0{i + 1}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex items-center gap-6 rounded-2xl bg-ink p-6 md:p-8">
              <span className="font-display text-6xl font-bold leading-none text-lime md:text-8xl">8x+</span>
              <span className="text-base leading-snug text-paper/80 md:text-lg">
                ROAS delivered across full-funnel paid campaigns
              </span>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
