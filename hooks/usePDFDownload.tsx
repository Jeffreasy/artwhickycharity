/**
 * Client-Side PDF Download Hook
 * Uses @react-pdf/renderer in the browser to generate and download PDFs
 */

'use client'

import { useState } from 'react'
import { pdf } from '@react-pdf/renderer'
import { InvoicePDF, type InvoiceData } from '@/lib/pdf-templates/InvoicePDF'

export interface PDFDownloadOptions {
    filename?: string
    onSuccess?: () => void
    onError?: (error: Error) => void
}

export function usePDFDownload() {
    const [isGenerating, setIsGenerating] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    /**
     * Generate and download an invoice PDF
     */
    const downloadInvoice = async (
        invoiceData: InvoiceData,
        options: PDFDownloadOptions = {}
    ) => {
        const {
            filename = `factuur-${invoiceData.orderNumber}.pdf`,
            onSuccess,
            onError,
        } = options

        setIsGenerating(true)
        setError(null)

        try {
            // Generate PDF blob using @react-pdf/renderer
            const blob = await pdf(<InvoicePDF data={ invoiceData } />).toBlob()

            // Create download link
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = filename
            link.style.display = 'none'

            // Trigger download
            document.body.appendChild(link)
            link.click()

            // Cleanup
            document.body.removeChild(link)
            URL.revokeObjectURL(url)

            onSuccess?.()
        } catch (err) {
            const error = err instanceof Error ? err : new Error('PDF generation failed')
            setError(error)
            onError?.(error)
            console.error('PDF generation error:', error)
        } finally {
            setIsGenerating(false)
        }
    }

    /**
     * Generate PDF blob without downloading (for preview, email attachment, etc.)
     */
    const generatePDFBlob = async (invoiceData: InvoiceData): Promise<Blob> => {
        setIsGenerating(true)
        setError(null)

        try {
            const blob = await pdf(<InvoicePDF data={ invoiceData } />).toBlob()
            return blob
        } catch (err) {
            const error = err instanceof Error ? err : new Error('PDF generation failed')
            setError(error)
            throw error
        } finally {
            setIsGenerating(false)
        }
    }

    return {
        downloadInvoice,
        generatePDFBlob,
        isGenerating,
        error,
    }
}
