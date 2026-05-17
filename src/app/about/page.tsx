import Image from "next/image";

import { SectionHeading } from "@/components/section-heading";

const principles = [
  {
    title: "Learn by shipping",
    body: "Ship small. Improve from feedback.",
  },
  {
    title: "AI-assisted development",
    body: "AI helps. Builders verify.",
  },
  {
    title: "Async collaboration",
    body: "GitHub, Discord, short demos.",
  },
  {
    title: "Product thinking",
    body: "Usefulness before code volume.",
  },
  {
    title: "Independent from school systems",
    body: "Optional, ungraded, unaffiliated.",
  },
  {
    title: "Pika as the anchor",
    body: "Orbit Pika. Protect core.",
  },
];

export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <SectionHeading
          eyebrow="About"
          title="Build. Verify. Ship."
          description="A small studio for serious student work."
        />
        <Image
          src="/images/visual-ui.svg"
          alt="Pika UI experiment card"
          width={640}
          height={420}
          className="aspect-[16/10] w-full rounded-lg border border-border bg-card object-cover shadow-sm"
        />
      </div>

      <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {principles.map((principle) => (
          <article
            key={principle.title}
            className="rounded-lg border border-border bg-card p-4 shadow-sm"
          >
            <h2 className="text-base font-semibold text-foreground">
              {principle.title}
            </h2>
            <p className="mt-2 text-sm leading-5 text-muted">
              {principle.body}
            </p>
          </article>
        ))}
      </div>
    </main>
  );
}
