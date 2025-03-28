import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

// Function to send a test email using WFC Email Service
async function sendTestEmailWithWFC() {
  // Skip API calls during build time in Vercel
  const isBuildTime = process.env.VERCEL_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build'
  
  if (isBuildTime) {
    console.log('Skipping WFC email test during build time')
    return {
      success: true,
      skipped: true,
      message: 'Test skipped during build'
    }
  }
  
  try {
    // Use the backend URL or default to the Render.com hosted service
    const backendUrl = process.env.WFC_BACKEND_URL || 'https://dklemailservice.onrender.com'
    const endpoint = '/api/wfc/test-email'
    
    // Create a test order for email
    const testData = {
      email: "laventejeffrey@gmail.com",
      subject: "Test Email from Whisky For Charity",
      message: "This is a test email from the Whisky For Charity website via the WFC Email Service."
    }
    
    console.log(`Sending test email to WFC Email Service: ${backendUrl}${endpoint}`)
    console.log('Test data:', JSON.stringify(testData, null, 2))
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
    
    try {
      const response = await fetch(`${backendUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.WFC_API_KEY || 'dkl_metrics_api_key_2025',
        },
        body: JSON.stringify(testData),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      console.log('WFC Email Service response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('WFC Email Service error response:', errorText)
        throw new Error(`WFC Email Service error (${response.status}): ${errorText}`)
      }
      
      const result = await response.json()
      console.log('WFC Email Service success response:', result)
      
      return {
        success: true,
        result: result
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.error('WFC Email Service request timed out')
        return {
          success: false,
          error: 'Request to WFC Email Service timed out after 5 seconds'
        }
      }
      throw error
    }
  } catch (error) {
    console.error('Error sending test email with WFC:', error)
    return {
      success: false,
      error: (error as Error).message
    }
  }
}

export async function GET(request: Request) {
  // Get Headers
  const headersList = headers();
  const referer = headersList.get('referer') || '';
  const userAgent = headersList.get('user-agent') || '';
  
  // Strikte controle voor Vercel build/prefetching
  const isBuildTime = process.env.VERCEL_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build';
  const isVercelBot = userAgent.includes('Vercel') || userAgent.includes('bot') || userAgent.includes('crawler');
  const isPrefetch = referer === '' || !referer;
  
  // Alleen uitvoeren als het een echte gebruiker betreft
  if (isBuildTime || isVercelBot || isPrefetch) {
    console.log('Skipping WFC email test during automated process:', { isBuildTime, isVercelBot, isPrefetch, userAgent });
    return NextResponse.json({
      message: 'WFC Email test skipped during automated process',
      skipped: true
    });
  }
  
  // Controleer op query parameter om handmatige test te forceren
  const { searchParams } = new URL(request.url);
  const forceTest = searchParams.get('force') === 'true';
  
  if (!forceTest) {
    return NextResponse.json({
      message: 'Use ?force=true query parameter to trigger a test email',
      skipped: true
    });
  }
  
  try {
    const result = await sendTestEmailWithWFC()
    
    if (result.skipped) {
      return NextResponse.json({
        message: 'WFC Email test skipped during build',
        skipped: true
      })
    }
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to send test email', details: result.error },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      message: 'Test email sent successfully via WFC Email Service',
      result: result.result
    })
    
  } catch (error) {
    console.error('Error in test-wfc-email API route:', error)
    return NextResponse.json(
      { error: 'Failed to send test email', details: (error as Error).message },
      { status: 500 }
    )
  }
} 