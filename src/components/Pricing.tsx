"use client";

import { motion } from "motion/react";
import { site } from "@/data/site";
import { PillLink, SectionTitle } from "./ui";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

export default function Pricing() {
  return (
    <section id="pricing" className="relative -mt-6 rounded-t-3xl bg-mist px-4 py-20 md:px-10 md:py-32">
      <div className="mx-auto max-w-[1600px]">
        <SectionTitle kicker="the" title="Pricing" />

        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {site.pricing.map((p, i) => (
            // Outer element owns the scroll-in transform, inner owns the CSS hover lift,
            // so the two transforms never overwrite each other.
            <motion.div
              key={p.name}
              className="flex"
              initial={{ opacity: 0, y: "40px" }}
              whileInView={{ opacity: 1, y: "0px" }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, ease: EASE_OUT, delay: i * 0.1 }}
            >
            <article
              className={`relative flex w-full flex-col rounded-3xl p-8 transition-transform duration-500 ease-(--ease-out) hover:-translate-y-2 md:p-10 ${
                p.featured ? "bg-ink text-paper" : "bg-paper"
              }`}
            >
              <span
                className={`w-max rounded-full px-3 py-1 text-xs uppercase tracking-wider ${
                  p.featured ? "bg-lime text-ink" : "border border-ink/30"
                }`}
              >
                {p.featured ? "Most popular" : "Package"}
              </span>
              <h3 className="mt-6 font-display text-4xl uppercase md:text-5xl">{p.name}</h3>
              <p className="mt-4">
                <span className="font-display text-6xl">{p.price}</span>
                <span className={p.featured ? "text-paper/70" : "text-muted"}> / month</span>
              </p>
              <ul className={`mt-8 flex-1 divide-y ${p.featured ? "divide-paper/15" : "divide-ink/10"}`}>
                {p.features.map((f) => (
                  <li key={f} className="flex gap-3 py-3">
                    <span className={p.featured ? "text-lime" : "text-forest"}>✦</span>
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <PillLink href="#inquiry" variant={p.featured ? "forest" : "dark"}>
                  Start with this
                </PillLink>
              </div>
            </article>
            </motion.div>
          ))}
        </div>

        <p className="mt-8 max-w-2xl text-muted">*{site.pricingNote}</p>
      </div>
    </section>
  );
}
