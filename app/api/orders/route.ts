import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { customer_name, customer_phone, delivery_city, delivery_address, notes, items } = body

    // Validate required fields
    if (!customer_name || !customer_phone || !delivery_city || !delivery_address || !items?.length) {
      return NextResponse.json({ error: 'Barcha majburiy maydonlarni to\'ldiring' }, { status: 400 })
    }

    const supabase = getAdminClient()

    // Generate order number
    const { data: orderNumData, error: numError } = await supabase
      .rpc('generate_order_number')
    if (numError) throw numError
    const orderNumber: string = orderNumData

    // Calculate total
    const totalAmount = items.reduce(
      (sum: number, item: { price: number; discount_price: number | null; quantity: number }) =>
        sum + (item.discount_price ?? item.price) * item.quantity,
      0
    )

    // Insert order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_name,
        customer_phone,
        delivery_city,
        delivery_address,
        notes: notes || null,
        total_amount: totalAmount,
        status: 'pending',
      })
      .select('id, order_number')
      .single()

    if (orderError) throw orderError

    // Insert order items
    const orderItems = items.map((item: {
      product_id: string
      name: string
      image: string
      price: number
      discount_price: number | null
      size: string
      color: string | null
      quantity: number
    }) => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.name,
      product_image: item.image,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
      price_at_order: item.discount_price ?? item.price,
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) throw itemsError

    return NextResponse.json({ order_number: order.order_number }, { status: 201 })

  } catch (error) {
    console.error('Order error:', error)
    return NextResponse.json({ error: 'Buyurtma yaratishda xatolik' }, { status: 500 })
  }
}
