import { site } from "@/data/site";
import { SectionTitle } from "./ui";

// No hooks or handlers here, so this stays a Server Component (zero client JS).
export default function Toolbox() {
  return (
    <section id="skills" className="py-20 md:py-32">
      <div className="mx-auto max-w-[1600px] px-4 md:px-10">
        <SectionTitle kicker="my" title="Toolbox" />
        <p className="mt-4 text-sm uppercase tracking-widest text-muted">Skills & certifications</p>
      </div>

      {/* Two copies of the list → translateX(-50%) loops seamlessly */}
      <div className="mt-12 overflow-hidden border-y border-ink/20 py-6" aria-label="Tools I use">
        <div className="marquee-track flex w-max gap-4" style={{ "--marquee-duration": "35s" } as React.CSSProperties}>
          {[0, 1].map((copy) => (
            <ul key={copy} className="flex gap-4" aria-hidden={copy === 1}>
              {site.tools.map((tool) => (
                <li
                  key={tool}
                  className="rounded-full border border-ink px-8 py-3 font-display text-2xl uppercase tracking-wide md:text-4xl"
                >
                  {tool}
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-16 max-w-[1600px] px-4 md:px-10">
        <h3 className="text-sm uppercase tracking-widest text-muted">Certifications</h3>
        <div className="mt-4 border-t border-ink/20">
          {site.certifications.map((c, i) => (
            <details key={c.title} className="accordion group border-b border-ink/20">
              <summary className="flex cursor-pointer items-center gap-4 py-6 md:gap-10">
                <span className="w-8 text-sm text-muted">0{i + 1}</span>
                <span className="flex-1 text-xl md:text-3xl">{c.title}</span>
                <span className="grid size-10 shrink-0 place-items-center rounded-full border border-ink text-xl transition-transform duration-300 group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="pb-6 pl-12 text-muted md:pl-[4.5rem] md:text-lg">{c.body}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
