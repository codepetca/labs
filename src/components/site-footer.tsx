import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-surface/80">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-5 py-8 text-sm text-muted sm:px-8 md:flex-row md:items-center md:justify-between">
        <p>
          CodePet Labs builds Pika-adjacent experiments with mock data first.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/about" className="hover:text-foreground">
            Philosophy
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
