"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import type { ProjectCardProject } from "@/components/project-card";

type TrackCardProps = {
  project: ProjectCardProject;
};

export function TrackCard({ project }: TrackCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const githubUrl = getGithubUrl(project.githubUrl);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isOpen]);

  return (
    <article className="group overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div className="relative">
        <Image
          src={project.imageUrl}
          alt={project.imageAlt}
          width={640}
          height={420}
          className="aspect-[16/10] w-full object-cover"
        />
        <button
          type="button"
          aria-label={`Play ${project.name} demo`}
          onClick={() => setIsOpen(true)}
          className="absolute inset-0 grid place-items-center bg-foreground/10 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
        >
          <span className="grid size-12 place-items-center rounded-full bg-background/95 text-foreground shadow-sm ring-1 ring-border transition group-hover:scale-105">
            <PlayIcon />
          </span>
        </button>
      </div>

      <div className="p-4">
        <h2 className="text-base font-semibold leading-6 text-foreground">
          <a
            href={githubUrl}
            target="_blank"
            rel="noreferrer"
            className="hover:text-accent"
          >
            {project.name}
          </a>
        </h2>
        <p className="mt-2 text-sm leading-5 text-muted">
          {project.description}
        </p>
      </div>

      {isOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${project.name} demo`}
          className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-4 backdrop-blur"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-3xl overflow-hidden rounded-lg border border-border bg-card shadow-sm"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
              <h3 className="text-sm font-semibold text-foreground">
                {project.name}
              </h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="grid size-9 place-items-center rounded-md text-muted transition hover:bg-card-soft hover:text-foreground"
                aria-label="Close demo"
              >
                <CloseIcon />
              </button>
            </div>
            <video
              src={project.demoVideoUrl}
              poster={project.imageUrl}
              controls
              autoPlay
              muted
              playsInline
              className="aspect-video w-full bg-surface object-cover"
            />
          </div>
        </div>
      ) : null}
    </article>
  );
}

function getGithubUrl(url: string) {
  if (url.startsWith("https://github.com/")) {
    return url;
  }

  return "https://github.com/codepetca/codepet-labs";
}

function PlayIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-5 translate-x-0.5"
      fill="currentColor"
    >
      <path d="M8 5.5v13l10-6.5-10-6.5Z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    >
      <path d="m6 6 12 12" />
      <path d="m18 6-12 12" />
    </svg>
  );
}
