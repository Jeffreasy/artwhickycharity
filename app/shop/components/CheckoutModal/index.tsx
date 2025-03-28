'use client'

import React, { useState, FormEvent } from 'react'
import { Modal } from '@/globalComponents/ui/Modal'
import { useCart } from '@/contexts/CartContext'
import { CldImage } from 'next-cloudinary'
import { format } from 'date-fns'
import { createOrder } from '../../lib/orders'

interface CheckoutFormData {
  firstName: string
  lastName: string
  email: string
  address: string
  city: string
  postalCode: string
  country: string
}

export function CheckoutModal({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean
  onClose: () => void 
}) {
  const { items, totalPrice, clearCart } = useCart()
  const [formData, setFormData] = useState<CheckoutFormData>({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    country: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)
  const [orderNumber, setOrderNumber] = useState<string>('')
  const [isDownloading, setIsDownloading] = useState(false)
  const [isSendingEmails, setIsSendingEmails] = useState(false)
  const [emailStatus, setEmailStatus] = useState<{
    sent: boolean,
    customerEmailSent?: boolean,
    adminEmailSent?: boolean
  } | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Create order in Supabase
      const order = await createOrder(
        {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country
        },
        items,
        totalPrice
      )
      
      // Set the order number from Supabase
      setOrderNumber(order.order_number)
      
      // Send confirmation emails
      await sendOrderEmails(order.id)
      
      // Show success message
      setSuccess(true)

    } catch (err) {
      console.error('Checkout error:', err)
      setError('Something went wrong processing your order. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const sendOrderEmails = async (orderId: string) => {
    try {
      setIsSendingEmails(true)
      
      const response = await fetch('/api/orders/send-emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId }),
      })
      
      if (!response.ok) {
        const error = await response.json()
        console.error('Email sending error:', error)
        setEmailStatus({ sent: false })
        return
      }
      
      const result = await response.json()
      setEmailStatus({
        sent: true,
        customerEmailSent: result.customerEmailSent,
        adminEmailSent: result.adminEmailSent
      })
      
      console.log('Emails sent:', result)
      
    } catch (error) {
      console.error('Failed to send confirmation emails:', error)
      setEmailStatus({ sent: false })
    } finally {
      setIsSendingEmails(false)
    }
  }

  const handleDownloadPDF = async () => {
    try {
      setIsDownloading(true)
      setError(null)
      
      // Get the invoice HTML content
      const invoiceElement = document.querySelector('.invoice-content')
      if (!invoiceElement) {
        throw new Error('Invoice content not found')
      }

      console.log('Sending request to generate PDF...')
      
      // Send to our API and get PDF blob
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          html: invoiceElement.outerHTML,
          orderNumber: orderNumber,
        }),
      })

      console.log('Response status:', response.status)
      
      if (!response.ok) {
        let errorText = 'Failed to generate PDF'
        try {
          const errorData = await response.json()
          errorText = errorData.error || errorText
          console.error('Error details:', errorData)
        } catch (e) {
          console.error('Could not parse error response')
        }
        throw new Error(errorText)
      }

      // Get the PDF blob
      const blob = await response.blob()
      
      if (!blob || blob.size === 0) {
        throw new Error('Received empty PDF')
      }
      
      console.log('PDF received, size:', blob.size)
      
      // Create object URL
      const url = window.URL.createObjectURL(blob)
      
      // Create temporary link and trigger download
      const link = document.createElement('a')
      link.href = url
      link.download = `invoice-${orderNumber}.pdf`
      link.style.display = 'none'
      document.body.appendChild(link)
      
      // Trigger download
      link.click()
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        console.log('PDF download triggered')
      }, 100)

    } catch (error: any) {
      console.error('Download error:', error)
      setError(`Failed to generate invoice PDF: ${error.message || 'Please try again.'}`)
      alert('Failed to generate invoice PDF. Please try again.')
    } finally {
      setIsDownloading(false)
    }
  }

  // Render de betalingsbevestiging en factuurinformatie
  if (success) {
    const currentDate = format(new Date(), 'dd/MM/yyyy')
    
    return (
      <Modal isOpen={isOpen} onClose={() => {
        clearCart()
        onClose()
      }}>
        <div className="invoice-content text-white max-h-[90vh] overflow-y-auto p-6 max-w-3xl mx-auto">
          <div className="mb-8 text-center">
            <div className="w-20 h-20 mx-auto mb-4">
              <CldImage
                src="66fbc7d32c54ed89b3c8945b_test_pgrla9"
                alt="Whisky4Charity Logo"
                width={80}
                height={80}
                className="object-contain rounded-full"
              />
            </div>
            <h2 className="text-2xl font-bold uppercase">Whisky For Charity</h2>
            <h3 className="text-xl mt-2">INVOICE</h3>
          </div>
          
          {emailStatus && (
            <div className={`mb-4 p-3 rounded ${emailStatus.sent ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-400'}`}>
              {emailStatus.sent 
                ? `A confirmation email has been sent to ${formData.email}.` 
                : 'We were unable to send a confirmation email. Please save this invoice for your records.'}
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p>Lauri Albers</p>
              <p>van Kinsbergenstraat 3</p>
              <p>8081CL Elburg</p>
              <p>Info@whiskyforcharity.com</p>
            </div>
            <div className="text-right">
              <p>Invoice</p>
              <p>Invoicenumber: {orderNumber}</p>
              <p>Date: {currentDate}</p>
            </div>
          </div>
          
          <div className="mb-6">
            <h4 className="font-medium mb-2">Buyer:</h4>
            <p>Name: {formData.firstName} {formData.lastName}</p>
            <p>Address: {formData.address}</p>
            <p>Zip code, City: {formData.postalCode}, {formData.city}</p>
            <p>Country: {formData.country}</p>
            <p>Email: {formData.email}</p>
          </div>
          
          <div className="mb-6">
            <h4 className="font-medium mb-2">Product Description:</h4>
            <ul className="list-disc list-inside mb-4">
              {items.map(item => (
                <li key={item.id}>
                  {item.name} - Quantity: {item.quantity}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="mb-6">
            <h4 className="font-medium mb-2">Price:</h4>
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left py-2">Description</th>
                  <th className="text-center py-2">Quantity</th>
                  <th className="text-center py-2">Price per piece</th>
                  <th className="text-right py-2">Total price</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id} className="border-b border-white/10">
                    <td className="py-2">{item.name}</td>
                    <td className="text-center py-2">{item.quantity}</td>
                    <td className="text-center py-2">€ {item.price.toFixed(2)}</td>
                    <td className="text-right py-2">€ {(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} className="text-right pt-4 font-bold">Total amount:</td>
                  <td className="text-right pt-4 font-bold">€ {totalPrice.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colSpan={4} className="text-sm pt-1">(No VAT applicable inclusive shipping)</td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
            <h4 className="font-medium mb-2">Payment Information:</h4>
            <p>Please transfer the amount to account number <span className="font-bold">NL10RABO0131123505</span> in the name of L. Albers.</p>
            <p>Mentioning: HOPE edition.</p>
          </div>
          
          <div className="mb-8">
            <h4 className="font-medium mb-2">Remark:</h4>
            <p>The entire proceeds from the sale of the 'HOPE' edition will be donated to the Refugee Foundation (www.vluchteling.nl).</p>
          </div>
          
          <div className="flex justify-between gap-4">
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="flex-1 bg-white/10 text-white py-3 rounded font-medium 
                      hover:bg-white/20 transition-colors disabled:opacity-50 
                      disabled:cursor-not-allowed"
            >
              {isDownloading ? 'Generating PDF...' : 'Download Invoice'}
            </button>
            <button
              onClick={() => {
                clearCart()
                onClose()
              }}
              className="flex-1 bg-white text-black py-3 rounded font-medium 
                      hover:bg-white/90 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="text-white max-h-[90vh] overflow-y-auto p-6">
        {/* Header met logo */}
        <div className="mb-8 text-center">
          <div className="w-32 h-32 mx-auto mb-4">
            <CldImage
              src="66fbc7d32c54ed89b3c8945b_test_pgrla9"
              alt="Whisky4Charity Logo"
              width={128}
              height={128}
              className="object-contain rounded-full"
            />
          </div>
          <h2 className="text-2xl font-bold">Complete Your Order</h2>
        </div>

        {/* Order Summary */}
        <div className="mb-8 p-4 bg-white/5 rounded-lg border border-white/10">
          <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between items-center py-2 border-b border-white/10 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 flex-shrink-0">
                    <CldImage
                      src={item.image}
                      alt={item.name}
                      width={48}
                      height={48}
                      className="object-contain rounded"
                    />
                  </div>
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-white/70">Quantity: {item.quantity}</p>
                  </div>
                </div>
                <p className="font-medium">€{(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
            <div className="pt-3 flex justify-between items-center font-bold">
              <span>Total</span>
              <span>€{totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400">
            {error}
          </div>
        )}

        {/* Checkout Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">First Name</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded focus:outline-none focus:border-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Last Name</label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded focus:outline-none focus:border-white transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded focus:outline-none focus:border-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded focus:outline-none focus:border-white transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">City</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded focus:outline-none focus:border-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Postal Code</label>
              <input
                type="text"
                required
                value={formData.postalCode}
                onChange={(e) => setFormData(prev => ({ ...prev, postalCode: e.target.value }))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded focus:outline-none focus:border-white transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Country</label>
            <input
              type="text"
              required
              value={formData.country}
              onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded focus:outline-none focus:border-white transition-colors"
            />
          </div>

          <p className="text-sm text-white/60 mt-4 mb-2">
            By completing your order, you'll receive an invoice with payment instructions via bank transfer.
          </p>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-6 bg-white text-black py-3 rounded font-medium 
                     hover:bg-white/90 transition-colors disabled:opacity-50 
                     disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Processing...' : `Complete Order (€${totalPrice.toFixed(2)})`}
          </button>
        </form>
      </div>
    </Modal>
  )
}