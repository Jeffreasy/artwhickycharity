import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

// Serverless-friendly HTML to PDF conversion
export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { html, orderNumber } = data

    if (!html) {
      throw new Error('HTML content is required')
    }

    console.log('Starting serverless PDF generation for order:', orderNumber)

    // Read the CSS file
    const cssPath = path.join(process.cwd(), 'app/shop/components/CheckoutModal/invoice-pdf.css')
    const css = await fs.readFile(cssPath, 'utf-8').catch(err => {
      console.error('Error reading CSS file:', err)
      return '/* Default CSS if file not found */'
    })

    console.log('CSS loaded, preparing HTML content')

    // Complete HTML document with embedded styles
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
          ${html.replace(/src="[^"]+"/g, 'src=""')}
        </body>
      </html>
    `

    console.log('HTML content prepared, generating PDF')

    // Using the API mode for serverless environments
    const apiKey = process.env.HTML_TO_PDF_API_KEY || '';
    const endpoint = 'https://api.html2pdf.app/v1/generate';

    const pdfResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        html: htmlContent,
        apiKey: apiKey,
        options: {
          format: 'A4',
          margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' }
        }
      })
    });

    if (!pdfResponse.ok) {
      const errorData = await pdfResponse.text();
      console.error('PDF Service Error:', pdfResponse.status, errorData);
      throw new Error(`PDF service error: ${pdfResponse.status}`);
    }

    const pdfBuffer = await pdfResponse.arrayBuffer();
    console.log('PDF generated successfully, size:', pdfBuffer.byteLength);

    // Return the PDF directly with proper headers
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${orderNumber}.pdf"`
      }
    });

  } catch (error: any) {
    console.error('PDF Generation Error:', error.message || error);
    
    // Fallback: Instead of failing, return a simple text-based invoice
    try {
      const { html, orderNumber } = await request.json();

      // Create plain text version from HTML
      let plainText = "INVOICE - WHISKY FOR CHARITY\n\n";
      plainText += `Order Number: ${orderNumber}\n`;
      plainText += `Date: ${new Date().toLocaleDateString()}\n\n`;
      plainText += "We couldn't generate a PDF invoice at this time.\n";
      plainText += "Please contact support for assistance.\n\n";
      plainText += "Whisky For Charity © 2025\n";

      return new NextResponse(plainText, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain',
          'Content-Disposition': `attachment; filename="invoice-${orderNumber}.txt"`
        }
      });
    } catch (fallbackError) {
      console.error('Even fallback failed:', fallbackError);
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to generate PDF',
          details: error.message || String(error)
        },
        { status: 500 }
      );
    }
  }
} 