import { SectionHeading } from "@/components/section-heading";

const notes = [
  "Participation is optional and not connected to grades.",
  "CodePet Labs is independent and not school-affiliated.",
  "The focus is learning, building, and portfolio-quality work.",
  "Students work in separate project repos with mock data first.",
  "Production Pika access is restricted and supervised.",
  "Student projects may be rewritten, replaced, or integrated later.",
];

export default function JoinPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8">
      <SectionHeading
        eyebrow="Join"
        title="Small, invite-only, and intentionally experimental"
        description="CodePet Labs is currently kept small so projects can get useful direction and students can build without the overhead of a formal program."
      />

      <div className="mt-8 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-foreground">
            How it works today
          </h2>
          <p className="mt-4 text-sm leading-6 text-muted">
            Students are invited into a builder environment where they can pick
            up focused Labs projects, learn modern development habits, and
            share visible progress. The work happens async through GitHub and
            Discord, with syncs used for demos, direction-setting, blockers,
            and next steps.
          </p>
          <p className="mt-4 text-sm leading-6 text-muted">
            Labs is a learning environment, not an employment program. It is
            meant to create skill growth, confidence, and credible portfolio
            artifacts without granting access to production systems or real
            student data.
          </p>
        </section>

        <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-foreground">
            Ground rules
          </h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {notes.map((note) => (
              <div
                key={note}
                className="rounded-md border border-border bg-card-soft p-4 text-sm leading-6 text-muted"
              >
                {note}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
