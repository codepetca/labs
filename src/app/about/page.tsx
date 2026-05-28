import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Codepet Labs",
  description:
    "A brief vision summary for Codepet Labs, an invite-only summer builder group.",
};

async function getAboutLabsCopy() {
  const filePath = path.join(process.cwd(), "docs", "about-labs.md");
  return readFile(filePath, "utf8");
}

function renderAboutMarkdown(markdown: string) {
  return markdown
    .trim()
    .split(/\n\n+/)
    .map((block) => {
      if (block.startsWith("# ")) {
        return (
          <h1
            key={block}
            className="text-4xl font-semibold tracking-normal text-foreground sm:text-5xl"
          >
            {block.replace(/^#\s*/, "")}
          </h1>
        );
      }

      if (block.startsWith("## ")) {
        return (
          <h2
            key={block}
            className="pt-4 text-xl font-semibold tracking-normal text-foreground"
          >
            {block.replace(/^##\s*/, "")}
          </h2>
        );
      }

      if (block.startsWith("- ")) {
        return (
          <ul key={block} className="grid gap-2 sm:grid-cols-2">
            {block.split("\n").map((line) => (
              <li
                key={line}
                className="rounded-md border border-border bg-card-soft px-3 py-2 text-sm font-semibold text-muted"
              >
                {line.replace(/^- /, "")}
              </li>
            ))}
          </ul>
        );
      }

      return (
        <p key={block} className="max-w-2xl text-base leading-6 text-muted">
          {block.replace(/\n/g, " ")}
        </p>
      );
    });
}

export default async function AboutPage() {
  const aboutCopy = await getAboutLabsCopy();

  return (
    <main>
      <section className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-5">{renderAboutMarkdown(aboutCopy)}</div>

          <aside className="rounded-lg border border-border bg-card p-4 shadow-sm sm:p-5">
            <p className="font-mono text-xs font-semibold uppercase tracking-normal text-accent">
              Summer shape
            </p>
            <dl className="mt-4 grid gap-4 text-sm">
              <div>
                <dt className="font-semibold text-foreground">Format</dt>
                <dd className="mt-1 text-muted">Independent project work</dd>
              </div>
              <div>
                <dt className="font-semibold text-foreground">Check-in</dt>
                <dd className="mt-1 text-muted">Weekly, 1-2 hours</dd>
              </div>
              <div>
                <dt className="font-semibold text-foreground">Commitment</dt>
                <dd className="mt-1 text-muted">About 10 hours per week</dd>
              </div>
            </dl>
            <Link
              href="/signup"
              className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-md bg-foreground px-5 py-3 text-sm font-semibold text-background transition hover:opacity-90"
            >
              Join
            </Link>
          </aside>
        </div>
      </section>
    </main>
  );
}
