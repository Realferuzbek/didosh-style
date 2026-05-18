'use client';

import { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { cn } from '@/lib/utils';
import SearchBar from '@/components/catalog/SearchBar';
import FilterBar from '@/components/catalog/FilterBar';
import ProductSkeleton from '@/components/catalog/ProductSkeleton';
import EmptyState from '@/components/catalog/EmptyState';
import FilterDrawer from '@/components/catalog/FilterDrawer';
import ProductCard from '@/components/products/ProductCard';

function useScrolled() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 10);
    }
    window.addEventListener('scroll', onScroll);
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return scrolled;
}

export default function CatalogPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('barchasi');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState<number | null>(null);
  const [priceMax, setPriceMax] = useState<number | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setProducts(data) })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...products];
    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q));
    }
    // Category filter (skip if "barchasi")
    if (activeCategory !== 'barchasi') {
      result = result.filter((p) =>
        p.name.toLowerCase().includes(
          activeCategory === 'koyilaklar' ? "ko'ylak" :
          activeCategory === 'koftalar' ? 'kofta' :
          activeCategory === 'yubkalar' ? 'yubka' :
          activeCategory === 'liboslar' ? 'libos' :
          activeCategory === 'palto-kurtka' ? 'palto' :
          ''
        )
      );
    }
    // Size filter
    if (selectedSizes.length > 0) {
      result = result.filter((p) => selectedSizes.some((s) => p.sizes.includes(s)));
    }
    // Price filter
    if (priceMin !== null) result = result.filter((p) => (p.discount_price ?? p.price) >= priceMin);
    if (priceMax !== null) result = result.filter((p) => (p.discount_price ?? p.price) <= priceMax);
    // Sort
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => (a.discount_price ?? a.price) - (b.discount_price ?? b.price));
        break;
      case 'price-desc':
        result.sort((a, b) => (b.discount_price ?? b.price) - (a.discount_price ?? a.price));
        break;
      case 'discount':
        result.sort((a, b) => {
          const aHas = a.discount_price !== null ? 1 : 0;
          const bHas = b.discount_price !== null ? 1 : 0;
          return bHas - aHas;
        });
        break;
      default:
        break;
    }
    return result;
  }, [search, activeCategory, sortBy, selectedSizes, priceMin, priceMax, products]);

  const hasActiveFilters =
    activeCategory !== 'barchasi' ||
    selectedSizes.length > 0 ||
    priceMin !== null ||
    priceMax !== null;

  const scrolled = useScrolled();

  return (
    <>
      {/* Sticky header */}
      <div
        className={cn(
          'sticky top-0 z-30 bg-brand-cream/90 backdrop-blur-xl transition-all',
          scrolled && 'border-b border-brand-border/60'
        )}
      >
        {/* Title row */}
        <div className="flex items-center justify-between h-[52px] px-4">
          <Link href="/" className="flex items-center p-1 -ml-2 rounded-full hover:bg-brand-blush active:scale-95">
            <ChevronLeft size={22} className="text-brand-dark" />
          </Link>
          <div className="font-display text-[22px] font-semibold text-brand-dark">Katalog</div>
          <button
            type="button"
            className="relative p-1 rounded-full hover:bg-brand-blush active:scale-95"
            onClick={() => setIsFilterOpen(true)}
            aria-label="Filtrlash"
          >
            <SlidersHorizontal size={22} className="text-brand-dark" />
            {hasActiveFilters && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-brand-deeprose rounded-full shadow" />
            )}
          </button>
        </div>
        <SearchBar value={search} onChange={setSearch} />
      </div>

      {/* Filter bar */}
      <FilterBar
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        sortBy={sortBy}
        onSortChange={setSortBy}
        resultCount={filteredProducts.length}
      />

      {/* Product grid */}
      <main className="page-container page-with-nav pb-6">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <EmptyState
            searchQuery={search}
            hasFilters={hasActiveFilters}
            onReset={() => {
              setSearch('');
              setActiveCategory('barchasi');
              setSelectedSizes([]);
              setPriceMin(null);
              setPriceMax(null);
            }}
          />
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.06 } },
              }}
            >
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
                  }}
                >
                  <ProductCard product={product} index={index} />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      {/* Filter Drawer */}
      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        selectedSizes={selectedSizes}
        onSizesChange={setSelectedSizes}
        priceMin={priceMin}
        priceMax={priceMax}
        onPriceChange={(min, max) => {
          setPriceMin(min);
          setPriceMax(max);
        }}
        productCount={filteredProducts.length}
      />
    </>
  );
}