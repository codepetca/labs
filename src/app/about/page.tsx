import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "About | Codepet Labs",
  description: "A small reviewed studio for young software builders.",
};

const facts = [
  ["Format", "Independent project work"],
  ["Check-in", "Weekly · 1–2 hours"],
  ["Commitment", "About 10 hours per week"],
];

const summerContributors = ["Abhijit", "Arron", "Jason", "Jessie"];

export default function AboutPage() {
  return (
    <main>
      <section className="mx-auto grid w-full max-w-5xl gap-8 px-4 py-10 sm:px-6 sm:py-16 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.12em] text-warm">
            Small by design
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-foreground sm:text-6xl">
            About
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-7 text-muted sm:text-xl sm:leading-8">
            Codepet Labs is a reviewed builder studio for young people making useful, Pika-adjacent software with AI and GitHub.
          </p>
        </div>
        <Image
          src="/images/lab-dog.png"
          alt="Friendly dog wearing goggles and a Codepet lab coat"
          width={960}
          height={960}
          priority
          className="aspect-square w-40 rounded-lg border border-border object-cover sm:w-48 lg:w-60 lg:justify-self-end"
        />
      </section>

      <section className="border-y border-border bg-surface-muted/35">
        <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
          <h2 className="text-xl font-semibold text-foreground">At a glance</h2>
          <dl className="mt-5 divide-y divide-border border-y border-border">
            {facts.map(([label, value]) => (
              <div key={label} className="grid gap-1 py-4 sm:grid-cols-[160px_1fr]">
                <dt className="text-sm font-semibold text-foreground">{label}</dt>
                <dd className="text-sm text-muted">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <article className="max-w-lg rounded-lg border border-border bg-card p-5 sm:p-6">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.12em] text-accent">
            Contributors
          </p>
          <h2 className="mt-2 text-xl font-semibold text-foreground">Summer 2026</h2>
          <ul
            aria-label="Summer 2026 contributors"
            className="mt-5 grid grid-cols-2 gap-x-6"
          >
            {summerContributors.map((name) => (
              <li key={name} className="border-t border-border py-3 text-sm font-semibold text-foreground">
                {name}
              </li>
            ))}
          </ul>
        </article>
      </section>
    </main>
  );
}
