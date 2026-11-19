"use client";

import { useEffect, useRef } from "react";
import { animate, motion, useInView } from "motion/react";
import { site } from "@/data/site";
import { Section, SectionTitle } from "./ui";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;
const maxRoas = Math.max(...site.roas.map((r) => r.value));

function Stat({ value, decimals, suffix, label }: (typeof site.stats)[number]) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const final = value.toFixed(decimals);

  // Count up once the number scrolls into view; writes to the DOM, not state.
  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration: 1.8,
      ease: EASE_OUT,
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = v.toFixed(decimals);
      },
    });
    return () => controls.stop();
  }, [inView, value, decimals]);

  return (
    <div className="border-t border-ink/25 pt-4">
      <p className="font-display text-[clamp(3.5rem,8vw,7.5rem)] font-bold leading-none text-ink">
        {/* Server renders the final value, so no-JS and screen readers see the real number */}
        <span ref={ref}>{final}</span>
        {suffix}
      </p>
      <p className="mt-2 text-sm uppercase tracking-widest text-ink/70">{label}</p>
    </div>
  );
}

export default function Results() {
  return (
    <Section id="results" className="bg-lime px-4 py-20 text-ink md:px-10 md:py-32">
      <div className="mx-auto max-w-[1600px]">
        <SectionTitle kicker="Proof in numbers" title="Results" />

        <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
          {site.stats.map((s) => (
            <Stat key={s.label} {...s} />
          ))}
        </div>

        <div className="mt-20 grid gap-4 md:grid-cols-2">
          {site.metrics.map((m, i) => (
            <motion.div
              key={m.title}
              className="rounded-2xl bg-paper/70 p-6 md:p-8"
              initial={{ opacity: 0, y: "30px" }}
              whileInView={{ opacity: 1, y: "0px" }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, ease: EASE_OUT, delay: (i % 2) * 0.1 }}
            >
              <h3 className="text-xs uppercase tracking-[0.2em] text-ink/70">{m.title}</h3>
              <dl className="mt-4 divide-y divide-ink/15">
                {m.rows.map(([k, v]) => (
                  <div key={k} className="flex items-baseline justify-between gap-4 py-3">
                    <dt className="text-ink/70">{k}</dt>
                    <dd className="font-display text-2xl tracking-wide md:text-3xl">{v}</dd>
                  </div>
                ))}
              </dl>
            </motion.div>
          ))}
        </div>

        <div className="mt-20">
          <h3 className="text-xs uppercase tracking-[0.2em] text-ink/70">Return on ad spend — by campaign</h3>
          <ul className="mt-6 space-y-5">
            {site.roas.map((r, i) => (
              <li key={r.campaign} className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 md:grid-cols-[16rem_1fr_5rem]">
                <span className="text-ink/80">{r.campaign}</span>
                {/* The track watches the viewport (a scaleX(0) bar has no area to observe)
                    and passes "show" down to the bar through variants. */}
                <motion.span
                  className="order-last col-span-2 h-3 overflow-hidden rounded-full bg-ink/10 md:order-none md:col-span-1"
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                >
                  {/* scaleX from the left edge: GPU-friendly "width" animation */}
                  <motion.span
                    className="block h-full origin-left rounded-full bg-forest"
                    variants={{
                      hidden: { scaleX: 0 },
                      show: { scaleX: r.value / maxRoas },
                    }}
                    transition={{ duration: 1.2, ease: EASE_OUT, delay: i * 0.08 }}
                  />
                </motion.span>
                <span className="text-right font-display text-2xl">{r.value.toFixed(2)}×</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
