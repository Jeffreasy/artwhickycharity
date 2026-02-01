/**
 * Download Invoice Button Component
 * Client-side PDF generation and download
 */

'use client'

import { usePDFDownload } from '@/hooks/usePDFDownload'
import type { InvoiceData } from '@/lib/pdf-templates/InvoicePDF'

interface DownloadInvoiceButtonProps {
    invoiceData: InvoiceData
    variant?: 'primary' | 'secondary' | 'outline'
    size?: 'sm' | 'md' | 'lg'
    className?: string
}

export function DownloadInvoiceButton({
    invoiceData,
    variant = 'primary',
    size = 'md',
    className = '',
}: DownloadInvoiceButtonProps) {
    const { downloadInvoice, isGenerating, error } = usePDFDownload()

    const handleDownload = () => {
        downloadInvoice(invoiceData, {
            filename: `factuur-${invoiceData.orderNumber}.pdf`,
            onSuccess: () => {
                console.log('PDF downloaded successfully')
            },
            onError: (err) => {
                console.error('PDF download failed:', err)
                alert('Er is een fout opgetreden bij het genereren van de PDF. Probeer het opnieuw.')
            },
        })
    }

    // Base styles
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

    // Variant styles
    const variantStyles = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
        secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
        outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500',
    }

    // Size styles
    const sizeStyles = {
        sm: 'px-3 py-1.5 text-sm rounded',
        md: 'px-4 py-2 text-base rounded-md',
        lg: 'px-6 py-3 text-lg rounded-lg',
    }

    return (
        <div className="space-y-2">
            <button
                onClick={handleDownload}
                disabled={isGenerating}
                className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
            >
                {isGenerating ? (
                    <>
                        <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                        </svg>
                        PDF Genereren...
                    </>
                ) : (
                    <>
                        <svg
                            className="-ml-1 mr-2 h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                        </svg>
                        Download Factuur (PDF)
                    </>
                )}
            </button>

            {error && (
                <p className="text-sm text-red-600">
                    Fout bij genereren PDF: {error.message}
                </p>
            )}
        </div>
    )
}
