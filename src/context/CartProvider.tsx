import { useCallback, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { CartContextValue, CartState } from '../types/cart'
import { addCartItem } from '../data/addCartItem'
import { CartContext } from './CartContext'

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartState>(() => ({ items: [] }))

  const addItem = useCallback<CartContextValue['addItem']>((dishId, presentationId) => {
    setCart((previous) => {
      const items = addCartItem(previous.items, dishId, presentationId)
      return items === previous.items ? previous : { items }
    })
  }, [])

  const value = useMemo<CartContextValue>(() => ({ ...cart, addItem }), [cart, addItem])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
