import { createContext } from 'react'
import type { CartState } from '../types/cart'

export const CartContext = createContext<CartState | undefined>(undefined)
