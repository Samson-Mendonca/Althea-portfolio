"use client";

import { useState } from "react";
import { site } from "@/data/site";
import { SectionTitle } from "./ui";

type Status = "idle" | "sending" | "sent" | "error";

const input =
  "w-full rounded-xl border border-ink/25 bg-paper px-4 py-3 outline-none transition-colors focus:border-accent";
const label = "mb-2 block text-xs uppercase tracking-widest";

// A checkbox/radio styled as a pill. The real input stays in the DOM (sr-only)
// so keyboard, screen readers and FormData all keep working.
function Chip({ type, name, value }: { type: "checkbox" | "radio"; name: string; value: string }) {
  return (
    <label className="cursor-pointer">
      <input type={type} name={name} value={value} className="peer sr-only" />
      <span className="inline-block rounded-full border border-ink/40 px-4 py-2 text-sm uppercase tracking-wide transition-colors peer-checked:border-accent peer-checked:bg-accent peer-checked:text-paper peer-focus-visible:outline-2 peer-focus-visible:outline-accent">
        {value}
      </span>
    </label>
  );
}

export default function Inquiry() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [goalsLength, setGoalsLength] = useState(0);

  // Uncontrolled form: the browser holds field values; we read them once on submit.
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    if (data.getAll("needs").length === 0) {
      setError("Pick at least one thing you need.");
      return;
    }
    setError("");
    setStatus("sending");
    try {
      // Netlify Forms: POST url-encoded data to the static form file it detected at build time.
      const res = await fetch("/__forms.html", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(data as unknown as Record<string, string>).toString(),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section id="inquiry" className="px-4 py-20 md:px-10 md:py-32">
      <div className="mx-auto grid max-w-[1600px] gap-12 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <SectionTitle kicker="start a" title="Project" />
          <p className="mt-6 max-w-md text-lg">{site.inquiry.intro}</p>
          <ul className="mt-8 space-y-3 text-muted">
            <li>✦ What you need — content, ads, email, or all of it</li>
            <li>✦ Where you want to go — reach, sales, or a launch</li>
            <li>✦ What you can spend — pick a range, or say not sure</li>
          </ul>
          <p className="mt-8 text-sm uppercase tracking-wide">
            Prefer email?{" "}
            <a href={`mailto:${site.email}`} className="text-accent underline underline-offset-4">
              {site.email}
            </a>
          </p>
        </div>

        {status === "sent" ? (
          <div className="grid place-items-center rounded-3xl bg-ink p-10 text-center text-paper" role="status">
            <div>
              <p className="font-script text-5xl text-accent-soft">thank you</p>
              <p className="mt-4 font-display text-4xl uppercase md:text-6xl">Inquiry sent</p>
              <p className="mt-4 text-paper/70">I’ll read it myself and get back to you with ideas soon.</p>
            </div>
          </div>
        ) : (
          <form name="inquiry" onSubmit={onSubmit} className="grid gap-6 rounded-3xl bg-cream p-6 md:grid-cols-2 md:p-10">
            <input type="hidden" name="form-name" value="inquiry" />
            {/* Honeypot: hidden from people, bots fill it, Netlify drops those submissions */}
            <p className="hidden">
              <label>
                Leave this field empty <input name="bot-field" tabIndex={-1} autoComplete="off" />
              </label>
            </p>

            <div>
              <label htmlFor="name" className={label}>Your name *</label>
              <input id="name" name="name" required autoComplete="name" className={input} />
            </div>
            <div>
              <label htmlFor="brand" className={label}>Brand <span className="normal-case text-muted">(optional)</span></label>
              <input id="brand" name="brand" autoComplete="organization" className={input} />
            </div>
            <div>
              <label htmlFor="email" className={label}>Email *</label>
              <input id="email" name="email" type="email" required autoComplete="email" className={input} />
            </div>
            <div>
              <label htmlFor="phone" className={label}>Phone <span className="normal-case text-muted">(optional)</span></label>
              <input id="phone" name="phone" type="tel" autoComplete="tel" className={input} />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="website" className={label}>Website or Instagram <span className="normal-case text-muted">(optional)</span></label>
              <input id="website" name="website" className={input} />
            </div>

            <fieldset className="md:col-span-2">
              <legend className={label}>What do you need? *</legend>
              <div className="flex flex-wrap gap-2">
                {site.inquiry.needs.map((n) => (
                  <Chip key={n} type="checkbox" name="needs" value={n} />
                ))}
              </div>
              {error && (
                <p className="mt-2 text-sm text-accent" role="alert">
                  {error}
                </p>
              )}
            </fieldset>

            <div className="md:col-span-2">
              <label htmlFor="goals" className={label}>Project goals <span className="normal-case text-muted">(optional)</span></label>
              <textarea
                id="goals"
                name="goals"
                rows={4}
                maxLength={2000}
                className={input}
                onChange={(e) => setGoalsLength(e.target.value.length)}
              />
              <p className="mt-1 text-right text-xs text-muted">{goalsLength}/2000</p>
            </div>

            <fieldset className="md:col-span-2">
              <legend className={label}>Monthly budget</legend>
              <div className="flex flex-wrap gap-2">
                {site.inquiry.budgets.map((b) => (
                  <Chip key={b} type="radio" name="budget" value={b} />
                ))}
              </div>
            </fieldset>

            <div className="md:col-span-2">
              <label htmlFor="timeline" className={label}>Timeline <span className="normal-case text-muted">(optional)</span></label>
              <select id="timeline" name="timeline" className={input} defaultValue={site.inquiry.timelines[0]}>
                {site.inquiry.timelines.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-4 md:col-span-2">
              <button
                type="submit"
                disabled={status === "sending"}
                className="rounded-full bg-ink px-8 py-4 text-sm uppercase tracking-wider text-paper transition-opacity disabled:opacity-60"
              >
                {status === "sending" ? "Sending…" : "Send inquiry"}
              </button>
              {status === "error" && (
                <p className="text-sm text-accent" role="alert">
                  Something went wrong. Please email {site.email} instead.
                </p>
              )}
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
