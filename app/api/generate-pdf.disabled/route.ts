/**
 * PDF Generation API Route
 * Uses @react-pdf/renderer for secure, serverless PDF generation
 * Replaces vulnerable puppeteer/html-pdf-node packages
 */

import { NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { createInvoicePDF } from '@/lib/pdf-templates/createInvoicePDF'
import type { InvoiceData } from '@/lib/pdf-templates/InvoicePDF'

export async function POST(request: Request) {
  try {
    const invoiceData: InvoiceData = await request.json()

    // Validate required fields
    if (!invoiceData.orderNumber) {
      return NextResponse.json(
        { error: 'Order number is required' },
        { status: 400 }
      )
    }

    if (!invoiceData.items || invoiceData.items.length === 0) {
      return NextResponse.json(
        { error: 'Invoice must contain at least one item' },
        { status: 400 }
      )
    }

    // Generate PDF using @react-pdf/renderer
    const pdfDocument = createInvoicePDF(invoiceData)
    const pdfBuffer = await renderToBuffer(pdfDocument as any)

    // Return PDF as download
    return new NextResponse(pdfBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="factuur-${invoiceData.orderNumber}.pdf"`,
      },
    })

  } catch (error) {
    console.error('PDF Generation Error:', error)

    return NextResponse.json(
      {
        error: 'Failed to generate PDF',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint for testing
 * Generates a sample invoice PDF
 */
export async function GET() {
  try {
    // Sample invoice data for testing
    const sampleData: InvoiceData = {
      orderNumber: 'TEST-001',
      orderDate: new Date().toLocaleDateString('nl-NL'),
      customerName: 'Test Klant',
      customerEmail: 'test@example.com',
      customerAddress: 'Teststraat 123, 1234 AB Amsterdam',
      items: [
        {
          id: '1',
          name: 'Lagavulin 16 Year Old',
          quantity: 1,
          price: 89.99,
          total: 89.99,
        },
        {
          id: '2',
          name: 'Glenfiddich 18 Year Old',
          quantity: 2,
          price: 79.99,
          total: 159.98,
        },
      ],
      subtotal: 249.97,
      tax: 52.49,
      total: 302.46,
      paymentMethod: 'iDEAL',
      notes: 'Dit is een test factuur.',
    }

    const pdfDocument = createInvoicePDF(sampleData)
    const pdfBuffer = await renderToBuffer(pdfDocument as any)

    return new NextResponse(pdfBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="test-factuur.pdf"',
      },
    })

  } catch (error) {
    console.error('Test PDF Generation Error:', error)

    return NextResponse.json(
      {
        error: 'Failed to generate test PDF',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}