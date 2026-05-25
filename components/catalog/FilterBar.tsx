"use client"

import { CATEGORIES } from "@/components/catalog/categories"
import SortDropdown from "@/components/catalog/SortDropdown"
import { cn } from "@/lib/utils"

interface DbCategory {
  id: string
  name: string
  slug: string
  sort_order: number
}

interface FilterBarProps {
  activeCategory: string
  onCategoryChange: (slug: string) => void
  sortBy: string
  onSortChange: (val: string) => void
  resultCount: number
  /** Dynamic categories from /api/categories — falls back to hardcoded CATEGORIES */
  categories?: DbCategory[]
}

export default function FilterBar({
  activeCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
  resultCount,
  categories,
}: FilterBarProps) {
  // Use DB categories if available and non-empty, otherwise fall back to hardcoded list
  const pills =
    categories && categories.length > 0
      ? [
          { label: 'Barchasi', emoji: '🛍️', slug: 'barchasi' },
          ...categories.map(c => ({
            label: c.name,
            emoji: CATEGORIES.find(h => h.slug === c.slug)?.emoji ?? '✨',
            slug:  c.slug,
          })),
        ]
      : CATEGORIES

  return (
    <div className="bg-transparent">
      {/* Row 1: Category pills */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 pl-4 py-3">
        {pills.map((cat) => (
          <button
            key={cat.slug}
            className={cn(
              "flex items-center gap-1 px-4 py-2 rounded-full text-sm font-body font-medium active:scale-95 transition-all duration-150",
              activeCategory === cat.slug
                ? "bg-gradient-to-tr from-brand-deeprose to-brand-rose text-white shadow"
                : "bg-white/80 backdrop-blur-sm border border-brand-border/40 text-brand-dark",
            )}
            onClick={() => onCategoryChange(cat.slug)}
          >
            <span>{cat.emoji}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Row 2: Results count + Sort */}
      <div className="flex items-center justify-between px-4 py-2">
        <span className="text-[13px] text-brand-muted font-body">{resultCount} ta mahsulot</span>
        <SortDropdown value={sortBy} onChange={onSortChange} />
      </div>
    </div>
  )
}
