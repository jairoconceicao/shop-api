import {
  type PropsWithChildren,
  useCallback,
  useState,
} from 'react'

import { FeedbackContext } from './feedbackContext'

export function FeedbackProvider({ children }: PropsWithChildren) {
  const [message, setMessage] = useState('')
  const announce = useCallback((nextMessage: string) => {
    setMessage(nextMessage)
  }, [])

  return (
    <FeedbackContext value={{ announce }}>
      {children}
      <div className="sr-only" role="status" aria-live="polite">
        {message}
      </div>
    </FeedbackContext>
  )
}
