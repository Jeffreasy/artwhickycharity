import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

// This function skips actual email sending during build time
export async function GET(request: Request) {
  // Skip during production build/runtime
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ message: 'Test skipped in production environment' }, { status: 200 });
  }
  
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
    return NextResponse.json({ message: 'Test skipped during automated process' }, { status: 200 });
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
    
    await transporter.verify()
    
    // Attempt to send a test email with timeout protection
    const mailOptions = {
      from: '"Whisky For Charity Test" <info@whiskyforcharity.com>',
      to: "laventejeffrey@gmail.com",
      subject: "Test Email - Direct SMTP",
      text: "This is a test email from the Whisky For Charity website via direct SMTP connection to Argeweb.",
      html: "<b>This is a test email from the Whisky For Charity website via direct SMTP connection to Argeweb.</b>"
    }
    
    const info = await transporter.sendMail(mailOptions)
    
    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully using Argeweb SMTP',
      details: info
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Email test failed',
      details: (error as Error).message
    }, { status: 500 })
  }
} 