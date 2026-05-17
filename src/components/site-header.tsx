import Link from "next/link";

const navItems = [
  { href: "/projects", label: "Projects" },
  { href: "/showcase", label: "Showcase" },
  { href: "/about", label: "About" },
  { href: "/join", label: "Join" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-border bg-background/90">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-5 py-4 sm:px-8 md:flex-row md:items-center md:justify-between">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-md border border-border bg-foreground font-mono text-sm font-semibold text-background">
            CL
          </span>
          <span>
            <span className="block text-sm font-semibold text-foreground">
              CodePet Labs
            </span>
            <span className="block text-xs text-muted">
              AI-native student software lab
            </span>
          </span>
        </Link>

        <nav aria-label="Main navigation" className="flex flex-wrap gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted transition hover:bg-card-soft hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
