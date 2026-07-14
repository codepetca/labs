import { ArrowRight, CheckCircle, GithubLogo } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Join | Codepet Labs",
  description: "How the invite-only Codepet Labs builder flow works.",
};

const steps = [
  "Continue with GitHub in AuthKit.",
  "Share a short builder profile.",
  "Wait for a small, reviewed project invite.",
];

export default function JoinPage() {
  return (
    <main className="mx-auto grid w-full max-w-5xl gap-10 px-4 py-10 sm:px-6 sm:py-16 lg:grid-cols-[1.08fr_0.92fr] lg:gap-20">
      <section>
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.12em] text-warm">
          Summer 2026 · Invite only
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-foreground sm:text-6xl">
          Join Codepet Labs
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-7 text-muted">
          Start with GitHub. We use it for identity, project review, and public credit.
        </p>
        <Link
          href="/signup"
          className="mt-8 inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-md bg-foreground px-6 py-3 text-sm font-semibold text-background transition hover:opacity-90 sm:w-auto"
        >
          <GithubLogo aria-hidden="true" size={20} />
          Continue with GitHub
          <ArrowRight aria-hidden="true" size={17} />
        </Link>
        <p className="mt-3 text-xs text-muted">You’ll continue in our secure AuthKit sign-in.</p>

        <section className="mt-12" aria-labelledby="join-steps-heading">
          <h2 id="join-steps-heading" className="text-lg font-semibold text-foreground">
            What happens next
          </h2>
          <ol className="mt-5 grid gap-4">
            {steps.map((step, index) => (
              <li key={step} className="flex gap-3 border-t border-border pt-4 text-sm text-muted">
                <span className="font-mono font-semibold text-foreground">0{index + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </section>
      </section>

      <aside className="self-start overflow-hidden rounded-lg border border-border bg-card">
        <Image
          src="/images/visual-join.svg"
          alt="GitHub-connected Codepet Labs join flow"
          width={640}
          height={420}
          priority
          className="aspect-[16/10] w-full object-cover"
        />
        <div className="border-t border-border p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <CheckCircle aria-hidden="true" size={18} className="text-accent" />
            GitHub required
          </div>
          <p className="mt-2 text-sm leading-5 text-muted">
            No production Pika access or real student data is part of the Labs flow.
          </p>
        </div>
      </aside>
    </main>
  );
}
