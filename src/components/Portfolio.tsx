"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { site, type Media } from "@/data/site";
import { Section, SectionTitle } from "./ui";

type Service = (typeof site.portfolio)[number];

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

// Categories without media (e.g. Event Marketing today) are hidden until content exists.
const services = site.portfolio.filter((s) => s.media.length > 0);

// "10 videos", "8 photos", or "3 videos · 2 photos" for mixed folders.
function countLabel(media: Media[]) {
  const videos = media.filter((m) => m.type === "video").length;
  const photos = media.length - videos;
  const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;
  return [videos && plural(videos, "video"), photos && plural(photos, "photo")].filter(Boolean).join(" · ");
}

const coverOf = (m: Media) => (m.type === "video" ? m.poster : m.src);

function MediaTile({ item, alt }: { item: Media; alt: string }) {
  return (
    // break-inside-avoid: keeps each tile whole inside the CSS-columns masonry
    <figure className="mb-4 break-inside-avoid overflow-hidden rounded-xl bg-paper/10">
      {item.type === "video" ? (
        <video
          src={item.src}
          poster={item.poster}
          width={item.width}
          height={item.height}
          controls
          playsInline
          preload="none" // nothing downloads until the visitor presses play
          className="h-auto w-full"
        />
      ) : (
        <Image
          src={item.src}
          alt={alt}
          width={item.width}
          height={item.height}
          sizes="(min-width: 1024px) 26rem, (min-width: 640px) 45vw, 90vw"
          className="h-auto w-full"
        />
      )}
    </figure>
  );
}

// Native <dialog>: focus trapping, Esc-to-close and an inert page come free.
function GalleryModal({ service, onClose }: { service: Service | null; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (service && !ref.current?.open) ref.current?.showModal();
  }, [service]);

  return (
    <dialog
      ref={ref}
      className="modal m-auto max-h-[92svh] w-[min(80rem,calc(100vw-2rem))] overflow-y-auto rounded-2xl bg-ink p-0 text-paper"
      aria-labelledby="gallery-title"
      data-lenis-prevent
      onClose={() => {
        ref.current?.querySelectorAll("video").forEach((v) => v.pause());
        setTimeout(onClose, 300); // wait for the exit transition before unmounting content
      }}
      onClick={(e) => e.target === ref.current && ref.current?.close()}
    >
      {/* Padding lives on this wrapper so only true backdrop clicks hit the <dialog> itself */}
      {service && (
        <div className="p-6 md:p-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 id="gallery-title" className="font-display text-4xl font-semibold uppercase md:text-6xl">
                {service.name}
              </h3>
              <p className="mt-2 max-w-lg text-lg opacity-70">
                {service.blurb} <span className="whitespace-nowrap">({countLabel(service.media)})</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => ref.current?.close()}
              className="shrink-0 rounded-full border border-paper/60 px-4 py-2 text-xs uppercase tracking-wider"
            >
              Close
            </button>
          </div>
          {/* CSS columns = masonry: portrait reels and landscape images pack without gaps */}
          <div className="mt-8 columns-1 gap-4 sm:columns-2 lg:columns-3">
            {service.media.map((m, i) => (
              <MediaTile key={m.src} item={m} alt={`${service.name} example ${i + 1}`} />
            ))}
          </div>
        </div>
      )}
    </dialog>
  );
}

function Card({ service, index, onOpen }: { service: Service; index: number; onOpen: () => void }) {
  const hasVideo = service.media.some((m) => m.type === "video");
  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.9, ease: EASE_OUT, delay: (index % 2) * 0.1 }}
    >
      <div className="mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
        <span className="size-2.5 rounded-full bg-forest" />
        {String(index + 1).padStart(2, "0")} — {service.name}
      </div>

      {/* "rest" → "hover" variants propagate to the cover, the shade and every letter */}
      <motion.button
        type="button"
        onClick={onOpen}
        initial="rest"
        animate="rest"
        whileHover="hover"
        whileFocus="hover"
        className="relative block aspect-[4/3] w-full cursor-pointer overflow-hidden rounded-2xl text-left"
        aria-label={`Open ${service.name} examples (${countLabel(service.media)})`}
      >
        <motion.span
          className="absolute inset-0"
          variants={{ rest: { scale: 1 }, hover: { scale: 1.06 } }}
          transition={{ duration: 0.8, ease: EASE_OUT }}
        >
          <Image
            src={coverOf(service.media[0])}
            alt=""
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </motion.span>
        {/* Darkens the cover on hover so the light title stays readable on any photo */}
        <motion.span
          aria-hidden
          className="absolute inset-0 bg-ink/55"
          variants={{ rest: { opacity: 0 }, hover: { opacity: 1 } }}
          transition={{ duration: 0.4 }}
        />

        <span className="absolute bottom-4 left-4 z-20 rounded-full bg-paper/90 px-4 py-2 text-xs uppercase tracking-wider text-ink">
          {hasVideo ? "▶ " : ""}
          {countLabel(service.media)}
        </span>

        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center overflow-hidden px-4"
        >
          <span className="flex flex-wrap justify-center font-display text-[clamp(2.75rem,5vw,6rem)] font-bold uppercase leading-none text-paper">
            {[...service.name].map((ch, i) => (
              <span key={i} className="overflow-hidden">
                <motion.span
                  className="inline-block whitespace-pre"
                  variants={{ rest: { y: "110%" }, hover: { y: "0%" } }}
                  transition={{ duration: 0.5, ease: EASE_OUT, delay: i * 0.025 }}
                >
                  {ch}
                </motion.span>
              </span>
            ))}
          </span>
        </span>
      </motion.button>

      <p className="mt-4 max-w-md text-lg opacity-80">{service.blurb}</p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {service.tags.map((t) => (
          <li key={t} className="rounded-full border border-ink/30 px-3 py-1 text-xs uppercase tracking-wide">
            {t}
          </li>
        ))}
      </ul>
    </motion.article>
  );
}

export default function Portfolio() {
  const [active, setActive] = useState<Service | null>(null);

  return (
    <Section id="portfolio" className="bg-paper px-4 py-20 text-ink md:px-10 md:py-32">
      <div className="mx-auto max-w-[1600px]">
        <div className="border-b border-ink/20 pb-6">
          <SectionTitle kicker="Selected work" title="Portfolio" />
          <p className="mt-4 max-w-lg text-lg opacity-80 md:text-xl">
            A selection of work for brands across fashion & lifestyle. Tap a service to see examples.
          </p>
        </div>
        <div className="mt-12 grid gap-x-6 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <Card key={s.id} service={s} index={i} onOpen={() => setActive(s)} />
          ))}
        </div>
      </div>
      <GalleryModal service={active} onClose={() => setActive(null)} />
    </Section>
  );
}
