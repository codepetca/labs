import { ProjectCard, type ProjectCardProject } from "@/components/project-card";
import { SectionHeading } from "@/components/section-heading";

import projects from "../../../content/projects.json";

const projectList = projects as ProjectCardProject[];

export default function ProjectsPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8">
      <SectionHeading
        eyebrow="Projects"
        title="Pika-adjacent prototypes and student experiments"
        description="These projects use mock data, separate repos, and narrow scopes. The goal is to learn by shipping visible work while keeping Pika core supervised and protected."
      />

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {projectList.map((project) => (
          <ProjectCard key={project.name} project={project} />
        ))}
      </div>
    </main>
  );
}
