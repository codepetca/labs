import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-surface-muted/45">
      <div className="mx-auto grid w-full max-w-5xl gap-5 px-4 py-7 text-sm text-muted sm:grid-cols-[1fr_auto] sm:items-center sm:px-6">
        <div className="flex items-center gap-2 font-semibold text-foreground">
          <Image src="/images/paw-icon.svg" alt="" width={20} height={20} />
          Codepet Labs
        </div>
        <nav
          aria-label="Secondary navigation"
          className="flex flex-wrap gap-x-5 gap-y-2"
        >
          <Link href="/projects" className="hover:text-foreground hover:underline">
            Projects
          </Link>
          <Link href="/about" className="hover:text-foreground hover:underline">
            About
          </Link>
          <Link href="/contributors" className="hover:text-foreground hover:underline">
            Contributors
          </Link>
        </nav>
        <p className="text-xs sm:col-span-2">
          Small software experiments, built with GitHub.
        </p>
      </div>
    </footer>
  );
}
