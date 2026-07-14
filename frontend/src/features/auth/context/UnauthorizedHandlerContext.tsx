import { createContext } from 'react'

export type UnauthorizedHandlerContextValue = {
  handleUnauthorized: () => void
}

export const UnauthorizedHandlerContext = createContext<UnauthorizedHandlerContextValue | null>(
  null,
)
