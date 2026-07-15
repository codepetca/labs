import Link from "next/link";

import { HeaderUserArea } from "@/components/header-user-menu";
import { MobileNavMenu } from "@/components/mobile-nav-menu";
import { SiteHomeLink } from "@/components/site-home-link";

export function SiteHeader({ authReady }: { authReady: boolean }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex min-h-15 w-full max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
        <SiteHomeLink authReady={authReady} />

        <nav
          aria-label="Main navigation"
          className="-mx-1 flex min-w-0 items-center gap-1 text-sm"
        >
          <Link
            href="/projects"
            className="inline-flex min-h-11 items-center rounded-md px-2.5 font-medium text-muted transition hover:bg-card-soft hover:text-foreground"
          >
            Projects
          </Link>
          <Link
            href="/about"
            className="hidden min-h-11 items-center rounded-md px-2.5 font-medium text-muted transition hover:bg-card-soft hover:text-foreground md:inline-flex"
          >
            About
          </Link>
          <HeaderUserArea authReady={authReady} />
          <Link
            href="/join"
            className="hidden min-h-11 items-center rounded-md bg-foreground px-4 font-semibold text-background transition hover:opacity-90 md:inline-flex"
          >
            Join
          </Link>
          <MobileNavMenu />
        </nav>
      </div>
    </header>
  );
}
