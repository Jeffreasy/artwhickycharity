/**
 * Invoice PDF Template
 * Uses @react-pdf/renderer for secure, serverless PDF generation
 */

import React from 'react'
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'

// Define types for invoice data
export interface InvoiceItem {
    id: string
    name: string
    quantity: number
    price: number
    total: number
}

export interface InvoiceData {
    orderNumber: string
    orderDate: string
    customerName: string
    customerEmail: string
    customerAddress?: string
    items: InvoiceItem[]
    subtotal: number
    tax?: number
    total: number
    paymentMethod?: string
    notes?: string
}

// Styles for PDF document
const styles = StyleSheet.create({
    page: {
        padding: 40,
        backgroundColor: '#FFFFFF',
        fontFamily: 'Helvetica',
    },
    header: {
        marginBottom: 30,
        borderBottom: '2px solid #000000',
        paddingBottom: 10,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 12,
        color: '#666666',
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#000000',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    label: {
        fontSize: 10,
        color: '#666666',
    },
    value: {
        fontSize: 10,
        color: '#000000',
    },
    table: {
        marginTop: 10,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#F5F5F5',
        padding: 8,
        borderBottom: '1px solid #DDDDDD',
    },
    tableRow: {
        flexDirection: 'row',
        padding: 8,
        borderBottom: '1px solid #EEEEEE',
    },
    tableCol: {
        fontSize: 10,
    },
    tableColHeader: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    col1: { width: '40%' },
    col2: { width: '20%', textAlign: 'center' },
    col3: { width: '20%', textAlign: 'right' },
    col4: { width: '20%', textAlign: 'right' },
    totalsSection: {
        marginTop: 20,
        alignItems: 'flex-end',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: 200,
        marginBottom: 5,
    },
    totalLabel: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    totalValue: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    grandTotal: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 10,
        paddingTop: 10,
        borderTop: '2px solid #000000',
    },
    footer: {
        position: 'absolute',
        bottom: 40,
        left: 40,
        right: 40,
        textAlign: 'center',
        fontSize: 9,
        color: '#999999',
    },
})

/**
 * Invoice PDF Document Component
 */
export const InvoicePDF: React.FC<{ data: InvoiceData }> = ({ data }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>FACTUUR</Text>
                <Text style={styles.subtitle}>Whisky4Charity</Text>
            </View>

            {/* Invoice Info */}
            <View style={styles.section}>
                <View style={styles.row}>
                    <View>
                        <Text style={styles.label}>Factuurnummer</Text>
                        <Text style={styles.value}>{data.orderNumber}</Text>
                    </View>
                    <View>
                        <Text style={styles.label}>Datum</Text>
                        <Text style={styles.value}>{data.orderDate}</Text>
                    </View>
                </View>
            </View>

            {/* Customer Info */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Klantgegevens</Text>
                <Text style={styles.value}>{data.customerName}</Text>
                <Text style={styles.value}>{data.customerEmail}</Text>
                {data.customerAddress && (
                    <Text style={styles.value}>{data.customerAddress}</Text>
                )}
            </View>

            {/* Items Table */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Bestellingsoverzicht</Text>

                {/* Table Header */}
                <View style={styles.tableHeader}>
                    <Text style={[styles.tableColHeader, styles.col1]}>Product</Text>
                    <Text style={[styles.tableColHeader, styles.col2]}>Aantal</Text>
                    <Text style={[styles.tableColHeader, styles.col3]}>Prijs</Text>
                    <Text style={[styles.tableColHeader, styles.col4]}>Totaal</Text>
                </View>

                {/* Table Rows */}
                {data.items.map((item) => (
                    <View key={item.id} style={styles.tableRow}>
                        <Text style={[styles.tableCol, styles.col1]}>{item.name}</Text>
                        <Text style={[styles.tableCol, styles.col2]}>{item.quantity}</Text>
                        <Text style={[styles.tableCol, styles.col3]}>
                            €{item.price.toFixed(2)}
                        </Text>
                        <Text style={[styles.tableCol, styles.col4]}>
                            €{item.total.toFixed(2)}
                        </Text>
                    </View>
                ))}
            </View>

            {/* Totals */}
            <View style={styles.totalsSection}>
                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Subtotaal:</Text>
                    <Text style={styles.totalValue}>€{data.subtotal.toFixed(2)}</Text>
                </View>

                {data.tax && data.tax > 0 && (
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>BTW (21%):</Text>
                        <Text style={styles.totalValue}>€{data.tax.toFixed(2)}</Text>
                    </View>
                )}

                <View style={styles.totalRow}>
                    <Text style={styles.grandTotal}>Totaal:</Text>
                    <Text style={styles.grandTotal}>€{data.total.toFixed(2)}</Text>
                </View>
            </View>

            {/* Payment Method */}
            {data.paymentMethod && (
                <View style={styles.section}>
                    <Text style={styles.label}>Betaalmethode</Text>
                    <Text style={styles.value}>{data.paymentMethod}</Text>
                </View>
            )}

            {/* Notes */}
            {data.notes && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Opmerkingen</Text>
                    <Text style={styles.value}>{data.notes}</Text>
                </View>
            )}

            {/* Footer */}
            <View style={styles.footer}>
                <Text>Whisky4Charity | info@whiskyforcharity.com</Text>
                <Text>Bedankt voor uw bestelling en steun aan het goede doel!</Text>
            </View>
        </Page>
    </Document>
)
