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
        align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-3xl"
      }
    >
      {eyebrow ? (
        <p className="mb-3 text-sm font-semibold uppercase text-accent">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="text-3xl font-semibold tracking-normal text-foreground sm:text-4xl">
        {title}
      </h1>
      {description ? (
        <p className="mt-4 text-base leading-7 text-muted">{description}</p>
      ) : null}
    </div>
  );
}
