export default function OfficeLoading() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 animate-pulse">
      <div className="size-14 rounded-2xl bg-slate-800 border border-white/10 flex items-center justify-center text-sky-400 mb-4 font-mono text-sm">
        3D
      </div>
      <h2 className="text-xl font-bold tracking-tight text-slate-100">
        Initializing 3D Office Environment
      </h2>
      <p className="mt-2 text-xs font-mono text-slate-400">
        Loading WebXR engine & spatial geometry...
      </p>
    </div>
  );
}
