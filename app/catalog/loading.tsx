export default function CatalogLoading() {
  return (
    <div className="page-container page-with-nav pt-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="aspect-[3/4] skeleton rounded-2xl" />
            <div className="h-4 skeleton rounded-lg w-3/4" />
            <div className="h-4 skeleton rounded-lg w-1/2" />
          </div>
        ))}
      </div>
    </div>
  )
}
