import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import contributorContent from "../../../content/contributors.json";

type ContributorRecord = {
  name: string;
  role: string;
  cohort: string;
  award: string;
  awardedOn: string;
  summary: string;
  contributions: string[];
  personalUrl?: string;
};

const content = contributorContent as { records: ContributorRecord[] };

export const metadata: Metadata = {
  title: "Contributors | Codepet Labs",
  description: "Public credit for reviewed Codepet Labs work.",
};

export default function ContributorsPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
      <section>
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.12em] text-muted">
          Public credit
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-foreground sm:text-6xl">
          Contributors
        </h1>
      </section>

      <section className="mt-12 sm:mt-16">
        {content.records.length ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {content.records.map((record) => (
              <ContributorCard key={`${record.name}-${record.cohort}`} record={record} />
            ))}
          </div>
        ) : (
          <div className="grid justify-items-start gap-4 border-y border-border py-10 sm:py-14">
            <Image src="/images/paw-icon.svg" alt="" width={38} height={38} />
            <h2 className="text-2xl font-semibold text-foreground">
              Work gets credited after it ships.
            </h2>
            <p className="max-w-lg text-sm leading-6 text-muted">
              The first public contributor records will appear after the Summer 2026 projects are reviewed.
            </p>
            <div className="mt-2 flex flex-wrap gap-4">
              <Link
                href="/projects"
                className="inline-flex min-h-11 items-center gap-2 rounded-md bg-foreground px-5 py-3 text-sm font-semibold text-background hover:opacity-90"
              >
                View projects
                <ArrowRight aria-hidden="true" size={17} />
              </Link>
              <Link
                href="/join"
                className="inline-flex min-h-11 items-center text-sm font-semibold text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground"
              >
                Join the studio
              </Link>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

function ContributorCard({ record }: { record: ContributorRecord }) {
  return (
    <article className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.12em] text-accent">
            {record.cohort}
          </p>
          <h2 className="mt-3 text-xl font-semibold text-foreground">
            {record.name}
          </h2>
          <p className="mt-1 text-sm text-muted">{record.role}</p>
        </div>
        <span className="rounded-md bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent">
          {record.award}
        </span>
      </div>
      <p className="mt-4 text-sm leading-5 text-muted">{record.summary}</p>

      <ul className="mt-4 grid gap-2">
        {record.contributions.map((contribution) => (
          <li
            key={contribution}
            className="rounded-md border border-border bg-card-soft px-3 py-2 text-sm text-muted"
          >
            {contribution}
          </li>
        ))}
      </ul>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm font-semibold">
        <span className="text-muted">Awarded {record.awardedOn}</span>
        {record.personalUrl ? (
          <a
            href={record.personalUrl}
            target="_blank"
            rel="noreferrer"
            className="text-accent hover:underline"
          >
            Builder page
          </a>
        ) : null}
      </div>
    </article>
  );
}
