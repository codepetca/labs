import { ProjectCard, type ProjectCardProject } from "@/components/project-card";
import { SectionHeading } from "@/components/section-heading";

import projects from "../../../content/projects.json";

const projectList = projects as ProjectCardProject[];

export default function ProjectsPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <SectionHeading title="Prototypes" />

      <div className="mt-7 grid gap-4 sm:grid-cols-2">
        {projectList.map((project) => (
          <ProjectCard key={project.name} project={project} />
        ))}
      </div>
    </main>
  );
}
