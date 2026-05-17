type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: SectionHeadingProps) {
  return (
    <div
      className={
        align === "center" ? "mx-auto max-w-xl text-center" : "max-w-2xl"
      }
    >
      {eyebrow ? (
        <p className="mb-2 text-xs font-semibold uppercase tracking-normal text-accent">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="text-2xl font-semibold tracking-normal text-foreground sm:text-4xl">
        {title}
      </h1>
      {description ? (
        <p className="mt-3 text-sm leading-6 text-muted sm:text-base">
          {description}
        </p>
      ) : null}
    </div>
  );
}
