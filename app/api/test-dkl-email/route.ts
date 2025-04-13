import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

// Function to send a test email using DKL Email Service
async function sendTestEmailWithDKL() {
  // Only proceed with the actual API call if not in build
  const isBuildTime = process.env.VERCEL_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build'
  
  if (isBuildTime) {
    return NextResponse.json({ message: 'Skipping test during build' }, { status: 200 });
  }
  
  try {
    const DKL_SERVICE_URL = process.env.DKL_EMAIL_SERVICE_URL || 'https://dklemailservice.onrender.com'
    
    // Use the contact-email endpoint for testing
    const endpoint = '/api/contact-email'
    
    // Create a simple test email
    const testData = {
      naam: "Test User from Whisky For Charity",
      email: "laventejeffrey@gmail.com", // Replace with your email for testing
      bericht: "This is a test email from Whisky For Charity via DKL Email Service. Testing integration with your service.",
      privacy_akkoord: true,
      additionalData: {
        testMode: true,
        source: "Whisky For Charity Test",
        timestamp: new Date().toISOString()
      }
    }
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
    
    try {
      const response = await fetch(`${DKL_SERVICE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.DKL_EMAIL_API_KEY || 'dkl_metrics_api_key_2025',
        },
        body: JSON.stringify(testData),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API call failed with status: ${response.status}: ${errorText}`)
      }
      
      const result = await response.json()
      
      return {
        success: true,
        result: result
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: 'Request to DKL Email Service timed out after 5 seconds'
        }
      }
      throw error
    }
  } catch (error) {
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
  
  // Prevent running during automated processes
  if (isBuildTime || isVercelBot || isPrefetch) {
    return NextResponse.json({ message: 'Skipping test during automated process' }, { status: 200 });
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
    const result = await sendTestEmailWithDKL()
    
    // Check if it's a NextResponse object (meaning it was skipped)
    if (result instanceof NextResponse) {
      return result; // Return the skip response directly
    }
    
    // Otherwise, it should be the result object
    if (!result.success) {
      console.error('DKL Email Test Failed:', result.error);
      return NextResponse.json(
        { message: 'DKL Email Test Failed', error: result.error },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      message: 'DKL Email Test Successful',
      result: result.result,
    });
    
  } catch (error: any) {
    console.error('Error in test-dkl-email API route:', error)
    return NextResponse.json(
      { error: 'Failed to send test email', details: (error as Error).message },
      { status: 500 }
    )
  }
} 