import Image from "next/image";

export type ProjectCardProject = {
  name: string;
  status: string;
  description: string;
  focusArea: string;
  demoUrl: string;
  githubUrl: string;
  contributor: string;
  imageUrl: string;
  imageAlt: string;
};

type ProjectCardProps = {
  project: ProjectCardProject;
};

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <Image
        src={project.imageUrl}
        alt={project.imageAlt}
        width={640}
        height={420}
        className="aspect-[16/10] w-full object-cover"
      />

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-md bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent">
            {project.status}
          </span>
          <span className="rounded-md bg-card-soft px-2.5 py-1 font-mono text-xs text-muted">
            {project.contributor}
          </span>
        </div>

        <h2 className="mt-4 text-base font-semibold leading-6 text-foreground">
          {project.name}
        </h2>
        <p className="mt-1 text-xs font-semibold uppercase text-muted">
          {project.focusArea}
        </p>
        <p className="mt-3 flex-1 text-sm leading-5 text-muted">
          {project.description}
        </p>

        <div className="mt-4 flex gap-3 border-t border-border pt-4 text-sm font-semibold">
          <a href={project.demoUrl} className="text-accent hover:underline">
            Demo
          </a>
          <a
            href={project.githubUrl}
            className="text-foreground hover:underline"
          >
            GitHub
          </a>
        </div>
      </div>
    </article>
  );
}
