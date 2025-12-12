export default function Loading() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-emerald-500/20 rounded-full" />
          <div className="absolute inset-0 w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-slate-400 text-sm animate-pulse">Loading...</p>
      </div>
    </div>
  );
}
