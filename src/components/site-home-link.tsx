"use client";

import { useAuth } from "@workos-inc/authkit-nextjs/components";
import Image from "next/image";
import Link from "next/link";

export function SiteHomeLink({ authReady }: { authReady: boolean }) {
  if (!authReady) {
    return <HomeLink href="/" />;
  }

  return <AuthenticatedHomeLink />;
}

function AuthenticatedHomeLink() {
  const { loading, user } = useAuth();
  const href =
    !loading && user
      ? getSignedInHomeHref({
          role: user.metadata.labsRole,
          status: user.metadata.labsStatus,
        })
      : "/";

  return <HomeLink href={href} />;
}

function HomeLink({ href }: { href: string }) {
  return (
    <Link
      href={href}
      aria-label="Codepet Labs home"
      className="flex min-h-11 shrink-0 items-center gap-2 rounded-md pr-2 text-sm font-semibold text-foreground transition hover:text-accent"
    >
      <Image src="/images/paw-icon.svg" alt="" width={22} height={22} />
      <span className="hidden sm:inline">Codepet Labs</span>
    </Link>
  );
}

function getSignedInHomeHref({
  role,
  status,
}: {
  role: string | undefined;
  status: string | undefined;
}) {
  if (role === "admin") {
    return "/admin";
  }

  return status === "approved" ? "/hub" : "/profile";
}
