import Link from "next/link";
import Image from "next/image";

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
          <div className="flex items-start gap-4 sm:items-center">
            <Image
              src="/images/lab-flask.svg"
              alt=""
              width={160}
              height={160}
              priority
              className="mt-1 size-16 shrink-0 sm:size-20"
            />
            <div>
              <h1 className="text-4xl font-semibold tracking-normal text-foreground sm:text-6xl">
                CodePet Labs
              </h1>
              <p className="mt-3 text-base leading-6 text-muted sm:text-lg">
                Tiny playful experiments.
              </p>
            </div>
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
          <SectionHeading title="Five tracks" />

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
