"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";

import type { GithubRepoSummary } from "@/lib/github-observability";

type RepoObserverPickerProps = {
  action: (formData: FormData) => void | Promise<void>;
  repos: GithubRepoSummary[];
  selectedRepoNames: string[];
  storageReady: boolean;
};

const INITIAL_VISIBLE_REPOS = 5;

export function RepoObserverPicker({
  action,
  repos,
  selectedRepoNames,
  storageReady,
}: RepoObserverPickerProps) {
  const titleId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_REPOS);
  const [selected, setSelected] = useState(() => new Set(selectedRepoNames));
  const visibleRepos = repos.slice(0, visibleCount);
  const hasMore = visibleCount < repos.length;
  const selectedCount = selected.size;
  const visibleRepoNames = new Set(visibleRepos.map((repo) => repo.fullName));
  const hiddenSelectedRepoNames = Array.from(selected).filter(
    (repoName) => !visibleRepoNames.has(repoName),
  );
  const selectedLabel = useMemo(
    () => `${selectedCount} selected`,
    [selectedCount],
  );

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

  function toggleRepo(repoName: string) {
    setSelected((current) => {
      const next = new Set(current);

      if (next.has(repoName)) {
        next.delete(repoName);
      } else {
        next.add(repoName);
      }

      return next;
    });
  }

  return (
    <>
      <button
        type="button"
        className="mt-1 min-h-9 w-fit rounded-md border border-border bg-surface px-3 text-sm font-semibold text-foreground transition hover:bg-card"
        onClick={() => setIsOpen(true)}
      >
        Repo settings
      </button>

      {isOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-4 backdrop-blur"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="max-h-[min(720px,calc(100vh-2rem))] w-full max-w-xl overflow-hidden rounded-lg border border-border bg-card shadow-sm"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
              <div>
                <h3
                  id={titleId}
                  className="text-base font-semibold text-foreground"
                >
                  Observed repos
                </h3>
                <p className="mt-0.5 text-xs text-muted">{selectedLabel}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="grid size-9 place-items-center rounded-md text-muted transition hover:bg-card-soft hover:text-foreground"
                aria-label="Close repo settings"
              >
                <CloseIcon />
              </button>
            </div>

            <form
              action={action}
              className="grid max-h-[calc(100vh-8rem)] gap-3 overflow-y-auto p-4"
            >
              {hiddenSelectedRepoNames.map((repoName) => (
                <input
                  key={repoName}
                  type="hidden"
                  name="repo"
                  value={repoName}
                />
              ))}

              <div className="grid gap-2">
                {visibleRepos.map((repo) => {
                  const checked = selected.has(repo.fullName);

                  return (
                    <label
                      key={repo.fullName}
                      className="grid cursor-pointer grid-cols-[auto_minmax(0,1fr)] gap-3 rounded-md border border-border bg-card p-2.5 text-sm transition hover:bg-card-soft"
                    >
                      <input
                        type="checkbox"
                        name="repo"
                        value={repo.fullName}
                        checked={checked}
                        disabled={!storageReady}
                        onChange={() => toggleRepo(repo.fullName)}
                        className="mt-1 size-4 accent-accent"
                      />
                      <span className="min-w-0">
                        <span className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                          <span className="font-semibold text-foreground">
                            {repo.name}
                          </span>
                          <span className="text-xs text-muted">
                            {formatRelativeDate(repo.pushedAt)}
                          </span>
                        </span>
                        {repo.description ? (
                          <span className="mt-1 block truncate text-xs text-muted">
                            {repo.description}
                          </span>
                        ) : null}
                      </span>
                    </label>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
                {hasMore ? (
                  <button
                    type="button"
                    className="min-h-9 rounded-md border border-border bg-surface px-3 text-sm font-semibold text-foreground transition hover:bg-card"
                    onClick={() =>
                      setVisibleCount((current) =>
                        Math.min(
                          current + INITIAL_VISIBLE_REPOS,
                          repos.length,
                        ),
                      )
                    }
                  >
                    Load more
                  </button>
                ) : (
                  <span className="text-xs text-muted">All repos shown</span>
                )}
                <SaveButton disabled={!storageReady} />
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}

function SaveButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="min-h-9 rounded-md bg-foreground px-3 text-sm font-semibold text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {pending ? "Saving" : "Save repos"}
    </button>
  );
}

function formatRelativeDate(value: string | null) {
  if (!value) {
    return "No activity";
  }

  const timestamp = Date.parse(value);

  if (Number.isNaN(timestamp)) {
    return "No activity";
  }

  const days = Math.floor((Date.now() - timestamp) / 86_400_000);

  if (days <= 0) {
    return "Active today";
  }

  if (days === 1) {
    return "Active yesterday";
  }

  return `Active ${days}d ago`;
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
