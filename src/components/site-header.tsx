import Image from "next/image";
import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link
          href="/"
          aria-label="CodePet Labs home"
          className="flex shrink-0 items-center gap-2"
        >
          <span
            aria-hidden="true"
            className="grid size-10 place-items-center rounded-md border border-border bg-surface"
          >
            <Image
              src="/images/codepet-paw-badge.svg"
              alt=""
              width={32}
              height={32}
              className="size-8"
            />
          </span>
          <span className="text-sm font-semibold text-foreground">
            CodePet Labs
          </span>
        </Link>

        <nav
          aria-label="Main navigation"
          className="-mx-1 flex min-w-0 gap-1 overflow-x-auto pb-1 text-sm [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <Link
            href="/hub"
            aria-label="Profile"
            title="Profile"
            className="grid size-10 shrink-0 place-items-center rounded-md text-muted transition hover:bg-card-soft hover:text-foreground"
          >
            <ProfileIcon />
          </Link>
        </nav>
      </div>
    </header>
  );
}

function ProfileIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    >
      <circle cx="12" cy="8" r="3.25" />
      <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}
