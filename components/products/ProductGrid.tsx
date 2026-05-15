import ProductCard from '@/components/products/ProductCard'

interface ProductGridProps {
  products: Array<{
    id: string
    name: string
    price: number
    discount_price: number | null
    images: string[]
    sizes: string[]
    is_featured: boolean
  }>
}

export default function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-4">
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} index={index} />
      ))}
    </div>
  )
}
