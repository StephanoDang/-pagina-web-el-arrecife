import { Link } from 'react-router'

const sectionContent = {
  inicio: {
    eyebrow: 'PANEL DE CONTROL',
    title: 'Todo el restaurante, desde un solo lugar.',
    description: 'Aquí podrás revisar la actividad y acceder rápidamente a los pedidos, las reservas y la carta.',
  },
  pedidos: {
    eyebrow: 'VENTAS',
    title: 'Pedidos',
    description: 'La gestión de pedidos se añadirá en los siguientes pasos del backoffice.',
  },
  reservas: {
    eyebrow: 'ATENCIÓN',
    title: 'Reservas',
    description: 'La gestión de reservas se añadirá en los siguientes pasos del backoffice.',
  },
  carta: {
    eyebrow: 'CONTENIDO',
    title: 'Carta',
    description: 'La administración de platos y categorías se añadirá en los siguientes pasos del backoffice.',
  },
  'no-encontrado': {
    eyebrow: 'PÁGINA NO ENCONTRADA',
    title: 'No encontramos esta sección.',
    description: 'Usa la navegación del panel para volver a una sección disponible.',
  },
}

type AdminSectionKey = keyof typeof sectionContent

export default function AdminSection({ section }: { section: AdminSectionKey }) {
  const content = sectionContent[section]

  return (
    <section className="admin-overview" aria-labelledby="admin-section-title">
      <p className="admin-eyebrow">{content.eyebrow}</p>
      <h2 id="admin-section-title">{content.title}</h2>
      <p className="admin-section-description">{content.description}</p>
      {section === 'inicio' && (
        <div className="admin-quick-links" aria-label="Accesos rápidos">
          <Link to="/admin/pedidos"><span aria-hidden="true">↗</span> Revisar pedidos</Link>
          <Link to="/admin/reservas"><span aria-hidden="true">↗</span> Revisar reservas</Link>
          <Link to="/admin/carta"><span aria-hidden="true">↗</span> Administrar carta</Link>
        </div>
      )}
    </section>
  )
}
