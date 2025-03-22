import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email-server'

// Deze route handler verwerkt email requests van Supabase Auth
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Verwachte Supabase email payload formaat
    const { email, template, data } = body
    
    // Check of alle vereiste velden aanwezig zijn
    if (!email || !template || !data) {
      return new NextResponse(
        JSON.stringify({
          error: 'Ontbrekende vereiste velden: email, template of data'
        }),
        { status: 400 }
      )
    }
    
    let subject: string
    let htmlContent: string
    
    // Verschillende templates verwerken
    switch (template) {
      case 'signup':
        subject = 'Bevestig je account bij Whisky For Charity'
        htmlContent = `
          <h1>Welkom bij Whisky For Charity</h1>
          <p>Klik op de onderstaande link om je account te bevestigen:</p>
          <p><a href="${data.confirmation_url}">Account bevestigen</a></p>
          <p>Als je niet hebt geprobeerd om een account aan te maken, kun je deze e-mail negeren.</p>
        `
        break
        
      case 'reset_password':
        subject = 'Herstel je wachtwoord bij Whisky For Charity'
        htmlContent = `
          <h1>Wachtwoord herstellen</h1>
          <p>Klik op de onderstaande link om je wachtwoord te herstellen:</p>
          <p><a href="${data.reset_password_url}">Wachtwoord herstellen</a></p>
          <p>Als je niet hebt gevraagd om je wachtwoord te herstellen, kun je deze e-mail negeren.</p>
        `
        break
        
      case 'magic_link':
        subject = 'Inloggen bij Whisky For Charity'
        htmlContent = `
          <h1>Login link</h1>
          <p>Klik op de onderstaande link om in te loggen:</p>
          <p><a href="${data.magic_link_url}">Inloggen</a></p>
          <p>Als je niet hebt geprobeerd om in te loggen, kun je deze e-mail negeren.</p>
        `
        break
        
      default:
        return new NextResponse(
          JSON.stringify({
            error: `Onbekend template type: ${template}`
          }),
          { status: 400 }
        )
    }
    
    // Email verzenden via Argewebhosting SMTP
    const result = await sendEmail({
      to: email,
      subject,
      html: htmlContent,
    })
    
    if (!result.success) {
      return new NextResponse(
        JSON.stringify({
          error: 'Kon geen email verzenden'
        }),
        { status: 500 }
      )
    }
    
    return new NextResponse(
      JSON.stringify({
        success: true,
        message: `Email succesvol verzonden naar ${email}`
      }),
      { status: 200 }
    )
    
  } catch (error) {
    console.error('Fout bij verwerken email request:', error)
    return new NextResponse(
      JSON.stringify({
        error: 'Interne serverfout'
      }),
      { status: 500 }
    )
  }
} 