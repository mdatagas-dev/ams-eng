export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string
  title: string
  description: string
  actions?: React.ReactNode
}) {
  return (
    <header className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex max-w-3xl flex-col gap-1">
        <p className="font-mono text-[0.6875rem] font-medium tracking-[0.16em] text-muted-foreground uppercase">
          {eyebrow}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {title}
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
      {actions}
    </header>
  )
}
