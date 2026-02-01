/**
 * Invoice PDF Document Factory
 * Wrapper to make it compatible with renderToBuffer
 */

import React from 'react'
import { InvoicePDF, type InvoiceData } from './InvoicePDF'

/**
 * Create invoice PDF document for rendering
 * This wrapper ensures type compatibility with @react-pdf/renderer
 */
export function createInvoicePDF(data: InvoiceData) {
    return React.createElement(InvoicePDF, { data })
}
