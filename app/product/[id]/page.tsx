"use client";

import { useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { redirect } from "next/navigation";
import { ChevronLeft, Heart, Share2 } from "lucide-react";
import { MOCK_PRODUCTS } from "@/lib/mock-data";
import type { Product } from "@/lib/types";
import { useCartStore } from "@/lib/store";
import { formatPrice } from "@/lib/utils";
import ImageGallery from "@/components/product/ImageGallery";
import ProductInfo from "@/components/product/ProductInfo";
import ColorSelector from "@/components/product/ColorSelector";
import SizeSelector from "@/components/product/SizeSelector";
import DescriptionAccordion from "@/components/product/DescriptionAccordion";
import SimilarProducts from "@/components/product/SimilarProducts";
import AddToCartBar from "@/components/product/AddToCartBar";
import { useFavoritesStore } from "@/lib/store";
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params as { id: string };
  const products = MOCK_PRODUCTS as Product[];
  const product = products.find((p) => p.id === id);
  if (!product) redirect("/catalog");

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(product.colors[0] ?? null);
  const [sizeError, setSizeError] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  // Cart store selector
  const addItem = useCartStore((s) => s.addItem);

  // Similar products
  const similarProducts = products.filter((p) => p.id !== product.id).slice(0, 6);

  // Add to cart handler
  const handleAddToCart = useCallback(() => {
    if (!selectedSize) {
      setSizeError(true);
      document.getElementById("size-selector")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    addItem({
      product_id: product.id,
      name: product.name,
      image: product.images[0] ?? "",
      price: product.price,
      discount_price: product.discount_price,
      size: selectedSize,
      color: selectedColor,
      quantity: 1,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  }, [addItem, product, selectedSize, selectedColor]);

  // Favorite button
  const isFavorite = useFavoritesStore((s) => s.isFavorite(product.id));
  const toggleFavorite = useFavoritesStore((s) => s.toggle);

  // Share button
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Didosh Style: ${product.name} — ${formatPrice(product.discount_price ?? product.price)}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Havola nusxalandi! 🔗');
    }
  };

  return (
    <>
      {/* Fixed header */}
      <header className="fixed top-0 left-0 right-0 z-30 h-[52px] flex items-center justify-between px-4 bg-brand-cream/90 backdrop-blur-xl border-b border-brand-border/40">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-brand-blush active:scale-95">
          <ChevronLeft size={22} className="text-brand-dark" />
        </button>
        <span className="font-display text-[18px] font-semibold text-brand-dark line-clamp-1">
          {product.name}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="w-9 h-9 rounded-full bg-brand-blush/80 backdrop-blur flex items-center justify-center active:scale-90"
            aria-label="Sevimli"
            onClick={() => toggleFavorite(product.id)}
          >
            <Heart
              size={20}
              className={isFavorite ? "fill-brand-deeprose text-brand-deeprose" : "text-brand-muted"}
            />
          </button>
          <button
            type="button"
            className="w-9 h-9 rounded-full bg-brand-blush/80 flex items-center justify-center ml-1 active:scale-90"
            aria-label="Ulashish"
            onClick={handleShare}
          >
            <Share2 size={18} className="text-brand-dark" />
          </button>
        </div>
      </header>

      {/* Scrollable content — padded for fixed header + sticky bar */}
      <main className="pt-[52px] pb-[88px]">
        <ImageGallery images={product.images} name={product.name} />
        <div className="page-container py-5 space-y-6">
          <ProductInfo product={product} />
          {product.colors.length > 0 && (
            <ColorSelector
              colors={product.colors}
              selected={selectedColor}
              onSelect={setSelectedColor}
            />
          )}
          <SizeSelector
            id="size-selector"
            sizes={product.sizes}
            selected={selectedSize}
            onSelect={(size: string) => {
              setSelectedSize(size);
              setSizeError(false);
            }}
            hasError={sizeError}
          />
          <DescriptionAccordion description={product.description} />
        </div>
        <SimilarProducts products={similarProducts} />
      </main>

      {/* Sticky add to cart bar */}
      <AddToCartBar
        price={product.price}
        discountPrice={product.discount_price}
        onAddToCart={handleAddToCart}
        addedToCart={addedToCart}
        disabled={false}
      />
    </>
  );
}
