'use client'

import React, { useState, FormEvent } from 'react'
import { Modal } from '@/globalComponents/ui/Modal'
import { useCart } from '@/contexts/CartContext'
import { CldImage } from 'next-cloudinary'
import { supabase } from '@/lib/supabase'

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
  const [success, setSuccess] = useState<{ message: string; orderNumber: string } | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formData,
          items,
          totalPrice
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process order')
      }

      // Toon succes bericht
      setSuccess({
        message: data.message,
        orderNumber: data.orderNumber
      })
      
      // Clear cart
      clearCart()
      
      // Sluit modal na 3 seconden
      setTimeout(() => {
        onClose()
      }, 3000)

    } catch (err) {
      console.error('Checkout error:', err)
      setError('Something went wrong processing your order. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="text-white max-h-[90vh] overflow-y-auto">
        {/* Header met logo */}
        <div className="mb-8 text-center">
          <div className="w-32 h-32 mx-auto mb-4">
            <CldImage
              src="66fbc7d32c54ed89b3c8945b_test_pgrla9"
              alt="Whisky4Charity Logo"
              width={128}
              height={128}
              className="object-cover rounded-full"
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
                      className="object-cover rounded"
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

        {success && (
          <div className="mb-4 p-4 bg-green-500/10 border border-green-500/20 rounded">
            <h3 className="text-green-400 font-bold text-lg mb-2">Order Successful!</h3>
            <p className="text-green-300">Thank you for your order.</p>
            <p className="text-green-300">Order Number: #{success.orderNumber}</p>
            <p className="text-sm mt-2 text-green-400/80">
              You will receive a confirmation email shortly.
            </p>
          </div>
        )}

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

          <button
            type="submit"
            disabled={isSubmitting || success !== null}
            className="w-full mt-6 bg-white text-black py-3 rounded font-medium 
                     hover:bg-white/90 transition-colors disabled:opacity-50 
                     disabled:cursor-not-allowed"
          >
            {isSubmitting 
              ? 'Processing...' 
              : success 
                ? 'Order Complete!' 
                : `Complete Order (€${totalPrice.toFixed(2)})`}
          </button>
        </form>
      </div>
    </Modal>
  )
}