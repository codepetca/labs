import Image from "next/image";

import { SectionHeading } from "@/components/section-heading";

const notes = [
  { title: "Optional", body: "No grades. No employment tie." },
  { title: "Independent", body: "Not school-affiliated." },
  { title: "Portfolio", body: "Build visible work." },
  { title: "Separate repos", body: "Mock data first." },
  { title: "Restricted access", body: "No production student data." },
  { title: "Flexible future", body: "Work may be rewritten later." },
];

export default function JoinPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <SectionHeading
        eyebrow="Join"
        title="Invite-only"
        description="Small. Optional. Experimental."
      />

      <div className="mt-7 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <Image
            src="/images/visual-join.svg"
            alt="Invite flow from pick to build to demo"
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
