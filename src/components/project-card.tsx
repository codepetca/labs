"use client";

import {
  ArrowSquareOut,
  GithubLogo,
  Play,
  X,
} from "@phosphor-icons/react";
import Image from "next/image";
import { useRef } from "react";

export type ProjectCardProject = {
  name: string;
  status: string;
  description: string;
  focusArea: string;
  demoUrl: string;
  githubUrl: string;
  demoVideoUrl?: string;
  demoDuration?: string;
  contributor: string;
  imageUrl: string;
  imageAlt: string;
};

export function ProjectCard({
  project,
  priority = false,
}: {
  project: ProjectCardProject;
  priority?: boolean;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null);
  const demoReady = Boolean(project.demoVideoUrl);

  function openDemo(trigger: HTMLButtonElement) {
    if (!demoReady) return;
    lastTriggerRef.current = trigger;
    dialogRef.current?.showModal();
    void videoRef.current?.play();
  }

  function closeDemo() {
    videoRef.current?.pause();
    dialogRef.current?.close();
  }

  return (
    <article className="grid gap-4 border-t border-border py-5 first:border-t-0 sm:grid-cols-[220px_minmax(0,1fr)] sm:gap-6 lg:grid-cols-[280px_minmax(0,1fr)_176px] lg:items-center">
      <button
        type="button"
        disabled={!demoReady}
        aria-label={demoReady ? `Play ${project.name} preview` : `${project.name} preview unavailable`}
        onClick={(event) => openDemo(event.currentTarget)}
        className="group relative overflow-hidden rounded-lg border border-border bg-card text-left disabled:cursor-default"
      >
        <Image
          src={project.imageUrl}
          alt={project.imageAlt}
          width={640}
          height={420}
          priority={priority}
          className="aspect-[16/10] w-full object-cover transition duration-300 group-enabled:group-hover:scale-[1.02]"
        />
        {demoReady ? (
          <span className="absolute bottom-3 right-3 grid size-10 place-items-center rounded-md border border-border bg-background/95 text-foreground shadow-sm">
            <Play aria-hidden="true" size={17} weight="fill" />
          </span>
        ) : null}
      </button>

      <div className="min-w-0">
        <p className={`font-mono text-[11px] font-semibold uppercase tracking-[0.12em] ${getStatusColor(project.status)}`}>
          {project.status}
        </p>
        <h2 className="mt-2 text-lg font-semibold text-foreground">{project.name}</h2>
        <p className="mt-2 text-sm leading-5 text-muted">{project.description}</p>
      </div>

      <div className="flex gap-2 sm:col-start-2 lg:col-start-auto lg:flex-col">
        <button
          type="button"
          disabled={!demoReady}
          onClick={(event) => openDemo(event.currentTarget)}
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md border border-border bg-background px-3 text-sm font-semibold text-foreground transition hover:bg-card-soft disabled:cursor-not-allowed disabled:text-muted"
        >
          <Play aria-hidden="true" size={15} weight="fill" />
          {demoReady ? `Play preview · ${project.demoDuration ?? "short"}` : "Preview soon"}
        </button>
        <a
          href={getGithubUrl(project.githubUrl)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md border border-border bg-background px-3 text-sm font-semibold text-foreground transition hover:bg-card-soft"
        >
          <GithubLogo aria-hidden="true" size={17} />
          GitHub
          <ArrowSquareOut aria-hidden="true" size={14} />
        </a>
      </div>

      <dialog
        ref={dialogRef}
        aria-labelledby={`${project.contributor}-project-demo-title`}
        onClose={() => {
          videoRef.current?.pause();
          lastTriggerRef.current?.focus();
        }}
        onClick={(event) => {
          if (event.target === dialogRef.current) closeDemo();
        }}
        className="m-auto w-[min(92vw,52rem)] overflow-hidden rounded-lg border border-border bg-card p-0 text-foreground shadow-2xl"
      >
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <h2 id={`${project.contributor}-project-demo-title`} className="text-sm font-semibold">
            {project.name}
          </h2>
          <button
            type="button"
            onClick={closeDemo}
            aria-label="Close demo"
            className="grid size-10 place-items-center rounded-md text-muted hover:bg-card-soft hover:text-foreground"
          >
            <X aria-hidden="true" size={18} />
          </button>
        </div>
        <video
          ref={videoRef}
          src={project.demoVideoUrl}
          poster={project.imageUrl}
          controls
          muted
          playsInline
          className="aspect-video w-full bg-surface object-cover"
        />
      </dialog>
    </article>
  );
}

function getGithubUrl(url: string) {
  return url.startsWith("https://github.com/")
    ? url
    : "https://github.com/codepetca/codepet-labs";
}

function getStatusColor(status: string) {
  if (status === "Prototype") return "text-accent";
  if (status === "Design build") return "text-violet";
  return "text-warm";
}
