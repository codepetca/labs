"use client";

import { AuthKitProvider, useAuth } from "@workos-inc/authkit-nextjs/components";
import type { User } from "@workos-inc/node";
import Link from "next/link";
import type { KeyboardEvent, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const AUTHED_PATHS = ["/admin", "/hub", "/profile"] as const;

export function HeaderUserArea() {
  const pathname = usePathname();
  const shouldLoadUser = AUTHED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  if (!shouldLoadUser) {
    return <GuestUserMenu />;
  }

  return (
    <AuthKitProvider onSessionExpired={false}>
      <AuthenticatedUserMenu />
    </AuthKitProvider>
  );
}

function AuthenticatedUserMenu() {
  const { user, loading, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | HTMLButtonElement | null)[]>([]);
  const shouldFocusFirstItem = useRef(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && shouldFocusFirstItem.current) {
      itemRefs.current[0]?.focus();
      shouldFocusFirstItem.current = false;
    }
  }, [isOpen]);

  if (loading) {
    return (
      <button
        type="button"
        aria-label="Profile"
        title="Profile"
        disabled
        className="grid size-10 shrink-0 place-items-center rounded-md text-muted opacity-70"
      >
        <ProfileIcon />
      </button>
    );
  }

  if (!user) {
    return <GuestUserMenu />;
  }

  const displayName = getDisplayName(user);
  const initials = getInitials(user);
  const statusLabel = getStatusLabel(user.metadata.labsStatus);
  const githubUsername = user.metadata.githubUsername;
  const detailLabel = githubUsername
    ? `${statusLabel} - @${githubUsername}`
    : statusLabel;
  const isApprovedBuilder = user.metadata.labsStatus === "approved";
  const avatarColor = getAvatarColor(displayName || user.email);

  function openMenu(focusFirstItem = false) {
    shouldFocusFirstItem.current = focusFirstItem;
    setIsOpen(true);
  }

  function closeMenu() {
    shouldFocusFirstItem.current = false;
    setIsOpen(false);
  }

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openMenu(true);
    }

    if (event.key === "Escape") {
      closeMenu();
    }
  }

  function handleMenuKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu();
      return;
    }

    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") {
      return;
    }

    event.preventDefault();
    const currentIndex = itemRefs.current.findIndex(
      (item) => item === document.activeElement,
    );
    const direction = event.key === "ArrowDown" ? 1 : -1;
    const nextIndex =
      currentIndex === -1
        ? 0
        : (currentIndex + direction + itemRefs.current.length) %
          itemRefs.current.length;

    itemRefs.current[nextIndex]?.focus();
  }

  async function handleSignOut() {
    setIsSigningOut(true);
    closeMenu();

    try {
      await signOut({ returnTo: "/" });
    } catch {
      setIsSigningOut(false);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label="Profile menu"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => (isOpen ? closeMenu() : openMenu())}
        onKeyDown={handleTriggerKeyDown}
        className="grid size-10 shrink-0 place-items-center rounded-md text-muted transition hover:bg-card-soft hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <Avatar color={avatarColor} initials={initials} size="sm" />
      </button>

      <div
        role="menu"
        aria-label="Profile menu"
        aria-hidden={!isOpen}
        onKeyDown={handleMenuKeyDown}
        className={`absolute right-0 top-full z-50 mt-2 w-72 origin-top-right rounded-lg border border-border bg-card py-1 text-sm shadow-lg transition duration-150 ${
          isOpen
            ? "scale-100 opacity-100"
            : "pointer-events-none scale-95 opacity-0"
        }`}
      >
        <div className="border-b border-border px-4 py-3">
          <div className="flex items-center gap-3">
            <Avatar color={avatarColor} initials={initials} size="md" />
            <div className="min-w-0">
              <p className="truncate font-semibold text-foreground">
                {displayName || user.email}
              </p>
              <p className="mt-0.5 truncate text-muted">{user.email}</p>
              <p className="mt-1 truncate text-xs text-muted">{detailLabel}</p>
            </div>
          </div>
        </div>

        <MenuLink
          refCallback={(element) => {
            itemRefs.current[0] = element;
          }}
          href="/profile"
          label="Profile"
          onClick={closeMenu}
          tabIndex={isOpen ? 0 : -1}
        >
          <ProfileIcon />
        </MenuLink>

        {isApprovedBuilder ? (
          <MenuLink
            refCallback={(element) => {
              itemRefs.current[1] = element;
            }}
            href="/hub"
            label="Hub"
            onClick={closeMenu}
            tabIndex={isOpen ? 0 : -1}
          >
            <HubIcon />
          </MenuLink>
        ) : null}

        <button
          type="button"
          ref={(element) => {
            itemRefs.current[isApprovedBuilder ? 2 : 1] = element;
          }}
          role="menuitem"
          tabIndex={isOpen ? 0 : -1}
          disabled={isSigningOut}
          onClick={handleSignOut}
          className="flex min-h-10 w-full items-center gap-3 px-4 py-2 text-left text-muted transition hover:bg-card-soft hover:text-foreground focus:bg-card-soft focus:text-foreground focus:outline-none disabled:cursor-wait disabled:opacity-60"
        >
          <LogOutIcon />
          {isSigningOut ? "Signing out" : "Log out"}
        </button>
      </div>
    </div>
  );
}

function GuestUserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const profileLinkRef = useRef<HTMLAnchorElement | null>(null);
  const shouldFocusFirstItem = useRef(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && shouldFocusFirstItem.current) {
      profileLinkRef.current?.focus();
      shouldFocusFirstItem.current = false;
    }
  }, [isOpen]);

  function openMenu(focusFirstItem = false) {
    shouldFocusFirstItem.current = focusFirstItem;
    setIsOpen(true);
  }

  function closeMenu() {
    shouldFocusFirstItem.current = false;
    setIsOpen(false);
  }

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openMenu(true);
    }

    if (event.key === "Escape") {
      closeMenu();
    }
  }

  function handleMenuKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu();
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label="Profile menu"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => (isOpen ? closeMenu() : openMenu())}
        onKeyDown={handleTriggerKeyDown}
        className="grid size-10 shrink-0 place-items-center rounded-md text-muted transition hover:bg-card-soft hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <ProfileIcon />
      </button>

      <div
        role="menu"
        aria-label="Profile menu"
        aria-hidden={!isOpen}
        onKeyDown={handleMenuKeyDown}
        className={`absolute right-0 top-full z-50 mt-2 w-44 origin-top-right rounded-lg border border-border bg-card py-1 text-sm shadow-lg transition duration-150 ${
          isOpen
            ? "scale-100 opacity-100"
            : "pointer-events-none scale-95 opacity-0"
        }`}
      >
        <MenuLink
          refCallback={(element) => {
            profileLinkRef.current = element;
          }}
          href="/profile"
          label="Profile"
          onClick={closeMenu}
          tabIndex={isOpen ? 0 : -1}
        >
          <ProfileIcon />
        </MenuLink>
      </div>
    </div>
  );
}

function MenuLink({
  children,
  href,
  label,
  onClick,
  refCallback,
  tabIndex,
}: {
  children: ReactNode;
  href: string;
  label: string;
  onClick: () => void;
  refCallback: (element: HTMLAnchorElement | null) => void;
  tabIndex: number;
}) {
  return (
    <Link
      ref={refCallback}
      href={href}
      role="menuitem"
      tabIndex={tabIndex}
      onClick={onClick}
      className="flex min-h-10 items-center gap-3 px-4 py-2 text-muted transition hover:bg-card-soft hover:text-foreground focus:bg-card-soft focus:text-foreground focus:outline-none"
    >
      {children}
      {label}
    </Link>
  );
}

function Avatar({
  color,
  initials,
  size,
}: {
  color: string;
  initials: string;
  size: "sm" | "md";
}) {
  return (
    <span
      aria-hidden="true"
      style={{ backgroundColor: color }}
      className={
        size === "sm"
          ? "grid size-8 place-items-center rounded-full font-mono text-xs font-semibold text-white"
          : "grid size-10 shrink-0 place-items-center rounded-full font-mono text-sm font-semibold text-white"
      }
    >
      {initials}
    </span>
  );
}

function getDisplayName(user: User) {
  return [user.firstName, user.lastName].filter(Boolean).join(" ") || "";
}

function getInitials(user: User) {
  return user.email.trim().charAt(0).toUpperCase() || "?";
}

function getAvatarColor(value: string) {
  const colors = [
    "#0f766e",
    "#7c3aed",
    "#b45309",
    "#0e7490",
    "#be123c",
    "#4f46e5",
    "#15803d",
  ];
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = value.charCodeAt(index) + (hash << 5) - hash;
  }

  return colors[Math.abs(hash) % colors.length];
}

function getStatusLabel(status: string | undefined) {
  if (status === "approved") {
    return "Builder";
  }

  if (status === "pending") {
    return "Pending";
  }

  if (status === "profile_required") {
    return "Profile needed";
  }

  if (status === "inactive") {
    return "Paused";
  }

  if (status === "not_now") {
    return "Not this round";
  }

  return "Codepet Labs";
}

function ProfileIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-5 shrink-0"
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

function HubIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    >
      <path d="M4 10.5 12 4l8 6.5" />
      <path d="M6.5 9.5V20h11V9.5" />
      <path d="M10 20v-5h4v5" />
    </svg>
  );
}

function LogOutIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    >
      <path d="M10 6H6.5A2.5 2.5 0 0 0 4 8.5v7A2.5 2.5 0 0 0 6.5 18H10" />
      <path d="M15 8l4 4-4 4" />
      <path d="M9 12h10" />
    </svg>
  );
}
