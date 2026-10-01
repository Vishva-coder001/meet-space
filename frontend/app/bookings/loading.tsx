export default function BookingsLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6 animate-pulse">
      {/* Page Header */}
      <div className="border-b border-line/60 pb-6 flex items-center justify-between">
        <div>
          <div className="h-4 w-32 bg-slate-200 rounded mb-2" />
          <div className="h-8 w-60 bg-slate-200 rounded" />
        </div>
        <div className="h-10 w-36 bg-slate-200 rounded-xl" />
      </div>

      {/* Filter Tabs Skeleton */}
      <div className="h-12 w-80 bg-slate-200/60 rounded-xl" />

      {/* Bookings List Skeleton */}
      <div className="rounded-3xl border border-line bg-white divide-y divide-line/60 overflow-hidden">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-6 flex items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="h-5 w-48 bg-slate-200 rounded" />
              <div className="h-4 w-64 bg-slate-200/60 rounded" />
            </div>
            <div className="h-8 w-24 bg-slate-200/70 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
