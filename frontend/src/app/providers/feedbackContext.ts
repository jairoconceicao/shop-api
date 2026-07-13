import { createContext, useContext } from 'react'

export type FeedbackContextValue = {
  announce: (message: string) => void
}

export const FeedbackContext = createContext<FeedbackContextValue | null>(null)

export function useFeedback(): FeedbackContextValue {
  const feedback = useContext(FeedbackContext)

  if (!feedback) {
    throw new Error('useFeedback deve ser usado dentro de FeedbackProvider.')
  }

  return feedback
}
