"use client";

import { useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { site } from "@/data/site";
import { Roll } from "./ui";

export default function Navbar() {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  // Hide while scrolling down, show again on any scroll up (Ochi behaviour).
  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(y > prev && y > 150);
    setScrolled(y > 40);
  });

  return (
    <>
      <motion.header
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
          scrolled && !open ? "bg-paper/80 backdrop-blur-md" : ""
        }`}
        animate={{ y: hidden && !open ? "-100%" : "0%" }}
        transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
      >
        <nav className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4 md:h-20 md:px-10">
          <a href="#top" className="flex items-baseline gap-1.5" onClick={() => setOpen(false)}>
            <span className="font-script text-2xl text-forest">{site.name.first}</span>
            <span className="font-display text-sm tracking-wide">{site.name.last.toUpperCase()}</span>
          </a>

          <ul className="hidden items-center gap-8 text-[15px] lg:flex">
            {site.nav.map((item) => (
              <li key={item.href}>
                <a href={item.href}>
                  <Roll text={item.label} />
                </a>
              </li>
            ))}
          </ul>

          <a
            href="#inquiry"
            className="hidden rounded-full bg-forest px-5 py-2.5 text-xs uppercase tracking-wider text-paper lg:inline-block"
          >
            <Roll text="Let’s work together" />
          </a>

          <button
            type="button"
            className="relative z-10 flex size-11 flex-col items-center justify-center gap-1.5 lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
          >
            <span
              className={`h-0.5 w-6 bg-current transition-transform duration-300 ${open ? "translate-y-1 rotate-45" : ""}`}
            />
            <span
              className={`h-0.5 w-6 bg-current transition-transform duration-300 ${open ? "-translate-y-1 -rotate-45" : ""}`}
            />
          </button>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="fixed inset-0 z-40 flex flex-col justify-end bg-mist px-4 pb-10 pt-24 lg:hidden"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.5, ease: [0.77, 0, 0.175, 1] }}
          >
            <ul>
              {[...site.nav, { label: "Inquire", href: "#inquiry" }].map((item, i) => (
                <li key={item.href} className="overflow-hidden border-b border-ink/15">
                  <motion.a
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block py-2 font-display text-5xl uppercase"
                    initial={{ y: "100%" }}
                    animate={{ y: "0%" }}
                    transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1], delay: 0.15 + i * 0.05 }}
                  >
                    {item.label}
                  </motion.a>
                </li>
              ))}
            </ul>
            <a href={`mailto:${site.email}`} className="mt-8 text-sm underline underline-offset-4">
              {site.email}
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
