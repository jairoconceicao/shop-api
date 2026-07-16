import type { KeyboardEvent } from 'react'

export interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  ariaLabel?: string
}

const pageButtonClasses =
  'inline-flex size-10 shrink-0 items-center justify-center rounded-xl text-sm font-semibold transition-colors duration-200'

export function Pagination({
  page,
  totalPages,
  onPageChange,
  ariaLabel = 'Paginação',
}: PaginationProps) {
  const lastPage = Math.max(1, Math.floor(totalPages))
  const currentPage = clamp(Math.floor(page), 1, lastPage)
  const items = getPaginationItems(currentPage, lastPage)

  const changePage = (nextPage: number) => {
    const normalizedPage = clamp(nextPage, 1, lastPage)

    if (normalizedPage !== currentPage) {
      onPageChange(normalizedPage)
    }
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const destinations: Partial<Record<string, number>> = {
      ArrowLeft: currentPage - 1,
      ArrowRight: currentPage + 1,
      End: lastPage,
      Home: 1,
    }
    const destination = destinations[event.key]

    if (destination === undefined) {
      return
    }

    event.preventDefault()
    changePage(destination)
  }

  return (
    <nav aria-label={ariaLabel} onKeyDown={handleKeyDown}>
      <ul
        data-responsive-overflow="pagination"
        className="flex max-w-full items-center justify-center gap-1 overflow-x-auto py-1"
      >
        <li>
          <button
            type="button"
            aria-label="Página anterior"
            disabled={currentPage === 1}
            onClick={() => changePage(currentPage - 1)}
            className={`${pageButtonClasses} text-zinc-300 hover:bg-ink-800 hover:text-zinc-50 disabled:pointer-events-none disabled:opacity-40`}
          >
            <span aria-hidden="true">‹</span>
          </button>
        </li>

        {items.map((item, index) =>
          item === 'ellipsis' ? (
            <li key={`ellipsis-${index}`} aria-hidden="true" className="flex size-10 items-center justify-center text-zinc-500">
              …
            </li>
          ) : (
            <li key={item}>
              <button
                type="button"
                aria-label={`Página ${item}`}
                aria-current={item === currentPage ? 'page' : undefined}
                onClick={() => changePage(item)}
                className={`${pageButtonClasses} ${
                  item === currentPage
                    ? 'bg-brand-500 text-ink-950'
                    : 'text-zinc-300 hover:bg-ink-800 hover:text-zinc-50'
                }`}
              >
                {item}
              </button>
            </li>
          ),
        )}

        <li>
          <button
            type="button"
            aria-label="Próxima página"
            disabled={currentPage === lastPage}
            onClick={() => changePage(currentPage + 1)}
            className={`${pageButtonClasses} text-zinc-300 hover:bg-ink-800 hover:text-zinc-50 disabled:pointer-events-none disabled:opacity-40`}
          >
            <span aria-hidden="true">›</span>
          </button>
        </li>
      </ul>
    </nav>
  )
}

type PaginationItem = number | 'ellipsis'

function getPaginationItems(currentPage: number, totalPages: number): PaginationItem[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, 'ellipsis', totalPages]
  }

  if (currentPage >= totalPages - 2) {
    return [1, 'ellipsis', totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
  }

  return [1, 'ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', totalPages]
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}
