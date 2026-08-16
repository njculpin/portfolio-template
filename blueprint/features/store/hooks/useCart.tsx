import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'

export interface CartItem {
  slug: string
  title: string
  price: number
  quantity: number
  providerId: string
  variantName: string
  image: string
}

interface CartContextValue {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (slug: string, variantName?: string) => void
  updateQuantity: (slug: string, quantity: number, variantName?: string) => void
  clearCart: () => void
  itemCount: number
  subtotal: number
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
}

const STORAGE_KEY = 'portfolio-cart'

function loadCartFromStorage(): CartItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch {
    // ignore parse errors
  }
  return []
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => loadCartFromStorage())
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addItem = useCallback((item: Omit<CartItem, 'quantity'>) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.slug === item.slug && i.variantName === item.variantName)
      if (existing) {
        return prev.map((i) =>
          i.slug === item.slug && i.variantName === item.variantName
            ? { ...i, quantity: i.quantity + 1 }
            : i,
        )
      }
      return [...prev, { ...item, quantity: 1 }]
    })
    setIsOpen(true)
  }, [])

  const removeItem = useCallback((slug: string, variantName: string = '') => {
    setItems((prev) => prev.filter((i) => !(i.slug === slug && i.variantName === variantName)))
  }, [])

  const updateQuantity = useCallback(
    (slug: string, quantity: number, variantName: string = '') => {
      if (quantity <= 0) {
        removeItem(slug, variantName)
        return
      }
      setItems((prev) =>
        prev.map((i) =>
          i.slug === slug && i.variantName === variantName ? { ...i, quantity } : i,
        ),
      )
    },
    [removeItem],
  )

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
        isOpen,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}
