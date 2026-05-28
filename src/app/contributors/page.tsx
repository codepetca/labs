import type { Metadata } from "next";

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

type ContributorContent = {
  records: ContributorRecord[];
};

const content = contributorContent as ContributorContent;

export const metadata: Metadata = {
  title: "Contributors | Codepet Labs",
  description:
    "Awarded Codepet Labs contributor and graduate records, maintained as static public content.",
};

export default function ContributorsPage() {
  const records = content.records;

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <section>
        <h1 className="text-4xl font-semibold tracking-normal text-foreground sm:text-5xl">
          Contributors
        </h1>
      </section>

      <section className="mt-10 border-t border-border pt-10 sm:mt-14 sm:pt-14">
        {records.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {records.map((record) => (
              <ContributorCard
                key={`${record.name}-${record.cohort}`}
                record={record}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-card p-4 shadow-sm sm:p-5">
            <p className="font-mono text-xs font-semibold uppercase tracking-normal text-warm">
              Summer 2026
            </p>
          </div>
        )}
      </section>
    </main>
  );
}

function ContributorCard({ record }: { record: ContributorRecord }) {
  return (
    <article className="rounded-lg border border-border bg-card p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-normal text-accent">
            {record.cohort}
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-normal text-foreground">
            {record.name}
          </h2>
          <p className="mt-1 text-sm font-semibold text-muted">{record.role}</p>
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
            Page
          </a>
        ) : null}
      </div>
    </article>
  );
}
