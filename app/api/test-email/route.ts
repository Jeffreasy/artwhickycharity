import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

// Configuratie voor testen
const testEmail = async () => {
  try {
    console.log('Setting up email test with Argeweb configuration...');
    
    // Configureer transporter met Argeweb MX record
    const transporter = nodemailer.createTransport({
      host: 'maildrop1.argewebhosting.nl', // Primaire MX-record
      port: 465,
      secure: true,
      auth: {
        user: 'noreply@whiskyforcharity.com',
        pass: 'Oprotten@12'
      },
      tls: {
        rejectUnauthorized: false // Accepteer zelf-ondertekende certificaten
      },
      debug: true, // Debug logging voor ontwikkeling
      logger: true // Meer gedetailleerde logs
    });

    // Verbinding verifiëren
    console.log('Verifying SMTP connection...');
    await transporter.verify();
    console.log('SMTP connection successfully verified!');

    // Testgegevens voor e-mail
    const testTo = 'laventejeffrey@gmail.com';
    const testHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #333;">Test Email van Whisky for Charity</h1>
        <p>Dit is een test e-mail verzonden op: ${new Date().toLocaleString('nl-NL')}</p>
        <p>Als je deze e-mail ontvangt, betekent dit dat de e-mailconfiguratie correct werkt!</p>
        <div style="margin-top: 20px; padding: 15px; background-color: #f8f8f8; border-radius: 5px;">
          <p style="margin: 0;">Met vriendelijke groet,<br>Whisky for Charity Team</p>
        </div>
      </div>
    `;

    // Verstuur test e-mail
    console.log(`Sending test email to ${testTo}...`);
    const info = await transporter.sendMail({
      from: '"Whisky for Charity Test" <noreply@whiskyforcharity.com>',
      to: testTo,
      subject: 'Test Email Configuratie',
      text: 'Als je dit kunt lezen, werkt de e-mailconfiguratie correct!',
      html: testHtml
    });

    console.log('Email sent successfully!');
    console.log('Message ID:', info.messageId);
    
    // Preview URL voor Ethereal
    if (info.messageId && nodemailer.getTestMessageUrl(info)) {
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    }
    
    return { 
      success: true, 
      messageId: info.messageId,
      previewUrl: nodemailer.getTestMessageUrl(info) || undefined 
    };
  } catch (error: any) {
    console.error('SMTP error:', error);
    return { 
      success: false, 
      error: error.message || 'Unknown error',
      stack: error.stack,
      code: error.code
    };
  }
};

// API route om e-mailconfiguratie te testen
export async function GET(request: NextRequest) {
  try {
    console.log('Starting email test...');
    const result = await testEmail();
    
    return NextResponse.json({
      success: result.success,
      message: result.success ? 'E-mail test succesvol' : 'E-mail test mislukt',
      details: result
    });
  } catch (error) {
    console.error('Test email failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error
      },
      { status: 500 }
    );
  }
} 