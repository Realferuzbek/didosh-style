export interface Category {
  id: string
  name: string
  slug: string
  sort_order: number
  created_at: string
}

export interface Product {
  id: string
  name: string
  description: string | null
  price: number
  discount_price: number | null
  category_id: string | null
  images: string[]
  sizes: string[]
  colors: string[]
  stock: number
  is_featured: boolean
  is_active: boolean
  instagram_reel_url?: string | null
  created_at: string
  categories?: Category
}

export interface Order {
  id: string
  order_number: string
  customer_name: string
  customer_phone: string
  delivery_city: string
  delivery_address: string
  notes: string | null
  total_amount: number
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  created_at: string
  order_items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  product_name: string
  product_image: string | null
  size: string
  color: string | null
  quantity: number
  price_at_order: number
}

export interface Banner {
  id: string
  image_url: string
  title: string | null
  subtitle: string | null
  is_active: boolean
  sort_order: number
}

export interface CartItem {
  product_id: string
  name: string
  image: string
  price: number
  discount_price: number | null
  size: string
  color: string | null
  quantity: number
}
