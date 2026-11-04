type ModalDialog = Pick<HTMLDialogElement, 'open' | 'showModal' | 'close'>

export function syncAdminModal(dialog: ModalDialog, shouldOpen: boolean) {
  if (shouldOpen && !dialog.open) dialog.showModal()
  if (!shouldOpen && dialog.open) dialog.close()
}

export function requestAdminModalClose(event: Pick<Event, 'preventDefault'>, onClose: () => void) {
  event.preventDefault()
  onClose()
}
