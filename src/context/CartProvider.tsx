import { useCallback, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { CartContextValue, CartState } from '../types/cart'
import { addCartItem } from '../data/addCartItem'
import { removeCartItem, updateCartItemQuantity } from '../data/cartItems'
import { CartContext } from './CartContext'

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartState>(() => ({ items: [] }))

  const addItem = useCallback<CartContextValue['addItem']>((dishId, presentationId) => {
    setCart((previous) => {
      const items = addCartItem(previous.items, dishId, presentationId)
      return items === previous.items ? previous : { items }
    })
  }, [])

  const setQuantity = useCallback<CartContextValue['setQuantity']>((dishId, presentationId, quantity) => {
    setCart((previous) => {
      const items = updateCartItemQuantity(previous.items, dishId, presentationId, quantity)
      return items === previous.items ? previous : { items }
    })
  }, [])

  const removeItem = useCallback<CartContextValue['removeItem']>((dishId, presentationId) => {
    setCart((previous) => {
      const items = removeCartItem(previous.items, dishId, presentationId)
      return items === previous.items ? previous : { items }
    })
  }, [])

  const value = useMemo<CartContextValue>(
    () => ({ ...cart, addItem, setQuantity, removeItem }),
    [cart, addItem, setQuantity, removeItem],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
