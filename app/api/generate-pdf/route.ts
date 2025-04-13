import { NextResponse } from 'next/server'

// Serverless-friendly HTML to PDF conversion via html2pdf.app API
export async function POST(request: Request) {
  try {
    const { html, orderNumber } = await request.json() // Expect pre-rendered HTML

    if (!html) {
      throw new Error('HTML content is required')
    }

    const apiKey = process.env.HTML_TO_PDF_API_KEY || ''
    const endpoint = 'https://api.html2pdf.app/v1/generate'

    const pdfResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        html: html,
        options: {
          format: 'A4',
          margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' }
        }
      })
    })

    if (!pdfResponse.ok) {
      const errorData = await pdfResponse.text()
      console.error('PDF Service Error:', pdfResponse.status, errorData)
      throw new Error(`PDF service error: ${pdfResponse.status}`)
    }

    const pdfBuffer = await pdfResponse.arrayBuffer()

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${orderNumber || 'unknown'}.pdf"`
      }
    })

  } catch (error: any) {
    console.error('PDF Generation Error:', error.message || error)
    
    // Try to get orderNumber for fallback filename if possible
    let fallbackOrderNumber = 'unknown'
    try {
      const { orderNumber } = await request.clone().json() // Clone request to read body again
      if (orderNumber) fallbackOrderNumber = orderNumber
    } catch {}

    // Fallback: simple text error message
    const errorText = `Error generating PDF invoice for order ${fallbackOrderNumber}. Please contact support. Error: ${error.message}`
    return new NextResponse(errorText, {
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': `attachment; filename="invoice-error-${fallbackOrderNumber}.txt"`
      }
    })
  }
} 