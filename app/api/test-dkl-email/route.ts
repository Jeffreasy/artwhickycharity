import { NextResponse } from 'next/server'

// Function to send a test email using DKL Email Service
async function sendTestEmailWithDKL() {
  // Only proceed with the actual API call if not in build
  const isBuildTime = process.env.VERCEL_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build'
  
  if (isBuildTime) {
    console.log('Skipping DKL email test during build time')
    return {
      success: true,
      skipped: true,
      message: 'Test skipped during build'
    }
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
    
    console.log(`Sending test email to DKL Email Service: ${DKL_SERVICE_URL}${endpoint}`)
    console.log('Test data:', JSON.stringify(testData, null, 2))
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
    
    try {
      const response = await fetch(`${DKL_SERVICE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DKL_EMAIL_API_KEY || 'dkl_metrics_api_key_2025'}`,
        },
        body: JSON.stringify(testData),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      console.log('DKL Email Service response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('DKL Email Service error response:', errorText)
        throw new Error(`DKL Email Service error (${response.status}): ${errorText}`)
      }
      
      const result = await response.json()
      console.log('DKL Email Service success response:', result)
      
      return {
        success: true,
        result: result
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.error('DKL Email Service request timed out')
        return {
          success: false,
          error: 'Request to DKL Email Service timed out after 5 seconds'
        }
      }
      throw error
    }
  } catch (error) {
    console.error('Error sending test email with DKL:', error)
    return {
      success: false,
      error: (error as Error).message
    }
  }
}

export async function GET() {
  // Skip API calls during build time in Vercel
  const isBuildTime = process.env.VERCEL_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build'
  
  if (isBuildTime) {
    console.log('Skipping DKL email test during build time')
    return NextResponse.json({
      message: 'DKL Email test skipped during build',
      skipped: true
    })
  }
  
  try {
    const result = await sendTestEmailWithDKL()
    
    if (result.skipped) {
      return NextResponse.json({
        message: 'DKL Email test skipped during build',
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
      message: 'Test email sent successfully via DKL Email Service',
      result: result.result
    })
    
  } catch (error) {
    console.error('Error in test-dkl-email API route:', error)
    return NextResponse.json(
      { error: 'Failed to send test email', details: (error as Error).message },
      { status: 500 }
    )
  }
} 