import { useSyncExternalStore } from 'react'
import { menuCategories, menuDishes } from './menu.ts'
import { validateMenu } from './validateMenu.ts'
import type { Dish } from '../types/menu.ts'

export const MENU_STORAGE_KEY = 'el-arrecife.menu.v1'
const listeners = new Set<() => void>()
let snapshot = loadMenu()

function loadMenu(): Dish[] {
  if (typeof window === 'undefined') return menuDishes
  try {
    const stored = window.localStorage.getItem(MENU_STORAGE_KEY)
    if (!stored) return menuDishes
    const parsed: unknown = JSON.parse(stored)
    if (!Array.isArray(parsed)) return menuDishes
    validateMenu(menuCategories, parsed as Dish[])
    return parsed as Dish[]
  } catch {
    return menuDishes
  }
}

function notify() {
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  if (typeof window !== 'undefined') window.addEventListener('storage', handleStorage)
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0 && typeof window !== 'undefined') window.removeEventListener('storage', handleStorage)
  }
}

function handleStorage(event: StorageEvent) {
  if (event.key !== MENU_STORAGE_KEY && event.key !== null) return
  snapshot = loadMenu()
  notify()
}

export function getMenuSnapshot(): Dish[] {
  return snapshot
}

export function setMenuDishes(update: Dish[] | ((current: Dish[]) => Dish[])) {
  const next = typeof update === 'function' ? update(snapshot) : update
  validateMenu(menuCategories, next)
  snapshot = next
  try {
    if (typeof window !== 'undefined') window.localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(next))
  } catch {
    // Keep the current session usable when browser storage is unavailable.
  }
  notify()
}

export function useMenuDishes(): Dish[] {
  return useSyncExternalStore(subscribe, getMenuSnapshot, () => menuDishes)
}
