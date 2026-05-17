import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-surface/80">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-4 py-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>Mock data first. Pika core protected.</p>
        <div className="flex flex-wrap gap-3">
          <Link href="/about" className="hover:text-foreground">
            About
          </Link>
          <Link href="/projects" className="hover:text-foreground">
            Projects
          </Link>
          <Link href="/join" className="hover:text-foreground">
            Join
          </Link>
        </div>
      </div>
    </footer>
  );
}
