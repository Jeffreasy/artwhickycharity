import { NextRequest, NextResponse } from 'next/server'
import { testSendgrid } from '@/lib/email-sendgrid'

// API route om SendGrid e-mail te testen
export async function GET(request: NextRequest) {
  try {
    //console.log('Testing SendGrid email service...')
    
    const success = await testSendgrid()
    
    return NextResponse.json({
      success,
      message: success ? 'SendGrid test successful' : 'SendGrid test failed'
    })
    
  } catch (error) {
    console.error('SendGrid test failed:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
} 