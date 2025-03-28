import { NextResponse } from 'next/server'
import puppeteer from 'puppeteer'
import fs from 'fs/promises'
import path from 'path'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { html, orderNumber } = data

    // Read the CSS file
    const cssPath = path.join(process.cwd(), 'app/shop/components/CheckoutModal/invoice-pdf.css')
    const css = await fs.readFile(cssPath, 'utf-8')

    // Launch Puppeteer
    const browser = await puppeteer.launch({
      headless: true
    })
    
    const page = await browser.newPage()
    
    // Set viewport for A4 size
    await page.setViewport({
      width: 800,
      height: 1130, // Approximate A4 height ratio
      deviceScaleFactor: 2
    })

    // Set content with CSS and wait for images to load
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>${css}</style>
          <style>
            @page {
              size: A4;
              margin: 20px;
            }
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          </style>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `, {
      waitUntil: ['networkidle0', 'load']
    })

    // Wait for any images to load
    await page.evaluate(() => {
      return Promise.all(
        Array.from(document.images)
          .filter(img => !img.complete)
          .map(img => new Promise(resolve => {
            img.onload = img.onerror = resolve
          }))
      )
    })

    // Generate PDF with better quality settings
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      },
      preferCSSPageSize: true,
      scale: 1
    })

    await browser.close()

    // Return the PDF directly with proper headers
    return new NextResponse(pdf, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${orderNumber}.pdf"`,
        'Content-Length': pdf.length.toString()
      }
    })

  } catch (error) {
    console.error('PDF Generation Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
} 