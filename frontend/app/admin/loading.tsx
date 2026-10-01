export default function AdminLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-pulse">
      {/* Header */}
      <div className="border-b border-line/60 pb-6">
        <div className="h-4 w-40 bg-slate-200 rounded mb-2" />
        <div className="h-8 w-64 bg-slate-200 rounded" />
      </div>

      {/* Tabs */}
      <div className="h-12 w-64 bg-slate-200/60 rounded-xl" />

      {/* Admin Content Skeleton */}
      <div className="rounded-3xl border border-line bg-white p-6 space-y-4">
        <div className="h-10 w-48 bg-slate-200 rounded-xl" />
        <div className="h-64 bg-slate-100 rounded-2xl" />
      </div>
    </div>
  );
}
