"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "motion/react";

function Eye({ rotate }: { rotate: MotionValue<string> }) {
  return (
    <div className="grid size-[clamp(8rem,17vw,15rem)] place-items-center rounded-full bg-paper shadow-[inset_0_-10px_30px_rgb(0_0_0/0.08)]">
      <div className="relative grid size-[66%] place-items-center rounded-full bg-ink">
        {/* Only this layer rotates — the shine dot orbits toward the cursor */}
        <motion.div className="absolute inset-0" style={{ transform: rotate }}>
          <span className="absolute left-1/2 top-[10%] size-[22%] -translate-x-1/2 rounded-full bg-paper" />
        </motion.div>
        <span className="relative text-[clamp(0.6rem,1vw,0.85rem)] uppercase tracking-widest text-paper/80">Look</span>
      </div>
    </div>
  );
}

// Ochi's cursor-following eyes, recast as Althea's promise: content that stops the scroll.
export default function Eyes() {
  const ref = useRef<HTMLDivElement>(null);
  const angle = useMotionValue(135);
  const smooth = useSpring(angle, { stiffness: 120, damping: 18 });
  const rotate = useTransform(smooth, (a) => `rotate(${a}deg)`);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const box = ref.current?.getBoundingClientRect();
      if (!box) return;
      const dx = e.clientX - (box.left + box.width / 2);
      const dy = e.clientY - (box.top + box.height / 2);
      // atan2 gives 0° at "east"; +90 because the dot sits at "north".
      let next = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
      // Take the shortest way round so the spring never spins 350°.
      const cur = angle.get();
      next += Math.round((cur - next) / 360) * 360;
      angle.set(next);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [angle]);

  return (
    <section aria-label="Stop the scroll" className="relative grid min-h-[70svh] place-items-center overflow-hidden bg-cream px-4 py-20 md:min-h-svh">
      <p
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 select-none text-center font-display text-[clamp(4.5rem,19vw,20rem)] uppercase leading-[0.82] text-accent/90"
      >
        Stop the
        <br />
        scroll
      </p>
      <div ref={ref} className="relative flex gap-3 md:gap-8">
        <Eye rotate={rotate} />
        <Eye rotate={rotate} />
      </div>
      <p className="absolute bottom-8 left-1/2 w-max max-w-[90vw] -translate-x-1/2 text-center text-sm uppercase tracking-[0.2em] text-ink/70">
        Content people can’t look away from
      </p>
    </section>
  );
}
