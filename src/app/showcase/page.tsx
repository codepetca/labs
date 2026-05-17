import { readFile } from "node:fs/promises";
import path from "node:path";

import { SectionHeading } from "@/components/section-heading";

async function getLaunchNote() {
  const filePath = path.join(
    process.cwd(),
    "content",
    "updates",
    "2026-summer-launch.md",
  );
  const markdown = await readFile(filePath, "utf8");
  const lines = markdown.trim().split(/\r?\n/);
  const title = lines[0]?.replace(/^#\s*/, "") ?? "Launch note";
  const body = lines.slice(1).join("\n").trim();

  return { title, body };
}

function renderMarkdownBlocks(markdown: string) {
  return markdown.split(/\n\n+/).map((block) => {
    if (block.startsWith("- ")) {
      return (
        <ul
          key={block}
          className="list-disc space-y-2 pl-5 text-sm leading-6 text-muted"
        >
          {block.split("\n").map((line) => (
            <li key={line}>{line.replace(/^- /, "")}</li>
          ))}
        </ul>
      );
    }

    return (
      <p key={block} className="text-sm leading-6 text-muted">
        {block}
      </p>
    );
  });
}

export default async function ShowcasePage() {
  const launchNote = await getLaunchNote();

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8">
      <SectionHeading
        eyebrow="Showcase"
        title="A future home for demos, screenshots, and short build notes"
        description="The showcase is intentionally lightweight for now. As Labs projects become demo-ready, this page can collect video clips, screenshots, and release notes that students can point to from their portfolios."
      />

      <div className="mt-8 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-foreground">
            Coming soon
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {["Demo clips", "Screenshots", "Build notes"].map((item) => (
              <div
                key={item}
                className="min-h-36 rounded-lg border border-dashed border-border bg-card-soft p-4"
              >
                <p className="text-sm font-semibold text-foreground">{item}</p>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Placeholder for future student work.
                </p>
              </div>
            ))}
          </div>
        </section>

        <aside className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <p className="mb-3 text-sm font-semibold uppercase text-accent">
            Launch note
          </p>
          <h2 className="text-xl font-semibold text-foreground">
            {launchNote.title}
          </h2>
          <div className="mt-4 space-y-4">
            {renderMarkdownBlocks(launchNote.body)}
          </div>
        </aside>
      </div>
    </main>
  );
}
