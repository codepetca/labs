import { SectionHeading } from "@/components/section-heading";

const principles = [
  {
    title: "Learn by shipping",
    body: "Students work on real slices of product thinking: framing a problem, building a prototype, demoing it, and improving it from feedback.",
  },
  {
    title: "AI-assisted development",
    body: "AI is part of the workflow, but students are responsible for understanding, testing, and explaining the work they submit.",
  },
  {
    title: "Async collaboration",
    body: "Most progress happens through GitHub, Discord, short demos, and clear written updates instead of classroom-style meetings.",
  },
  {
    title: "Product thinking",
    body: "The work is about usefulness, clarity, constraints, and tradeoffs, not just producing code that runs locally.",
  },
  {
    title: "Independent from school systems",
    body: "CodePet Labs is not a class, club, grade pathway, or school-affiliated program. It is an independent builder environment.",
  },
  {
    title: "Pika as the anchor",
    body: "Pika gives Labs a real ecosystem to orbit, while Pika core remains supervised, protected, and separate from student experiments.",
  },
];

export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8">
      <SectionHeading
        eyebrow="About"
        title="A small lab for students who want to build seriously"
        description="CodePet Labs gives motivated students a place to practice modern software work in a grounded, portfolio-friendly way. The tone is practical: build something small, make it work, explain the decisions, and keep improving."
      />

      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {principles.map((principle) => (
          <article
            key={principle.title}
            className="rounded-lg border border-border bg-card p-5 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-foreground">
              {principle.title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted">
              {principle.body}
            </p>
          </article>
        ))}
      </div>
    </main>
  );
}
