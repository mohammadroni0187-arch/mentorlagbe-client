export default function Loading() {
  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-pink-50 px-4"
      role="status"
      aria-live="polite"
    >
      <div className="relative h-16 w-16">
        <span className="absolute inset-0 animate-spin rounded-full border-4 border-indigo-100 border-t-purple-500 border-r-pink-400" />
        <span className="absolute inset-3 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500" />
      </div>
      <p className="mt-6 text-sm font-medium text-slate-600">Loading MentorLagbe...</p>
      <div className="mt-5 grid w-full max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-2xl border border-white/60 bg-white/80"
          />
        ))}
      </div>
    </main>
  );
}
