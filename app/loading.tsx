export default function GlobalLoading() {
  return (
    <div className="min-h-screen bg-brand-cream flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-4 border-brand-rose border-t-brand-deeprose animate-spin" />
        <span className="font-body text-sm text-brand-muted">Yuklanmoqda...</span>
      </div>
    </div>
  )
}
