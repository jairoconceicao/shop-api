import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import {
  createMemoryRouter,
  Link,
  Outlet,
  RouterProvider,
  useNavigate,
} from 'react-router-dom'

import { Dialog } from '../../shared/ui/overlays/Dialog'
import { RouteFocusBoundary } from './RouteFocusBoundary'

function Shell() {
  return (
    <RouteFocusBoundary>
      <main><Outlet /></main>
    </RouteFocusBoundary>
  )
}

function Page({ title, lazy = false }: { title: string; lazy?: boolean }) {
  const [ready, setReady] = useState(false)
  return (
    <>
      {!lazy || ready ? <h1>{title}</h1> : <div role="status">Carregando</div>}
      {lazy ? <button onClick={() => setReady(true)}>Resolver</button> : null}
      <Link to={title === 'Entrar' ? '/cadastro' : '/entrar'}>Próxima</Link>
    </>
  )
}

function NavigationControls() {
  const navigate = useNavigate()
  return (
    <>
      <button onClick={() => navigate('/cadastro')}>Push</button>
      <button onClick={() => navigate('/cadastro', { replace: true })}>Replace</button>
      <button onClick={() => navigate('?page=2')}>Search</button>
      <button onClick={() => navigate('#endereco')}>Hash</button>
      <button onClick={() => navigate(-1)}>Back</button>
      <button onClick={() => navigate(1)}>Forward</button>
    </>
  )
}

function renderRouter(initialEntries = ['/entrar']) {
  const router = createMemoryRouter([
    {
      element: <Shell />,
      children: [
        { path: '/entrar', element: <><Page title="Entrar" /><NavigationControls /></> },
        { path: '/cadastro', element: <Page title="Cadastro" /> },
        { path: '/lazy', element: <Page title="Lazy" lazy /> },
      ],
    },
  ], { initialEntries })
  render(<RouterProvider router={router} />)
  return router
}

describe('RouteFocusBoundary', () => {
  it('não move o foco no carregamento inicial', () => {
    const outside = document.createElement('button')
    document.body.append(outside)
    outside.focus()
    renderRouter()
    expect(document.activeElement).toBe(outside)
    outside.remove()
  })

  it.each(['Push', 'Replace'])('focaliza uma vez o heading em navegação %s', async (action) => {
    const user = userEvent.setup()
    renderRouter()
    await user.click(screen.getByRole('button', { name: action }))
    expect(screen.getByRole('heading', { name: 'Cadastro' })).toHaveFocus()
  })

  it('aguarda estruturalmente o heading de uma rota lazy', async () => {
    const router = renderRouter()
    await act(() => router.navigate('/lazy'))
    expect(screen.getByRole('status')).not.toHaveFocus()
    await userEvent.setup().click(screen.getByRole('button', { name: 'Resolver' }))
    expect(screen.getByRole('heading', { name: 'Lazy' })).toHaveFocus()
  })

  it('preserva foco em mudanças de search e hash', async () => {
    const user = userEvent.setup()
    renderRouter()
    const search = screen.getByRole('button', { name: 'Search' })
    search.focus()
    await user.keyboard('{Enter}')
    expect(search).toHaveFocus()
    await user.click(screen.getByRole('button', { name: 'Hash' }))
    expect(screen.getByRole('button', { name: 'Hash' })).toHaveFocus()
  })

  it('focaliza headings ao voltar e avançar no histórico', async () => {
    const router = renderRouter()
    await act(() => router.navigate('/cadastro'))
    expect(screen.getByRole('heading', { name: 'Cadastro' })).toHaveFocus()
    await act(() => router.navigate(-1))
    expect(screen.getByRole('heading', { name: 'Entrar' })).toHaveFocus()
    await act(() => router.navigate(1))
    expect(screen.getByRole('heading', { name: 'Cadastro' })).toHaveFocus()
  })

  it('cancela observação antiga e não interfere na restauração de dialog', async () => {
    const user = userEvent.setup()
    const router = renderRouter()
    await act(() => router.navigate('/lazy'))
    await act(() => router.navigate('/cadastro'))
    expect(screen.getByRole('heading', { name: 'Cadastro' })).toHaveFocus()

    function DialogProbe() {
      const [open, setOpen] = useState(false)
      return (
        <>
          <button onClick={() => setOpen(true)}>Abrir dialog</button>
          <Dialog open={open} title="Confirmação" onOpenChange={setOpen}>
            <button onClick={() => setOpen(false)}>Cancelar</button>
          </Dialog>
        </>
      )
    }
    render(<DialogProbe />)
    const trigger = screen.getByRole('button', { name: 'Abrir dialog' })
    await user.click(trigger)
    await user.keyboard('{Escape}')
    expect(trigger).toHaveFocus()
  })
})
