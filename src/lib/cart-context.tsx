'use client'

import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import type { Product, Additional } from '@/types/database'

export interface CartItem {
  product: Product
  quantity: number
  selectedAdditionals: Additional[]
  notes?: string
}

interface CartContextType {
  items: CartItem[]
  businessId: string | null
  addItem: (item: CartItem, businessId: string) => void
  updateQuantity: (productId: string, additionalsKey: string, quantity: number) => void
  removeItem: (productId: string, additionalsKey: string) => void
  clearCart: () => void
  getSubtotal: () => number
  getTotalItems: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

function getAdditionalsKey(additionals: Additional[]): string {
  return additionals.map(a => a.id).sort().join('-') || 'none'
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [businessId, setBusinessId] = useState<string | null>(null)

  // Load cart from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('delivio_cart')
    if (saved) {
      try {
        const { items: savedItems, businessId: savedBusinessId } = JSON.parse(saved)
        setItems(savedItems || [])
        setBusinessId(savedBusinessId || null)
      } catch (e) {
        console.error('Error loading cart:', e)
      }
    }
  }, [])

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('delivio_cart', JSON.stringify({ items, businessId }))
  }, [items, businessId])

  const addItem = (item: CartItem, newBusinessId: string) => {
    // If adding from different business, clear cart first
    if (businessId && businessId !== newBusinessId) {
      setItems([item])
      setBusinessId(newBusinessId)
      return
    }

    setBusinessId(newBusinessId)
    
    const additionalsKey = getAdditionalsKey(item.selectedAdditionals)
    const existingIndex = items.findIndex(
      i => i.product.id === item.product.id && 
           getAdditionalsKey(i.selectedAdditionals) === additionalsKey
    )

    if (existingIndex >= 0) {
      const newItems = [...items]
      newItems[existingIndex].quantity += item.quantity
      setItems(newItems)
    } else {
      setItems([...items, item])
    }
  }

  const updateQuantity = (productId: string, additionalsKey: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId, additionalsKey)
      return
    }

    setItems(items.map(item => {
      if (item.product.id === productId && 
          getAdditionalsKey(item.selectedAdditionals) === additionalsKey) {
        return { ...item, quantity }
      }
      return item
    }))
  }

  const removeItem = (productId: string, additionalsKey: string) => {
    const newItems = items.filter(item => 
      !(item.product.id === productId && 
        getAdditionalsKey(item.selectedAdditionals) === additionalsKey)
    )
    setItems(newItems)
    if (newItems.length === 0) {
      setBusinessId(null)
    }
  }

  const clearCart = () => {
    setItems([])
    setBusinessId(null)
  }

  const getSubtotal = () => {
    return items.reduce((total, item) => {
      const additionalsTotal = item.selectedAdditionals.reduce((sum, a) => sum + a.price, 0)
      return total + (item.product.price + additionalsTotal) * item.quantity
    }, 0)
  }

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0)
  }

  return (
    <CartContext.Provider value={{
      items,
      businessId,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      getSubtotal,
      getTotalItems
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

export { getAdditionalsKey }
