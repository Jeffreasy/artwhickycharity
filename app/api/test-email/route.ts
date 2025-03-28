import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

// This function skips actual email sending during build time
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
    console.log('Skipping email test during automated process:', { isBuildTime, isVercelBot, isPrefetch, userAgent });
    return NextResponse.json({
      message: 'Email test skipped during automated process',
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
    
    // Attempt to send a test email with timeout protection
    try {
      console.log('Attempting to send test email...')
      
      const sendPromise = transporter.sendMail({
        from: '"Whisky For Charity Test" <info@whiskyforcharity.com>',
        to: "laventejeffrey@gmail.com",
        subject: "Test Email - Direct SMTP",
        text: "This is a test email from the Whisky For Charity website via direct SMTP connection to Argeweb.",
        html: "<b>This is a test email from the Whisky For Charity website via direct SMTP connection to Argeweb.</b>"
      })
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Email sending timed out')), 10000)
      )
      
      const info = await Promise.race([sendPromise, timeoutPromise])
      console.log('Test email sent successfully:', info)
      
      return NextResponse.json({
        success: true,
        message: 'Test email sent successfully',
        details: info
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
      error: 'Email test failed',
      details: (error as Error).message
    }, { status: 500 })
  }
} 