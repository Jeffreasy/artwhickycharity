import { supabase } from '@/lib/supabase'
import { Order, OrderItem } from '@/types/order'
import { CartItem } from '@/types/product'

export async function createOrder(
  customerData: {
    firstName: string
    lastName: string
    email: string
    address: string
    city: string
    postalCode: string
    country: string
  },
  items: CartItem[],
  totalAmount: number
): Promise<Order> {
  // Start a Supabase transaction
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      customer_first_name: customerData.firstName,
      customer_last_name: customerData.lastName,
      customer_email: customerData.email,
      customer_address: customerData.address,
      customer_city: customerData.city,
      customer_postal_code: customerData.postalCode,
      customer_country: customerData.country,
      total_amount: totalAmount,
      status: 'pending'
    })
    .select()
    .single()

  if (orderError) {
    console.error('Error creating order:', orderError)
    throw new Error('Failed to create order')
  }

  // Insert order items
  const orderItems = items.map(item => ({
    order_id: order.id,
    product_id: item.id,
    quantity: item.quantity,
    price: item.price
  }))

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems)

  if (itemsError) {
    console.error('Error creating order items:', itemsError)
    // Attempt to delete the order if items failed
    await supabase.from('orders').delete().eq('id', order.id)
    throw new Error('Failed to create order items')
  }

  // Get the complete order with items
  const { data: completeOrder, error: fetchError } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(*)
    `)
    .eq('id', order.id)
    .single()

  if (fetchError) {
    console.error('Error fetching complete order:', fetchError)
    throw new Error('Failed to fetch complete order')
  }

  return completeOrder as Order
}

export async function getOrder(orderId: string): Promise<Order | null> {
  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(*)
    `)
    .eq('id', orderId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    console.error('Error fetching order:', error)
    throw new Error('Failed to fetch order')
  }

  return order as Order
}

export async function updateOrderStatus(
  orderId: string, 
  status: Order['status'],
  paymentReference?: string
): Promise<void> {
  const { error } = await supabase
    .from('orders')
    .update({ 
      status,
      payment_reference: paymentReference,
      updated_at: new Date().toISOString()
    })
    .eq('id', orderId)

  if (error) {
    console.error('Error updating order status:', error)
    throw new Error('Failed to update order status')
  }
} 