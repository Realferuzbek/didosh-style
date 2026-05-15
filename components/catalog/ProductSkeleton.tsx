"use client";

export default function ProductSkeleton() {
  return (
    <div className="bg-white rounded-card overflow-hidden">
      <div className="aspect-[3/4] skeleton" />
      <div className="p-3 space-y-2">
        <div className="h-4 w-[70%] skeleton rounded" />
        <div className="h-4 w-[45%] skeleton rounded" />
        <div className="flex gap-2 mt-2">
          <div className="h-5 w-8 skeleton rounded" />
          <div className="h-5 w-8 skeleton rounded" />
          <div className="h-5 w-8 skeleton rounded" />
        </div>
      </div>
    </div>
  );
}
