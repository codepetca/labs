import Image from "next/image";
import Link from "next/link";

import { SectionHeading } from "@/components/section-heading";

const notes = [
  { title: "Start small", body: "Pick one useful idea." },
  { title: "Mock first", body: "Use sample data." },
  { title: "Work in PRs", body: "Share early drafts." },
  { title: "Demo often", body: "Show what works." },
];

export default function JoinPage() {
  const discordInviteUrl = process.env.CODEPET_DISCORD_INVITE_URL;

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <SectionHeading
        eyebrow="Join"
        title="Join Labs"
        description="Anyone can start. Builders are chosen from the interest list."
      />
      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          href="/signup"
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-foreground px-5 py-3 text-sm font-semibold text-background transition hover:opacity-90"
        >
          Join with GitHub
        </Link>
        <Link
          href="/hub"
          className="inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-surface px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-card-soft"
        >
          Member hub
        </Link>
        {discordInviteUrl ? (
          <Link
            href={discordInviteUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-surface px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-card-soft"
          >
            Join Discord
          </Link>
        ) : null}
      </div>

      <div className="mt-7 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <Image
            src="/images/visual-join.svg"
            alt="Join flow from pick to build to demo"
            width={640}
            height={420}
            className="aspect-[16/10] w-full object-cover"
          />
          <div className="grid gap-3 p-4 sm:grid-cols-3">
            {["Pick", "Build", "Demo"].map((step, index) => (
              <div
                key={step}
                className="rounded-lg border border-border bg-card-soft p-3"
              >
                <span className="font-mono text-xs text-muted">
                  0{index + 1}
                </span>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  {step}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-border bg-card p-4 shadow-sm sm:p-5">
          <h2 className="text-lg font-semibold text-foreground">Ground rules</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {notes.map((note) => (
              <div
                key={note.title}
                className="rounded-md border border-border bg-card-soft p-3"
              >
                <p className="text-sm font-semibold text-foreground">
                  {note.title}
                </p>
                <p className="mt-1 text-sm leading-5 text-muted">
                  {note.body}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
