"use client";

import { useMemo, useState } from "react";
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
    <form action={action} className="mt-3">
      {hiddenSelectedRepoNames.map((repoName) => (
        <input key={repoName} type="hidden" name="repo" value={repoName} />
      ))}

      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold text-muted">{selectedLabel}</span>
        {hasMore ? (
          <button
            type="button"
            className="min-h-9 rounded-md border border-border bg-surface px-3 text-sm font-semibold text-foreground transition hover:bg-card"
            onClick={() =>
              setVisibleCount((current) =>
                Math.min(current + INITIAL_VISIBLE_REPOS, repos.length),
              )
            }
          >
            Load more
          </button>
        ) : null}
      </div>

      <div className="mt-2 grid gap-2">
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

      <SaveButton disabled={!storageReady} />
    </form>
  );
}

function SaveButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="mt-3 min-h-9 rounded-md bg-foreground px-3 text-sm font-semibold text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
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
