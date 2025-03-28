import { NextRequest, NextResponse } from 'next/server'

// This function skips actual email sending during build time
export async function GET() {
  // Detect if we're in a build environment (Vercel)
  const isBuildTime = process.env.VERCEL_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build'
  
  if (isBuildTime) {
    console.log('Skipping email test during build time')
    return NextResponse.json({
      message: 'Email test skipped during build',
      skipped: true
    })
  }
  
  try {
    console.log('Starting email test...')
    console.log('Setting up email test with Argeweb configuration...')
    
    // Only require these modules when not in build time to prevent blocking
    const nodemailer = await import('nodemailer')
    
    // Create a test transporter
    const transporter = nodemailer.default.createTransport({
      host: process.env.SMTP_HOST || 'maildrop1.argewebhosting.nl',
      port: 465,
      secure: true,
      auth: {
        user: 'info@whiskyforcharity.com',
        pass: process.env.SMTP_PASSWORD || 'Oprotten@12'
      },
      connectionTimeout: 5000, // 5 seconds timeout
      greetingTimeout: 5000,
      socketTimeout: 5000
    })
    
    console.log('Verifying SMTP connection...')
    
    try {
      // Set a timeout for the verify operation
      const verifyPromise = transporter.verify()
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('SMTP verification timed out')), 5000)
      )
      
      await Promise.race([verifyPromise, timeoutPromise])
      console.log('SMTP connection verified successfully')
    } catch (error) {
      console.error('SMTP Verification failed:', error)
      return NextResponse.json({
        error: 'Failed to verify SMTP connection',
        details: (error as Error).message
      }, { status: 500 })
    }
    
    // Try to send a test email
    try {
      console.log('Sending test email...')
      const info = await transporter.sendMail({
        from: 'info@whiskyforcharity.com',
        to: 'laventejeffrey@gmail.com',
        subject: 'Test Email from Whisky For Charity',
        text: 'This is a test email from the Whisky For Charity website.',
        html: '<p>This is a test email from the <b>Whisky For Charity</b> website.</p>'
      })
      
      console.log('Email sent successfully:', info.messageId)
      
      return NextResponse.json({
        message: 'Test email sent successfully',
        messageId: info.messageId
      })
    } catch (error) {
      console.error('Failed to send test email:', error)
      return NextResponse.json({
        error: 'Failed to send test email',
        details: (error as Error).message
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Error in test-email API route:', error)
    return NextResponse.json({
      error: 'An unexpected error occurred',
      details: (error as Error).message
    }, { status: 500 })
  }
} 