import nodemailer from 'nodemailer'

export const createTransporter = (user: 'jeffrey' | 'info' = 'info') => {
  // Bepaal welke gebruiker we moeten gebruiken
  const email = user === 'jeffrey' 
    ? process.env.SMTP_USER_JEFFREY 
    : process.env.SMTP_USER_INFO

  // Creëer een transporter met de juiste SMTP instellingen
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 465,
    secure: process.env.SMTP_SECURE === 'true', // true voor port 465, false voor andere poorten
    auth: {
      user: email,
      pass: process.env.SMTP_PASSWORD, // Wachtwoord uit environment variabelen
    },
  })

  return transporter
}

// Helper functie om een e-mail te versturen
export const sendEmail = async ({
  to,
  subject,
  html,
  from = 'info',
}: {
  to: string
  subject: string
  html: string
  from?: 'jeffrey' | 'info'
}) => {
  const transporter = createTransporter(from)
  const fromEmail = from === 'jeffrey' 
    ? process.env.SMTP_USER_JEFFREY 
    : process.env.SMTP_USER_INFO

  try {
    const result = await transporter.sendMail({
      from: `Whisky For Charity <${fromEmail}>`,
      to,
      subject,
      html,
    })
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error }
  }
} 