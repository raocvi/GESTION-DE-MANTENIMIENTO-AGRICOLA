export default function Loading() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      {/* Page header skeleton */}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-slate-200 shrink-0" />
          <div className="flex flex-col gap-2">
            <div className="h-6 w-48 rounded-lg bg-slate-200" />
            <div className="h-3.5 w-32 rounded-md bg-slate-100" />
          </div>
        </div>
        <div className="h-9 w-32 rounded-xl bg-slate-200" />
      </div>

      {/* KPI cards skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="kpi-card">
            <div className="h-9 w-20 rounded-lg bg-slate-200 mb-3" />
            <div className="h-3 w-24 rounded-md bg-slate-100" />
          </div>
        ))}
      </div>

      {/* Content area skeleton */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="chart-card p-5 flex flex-col gap-3">
            <div className="h-5 w-3/4 rounded-lg bg-slate-200" />
            <div className="h-3.5 w-full rounded-md bg-slate-100" />
            <div className="h-3.5 w-5/6 rounded-md bg-slate-100" />
            <div className="h-3.5 w-4/6 rounded-md bg-slate-100" />
            <div className="mt-2 h-32 w-full rounded-xl bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  )
}
