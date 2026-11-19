import { site } from "@/data/site";
import { Reveal, Roll, Section } from "./ui";

export default function Footer() {
  return (
    <Section id="contact" className="bg-lime px-4 pt-20 text-ink md:px-10 md:pt-32">
      <footer>
      <div className="mx-auto max-w-[1600px]">
        <p className="mb-3 flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-ink/80">
          <span className="size-2 rounded-full bg-ink" />
          Let’s create
        </p>
        <h2 className="font-display text-[clamp(4rem,13vw,13rem)] font-bold uppercase leading-[0.86]">
          <Reveal>Let’s work</Reveal>
          <Reveal delay={0.1}>together!</Reveal>
        </h2>

        <div className="mt-16 grid gap-10 border-t border-ink/20 pt-10 md:grid-cols-[2fr_1fr_1fr]">
          <div>
            <p className="text-xs uppercase tracking-widest text-ink/80">Email</p>
            <a href={`mailto:${site.email}`} className="mt-2 block text-lg sm:text-xl lg:text-2xl">
              <Roll text={site.email} />
            </a>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-ink/80">Phone</p>
            <a href={site.phone.href} className="mt-2 block text-xl md:text-2xl">
              <Roll text={site.phone.display} />
            </a>
          </div>
          <nav aria-label="Footer">
            <p className="text-xs uppercase tracking-widest text-ink/80">Menu</p>
            <ul className="mt-2 grid grid-cols-2 gap-1">
              {site.nav.map((n) => (
                <li key={n.href}>
                  <a href={n.href}>
                    <Roll text={n.label} />
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Giant name, sized to the viewport width so it always fits on one line */}
        <p
          aria-hidden
          className="mt-20 select-none whitespace-nowrap text-center font-display text-[13.5vw] font-bold uppercase leading-[0.8] text-paper md:mt-28"
        >
          {site.name.first} {site.name.last}
        </p>
        <p className="py-6 text-center text-xs uppercase tracking-widest text-ink/80">
          © {site.name.first} {site.name.last} · {site.location}
        </p>
      </div>
      </footer>
    </Section>
  );
}
