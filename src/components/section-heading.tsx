type SectionHeadingProps = {
  title: string;
  align?: "left" | "center";
};

export function SectionHeading({
  title,
  align = "left",
}: SectionHeadingProps) {
  return (
    <div
      className={
        align === "center" ? "mx-auto max-w-xl text-center" : "max-w-2xl"
      }
    >
      <h1 className="text-2xl font-semibold tracking-normal text-foreground sm:text-4xl">
        {title}
      </h1>
    </div>
  );
}
