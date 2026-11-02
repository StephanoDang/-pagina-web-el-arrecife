import type { ButtonHTMLAttributes } from 'react'
import './AdminComponents.css'

type AdminButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger'
}

export default function AdminButton({
  children,
  className = '',
  type = 'button',
  variant = 'primary',
  ...props
}: AdminButtonProps) {
  const classes = ['admin-button', `admin-button--${variant}`, className].filter(Boolean).join(' ')

  return <button {...props} className={classes} type={type}>{children}</button>
}
