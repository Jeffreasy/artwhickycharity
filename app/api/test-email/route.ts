import { NextRequest, NextResponse } from 'next/server'
import { verifyEmailConfig } from '@/lib/email'
import nodemailer from 'nodemailer'

// Configuratie voor testen
const noreplyEmail = 'noreply@whiskyforcharity.com'
const testTransporter = nodemailer.createTransport({
  host: 'arg-plplcl14.argewebhosting.nl',
  port: 465,
  secure: true,
  auth: {
    user: 'noreply@whiskyforcharity.com', // volledige e-mailadres inclusief domein
    pass: 'Oprotten@12',
  },
  logger: true, // meer logs voor debugging
  debug: true, // voor ontwikkelomgeving
  tls: {
    rejectUnauthorized: false, // certificaat validatie uitschakelen
    ciphers: 'SSLv3'
  }
})

// API route om e-mailconfiguratie te testen
export async function GET(request: NextRequest) {
  try {
    console.log('Testing email configuration...')
    
    // Verify connection
    const isConnected = await testTransporter.verify()
    console.log('Connection verified:', isConnected)
    
    // Send test email
    const info = await testTransporter.sendMail({
      from: `"Test Email" <${noreplyEmail}>`,
      to: 'laventejeffrey@gmail.com',
      subject: 'Test Email from Whisky for Charity',
      html: `
        <h1>This is a test email</h1>
        <p>If you're receiving this, the email configuration is working correctly.</p>
        <p>Time sent: ${new Date().toISOString()}</p>
      `
    })
    
    console.log('Test email sent:', info.messageId)
    
    return NextResponse.json({
      success: true,
      message: 'Email test successful',
      details: {
        messageId: info.messageId,
        connectionVerified: isConnected
      }
    })
    
  } catch (error) {
    console.error('Email test failed:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error
      },
      { status: 500 }
    )
  }
} 