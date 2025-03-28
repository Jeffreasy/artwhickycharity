import { NextResponse } from 'next/server'
import puppeteer from 'puppeteer'
import fs from 'fs/promises'
import path from 'path'

export async function POST(request: Request) {
  let browser = null
  
  try {
    const data = await request.json()
    const { html, orderNumber } = data

    if (!html) {
      throw new Error('HTML content is required')
    }

    console.log('Starting PDF generation for order:', orderNumber)

    // Read the CSS file
    const cssPath = path.join(process.cwd(), 'app/shop/components/CheckoutModal/invoice-pdf.css')
    const css = await fs.readFile(cssPath, 'utf-8').catch(err => {
      console.error('Error reading CSS file:', err)
      return '/* Default CSS if file not found */'
    })

    // Launch Puppeteer with more explicit options for serverless environments
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--font-render-hinting=none'
      ]
    })
    
    console.log('Puppeteer browser launched')
    
    const page = await browser.newPage()
    
    // Set viewport for A4 size
    await page.setViewport({
      width: 800,
      height: 1130,
      deviceScaleFactor: 2
    })

    console.log('Setting page content')

    // Set a simple HTML content that doesn't rely on external resources
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            ${css}
            body {
              font-family: Arial, sans-serif;
              color: #000000;
              background-color: #ffffff;
              padding: 20px;
            }
            @page {
              size: A4;
              margin: 20px;
            }
          </style>
        </head>
        <body>
          ${html.replace(/src="[^"]+"/g, 'src=""')} <!-- Remove image sources to avoid loading issues -->
        </body>
      </html>
    `

    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0'
    })

    console.log('Generating PDF')

    // Generate PDF with simpler settings
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true
    })

    console.log('PDF generated successfully, size:', pdf.length)

    if (browser) {
      await browser.close()
      console.log('Browser closed')
    }

    // Return the PDF directly with proper headers
    return new NextResponse(pdf, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${orderNumber}.pdf"`
      }
    })

  } catch (error: any) {
    console.error('PDF Generation Error:', error.message || error)
    // Make sure to close the browser in case of error
    if (browser) {
      await browser.close().catch(err => console.error('Error closing browser:', err))
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate PDF',
        details: error.message || String(error)
      },
      { status: 500 }
    )
  }
} 