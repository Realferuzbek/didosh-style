export default function ProductLoading() {
  return (
    <div className="pt-[52px] pb-[88px] animate-pulse">
      <div className="aspect-[3/4] w-full skeleton" />
      <div className="page-container py-5 space-y-4">
        <div className="h-6 skeleton rounded-xl w-3/4" />
        <div className="h-8 skeleton rounded-xl w-1/2" />
        <div className="h-4 skeleton rounded-xl w-full" />
        <div className="h-4 skeleton rounded-xl w-5/6" />
      </div>
    </div>
  )
}
