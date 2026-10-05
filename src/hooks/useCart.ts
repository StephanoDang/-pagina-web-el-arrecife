import { useContext } from 'react'
import { CartContext } from '../context/CartContext'

export function useCart() {
  const cart = useContext(CartContext)

  if (cart === undefined) {
    throw new Error('useCart debe utilizarse dentro de CartProvider.')
  }

  return cart
}
