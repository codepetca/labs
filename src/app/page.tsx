import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { withAuth } from "@workos-inc/authkit-nextjs";
import Link from "next/link";
import { redirect } from "next/navigation";

import type { ProjectCardProject } from "@/components/project-card";
import { TrackCard } from "@/components/track-card";
import { getLabsConfigStatus, isAdminEmail } from "@/lib/labs-admin";

import projects from "../../content/projects.json";

const projectList = projects as ProjectCardProject[];
const featuredProject: ProjectCardProject = {
  ...projectList[0],
  name: "Pal",
  description: "A gamified pet.",
};

export const dynamic = "force-dynamic";

export default async function Home() {
  await redirectSignedInUser();

  return (
    <main>
      <section>
        <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-20 lg:py-24">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-semibold tracking-[-0.04em] text-foreground sm:text-6xl lg:text-7xl">
              Codepet Labs
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-7 text-muted sm:text-xl sm:leading-8">
              Play, learn, solve real problems with AI.
            </p>
            <div className="mt-8">
              <Link
                href="/join"
                className="inline-flex min-h-11 items-center justify-center gap-3 rounded-md bg-foreground px-5 py-3 text-sm font-semibold text-background transition hover:opacity-90"
              >
                Apply
                <ArrowRight aria-hidden="true" size={18} />
              </Link>
            </div>
          </div>

          <div className="mt-12 border-t border-border pt-8 sm:mt-16 sm:pt-10">
            <p className="mb-4 font-mono text-xs font-semibold uppercase tracking-[0.12em] text-muted">
              Featured project
            </p>
            <TrackCard project={featuredProject} priority featured />
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
