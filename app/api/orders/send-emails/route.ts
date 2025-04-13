import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { sendOrderEmailWithWFC } from '@/app/api/orders/send-emails-wfc/route';
import { sendEmailWithDKL } from '@/app/api/orders/send-emails-dkl/route';
import { sendOrderEmails as sendEmailsWithSendgrid } from '@/lib/email-sendgrid';
import { Order, OrderItem } from '@/types/order'

interface OrderItemDB {
  id: string
  product_id: string
  quantity: number
  price: number
}

interface OrderDB {
  id: string
  order_number: string
  customer_first_name: string
  customer_last_name: string
  customer_email: string
  customer_address: string
  customer_city: string
  customer_postal_code: string
  customer_country: string
  total_amount: number
  status: 'pending' | 'paid' | 'completed' | 'cancelled'
  payment_reference?: string
  created_at: string
  updated_at: string
  order_items: OrderItemDB[]
}

interface ProductDB {
  id: string
  name: string
  description: string
  image: string
  images: string[]
}

const EMAIL_SERVICE = process.env.NEXT_PUBLIC_EMAIL_SERVICE || 'sendgrid';

async function getFullOrderData(orderId: string, supabase: any): Promise<Order | null> {
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (orderError || !order) {
    console.error('Error fetching order:', orderError);
    return null;
  }

  const { data: orderItemsDB, error: itemsError } = await supabase
    .from('order_items')
    .select('*, products(*)')
    .eq('order_id', orderId);

  if (itemsError) {
    console.error('Error fetching order items:', itemsError);
    return null;
  }

  if (!orderItemsDB || orderItemsDB.length === 0) {
    console.warn('No order items found for order:', orderId);
    return { ...order, items: [] };
  }

  const orderItems = orderItemsDB.map((item: any) => ({
    ...item,
    product: item.products
  }));

  return { ...order, items: orderItems };
}

export async function POST(request: NextRequest) {
  const isBuildTime = process.env.VERCEL_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build';
  if (isBuildTime) {
    return NextResponse.json({ message: 'Skipping email processing during build time', emailSent: true, skippedDuringBuild: true });
  }

  try {
    const { orderId } = await request.json();
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const cookieStore = cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    const orderData = await getFullOrderData(orderId, supabase);
    if (!orderData) {
      return NextResponse.json({ error: 'Order data not found or incomplete' }, { status: 404 });
    }

    const requestData = { orderData };

    // Determine which email service to use and delegate
    // Make success optional in the type definition
    let emailResult: { success?: boolean; customerEmailSent?: boolean; adminEmailSent?: boolean; error?: string; skipped?: boolean; message?: string };

    if (EMAIL_SERVICE === 'wfc') {
      const wfcResult = await sendOrderEmailWithWFC(requestData);
      emailResult = typeof wfcResult === 'object' && wfcResult !== null ? wfcResult : { success: false, error: 'Invalid response from WFC service' };
    } else if (EMAIL_SERVICE === 'dkl') {
      const dklResult = await sendEmailWithDKL('orderConfirmation', requestData);
      emailResult = typeof dklResult === 'object' && dklResult !== null ? dklResult : { success: false, error: 'Invalid response from DKL service' };
    } else {
      emailResult = await sendEmailsWithSendgrid(orderData);
    }

    if (emailResult.skipped) {
      return NextResponse.json({ message: 'Email sending skipped (likely build process)', emailSent: true });
    }

    // Determine overall success based on the service used and the result structure
    let isSuccess = false;
    if (EMAIL_SERVICE === 'sendgrid') {
      // For SendGrid, success depends on both emails being sent (success property might be absent)
      isSuccess = emailResult.customerEmailSent === true && emailResult.adminEmailSent === true;
    } else {
      // For WFC/DKL, rely on the success flag they should return
      isSuccess = emailResult.success === true;
    }
    
    // Update order status based on overall success
    await supabase
      .from('orders')
      .update({ emails_sent: isSuccess })
      .eq('id', orderId);

    if (!isSuccess) {
      console.error(`Email sending failed via ${EMAIL_SERVICE}:`, emailResult.error);
      return NextResponse.json(
        { error: `Failed to send one or more emails via ${EMAIL_SERVICE}`, details: emailResult.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      emailSent: true, 
      message: `Emails sent successfully via ${EMAIL_SERVICE}` 
    });

  } catch (error: any) {
    console.error('Error in send-emails API route:', error);
    return NextResponse.json(
      { error: 'Failed to process email request', details: error.message },
      { status: 500 }
    );
  }
} 