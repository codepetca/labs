import Link from "next/link";

const navItems = [
  { href: "/projects", label: "Projects" },
  { href: "/showcase", label: "Showcase" },
  { href: "/about", label: "About" },
  { href: "/join", label: "Join" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-md border border-border bg-foreground font-mono text-sm font-semibold text-background">
            CL
          </span>
          <span className="block text-sm font-semibold text-foreground">
            CodePet Labs
          </span>
        </Link>

        <nav
          aria-label="Main navigation"
          className="-mx-1 flex gap-1 overflow-x-auto pb-1 text-sm [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="shrink-0 rounded-md px-3 py-2 font-medium text-muted transition hover:bg-card-soft hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
