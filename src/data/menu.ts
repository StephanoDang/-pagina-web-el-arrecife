import type { Dish, MenuCategory } from '../types/menu'

// Selección inicial de la carta confirmada; importes en céntimos de sol.
export const menuCategories: MenuCategory[] = [
  { id: 'cebiches', name: 'Cebiches' },
  { id: 'causas', name: 'Causas' },
  { id: 'cecina', name: 'Cecina' },
  { id: 'norte', name: 'Cocina del Norte' },
  { id: 'criolla', name: 'Cocina Criolla' },
]

export const menuDishes: Dish[] = [
  {
    id: 'carretillero', categoryId: 'cebiches', name: 'El Carretillero',
    description: 'Cebiche de pota o pescado, acompañado de chicharrón de pota.',
    available: true,
    presentations: [
      { id: 'pota', name: 'De pota', priceInCents: 2250 },
      { id: 'pescado', name: 'De pescado', priceInCents: 2750 },
    ],
  },
  {
    id: 'cebiche-arrecife', categoryId: 'cebiches', name: 'Cebiche Arrecife',
    description: 'Pescado, pulpo, calamar, langostinos, concha de abanico y una concha negra.',
    available: true,
    presentations: [{ id: 'unica', name: 'Única', priceInCents: 3900 }],
  },
  {
    id: 'causa-arrecife', categoryId: 'causas', name: 'Causa Arrecife',
    description: 'Causa rellena de palta y langostinos.', available: true,
    presentations: [{ id: 'unica', name: 'Única', priceInCents: 2150 }],
  },
  {
    id: 'causa-novia', categoryId: 'causas', name: 'Mi Causa la Novia',
    description: 'Causa de palta y langostinos, con opción de agregar cebiche Velo de Novia.',
    available: true,
    presentations: [
      { id: 'sin-cebiche', name: 'Sin cebiche', priceInCents: 3300 },
      { id: 'con-cebiche', name: 'Con cebiche Velo de Novia', priceInCents: 4000 },
    ],
  },
  {
    id: 'chaufa-cecina', categoryId: 'cecina', name: 'Chaufa de Cecina',
    description: 'Chaufa ahumado con patacones y opción de leche de tigre.', available: true,
    presentations: [
      { id: 'sin-leche', name: 'Sin leche de tigre', priceInCents: 3000 },
      { id: 'con-leche', name: 'Con leche de tigre', priceInCents: 3600 },
    ],
  },
  {
    id: 'arroz-pato', categoryId: 'norte', name: 'Arroz con Pato',
    description: 'Al estilo norteño, con cerveza negra, chicha de jora y zapallito loche.',
    available: true,
    presentations: [
      { id: 'solo', name: 'Solo', priceInCents: 3800 },
      { id: 'huancaina', name: 'Con papa a la huancaína', priceInCents: 4500 },
      { id: 'huancaina-leche', name: 'Con papa a la huancaína y leche de tigre', priceInCents: 5000 },
    ],
  },
  {
    id: 'panceta-chaufa', categoryId: 'criolla', name: 'Panceta al Cilindro con Chaufa',
    description: 'Panceta al cilindro de 300 g con chaufa y opción de leche de tigre.',
    available: true,
    presentations: [
      { id: 'sin-leche', name: 'Sin leche de tigre', priceInCents: 3250 },
      { id: 'con-leche', name: 'Con leche de tigre', priceInCents: 3850 },
    ],
  },
]
