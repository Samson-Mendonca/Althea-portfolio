"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { site, type Video } from "@/data/site";
import { SectionTitle } from "./ui";

type Service = (typeof site.portfolio)[number];

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

const gradients = [
  "radial-gradient(circle at 20% 30%, #cdea68, transparent 45%), linear-gradient(135deg, #004d43, #002a25)",
  "radial-gradient(circle at 80% 20%, #4b4b4b, transparent 50%), linear-gradient(135deg, #212121, #3c3c3c)",
  "radial-gradient(circle at 70% 75%, #004d43, transparent 45%), linear-gradient(135deg, #cdea68, #9fbf3b)",
  "radial-gradient(circle at 30% 70%, #cdea68, transparent 40%), linear-gradient(135deg, #e7e7e7, #bdbdbd)",
];

function youtubeEmbed(url: string) {
  const id = url.match(/(?:youtu\.be\/|[?&]v=|youtube\.com\/(?:embed|shorts)\/)([\w-]{6,})/)?.[1];
  return id ? `https://www.youtube-nocookie.com/embed/${id}?rel=0&playsinline=1` : null;
}

function VideoTile({ video }: { video: Video }) {
  const embed = video.kind === "youtube" && video.url ? youtubeEmbed(video.url) : null;
  return (
    <figure>
      <div className="aspect-[9/16] max-h-[60vh] w-full overflow-hidden rounded-xl bg-ink/10">
        {embed ? (
          <iframe src={embed} title={video.title} className="size-full" allow="encrypted-media; picture-in-picture" allowFullScreen />
        ) : video.url ? (
          <video src={video.url} controls playsInline preload="metadata" className="size-full object-cover" />
        ) : (
          <div className="grid size-full place-items-center p-6 text-center text-sm uppercase tracking-widest text-muted">
            Video coming soon
          </div>
        )}
      </div>
      <figcaption className="mt-2 text-sm text-muted">{video.title}</figcaption>
    </figure>
  );
}

// Native <dialog>: focus trapping, Esc-to-close and an inert page come free.
function VideoModal({ service, onClose }: { service: Service | null; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (service && !ref.current?.open) ref.current?.showModal();
  }, [service]);

  return (
    <dialog
      ref={ref}
      className="modal m-auto w-[min(56rem,calc(100vw-2rem))] max-h-[90svh] overflow-y-auto rounded-2xl bg-paper p-0 text-ink"
      aria-labelledby="video-modal-title"
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
            <h3 id="video-modal-title" className="font-display text-4xl uppercase md:text-6xl">
              {service.name}
            </h3>
            <button
              type="button"
              onClick={() => ref.current?.close()}
              className="rounded-full border border-ink px-4 py-2 text-xs uppercase tracking-wider"
            >
              Close
            </button>
          </div>
          <p className="mt-2 max-w-lg text-muted">{service.blurb}</p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {service.videos.map((v) => (
              <VideoTile key={v.title} video={v} />
            ))}
          </div>
        </div>
      )}
    </dialog>
  );
}

function Card({ service, index, onOpen }: { service: Service; index: number; onOpen: () => void }) {
  const count = service.videos.length;
  return (
    <motion.article
      initial={{ opacity: 0, y: "40px" }}
      whileInView={{ opacity: 1, y: "0px" }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.9, ease: EASE_OUT, delay: (index % 2) * 0.1 }}
    >
      <div className="mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
        <span className="size-2.5 rounded-full bg-ink" />
        {String(index + 1).padStart(2, "0")} — {service.name}
      </div>

      {/* "rest" → "hover" variants propagate to the letters inside */}
      <motion.button
        type="button"
        onClick={onOpen}
        initial="rest"
        animate="rest"
        whileHover="hover"
        whileFocus="hover"
        className="relative block aspect-[4/3] w-full cursor-pointer text-left"
        aria-label={`Watch ${service.name} examples`}
      >
        <motion.span
          className="absolute inset-0 overflow-hidden rounded-2xl"
          style={{ background: gradients[index % gradients.length] }}
          variants={{ rest: { scale: 1 }, hover: { scale: 0.96 } }}
          transition={{ duration: 0.6, ease: EASE_OUT }}
        >
          <span className="absolute bottom-4 left-4 rounded-full bg-paper/90 px-4 py-2 text-xs uppercase tracking-wider text-ink">
            ▶ Watch {count} video{count > 1 ? "s" : ""}
          </span>
        </motion.span>

        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center overflow-hidden px-4"
        >
          <span className={`flex flex-wrap justify-center font-display text-[clamp(3rem,7vw,7rem)] uppercase leading-none ${index % 4 < 2 ? "text-lime" : "text-forest"}`}>
            {[...service.name].map((ch, i) => (
              <span key={i} className="overflow-hidden">
                <motion.span
                  className="inline-block whitespace-pre"
                  variants={{
                    rest: { y: "110%" },
                    hover: { y: "0%" },
                  }}
                  transition={{ duration: 0.5, ease: EASE_OUT, delay: i * 0.025 }}
                >
                  {ch}
                </motion.span>
              </span>
            ))}
          </span>
        </span>
      </motion.button>

      <p className="mt-4 max-w-md text-muted">{service.blurb}</p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {service.tags.map((t) => (
          <li key={t} className="rounded-full border border-ink/40 px-3 py-1 text-xs uppercase tracking-wide">
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
    <section id="portfolio" className="relative -mt-6 rounded-t-3xl bg-paper px-4 py-20 md:px-10 md:py-32">
      <div className="mx-auto max-w-[1600px]">
        <div className="border-b border-ink/20 pb-6">
          <SectionTitle kicker="the" title="Portfolio" />
          <p className="mt-4 max-w-md text-muted">
            A selection of work for brands across fashion & lifestyle. Tap a service to watch examples.
          </p>
        </div>
        <div className="mt-12 grid gap-x-8 gap-y-16 md:grid-cols-2">
          {site.portfolio.map((s, i) => (
            <Card key={s.id} service={s} index={i} onOpen={() => setActive(s)} />
          ))}
        </div>
      </div>
      <VideoModal service={active} onClose={() => setActive(null)} />
    </section>
  );
}
