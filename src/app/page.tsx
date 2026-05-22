import Link from "next/link";

import { SectionHeading } from "@/components/section-heading";
import { TrackCard } from "@/components/track-card";
import type { ProjectCardProject } from "@/components/project-card";

import projects from "../../content/projects.json";

const projectList = projects as ProjectCardProject[];

export default function Home() {
  const discordInviteUrl = process.env.CODEPET_DISCORD_INVITE_URL;

  return (
    <main>
      <section
        id="join"
        className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-14"
      >
        <div className="max-w-3xl">
          <h1 className="text-4xl font-semibold tracking-normal text-foreground sm:text-6xl">
            CodePet Labs
          </h1>
          <div className="mt-3 inline-flex items-center gap-2 text-muted">
            <p className="text-base leading-6 sm:text-lg">
              Tiny playful experiments.
            </p>
            <TennisBallIcon />
          </div>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <a
              href="/hub"
              className="inline-flex min-h-16 items-center justify-center rounded-md bg-foreground px-10 py-5 text-xl font-semibold text-background transition hover:opacity-90 sm:min-w-44"
            >
              Join
            </a>
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
        </div>
      </section>

      <section id="tracks" className="border-y border-border bg-surface/75">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
          <SectionHeading title="Projects" />

          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {projectList.map((project) => (
              <TrackCard key={project.name} project={project} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function TennisBallIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 32 32"
      className="size-4 shrink-0 text-[#2faa58]"
      fill="none"
    >
      <circle cx="16" cy="16" r="12" fill="currentColor" />
      <path
        d="M7.7 7.4c4.5 3 6.2 6.5 5.4 10.5-.4 2.4-1.7 4.7-3.7 6.9M24.3 7.2c-4.5 3-6.2 6.5-5.4 10.5.4 2.4 1.7 4.7 3.7 6.9"
        stroke="var(--background)"
        strokeLinecap="round"
        strokeWidth="2.8"
      />
    </svg>
  );
}
