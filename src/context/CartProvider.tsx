import { useState } from 'react'
import type { ReactNode } from 'react'
import type { CartState } from '../types/cart'
import { CartContext } from './CartContext'

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart] = useState<CartState>(() => ({ items: [] }))

  return <CartContext.Provider value={cart}>{children}</CartContext.Provider>
}
