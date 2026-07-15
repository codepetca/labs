import type { Metadata } from "next";

import { ProjectCard, type ProjectCardProject } from "@/components/project-card";

import projects from "../../../content/projects.json";

const projectList = projects as ProjectCardProject[];

export const metadata: Metadata = {
  title: "Projects | Codepet Labs",
  description: "Playable Codepet Labs prototypes and experiments.",
};

export default function ProjectsPage() {
  const previewCount = projectList.filter((project) => project.demoVideoUrl).length;

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
      <section>
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.12em] text-muted">
          Summer 2026
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-foreground sm:text-6xl">
          Projects
        </h1>
        <p className="mt-4 max-w-xl text-base leading-6 text-muted sm:text-lg">
          Five working experiments. Play the short preview or inspect the code.
        </p>
      </section>

      <section className="mt-12 sm:mt-16" aria-labelledby="current-work-heading">
        <div className="flex items-center justify-between gap-4 border-b border-border pb-3">
          <h2 id="current-work-heading" className="text-base font-semibold text-foreground">
            Current work
          </h2>
          <p className="flex items-center gap-2 font-mono text-xs text-muted">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />
            {previewCount} previews available
          </p>
        </div>
        <div>
          {projectList.map((project, index) => (
            <ProjectCard key={project.name} project={project} priority={index === 0} />
          ))}
        </div>
      </section>
    </main>
  );
}
