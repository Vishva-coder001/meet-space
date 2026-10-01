export default function ProfileLoading() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-pulse">
      {/* Header */}
      <div className="border-b border-line/60 pb-6">
        <div className="h-4 w-36 bg-slate-200 rounded mb-2" />
        <div className="h-8 w-56 bg-slate-200 rounded" />
      </div>

      {/* Profile Card Skeleton */}
      <div className="rounded-3xl border border-line bg-white p-8 space-y-6">
        <div className="flex items-center gap-4">
          <div className="size-16 rounded-2xl bg-slate-200" />
          <div className="space-y-2">
            <div className="h-6 w-44 bg-slate-200 rounded" />
            <div className="h-4 w-60 bg-slate-200/60 rounded" />
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 pt-6 border-t border-line/60">
          <div className="h-14 bg-slate-200/50 rounded-2xl" />
          <div className="h-14 bg-slate-200/50 rounded-2xl" />
          <div className="h-14 bg-slate-200/50 rounded-2xl" />
          <div className="h-14 bg-slate-200/50 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
