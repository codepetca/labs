import Image from "next/image";
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
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" aria-label="CodePet Labs home" className="shrink-0">
          <span
            aria-hidden="true"
            className="grid size-10 place-items-center rounded-md border border-border bg-surface"
          >
            <Image
              src="/images/paw-light.svg"
              alt=""
              width={24}
              height={24}
              priority
              className="size-6 dark:hidden"
            />
            <Image
              src="/images/paw-dark.svg"
              alt=""
              width={24}
              height={24}
              priority
              className="hidden size-6 dark:block"
            />
          </span>
        </Link>

        <nav
          aria-label="Main navigation"
          className="-mx-1 flex min-w-0 gap-1 overflow-x-auto pb-1 text-sm [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
