import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { Dialog } from './Dialog'
import { DropdownMenu, DropdownMenuItem } from './DropdownMenu'

function DialogFixture() {
  const [open, setOpen] = useState(false)
  return <><button onClick={() => setOpen(true)}>Excluir</button><Dialog open={open} onOpenChange={setOpen} title="Confirmar exclusao"><button>Cancelar</button><button>Confirmar</button></Dialog></>
}

function LockedDialogFixture() {
  const [open, setOpen] = useState(true)
  return <Dialog open={open} onOpenChange={setOpen} title="Operação pendente" closeDisabled><button>Voltar</button></Dialog>
}

describe('Dialog', () => {
  it('associates its optional description with the dialog', () => {
    render(<Dialog open onOpenChange={vi.fn()} title="Excluir item" description="Esta ação não pode ser desfeita"><button>Cancelar</button></Dialog>)
    expect(screen.getByRole('dialog', { name: 'Excluir item' })).toHaveAccessibleDescription('Esta ação não pode ser desfeita')
  })

  it('manages initial focus, traps Tab, closes with Escape and restores focus', () => {
    render(<DialogFixture />)
    const trigger = screen.getByRole('button', { name: 'Excluir' })
    trigger.focus()
    fireEvent.click(trigger)
    const close = screen.getByRole('button', { name: 'Fechar dialogo' })
    const confirm = screen.getByRole('button', { name: 'Confirmar' })
    expect(close).toHaveFocus()
    confirm.focus()
    fireEvent.keyDown(confirm, { key: 'Tab' })
    expect(close).toHaveFocus()
    fireEvent.keyDown(close, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it('semantically disables the close action when closing is locked', () => {
    render(<LockedDialogFixture />)
    const close = screen.getByRole('button', { name: 'Fechar dialogo' })
    expect(close).toBeDisabled()
    fireEvent.click(close)
    expect(screen.getByRole('dialog', { name: 'Operação pendente' })).toBeInTheDocument()
  })

  it('blocks Escape and backdrop closing internally when closing is locked', () => {
    const onOpenChange = vi.fn()
    render(<Dialog open onOpenChange={onOpenChange} title="Operação pendente" closeDisabled><button>Voltar</button></Dialog>)
    const dialog = screen.getByRole('dialog', { name: 'Operação pendente' })

    fireEvent.keyDown(dialog, { key: 'Escape' })
    fireEvent.mouseDown(dialog.parentElement!)

    expect(onOpenChange).not.toHaveBeenCalled()
  })
})

describe('DropdownMenu', () => {
  it('skips a disabled item during keyboard navigation and does not activate it', () => {
    const blocked = vi.fn()
    render(<DropdownMenu label="Conta" trigger="Minha conta"><DropdownMenuItem disabled onClick={blocked}>Bloqueado</DropdownMenuItem><DropdownMenuItem>Perfil</DropdownMenuItem></DropdownMenu>)
    fireEvent.keyDown(screen.getByRole('button', { name: 'Conta' }), { key: 'ArrowDown' })
    return new Promise<void>((resolve) => requestAnimationFrame(() => {
      const disabled = screen.getByRole('menuitem', { name: 'Bloqueado' })
      expect(disabled).toBeDisabled()
      expect(screen.getByRole('menuitem', { name: 'Perfil' })).toHaveFocus()
      fireEvent.click(disabled)
      expect(blocked).not.toHaveBeenCalled()
      resolve()
    }))
  })

  it('supports keyboard navigation, activation and Escape focus return', () => {
    const action = vi.fn()
    render(<DropdownMenu label="Conta" trigger="Minha conta"><DropdownMenuItem onClick={action}>Perfil</DropdownMenuItem><DropdownMenuItem>Sair</DropdownMenuItem></DropdownMenu>)
    const trigger = screen.getByRole('button', { name: 'Conta' })
    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    return new Promise<void>((resolve) => requestAnimationFrame(() => {
      const profile = screen.getByRole('menuitem', { name: 'Perfil' })
      expect(profile).toHaveFocus()
      fireEvent.keyDown(profile, { key: 'ArrowDown' })
      expect(screen.getByRole('menuitem', { name: 'Sair' })).toHaveFocus()
      fireEvent.keyDown(document.activeElement!, { key: 'Escape' })
      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
      expect(trigger).toHaveFocus()
      resolve()
    }))
  })
})
