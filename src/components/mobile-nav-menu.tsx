"use client";

import { DotsThree } from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export function MobileNavMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    firstLinkRef.current?.focus();

    function closeOutside(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative z-50 md:hidden">
      <button
        ref={triggerRef}
        type="button"
        aria-label="More navigation"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        className="grid size-11 place-items-center rounded-md text-muted transition hover:bg-card-soft hover:text-foreground"
      >
        <DotsThree aria-hidden="true" size={22} weight="bold" />
      </button>
      <div
        role="menu"
        aria-label="More navigation"
        aria-hidden={!isOpen}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            setIsOpen(false);
            triggerRef.current?.focus();
          }
        }}
        className={`absolute right-0 top-full z-50 mt-2 w-40 rounded-lg border border-border bg-card p-1 text-sm shadow-lg transition ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <Link
          ref={firstLinkRef}
          role="menuitem"
          tabIndex={isOpen ? 0 : -1}
          href="/about"
          onClick={() => setIsOpen(false)}
          className="flex min-h-11 items-center rounded-md px-3 text-muted hover:bg-card-soft hover:text-foreground"
        >
          About
        </Link>
        <Link
          role="menuitem"
          tabIndex={isOpen ? 0 : -1}
          href="/contributors"
          onClick={() => setIsOpen(false)}
          className="flex min-h-11 items-center rounded-md px-3 text-muted hover:bg-card-soft hover:text-foreground"
        >
          Contributors
        </Link>
        <Link
          role="menuitem"
          tabIndex={isOpen ? 0 : -1}
          href="/join"
          onClick={() => setIsOpen(false)}
          className="flex min-h-11 items-center rounded-md px-3 font-semibold text-foreground hover:bg-card-soft"
        >
          Join
        </Link>
      </div>
    </div>
  );
}
