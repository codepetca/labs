import Link from "next/link";

import { SectionHeading } from "@/components/section-heading";

const focusAreas = [
  {
    name: "CodePetPal",
    description:
      "Companion-style learning experiments for motivation, feedback, and lightweight progress loops.",
    accent: "bg-accent-soft text-accent",
  },
  {
    name: "Gradex",
    description:
      "Teacher-facing gradebook and analytics prototypes that explore clearer student progress signals.",
    accent: "bg-violet-soft text-violet",
  },
  {
    name: "Attendance",
    description:
      "TapCheck-style attendance flows using mock rosters and fast classroom check-in patterns.",
    accent: "bg-warm-soft text-warm",
  },
  {
    name: "Polling",
    description:
      "Low-friction classroom pulse checks, feedback prompts, and discussion starters.",
    accent: "bg-accent-soft text-accent",
  },
  {
    name: "Pika UI Experiments",
    description:
      "Interface studies for future Pika-adjacent products, dashboards, and shared design language.",
    accent: "bg-violet-soft text-violet",
  },
];

export default function Home() {
  return (
    <main>
      <section className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1fr_420px] lg:items-center">
        <div className="max-w-3xl">
          <p className="mb-4 inline-flex rounded-md border border-border bg-surface px-3 py-1 text-sm font-medium text-muted">
            Independent student builder studio
          </p>
          <h1 className="text-5xl font-semibold tracking-normal text-foreground sm:text-6xl">
            CodePet Labs
          </h1>
          <p className="mt-6 max-w-2xl text-xl leading-8 text-muted">
            An AI-native software lab exploring educational tools around the
            Pika ecosystem.
          </p>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted">
            CodePet Labs is a small invite-only environment where motivated
            students learn modern software development by shipping
            Pika-adjacent tools, prototypes, and experiments. It is not a
            school club, formal class, or employment program.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/projects"
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-foreground px-5 py-3 text-sm font-semibold text-background transition hover:opacity-90"
            >
              View projects
            </Link>
            <Link
              href="/join"
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-surface px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-card-soft"
            >
              How joining works
            </Link>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <div className="rounded-md border border-border bg-card-soft p-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Labs board
                </p>
                <p className="text-xs text-muted">Mock-first prototypes</p>
              </div>
              <span className="rounded-md bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent">
                Summer 2026
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {["Idea", "Prototype", "Demo", "Review"].map((step, index) => (
                <div
                  key={step}
                  className="flex items-center gap-3 rounded-md border border-border bg-surface p-3"
                >
                  <span className="flex size-8 items-center justify-center rounded-md bg-foreground font-mono text-sm text-background">
                    0{index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {step}
                    </p>
                    <p className="text-xs text-muted">
                      {index === 0 && "Shape the problem with Pika context."}
                      {index === 1 && "Build with mock data and small scope."}
                      {index === 2 && "Share a working slice each week."}
                      {index === 3 && "Verify, polish, and decide next steps."}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-surface/75">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
          <SectionHeading
            eyebrow="Current focus"
            title="Small projects around real product questions"
            description="Labs work stays adjacent to Pika core. Students explore useful interfaces, workflows, and product ideas in separate repos with mock data first."
          />

          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {focusAreas.map((area) => (
              <article
                key={area.name}
                className="rounded-lg border border-border bg-card p-5 shadow-sm"
              >
                <span
                  className={`mb-4 inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${area.accent}`}
                >
                  Focus
                </span>
                <h2 className="text-lg font-semibold text-foreground">
                  {area.name}
                </h2>
                <p className="mt-3 text-sm leading-6 text-muted">
                  {area.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
