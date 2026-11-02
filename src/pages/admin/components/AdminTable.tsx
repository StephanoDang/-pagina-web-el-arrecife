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
}

export default function AdminTable<Row>({ caption, columns, rows, getRowKey }: AdminTableProps<Row>) {
  return (
    <div className="admin-table-scroll">
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
          {rows.map((row) => (
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
