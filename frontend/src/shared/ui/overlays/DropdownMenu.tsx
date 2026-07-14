import { type ButtonHTMLAttributes, type ReactNode, useEffect, useId, useRef, useState } from 'react'
import { getFocusableElements } from './focus'

export interface DropdownMenuProps {
  label: string
  trigger: ReactNode
  children: ReactNode
}

export function DropdownMenu({ label, trigger, children }: DropdownMenuProps) {
  const [open, setOpen] = useState(false)
  const menuId = useId()
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [open])

  function focusItem(position: 'first' | 'last' | 'next' | 'previous') {
    if (!containerRef.current) return
    const items = getFocusableElements(containerRef.current).filter((item) => item.getAttribute('role') === 'menuitem')
    const current = items.indexOf(document.activeElement as HTMLElement)
    const index = position === 'first' ? 0 : position === 'last' ? items.length - 1 : position === 'next' ? (current + 1) % items.length : (current - 1 + items.length) % items.length
    items[index]?.focus()
  }

  function closeAndRestoreFocus() {
    setOpen(false)
    triggerRef.current?.focus()
  }

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        className="flex min-h-10 items-center rounded-xl px-3 text-zinc-200 hover:bg-ink-750"
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault()
            setOpen(true)
            requestAnimationFrame(() => focusItem(event.key === 'ArrowDown' ? 'first' : 'last'))
          }
        }}
      >
        {trigger}
      </button>
      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label={label}
          className="surface-raised absolute right-0 z-40 mt-2 min-w-48 p-2"
          onKeyDown={(event) => {
            if (event.key === 'Escape' || event.key === 'Tab') closeAndRestoreFocus()
            else if (event.key === 'ArrowDown') { event.preventDefault(); focusItem('next') }
            else if (event.key === 'ArrowUp') { event.preventDefault(); focusItem('previous') }
            else if (event.key === 'Home') { event.preventDefault(); focusItem('first') }
            else if (event.key === 'End') { event.preventDefault(); focusItem('last') }
          }}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      ) : null}
    </div>
  )
}

export function DropdownMenuItem({ className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      role="menuitem"
      className={`flex min-h-10 w-full items-center rounded-xl px-3 text-left text-sm text-zinc-200 hover:bg-ink-700 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  )
}
