"use client";

import { Play, X } from "@phosphor-icons/react";
import Image from "next/image";
import { useRef } from "react";

import type { ProjectCardProject } from "@/components/project-card";

export function TrackCard({
  project,
  priority = false,
}: {
  project: ProjectCardProject;
  priority?: boolean;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  function openDemo() {
    dialogRef.current?.showModal();
    void videoRef.current?.play();
  }

  function closeDemo() {
    videoRef.current?.pause();
    dialogRef.current?.close();
  }

  return (
    <article className="overflow-hidden rounded-lg border border-border bg-card">
      <button
        ref={triggerRef}
        type="button"
        aria-label={`Play ${project.name} preview`}
        onClick={openDemo}
        className="group relative block w-full overflow-hidden text-left"
      >
        <Image
          src={project.imageUrl}
          alt={project.imageAlt}
          width={640}
          height={420}
          priority={priority}
          className="aspect-[16/10] w-full object-cover transition duration-300 group-hover:scale-[1.02]"
        />
        <span className="absolute bottom-3 right-3 grid size-10 place-items-center rounded-md border border-border bg-background/95 text-foreground shadow-sm">
          <Play aria-hidden="true" size={17} weight="fill" />
        </span>
      </button>
      <div className="border-t border-border p-4">
        <p className={`font-mono text-[11px] font-semibold uppercase tracking-[0.12em] ${getStatusColor(project.status)}`}>
          {project.status}
        </p>
        <h3 className="mt-2 text-base font-semibold text-foreground">
          {shortProjectName(project.name)}
        </h3>
        <p className="mt-2 text-sm leading-5 text-muted">{project.description}</p>
      </div>

      <dialog
        ref={dialogRef}
        aria-labelledby={`${project.contributor}-demo-title`}
        onClose={() => {
          videoRef.current?.pause();
          triggerRef.current?.focus();
        }}
        onClick={(event) => {
          if (event.target === dialogRef.current) closeDemo();
        }}
        className="m-auto w-[min(92vw,52rem)] overflow-hidden rounded-lg border border-border bg-card p-0 text-foreground shadow-2xl"
      >
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <h2 id={`${project.contributor}-demo-title`} className="text-sm font-semibold">
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

function shortProjectName(name: string) {
  return name.replace(/ Prototype$| Experiments$/, "");
}

function getStatusColor(status: string) {
  if (status === "Prototype") return "text-accent";
  if (status === "Design build") return "text-violet";
  return "text-warm";
}
