import { useEffect, useId, useRef, type ReactNode } from 'react'
import AdminButton from './AdminButton'
import './AdminComponents.css'

type AdminModalProps = {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}

export default function AdminModal({ open, title, onClose, children, footer }: AdminModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      aria-labelledby={titleId}
      className="admin-modal"
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      ref={dialogRef}
    >
      <section className="admin-modal-panel">
        <header className="admin-modal-header">
          <h2 id={titleId}>{title}</h2>
          <AdminButton aria-label="Cerrar ventana" onClick={onClose} variant="secondary">×</AdminButton>
        </header>
        <div className="admin-modal-content">{children}</div>
        {footer && <footer className="admin-modal-footer">{footer}</footer>}
      </section>
    </dialog>
  )
}
