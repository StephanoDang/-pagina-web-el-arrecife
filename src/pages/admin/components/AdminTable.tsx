import type { ReactNode } from 'react'
import './AdminComponents.css'

export type AdminTableColumn<Row> = {
  key: string
  header: ReactNode
  render: (row: Row) => ReactNode
  className?: string
}

type AdminTableProps<Row> = {
  caption: string
  columns: AdminTableColumn<Row>[]
  rows: Row[]
  getRowKey: (row: Row) => string | number
  emptyMessage?: string
}

export default function AdminTable<Row>({
  caption,
  columns,
  rows,
  getRowKey,
  emptyMessage = 'No hay registros para mostrar.',
}: AdminTableProps<Row>) {
  return (
    <div
      aria-label={`${caption}. Usa las teclas de flecha para desplazarte por la tabla.`}
      className="admin-table-scroll"
      role="region"
      tabIndex={0}
    >
      <table className="admin-table">
        <caption>{caption}</caption>
        <thead>
          <tr>
            {columns.map((column) => (
              <th className={column.className} key={column.key} scope="col">{column.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td className="admin-table-empty" colSpan={Math.max(columns.length, 1)} role="status">
                {emptyMessage}
              </td>
            </tr>
          ) : rows.map((row) => (
              <tr key={getRowKey(row)}>
                {columns.map((column) => (
                  <td className={column.className} key={column.key}>{column.render(row)}</td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
}
