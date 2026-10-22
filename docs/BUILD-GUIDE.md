# How this site was built: a step-by-step guide

This guide follows the build in the order it happened. Each step covers **what** was done, **why**, and the **React / Next.js practice** behind it. It assumes you already know React (components, props, hooks, JSX). The focus is on the parts that go beyond the basics.

Open the files as you read. Every section names the file it talks about.

---

## Step 0 — Research before code

Before writing any code, two sites were studied in the browser:

1. **The current site** (Lovable build). The words, numbers, prices and form fields were pulled from the rendered page. Fonts, colors and media sources came from `getComputedStyle` and the JS bundle. That showed the portfolio videos were still empty placeholders, so nothing was lost by rebuilding.
2. **The reference (ochi.design).** Its colors were read from computed styles: `#212121`, `#CDEA68`, `#F1F1F1`, `#E7E7E7`, `#004D43`. Its signature moves were noted: the loader card, masked text reveals, the image chip inside the headline, the marquee band, cursor-following eyes, letter-by-letter hover titles, rolling nav links, and sections that overlap as you scroll.

**Practice:** the content becomes data first and the visual ideas become a feature list. Then each Ochi feature maps to something that makes sense for one person instead of an agency. For example, Ochi's "PLAY" eyes became "STOP THE SCROLL", which echoes Althea's own copy.

---

## Step 1 — Scaffold the project

```bash
npx create-next-app@latest althea-portfolio --ts --tailwind --eslint --app --src-dir --turbopack --import-alias "@/*"
npm i motion lenis
```

The folder name `Althea-Portfolio` has capital letters, and npm package names can't. So the app was generated in a lowercase subfolder and moved up a level.

What you get, and why it matters:

| Piece | Why |
|---|---|
| **App Router** (`src/app`) | Files map to routes. `layout.tsx` wraps every page, and `page.tsx` is the `/` route. |
| **React Server Components** by default | Components render on the server and ship **zero JS** unless you opt in with `"use client"`. |
| **Turbopack** | Fast dev server and builds. |
| **React Compiler** (`reactCompiler: true` in `next.config.ts`) | Memoizes automatically, so this codebase has **no `useMemo` / `useCallback`**. With the compiler on, adding them by hand is noise. |
| **Tailwind v4** | Config lives in CSS (`@theme`), not in a `tailwind.config.js`. |

**Libraries:** `motion` (formerly Framer Motion) handles React-friendly animation. `lenis` handles smooth scrolling. Nothing else was added. Each dependency has to earn its place.

---

## Step 2 — Install agent skills

Three skills went into `.claude/skills/`: `animate` (Emil Kowalski's animation decision order), `accessible-animation`, and `vercel-react-best-practices`. Each was scanned with `skillspector` before use. They shaped decisions you'll see below: animate only `transform`/`opacity`/`clip-path`, use strong ease-out curves, prefer native platform features, and don't re-render per frame.

---

## Step 3 — Content as data: `src/data/site.ts`

Every word, number, price and link lives in **one typed object**. Components never hard-code copy. They `.map()` over data.

```ts
export const site = {
  name: { first: "Althea", last: "Carvalho" },
  stats: [{ value: 5.2, decimals: 1, suffix: "M", label: "Accounts reached" }, ...],
  pricing: [...],
};
```

**Practices:**
- **Single source of truth.** Changing a price means editing one line, not hunting through JSX.
- **Types come from the data.** `type Service = (typeof site.portfolio)[number]` in `Portfolio.tsx` derives the type from the array, so types and data can't drift apart.
- **Stable keys.** Lists use real identifiers (`key={s.id}`, `key={tool}`), not array indexes, wherever one exists. Indexes are only used for letters of a word, which never reorder.

---

## Step 4 — Design tokens and fonts

### `src/app/globals.css`, Tailwind v4 `@theme`

```css
@theme inline {
  --color-ink: #212121;
  --color-lime: #cdea68;
  --color-forest: #004d43;
  --font-display: var(--font-anton), "Arial Narrow", sans-serif;
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
}
```

Each `--color-*` token automatically becomes a utility class: `bg-lime`, `text-forest`, `border-ink/20`. Switching from orange to Ochi's palette was mostly a token rename plus new values. That's the payoff of tokens: **the design changes in one place**.

### `src/app/layout.tsx`, `next/font`

```tsx
const anton = Anton({ variable: "--font-anton", weight: "400", subsets: ["latin"] });
<html className={`${anton.variable} ...`}>
```

`next/font` downloads Google fonts **at build time** and self-hosts them. That means no request to Google at runtime, no layout shift, and a CSS variable you can plug into the tokens. `layout.tsx` also exports `metadata` (title, description, Open Graph), which Next turns into `<head>` tags. No `react-helmet` is needed.

---

## Step 5 — Providers: the client boundary at the top (`Providers.tsx`)

`layout.tsx` is a Server Component, but smooth scrolling needs `window`. So a small **client component** wraps the app:

```tsx
"use client";
export default function Providers({ children }) {
  useEffect(() => {
    const lenis = new Lenis({ autoRaf: true, anchors: true, lerp: 0.08 });
    lenis.stop();
    const start = () => lenis.start();
    window.addEventListener("intro:done", start, { once: true });
    return () => { window.removeEventListener("intro:done", start); lenis.destroy(); };
  }, []);
  return <MotionConfig reducedMotion="never">{children}</MotionConfig>;
}
```

**Practices:**
1. **`children` passes through the client boundary.** Server Components rendered as `children` of a client component *stay* Server Components. Wrapping the app in a client provider does **not** turn the whole app into client code.
2. **Every effect cleans up.** `lenis.destroy()` and `removeEventListener`. In development React Strict Mode mounts components twice, so a missing cleanup would create two Lenis instances.
3. **Effect order: children run before parents.** The Preloader (a child) starts its effect before Providers (the parent) has created Lenis. So a shared ref would be `null` at that moment. The fix is a decoupled **DOM event** (`intro:done`): Preloader announces, Providers listens. Remember this ordering rule; it explains a lot of "why is my ref null" bugs.
4. `<MotionConfig>` sets Motion defaults for the whole tree. You chose **full motion for everyone**, so it's `"never"`. To respect the OS "reduce motion" setting later, switch to `"user"`. That only affects **shorthand** props (`y`, `scale`), not raw `transform` strings. That's why every animation here uses shorthands.

---

## Step 6 — Page composition (`src/app/page.tsx`)

```tsx
export default function Home() {
  return (<>
    <Preloader /><Navbar />
    <main className="relative z-10 rounded-b-3xl bg-paper">
      <Hero /><Marquee /><About /> ...
    </main>
    <Footer />
  </>);
}
```

`page.tsx` has no `"use client"`. It's a Server Component that only arranges sections. **Each section decides for itself** whether it needs the client. `Toolbox.tsx` and `Footer.tsx` have no hooks or handlers, so they stay server-only and ship no JS. Push `"use client"` as far down the tree as you can.

---

## Step 7 — Shared UI primitives (`src/components/ui.tsx`)

Four tiny building blocks, reused everywhere:

- **`Reveal`**: Ochi's text rising out of a mask.
- **`SectionTitle`**: a script kicker plus a huge display title.
- **`Roll`**: rolling-text hover (pure CSS).
- **`PillLink`**: the pill button whose dot grows on hover.

### The IntersectionObserver gotcha (a real bug that was fixed)

The first version put `whileInView` on the text itself. But the text starts at `translateY(105%)`, fully clipped by its `overflow:hidden` parent. **IntersectionObserver treats clipped elements as invisible**, so the reveal sometimes never fired. The fix is to observe the *mask* and drive the child from that:

```tsx
const ref = useRef(null);
const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
<span ref={ref} className="block overflow-hidden">
  <motion.span animate={{ y: inView ? "0%" : "105%" }} />
</span>
```

The same bug hit the ROAS bars, because `scaleX(0)` has zero area. There the track uses `whileInView="show"` and the bar inherits it through **variants** (Step 12).

### CSS beats JS where it can: `Roll`

```css
.roll { height: 1.2em; overflow: hidden; }
.roll > span::after { content: attr(data-text); display: block; }
a:hover .roll > span { transform: translateY(-50%); }
```

The duplicate text comes from a pseudo-element, so there's no extra DOM, no state and no JS. Rule of thumb: **use CSS for hover and toggles, JS for anything dynamic or interruptible.** (One real bug here: without `height: 1.2em` both copies were visible.)

---

## Step 8 — The preloader (`Preloader.tsx`)

Ochi's loader: a grey card inside a dark frame brightens to white while a counter runs, then **grows to fill the screen**. The card becomes the page.

**Core idea: one motion value drives everything.**

```tsx
const p = useMotionValue(0);                                      // 0→1 counting, 1→2 growing
const top        = useTransform(p, [0, 1, 2], ["34%", "12%", "0%"]);
const background = useTransform(p, [0, 1], ["#6b6b6b", "#f1f1f1"]);
const contentOpacity = useTransform(p, [1.2, 1.7], [1, 0]);
```

`useMotionValue` holds a value **outside React state**. When it changes, Motion updates the DOM directly and **the component doesn't re-render**. `useTransform` maps one value onto many styles. The timeline is two chained `animate()` calls:

```tsx
animate(p, 1, { duration: 1.8, onUpdate: v => countRef.current.textContent = ... })
  .then(() => animate(p, 2, { duration: 0.9 }))
  .then(() => { window.dispatchEvent(new Event("intro:done")); setDone(true); });
```

**Practices:**
- **The counter writes to `ref.current.textContent`**, not `setState`. With state, React would re-render 60 times a second for a number.
- **`AnimatePresence`** keeps the overlay mounted long enough to play its `exit` animation after `done` becomes `true`.
- **A `cancelled` flag** in the effect makes the cleanup safe if the component unmounts mid-animation (Strict Mode does exactly that in dev).
- `INTRO_SECONDS` is **exported**, so the Hero can schedule its reveal to start as the card finishes growing.

---

## Step 9 — Navbar (`Navbar.tsx`)

- **Hide on scroll down, show on scroll up:**
  ```tsx
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", y => setHidden(y > scrollY.getPrevious() && y > 150));
  ```
  `useMotionValueEvent` subscribes to a motion value and cleans up for you. State only changes when `hidden` flips, not on every pixel of scroll.
- **Functional state update** for the toggle: `setOpen(o => !o)`.
- **Accessible menu button:** `aria-expanded`, `aria-controls` and a changing `aria-label`.
- **Mobile menu** enters with `clipPath: inset(0 0 100% 0) → inset(0 0 0% 0)`, a wipe that never changes layout. Links stagger with `delay: 0.15 + i * 0.05`.

---

## Step 10 — Hero (`Hero.tsx`)

Three techniques:

### a) Name on one line: sizing from measurement, not guesswork

The Anton font was measured in the browser:

```js
ctx.font = "100px Anton"; ctx.measureText("ALTHEACARVALHO").width  // ≈ 640px → 6.4em
```

Add the image chip (0.9em) and the gaps, and the line is ≈ **7.4em** wide. So:

```
font-size = min( (100vw − side padding) / 7.4 , 13.5rem )
```

In Tailwind: `text-[min(calc((100vw_-_5rem)/7.4),13.5rem)]` (underscores stand for spaces in arbitrary values). `whitespace-nowrap` guarantees one line. Then it was checked in the DOM: `scrollWidth === clientWidth`, so nothing overflows.

### b) 3D hover tilt

```tsx
const rx = useMotionValue(0), ry = useMotionValue(0);
const rotateX = useSpring(rx, { stiffness: 150, damping: 15 });
function onPointerMove(e) {
  const box = e.currentTarget.getBoundingClientRect();
  ry.set(((e.clientX - box.left) / box.width - 0.5) * 16);
  rx.set(-((e.clientY - box.top) / box.height - 0.5) * 28);
}
<h1 onPointerMove={onPointerMove} onPointerLeave={reset} className="[perspective:900px]">
  <motion.span style={{ rotateX, rotateY }}>…</motion.span>
```

- **Pointer events** (`onPointerMove`) cover mouse, pen and touch with one API.
- **`useSpring`** smooths the raw values and carries velocity, so letting go glides back instead of snapping. The `animate` skill's rule: springs for anything gesture-driven.
- **`perspective` on the parent** makes `rotateX/Y` look three-dimensional.
- **No re-renders**: motion values again. A `useState` here would re-render on every mouse move.

### c) Scroll parallax (the "overlap" feel)

```tsx
const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
const y = useTransform(scrollYProgress, [0, 1], ["0%", "45%"]);
```

The hero content drifts **down** while you scroll, so it effectively moves at about half speed. The next section, with a higher stacking order and a rounded top, slides up over it. Step 15 covers the layering.

Also in the hero: the **image chip** wipes open with `clipPath: inset(0 100% 0 0) → inset(0 0% 0 0)`, and the **portrait** wipes up the same way. `clip-path` is the one property beyond transform and opacity that animates cheaply.

---

## Step 11 — Marquee (`Marquee.tsx`): per-frame motion without React

```tsx
const baseX = useMotionValue(0);
const velocity = useVelocity(useScroll().scrollY);
useAnimationFrame((_, delta) => {
  const v = velocity.get();
  if (v < 0) direction.current = 1; else if (v > 0) direction.current = -1;
  const boost = 1 + Math.min(Math.abs(v) / 800, 4);
  baseX.set(baseX.get() + direction.current * 2.2 * boost * (delta / 1000));
});
const transform = useTransform(baseX, v => `translateX(${wrap(-50, 0, v)}%)`);
```

- **`useAnimationFrame`** runs a callback every frame. `delta` keeps the speed the same on 60Hz and 120Hz screens.
- **`useRef` for `direction`**: a mutable value that persists between frames and **should not** trigger renders. That's the textbook use of a ref.
- **Seamless loop:** the content is rendered twice, so wrapping between −50% and 0% is invisible.
- **Accessibility:** the moving text is `aria-hidden` and a `sr-only` list gives screen readers the real content once.

Compare `Toolbox.tsx`: its tool strip is a **pure CSS** `@keyframes` marquee. It doesn't react to scroll, so it needs no JS, and CSS animations run off the main thread.

---

## Step 12 — About and the variants pattern (`About.tsx`)

```tsx
const fadeUp = { hidden: { opacity: 0, y: "24px" }, show: { opacity: 1, y: "0px" } };
<motion.div initial="hidden" whileInView="show" transition={{ staggerChildren: 0.12 }}>
  <motion.p variants={fadeUp}>…</motion.p>
  <motion.p variants={fadeUp}>…</motion.p>
</motion.div>
```

**Variants are named states that flow down the tree.** The parent switches to `"show"`, every child with a `show` variant follows, and `staggerChildren` spaces them out. Children need no `initial`/`animate` of their own. The same mechanism drives the portfolio letters (Step 14) and the ROAS bars.

---

## Step 13 — Eyes (`Eyes.tsx`): global listeners and angle math

```tsx
useEffect(() => {
  const onMove = (e: PointerEvent) => {
    let next = Math.atan2(dy, dx) * 180 / Math.PI + 90;
    next += Math.round((angle.get() - next) / 360) * 360;  // shortest way round
    angle.set(next);
  };
  window.addEventListener("pointermove", onMove, { passive: true });
  return () => window.removeEventListener("pointermove", onMove);
}, [angle]);
```

- **`passive: true`** tells the browser the handler never calls `preventDefault`, so scrolling stays smooth.
- **Shortest-path unwrapping** stops the spring from spinning 350° the wrong way when the angle crosses ±180°.
- **A small sub-component** (`Eye`) receives a `MotionValue<string>` as a prop. Motion values can be passed around like any other value, and the child still won't re-render.
- The headline has its own `useScroll` parallax (`-30% → 30%`), so it moves at a different speed from the eyes and gives the scene depth.

---

## Step 14 — Portfolio (`Portfolio.tsx`): hover choreography and a native modal

### Letter-by-letter hover

```tsx
<motion.button initial="rest" animate="rest" whileHover="hover" whileFocus="hover">
  {[...service.name].map((ch, i) => (
    <span className="overflow-hidden"><motion.span
      variants={{ rest: { y: "110%" }, hover: { y: "0%" } }}
      transition={{ delay: i * 0.025 }}>{ch}</motion.span></span>
  ))}
</motion.button>
```

`whileHover` on the button sets the variant, and every letter follows with its own delay. **`whileFocus` gives keyboard users the same effect.** The card is a real `<button>` with an `aria-label`, and the big letters are `aria-hidden` decoration.

### The modal uses `<dialog>`, not a library

```tsx
useEffect(() => { if (service && !ref.current?.open) ref.current?.showModal(); }, [service]);
<dialog className="modal" onClose={...} onClick={e => e.target === ref.current && ref.current.close()}>
```

`showModal()` gives you, **for free**, a focus trap, Esc to close, an inert page behind it, a `::backdrop` and the top layer (no z-index fights). The enter and exit animation is pure CSS:

```css
dialog.modal { opacity: 0; transition: opacity .3s, overlay .3s allow-discrete, display .3s allow-discrete; }
dialog.modal[open] { opacity: 1; }
@starting-style { dialog.modal[open] { opacity: 0; } }
```

`@starting-style` defines where the *entry* starts, and `allow-discrete` lets `display` and `overlay` wait for the *exit* to finish. **Gotcha:** padding sits on an inner wrapper, so `e.target === dialog` is only true when the click lands on the backdrop.

`data-lenis-prevent` on the dialog lets it scroll normally while Lenis keeps hold of the page.

---

## Step 15 — The overlapping sections (stacking contexts)

Ochi's "sections slide over each other" effect is mostly **CSS layering**:

```
section: relative -mt-6 rounded-t-3xl bg-*
```

1. **`relative`** puts the section in the positioned layer. Later positioned siblings paint *over* earlier ones, and the parallaxed hero (it has a transform) counts as positioned too.
2. **`-mt-6`** pulls each section up so it overlaps the previous one by 1.5rem.
3. **`rounded-t-3xl` plus a solid background** shows the curved edge over the section below.

**Footer reveal:**

```tsx
<main className="relative z-10 rounded-b-3xl bg-paper">…</main>
<footer className="sticky bottom-0 z-0">…</footer>
```

The footer sticks to the bottom *underneath* `main`. As `main` scrolls away, its rounded bottom edge lifts and uncovers the footer.

The parallax hero (Step 10) plus these layers plus Lenis smoothing together make the "smooth overlap" feel.

---

## Step 16 — Results (`Results.tsx`): count-ups with progressive enhancement

```tsx
<span ref={ref}>{value.toFixed(decimals)}</span>     // server renders the FINAL number
useEffect(() => {
  if (!inView) return;
  const controls = animate(0, value, { onUpdate: v => ref.current.textContent = v.toFixed(decimals) });
  return () => controls.stop();
}, [inView, value, decimals]);
```

- **The server HTML holds the real number.** Search engines, no-JS visitors and screen readers get "5.2M", never "0".
- **The animation is cleaned up** (`controls.stop()`) if the component unmounts.
- **ROAS bars** animate `scaleX` with `origin-left` instead of `width`. That looks the same but skips layout and paint.

---

## Step 17 — Toolbox (`Toolbox.tsx`): zero-JS interactivity

This is a **Server Component**:
- The tool marquee uses a CSS `@keyframes` animation.
- The certifications accordion uses native **`<details>/<summary>`**, animated with:
  ```css
  details.accordion { interpolate-size: allow-keywords; }
  details.accordion::details-content { block-size: 0; transition: block-size .4s, content-visibility .4s allow-discrete; }
  details.accordion[open]::details-content { block-size: auto; }
  ```
  `interpolate-size` finally allows animating to `height: auto`. Browsers that don't support it simply open the panel without animating: **progressive enhancement**.

---

## Step 18 — Pricing (`Pricing.tsx`): two transforms on one element is a bug

The cards scroll in (a Motion transform) **and** lift on hover (a CSS transform). Put both on one element and Motion's inline `transform` overwrites the CSS hover. The fix is to **split responsibilities across two elements**:

```tsx
<motion.div whileInView={{ opacity: 1, y: "0px" }}>          {/* scroll-in */}
  <article className="transition-transform hover:-translate-y-2">  {/* hover */}
```

General rule: **one owner per CSS property per element.**

---

## Step 19 — Inquiry form (`Inquiry.tsx`): uncontrolled forms and Netlify

```tsx
async function onSubmit(e) {
  e.preventDefault();
  const data = new FormData(e.currentTarget);
  if (data.getAll("needs").length === 0) return setError("Pick at least one thing you need.");
  await fetch("/__forms.html", { method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(data as any).toString() });
}
```

- **Uncontrolled inputs.** The browser holds field values and you read them once with `FormData`. There are no 11 `useState`s and no re-render on every keystroke. Use state only for what the UI shows: `status`, `error`, the character counter.
- **Native validation first.** `required` and `type="email"` cost nothing. JS only checks what HTML can't ("at least one checkbox").
- **Chips are real inputs.** `<input type="checkbox" className="peer sr-only">` plus a styled `<span>` using `peer-checked:` / `peer-focus-visible:`. Keyboard, screen readers and `FormData` all just work.
- **Every label has `htmlFor`, and every group is a `<fieldset>` with a `<legend>`.**
- **Netlify Forms with Next.js:** Netlify detects forms in *static HTML* at deploy time, and a React-rendered form isn't static. So `public/__forms.html` declares a hidden copy with the same field names, and the React form POSTs to that file. The honeypot field `bot-field` filters spam.

---

## Step 20 — Verification and the bugs it caught

Each change was checked with `tsc --noEmit`, `npm run lint`, `npm run build`, and then in a real browser, reading DOM values, not only screenshots:

| Check | Bug found |
|---|---|
| Lint (`react-hooks/set-state-in-effect`) | `setState` called synchronously inside an effect → cascading renders. Restructured. |
| Visual check | Rolling text showed both copies (missing fixed height). |
| DOM inspection | Reveals not firing: the IntersectionObserver vs clipping issue (Step 7). |
| `matchMedia` probe | Your OS reports reduced motion, which is why animations looked "missing". |
| `scrollWidth === clientWidth` | Proved the one-line name doesn't overflow. |
| Reading `style.transform` | Proved the tilt, parallax and marquee are live. |

**Practice:** verify behaviour by checking the actual state ("is the transform applied?"), not by assuming it works because the code looks right.

---

## Step 21 — Deployment setup

- `netlify.toml` sets `command = "npm run build"` and `publish = ".next"`. It **overrides** the old Lovable settings (`dist`) still saved in the Netlify UI, and Netlify applies its Next.js adapter automatically.
- The page is fully **static** (`○ /` in the build output), so it's fast and cheap to host.

---

## Cheat sheet: the React rules this codebase follows

1. **Server by default; `"use client"` only on leaves that need hooks or events.**
2. **Never `setState` per frame.** Use motion values, refs, or direct DOM writes for anything that changes 60 times a second.
3. **Every effect returns a cleanup** for listeners, animations and library instances.
4. **Children's effects run before parents'.** Use events or callbacks, not refs, to talk upward at mount.
5. **One owner per CSS property per element.**
6. **Animate `transform`, `opacity` and `clip-path`; avoid `width`, `height`, `top` and `left`.**
7. **Use the platform first:** `<dialog>`, `<details>`, `FormData`, `required`, CSS `@keyframes`, `@starting-style`.
8. **Content in data, design in tokens, components only arrange.**
9. **Measure, don't guess** (font widths, overflow, applied styles).
10. **React Compiler is on, so no manual `useMemo` / `useCallback`.**

## Exercises to lock it in

1. Add a fifth service to `site.portfolio`. Notice that no JSX changes are needed.
2. Make the navbar's background turn `bg-ink` while it sits over the dark Results section. Hint: `useScroll({ target })` plus `useMotionValueEvent`.
3. Turn reduced-motion support back on, but tiered: keep fades, drop the tilt and parallax. Hint: `MotionConfig reducedMotion="user"` and skip Lenis when `matchMedia` reports `reduce`.
4. Replace the portrait placeholder with a real image through `next/image` (set `site.portrait`). Then check in the Network tab that Next serves a resized AVIF/WebP.
5. Write a `useTilt()` custom hook that pulls the tilt logic out of `Hero.tsx`, then reuse it on the pricing cards.

---

## Step 22: Iteration 2, feedback-driven changes

Some earlier steps are superseded here: the fonts in Step 4, the overlap and footer reveal in Step 15, and the preloader copy in Step 8.

### a) Run the intro once per session, with no flash

Hiding the loader from React (`useEffect` → `setDone(true)`) would paint it for a frame first, because effects run *after* paint. The fix is a tiny **inline script in `<head>`** (`layout.tsx`) that runs before first paint:

```js
if (sessionStorage.getItem("intro-seen")) document.documentElement.dataset.introSeen = "";
```

```css
html[data-intro-seen] .preloader { display: none; }
```

`<html suppressHydrationWarning>` tells React the attribute was added on purpose before hydration. The Preloader sets the flag when the intro finishes, and `heroDelay()` lets the hero skip its 2.4s wait on repeat visits. Lesson: **anything that must be right on the first paint belongs in CSS or an inline script, not an effect.**

### b) A shared `Section` component (`ui.tsx`)

Every section had copied the same layout classes. Now one component owns the card look (`mx-2.5 mt-2.5 rounded-[1.75rem] overflow-hidden`), the scale-in on scroll (`useScroll` → `scale 0.94 → 1`) and the snap marker (`data-snap`). The sections only pass a colour. This is a good moment to extract: once **three or more call sites repeat** a pattern, not before.

Server components still work inside it. `Toolbox.tsx` has no `"use client"` and renders `<Section>` (a client component), passing server-rendered children through.

### c) Section snapping with Lenis

CSS `scroll-snap-type` fights Lenis, because both try to own the scroll position. So the official add-on is used instead:

```ts
const snap = new Snap(lenis, { type: "proximity", distanceThreshold: "30%" });
snap.addElements([...document.querySelectorAll("[data-snap]")], { align: ["start"], ignoreTransform: true });
```

- `proximity` (not `mandatory`) means long sections like Pricing still scroll freely. It only snaps when you stop near a section's top.
- `ignoreTransform` makes snap measure the real position, not the temporarily scaled one.
- This runs in the **parent's** effect, which runs after every child has mounted, so all `[data-snap]` elements already exist.

### d) Theme-agnostic primitives

`SectionTitle` and `PillLink` used to hard-code ink-on-paper colours. Now they use `currentColor` (`bg-current`, `opacity-70`, `border-current`), so the same component works on ink, forest and lime cards. **Let components inherit colour; let sections decide it.**

### e) Fonts

Ochi's fonts (Founders Grotesk and PP Neue Montreal) need paid licences. Antonio and Hanken Grotesk are free and close. When fonts change, re-measure anything sized by font metrics: the one-line hero name went from a 7.4em to a 7.05em divisor. If Althea buys the real fonts, load them with `next/font/local` and point `--font-display` / `--font-sans` at them. Nothing else changes.
