import Image from "next/image";
import Link from "next/link";

import { SectionHeading } from "@/components/section-heading";

export default function JoinPage() {
  const discordInviteUrl = process.env.CODEPET_DISCORD_INVITE_URL;

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <SectionHeading title="Join Labs" />
      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          href="/signup"
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-foreground px-5 py-3 text-sm font-semibold text-background transition hover:opacity-90"
        >
          Join with GitHub
        </Link>
        <Link
          href="/hub"
          className="inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-surface px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-card-soft"
        >
          Member hub
        </Link>
        {discordInviteUrl ? (
          <Link
            href={discordInviteUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-surface px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-card-soft"
          >
            Join Discord
          </Link>
        ) : null}
      </div>

      <Image
        src="/images/visual-join.svg"
        alt="Join flow"
        width={640}
        height={420}
        className="mt-7 aspect-[16/10] w-full rounded-lg border border-border bg-card object-cover shadow-sm"
      />
    </main>
  );
}
