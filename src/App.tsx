import { Route, Routes } from 'react-router'
import './App.css'

function PlaceholderPage({ title }: { title: string }) {
  return (
    <main className="placeholder">
      <h1>{title}</h1>
      <p>Sitio web en construcción.</p>
    </main>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<PlaceholderPage title="El Arrecife" />} />
      <Route path="/carta" element={<PlaceholderPage title="Carta" />} />
      <Route path="/pedidos" element={<PlaceholderPage title="Pedidos" />} />
      <Route path="/reservas" element={<PlaceholderPage title="Reservas" />} />
      <Route path="*" element={<PlaceholderPage title="Página no encontrada" />} />
    </Routes>
  )
}

export default App
