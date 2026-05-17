export type ProjectCardProject = {
  name: string;
  status: string;
  description: string;
  focusArea: string;
  demoUrl: string;
  githubUrl: string;
  contributor: string;
};

type ProjectCardProps = {
  project: ProjectCardProject;
};

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <article className="flex h-full flex-col rounded-lg border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            {project.name}
          </h2>
          <p className="mt-1 text-sm text-muted">{project.focusArea}</p>
        </div>
        <span className="rounded-md bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent">
          {project.status}
        </span>
      </div>

      <p className="mt-4 flex-1 text-sm leading-6 text-muted">
        {project.description}
      </p>

      <div className="mt-5 flex items-center justify-between gap-4 border-t border-border pt-4">
        <span className="rounded-md bg-card-soft px-2.5 py-1 font-mono text-xs text-muted">
          {project.contributor}
        </span>
        <div className="flex gap-3 text-sm font-semibold">
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
