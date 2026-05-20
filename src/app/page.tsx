import Link from "next/link";
import Image from "next/image";

import { SectionHeading } from "@/components/section-heading";

const focusAreas = [
  {
    name: "CodePetPal",
    imageUrl: "/images/visual-codepetpal.svg",
  },
  {
    name: "Gradex",
    imageUrl: "/images/visual-gradex.svg",
  },
  {
    name: "Attendance",
    imageUrl: "/images/visual-attendance.svg",
  },
  {
    name: "Polling",
    imageUrl: "/images/visual-polling.svg",
  },
  {
    name: "Pika UI",
    imageUrl: "/images/visual-ui.svg",
  },
];

export default function Home() {
  return (
    <main>
      <section className="mx-auto grid w-full max-w-5xl gap-7 px-4 py-8 sm:px-6 sm:py-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-semibold tracking-normal text-foreground sm:text-6xl">
            CodePet Labs
          </h1>
          <Image
            src="/images/lab-board.svg"
            alt="CodePet Labs prototype board"
            width={960}
            height={640}
            priority
            className="mt-6 aspect-[3/2] w-full rounded-lg border border-border bg-card object-cover shadow-sm lg:hidden"
          />
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/projects"
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-foreground px-5 py-3 text-sm font-semibold text-background transition hover:opacity-90"
            >
              View projects
            </Link>
            <Link
              href="/join"
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-surface px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-card-soft"
            >
              Join
            </Link>
          </div>
        </div>

        <Image
          src="/images/lab-board.svg"
          alt="CodePet Labs prototype board"
          width={960}
          height={640}
          priority
          className="hidden aspect-[3/2] w-full rounded-lg border border-border bg-card object-cover shadow-sm lg:block"
        />
      </section>

      <section className="border-y border-border bg-surface/75">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              title="Five tracks"
            />
            <Link
              href="/projects"
              className="text-sm font-semibold text-accent hover:underline"
            >
              See projects
            </Link>
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {focusAreas.map((area) => (
              <article
                key={area.name}
                className="overflow-hidden rounded-lg border border-border bg-card shadow-sm"
              >
                <Image
                  src={area.imageUrl}
                  alt=""
                  width={640}
                  height={420}
                  className="aspect-[16/10] w-full object-cover"
                />
                <div className="p-4">
                  <h2 className="text-base font-semibold leading-6 text-foreground">
                    {area.name}
                  </h2>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
