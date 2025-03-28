import nodemailer from 'nodemailer'
import type { Order } from '@/types/order'

// E-mail configuratie
export const adminEmail = 'info@whiskyforcharity.com'
const noreplyEmail = 'noreply@whiskyforcharity.com'

// Configureer nodemailer transporter
const transporter = nodemailer.createTransport({
  host: 'arg-plplcl14.argewebhosting.nl',
  port: 465,
  secure: true, // true voor 465, false voor andere poorten
  auth: {
    user: noreplyEmail, // volledige e-mailadres
    pass: 'Oprotten@12',
  },
  tls: {
    // Niet controleren op geldige certificaten - soms nodig bij bepaalde hostingproviders
    rejectUnauthorized: false
  },
  debug: true // voor ontwikkelomgeving
})

// Controleer of de email is geconfigureerd en werkt
export async function verifyEmailConfig() {
  try {
    console.log('Verifying email configuration...')
    const result = await transporter.verify()
    console.log('Email service is ready to take messages')
    return true
  } catch (error) {
    console.error('Error verifying email configuration:', error)
    return false
  }
}

// Functie om datum in NL format te formatteren
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('nl-NL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date)
}

// Genereer HTML-template voor klant e-mail
export function generateCustomerEmailHTML(order: Order): string {
  const orderDate = formatDate(new Date(order.created_at))
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .header img { max-width: 100px; }
        h1, h2 { color: #000; }
        .order-details { margin: 20px 0; background-color: #f9f9f9; padding: 15px; border-radius: 5px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f2f2f2; }
        .total { font-weight: bold; text-align: right; }
        .footer { margin-top: 30px; text-align: center; font-size: 0.8em; color: #777; }
        .payment-info { background-color: #f2f2f2; padding: 15px; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Thank You for Your Order!</h1>
          <p>Order Number: ${order.order_number}</p>
          <p>Date: ${orderDate}</p>
        </div>
        
        <p>Dear ${order.customer_first_name} ${order.customer_last_name},</p>
        
        <p>Thank you for supporting Whisky for Charity. Your order has been received and is being processed.</p>
        
        <div class="order-details">
          <h2>Order Summary</h2>
          <table>
            <tr>
              <th>Product</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
            ${order.items.map(item => `
            <tr>
              <td>${item.name}</td>
              <td>${item.quantity}</td>
              <td>€${Number(item.price).toFixed(2)}</td>
              <td>€${(Number(item.price) * item.quantity).toFixed(2)}</td>
            </tr>
            `).join('')}
            <tr class="total">
              <td colspan="3">Total Amount</td>
              <td>€${Number(order.total_amount).toFixed(2)}</td>
            </tr>
          </table>
        </div>
        
        <div class="payment-info">
          <h2>Payment Information</h2>
          <p>Please transfer the total amount to:</p>
          <p><strong>Account Number:</strong> NL10RABO0131123505</p>
          <p><strong>Account Holder:</strong> L. Albers</p>
          <p><strong>Reference:</strong> HOPE edition - Order ${order.order_number}</p>
          <p>We will process your order once payment is received.</p>
        </div>
        
        <p>The entire proceeds from the sale of the 'HOPE' edition will be donated to the Refugee Foundation (www.vluchteling.nl).</p>
        
        <p>If you have any questions, please contact us at info@whiskyforcharity.com.</p>
        
        <p>Thank you for your support!</p>
        
        <p>Best regards,<br>
        Whisky for Charity Team</p>
        
        <div class="footer">
          <p>This email was sent from a notification-only address. Please do not reply to this message.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Genereer HTML-template voor admin e-mail
export function generateAdminEmailHTML(order: Order): string {
  const orderDate = formatDate(new Date(order.created_at))
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { margin-bottom: 30px; }
        h1, h2 { color: #000; }
        .alert { background-color: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px; }
        .order-details { margin: 20px 0; background-color: #f9f9f9; padding: 15px; border-radius: 5px; }
        .customer-info { margin: 20px 0; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f2f2f2; }
        .total { font-weight: bold; text-align: right; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Order Notification</h1>
          <p>Order Number: ${order.order_number}</p>
          <p>Date: ${orderDate}</p>
        </div>
        
        <div class="alert">
          <p><strong>Action Required:</strong> New order requires processing.</p>
        </div>
        
        <div class="customer-info">
          <h2>Customer Information</h2>
          <p><strong>Name:</strong> ${order.customer_first_name} ${order.customer_last_name}</p>
          <p><strong>Email:</strong> ${order.customer_email}</p>
          <p><strong>Address:</strong> ${order.customer_address}</p>
          <p><strong>City:</strong> ${order.customer_city}</p>
          <p><strong>Postal Code:</strong> ${order.customer_postal_code}</p>
          <p><strong>Country:</strong> ${order.customer_country}</p>
        </div>
        
        <div class="order-details">
          <h2>Order Details</h2>
          <table>
            <tr>
              <th>Product</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
            ${order.items.map(item => `
            <tr>
              <td>${item.name}</td>
              <td>${item.quantity}</td>
              <td>€${Number(item.price).toFixed(2)}</td>
              <td>€${(Number(item.price) * item.quantity).toFixed(2)}</td>
            </tr>
            `).join('')}
            <tr class="total">
              <td colspan="3">Total Amount</td>
              <td>€${Number(order.total_amount).toFixed(2)}</td>
            </tr>
          </table>
        </div>
        
        <p>You can view the full order details in the admin dashboard.</p>
      </div>
    </body>
    </html>
  `
}

// Functie om e-mail naar klant te versturen
export async function sendCustomerOrderConfirmation(order: Order): Promise<boolean> {
  try {
    // Genereer HTML
    const htmlContent = generateCustomerEmailHTML(order)
    
    // Verstuur e-mail
    const info = await transporter.sendMail({
      from: `"Whisky for Charity" <${noreplyEmail}>`,
      to: order.customer_email,
      subject: `Order Confirmation - ${order.order_number}`,
      html: htmlContent
    })
    
    console.log('Customer confirmation email sent:', info.messageId)
    return true
  } catch (error) {
    console.error('Error sending customer confirmation email:', error)
    return false
  }
}

// Functie om e-mail naar admin te versturen
export async function sendAdminOrderNotification(order: Order): Promise<boolean> {
  try {
    // Genereer HTML
    const htmlContent = generateAdminEmailHTML(order)
    
    // Verstuur e-mail
    const info = await transporter.sendMail({
      from: `"Whisky for Charity System" <${noreplyEmail}>`,
      to: adminEmail,
      subject: `New Order Received - ${order.order_number}`,
      html: htmlContent
    })
    
    console.log('Admin notification email sent:', info.messageId)
    return true
  } catch (error) {
    console.error('Error sending admin notification email:', error)
    return false
  }
}

// Functie om alle e-mails voor een bestelling te verzenden
export async function sendOrderEmails(order: Order): Promise<{
  customerEmailSent: boolean
  adminEmailSent: boolean
}> {
  const customerEmailSent = await sendCustomerOrderConfirmation(order)
  const adminEmailSent = await sendAdminOrderNotification(order)
  
  return {
    customerEmailSent,
    adminEmailSent
  }
} 