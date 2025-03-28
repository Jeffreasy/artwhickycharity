import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Dummy data voor test doeleinden
// In een echte implementatie zou je hier de Google Analytics API gebruiken
const dummyData = {
  '7d': {
    pageViews: 1520,
    visitors: 423,
    avgSessionDuration: 2.3,
    bounceRate: 42.8,
    sources: [
      { name: 'Google', sessions: 210 },
      { name: 'Direct', sessions: 156 },
      { name: 'Instagram', sessions: 87 },
      { name: 'Facebook', sessions: 42 },
    ],
    topPages: [
      { path: '/shop', pageviews: 342 },
      { path: '/whisky', pageviews: 285 },
      { path: '/art', pageviews: 187 },
      { path: '/charity', pageviews: 129 },
      { path: '/about', pageviews: 98 },
    ]
  },
  '30d': {
    pageViews: 6450,
    visitors: 1823,
    avgSessionDuration: 2.6,
    bounceRate: 38.5,
    sources: [
      { name: 'Google', sessions: 895 },
      { name: 'Direct', sessions: 621 },
      { name: 'Instagram', sessions: 356 },
      { name: 'Facebook', sessions: 187 },
      { name: 'Twitter', sessions: 85 },
    ],
    topPages: [
      { path: '/shop', pageviews: 1542 },
      { path: '/whisky', pageviews: 1236 },
      { path: '/art', pageviews: 824 },
      { path: '/charity', pageviews: 512 },
      { path: '/about', pageviews: 387 },
    ]
  },
  '90d': {
    pageViews: 18250,
    visitors: 5329,
    avgSessionDuration: 2.9,
    bounceRate: 35.2,
    sources: [
      { name: 'Google', sessions: 2485 },
      { name: 'Direct', sessions: 1852 },
      { name: 'Instagram', sessions: 1024 },
      { name: 'Facebook', sessions: 568 },
      { name: 'Twitter', sessions: 214 },
    ],
    topPages: [
      { path: '/shop', pageviews: 4285 },
      { path: '/whisky', pageviews: 3642 },
      { path: '/art', pageviews: 2541 },
      { path: '/charity', pageviews: 1687 },
      { path: '/about', pageviews: 1124 },
    ]
  },
  'all': {
    pageViews: 35680,
    visitors: 10845,
    avgSessionDuration: 3.1,
    bounceRate: 32.7,
    sources: [
      { name: 'Google', sessions: 4862 },
      { name: 'Direct', sessions: 3647 },
      { name: 'Instagram', sessions: 2154 },
      { name: 'Facebook', sessions: 1238 },
      { name: 'Twitter', sessions: 487 },
      { name: 'LinkedIn', sessions: 245 },
    ],
    topPages: [
      { path: '/shop', pageviews: 8542 },
      { path: '/whisky', pageviews: 7138 },
      { path: '/art', pageviews: 5241 },
      { path: '/charity', pageviews: 3624 },
      { path: '/about', pageviews: 2547 },
      { path: '/contact', pageviews: 1547 },
    ]
  }
};

export async function GET(request: NextRequest) {
  // Haal periode op uit de query parameters
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  
  // Bereken welke periode we moeten gebruiken op basis van startDate en endDate
  let period: '7d' | '30d' | '90d' | 'all' = 'all';
  
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 7) {
      period = '7d';
    } else if (diffDays <= 30) {
      period = '30d';
    } else if (diffDays <= 90) {
      period = '90d';
    }
  }
  
  // Voeg order data toe uit Supabase voor custom metrics
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
    
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // Voer Supabase query's uit om echte order data op te halen
      // Dit kan worden gebruikt om custom analytics te maken
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*');
        
      // Voeg echte orderdata toe aan de response
      if (!orderError && orderData) {
        return NextResponse.json({
          ...dummyData[period],
          // Je kunt echte order data combineren met de dummy GA data
          recentOrders: orderData.slice(0, 5),
          totalOrders: orderData.length,
          totalRevenue: orderData.reduce((sum: number, order: any) => sum + Number(order.total_amount), 0),
        });
      }
    }
  } catch (error) {
    console.error('Error fetching Supabase data:', error);
  }
  
  // Fallback naar alleen dummy data als Supabase niet werkt
  return NextResponse.json(dummyData[period]);
} 