export default function PageHeader({
  kicker,
  title,
  subtitle,
}: {
  kicker: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <section className="relative overflow-hidden border-b-6 border-pollo-navy">
      <div className="pointer-events-none absolute inset-0 bg-halftone opacity-60" />
      <div className="relative mx-auto max-w-7xl px-4 py-12 text-center sm:px-6 md:py-16 lg:px-8">
        <p className="font-display text-lg tracking-[0.25em] text-white drop-shadow">
          {kicker}
        </p>
        <h1 className="mt-1 font-display text-6xl text-pollo-navy drop-poster sm:text-7xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mx-auto mt-4 max-w-xl text-lg font-semibold text-pollo-navy/80">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
