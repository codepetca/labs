import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About | Codepet Labs",
  description: "A small reviewed studio for young software builders.",
};

const facts = [
  ["Format", "Independent project work"],
  ["Check-in", "Weekly · 1–2 hours"],
  ["Commitment", "About 10 hours per week"],
];

const outcomes = [
  ["Prototype", "A small idea you can demo."],
  ["Practice", "GitHub, review, and responsible AI habits."],
  ["Credit", "Public attribution after reviewed work ships."],
];

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
          className="aspect-[4/3] w-full rounded-lg border border-border object-cover"
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
        <h2 className="text-xl font-semibold text-foreground">What comes out</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {outcomes.map(([title, description]) => (
            <article key={title} className="border-t border-border pt-4">
              <h3 className="font-semibold text-foreground">{title}</h3>
              <p className="mt-2 text-sm leading-5 text-muted">{description}</p>
            </article>
          ))}
        </div>
        <Link
          href="/join"
          className="mt-10 inline-flex min-h-11 items-center gap-2 rounded-md bg-foreground px-5 py-3 text-sm font-semibold text-background transition hover:opacity-90"
        >
          See how joining works
          <ArrowRight aria-hidden="true" size={17} />
        </Link>
      </section>
    </main>
  );
}
