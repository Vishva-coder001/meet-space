export default function DashboardLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-pulse">
      {/* Top Header Skeleton */}
      <div className="border-b border-line/60 pb-6">
        <div className="h-4 w-40 bg-slate-200 rounded mb-3" />
        <div className="h-8 w-72 bg-slate-200 rounded mb-2" />
        <div className="h-4 w-96 bg-slate-200/60 rounded" />
      </div>

      {/* Live Workspace Banner Skeleton */}
      <div className="h-36 rounded-3xl bg-slate-200/70" />

      {/* Main Grid Skeleton */}
      <div className="grid gap-8 lg:grid-cols-[1.6fr_1.4fr]">
        <div className="space-y-8">
          <div className="h-48 rounded-3xl bg-slate-200/50" />
          <div className="h-64 rounded-3xl bg-slate-200/50" />
        </div>
        <div className="space-y-8">
          <div className="h-96 rounded-3xl bg-slate-200/50" />
        </div>
      </div>
    </div>
  );
}
