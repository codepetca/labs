import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { withAuth } from "@workos-inc/authkit-nextjs";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import type { ProjectCardProject } from "@/components/project-card";
import { TrackCard } from "@/components/track-card";
import { getLabsConfigStatus, isAdminEmail } from "@/lib/labs-admin";

import projects from "../../content/projects.json";

const projectList = projects as ProjectCardProject[];

export const dynamic = "force-dynamic";

export default async function Home() {
  await redirectSignedInUser();

  return (
    <main>
      <section className="border-b border-border">
        <div className="mx-auto grid w-full max-w-5xl gap-10 px-4 py-12 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-24">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.12em] text-warm">
              Summer 2026 · Invite only
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-foreground sm:text-6xl lg:text-7xl">
              Codepet Labs
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-7 text-muted sm:text-xl sm:leading-8">
              Young builders make AI-assisted prototypes here — GitHub is required.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/join"
                className="inline-flex min-h-11 items-center justify-center gap-3 rounded-md bg-foreground px-5 py-3 text-sm font-semibold text-background transition hover:opacity-90"
              >
                Join the studio
                <ArrowRight aria-hidden="true" size={18} />
              </Link>
              <Link
                href="/projects"
                className="inline-flex min-h-11 items-center text-sm font-semibold text-foreground underline decoration-border underline-offset-4 transition hover:decoration-foreground"
              >
                Browse projects
              </Link>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <Image
              src="/images/lab-board.svg"
              alt="Codepet Labs project board with small prototype cards"
              width={900}
              height={640}
              priority
              className="aspect-[4/3] w-full object-cover"
            />
            <div className="flex items-center justify-between border-t border-border px-4 py-3 font-mono text-xs text-muted">
              <span>Current board</span>
              <span>{projectList.length} experiments</span>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface-muted/35">
        <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-20">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                Playable work
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-foreground">
                Projects
              </h2>
            </div>
            <Link
              href="/projects"
              className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground"
            >
              View all
              <ArrowRight aria-hidden="true" size={17} />
            </Link>
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projectList.slice(0, 3).map((project, index) => (
              <TrackCard key={project.name} project={project} priority={index === 0} />
            ))}
          </div>

          <div className="mt-12 flex flex-col gap-5 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.12em] text-accent">
                Build with us
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-foreground">
                Bring one small idea.
              </h2>
            </div>
            <Link
              href="/join"
              className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground"
            >
              How joining works
              <ArrowRight aria-hidden="true" size={17} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

async function redirectSignedInUser() {
  if (!getLabsConfigStatus().ready) return;

  const { user } = await withAuth();
  if (!user) return;

  if (isAdminEmail(user.email)) redirect("/admin");
  if (user.metadata.labsStatus === "approved") redirect("/hub");
  redirect("/profile");
}
