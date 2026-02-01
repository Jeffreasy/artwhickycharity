/**
 * Example Invoice Page
 * Demonstrates client-side PDF generation
 */

'use client'

import { DownloadInvoiceButton } from '@/components/DownloadInvoiceButton'
import type { InvoiceData } from '@/lib/pdf-templates/InvoicePDF'

export default function InvoiceExamplePage() {
    // Sample invoice data
    const sampleInvoice: InvoiceData = {
        orderNumber: 'WFC-2026-001',
        orderDate: new Date().toLocaleDateString('nl-NL'),
        customerName: 'Jan de Vries',
        customerEmail: 'jan@example.com',
        customerAddress: 'Voorbeeldstraat 123, 1234 AB Amsterdam',
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
            {
                id: '3',
                name: 'Macallan 12 Year Old Sherry Oak',
                quantity: 1,
                price: 69.99,
                total: 69.99,
            },
        ],
        subtotal: 319.96,
        tax: 67.19,
        total: 387.15,
        paymentMethod: 'iDEAL',
        notes: 'Bedankt voor uw bestelling! Een deel van de opbrengst gaat naar het goede doel.',
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-6 px-3 sm:pt-28 sm:pb-12 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-white shadow rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                        Factuur {sampleInvoice.orderNumber}
                    </h1>
                    <p className="text-sm sm:text-base text-gray-600">
                        Datum: {sampleInvoice.orderDate}
                    </p>
                </div>

                {/* Customer Info */}
                <div className="bg-white shadow rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
                        Klantgegevens
                    </h2>
                    <div className="space-y-1 text-sm sm:text-base text-gray-700">
                        <p className="font-medium">{sampleInvoice.customerName}</p>
                        <p>{sampleInvoice.customerEmail}</p>
                        <p>{sampleInvoice.customerAddress}</p>
                    </div>
                </div>

                {/* Order Items */}
                <div className="bg-white shadow rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
                        Bestellingsoverzicht
                    </h2>
                    <div className="overflow-x-auto -mx-4 sm:mx-0">
                        <div className="inline-block min-w-full align-middle px-4 sm:px-0">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Product
                                        </th>
                                        <th className="px-3 sm:px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Aantal
                                        </th>
                                        <th className="px-3 sm:px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Prijs
                                        </th>
                                        <th className="px-3 sm:px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Totaal
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {sampleInvoice.items.map((item) => (
                                        <tr key={item.id}>
                                            <td className="px-3 sm:px-4 py-4 text-xs sm:text-sm text-gray-900">{item.name}</td>
                                            <td className="px-3 sm:px-4 py-4 text-xs sm:text-sm text-gray-900 text-center">{item.quantity}</td>
                                            <td className="px-3 sm:px-4 py-4 text-xs sm:text-sm text-gray-900 text-right whitespace-nowrap">
                                                €{item.price.toFixed(2)}
                                            </td>
                                            <td className="px-3 sm:px-4 py-4 text-xs sm:text-sm font-medium text-gray-900 text-right whitespace-nowrap">
                                                €{item.total.toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Totals */}
                    <div className="mt-6 border-t border-gray-200 pt-4">
                        <div className="flex justify-end">
                            <div className="w-full sm:w-64 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Subtotaal:</span>
                                    <span className="font-medium">€{sampleInvoice.subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">BTW (21%):</span>
                                    <span className="font-medium">€{sampleInvoice.tax?.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-base sm:text-lg font-bold border-t border-gray-200 pt-2">
                                    <span>Totaal:</span>
                                    <span>€{sampleInvoice.total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payment Method */}
                <div className="bg-white shadow rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                        Betaalmethode
                    </h2>
                    <p className="text-sm sm:text-base text-gray-700">{sampleInvoice.paymentMethod}</p>
                </div>

                {/* Notes */}
                {sampleInvoice.notes && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
                        <h2 className="text-lg sm:text-xl font-semibold text-blue-900 mb-2">
                            Opmerkingen
                        </h2>
                        <p className="text-sm sm:text-base text-blue-800">{sampleInvoice.notes}</p>
                    </div>
                )}

                {/* Download Button */}
                <div className="bg-white shadow rounded-lg p-4 sm:p-6">
                    <div className="text-center space-y-4">
                        <p className="text-sm sm:text-base text-gray-600 mb-4">
                            Download uw factuur als PDF bestand voor uw administratie.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <DownloadInvoiceButton
                                invoiceData={sampleInvoice}
                                variant="primary"
                                size="lg"
                            />

                            <DownloadInvoiceButton
                                invoiceData={sampleInvoice}
                                variant="outline"
                                size="lg"
                            />
                        </div>

                        <p className="text-xs text-gray-500 mt-4">
                            💡 Tip: PDF wordt direct in uw browser gegenereerd, geen server nodig!
                        </p>
                    </div>
                </div>

                {/* Info Box */}
                <div className="mt-4 sm:mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg
                                className="h-5 w-5 text-green-400"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-green-800">
                                Client-side PDF Generation
                            </h3>
                            <div className="mt-2 text-xs sm:text-sm text-green-700">
                                <p>
                                    Deze pagina gebruikt <code className="bg-green-100 px-1 rounded">@react-pdf/renderer</code> om
                                    facturen direct in uw browser te genereren. Geen server-side processing nodig!
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
