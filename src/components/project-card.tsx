import Image from "next/image";

export type ProjectCardProject = {
  name: string;
  status: string;
  description: string;
  focusArea: string;
  demoUrl: string;
  githubUrl: string;
  demoVideoUrl?: string;
  contributor: string;
  imageUrl: string;
  imageAlt: string;
};

type ProjectCardProps = {
  project: ProjectCardProject;
};

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <article className="grid min-h-32 grid-cols-[minmax(0,1fr)_112px] overflow-hidden rounded-lg border border-border bg-card shadow-sm sm:grid-cols-[minmax(0,1fr)_220px]">
      <div className="flex min-w-0 flex-col p-4">
        <h2 className="text-base font-semibold leading-6 text-foreground">
          {project.name}
        </h2>
        <p className="mt-2 flex-1 text-sm leading-5 text-muted">
          {project.description}
        </p>

        <div className="mt-3 flex gap-3 text-sm font-semibold">
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

      <Image
        src={project.imageUrl}
        alt={project.imageAlt}
        width={640}
        height={420}
        className="h-full min-h-32 w-full border-l border-border object-cover"
      />
    </article>
  );
}
