import {
  type PropsWithChildren,
  useCallback,
  useEffect,
  useState,
} from 'react'

import { Toast } from '../../shared/ui/feedback/Toast'
import { FeedbackContext } from './feedbackContext'

export function FeedbackProvider({ children }: PropsWithChildren) {
  const [message, setMessage] = useState('')
  const announce = useCallback((nextMessage: string) => {
    setMessage(nextMessage)
  }, [])

  useEffect(() => {
    if (!message) return

    const timeout = window.setTimeout(() => setMessage(''), 5000)
    return () => window.clearTimeout(timeout)
  }, [message])

  return (
    <FeedbackContext value={{ announce }}>
      {children}
      {message ? (
        <div className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex justify-end">
          <Toast className="pointer-events-auto" message={message} onDismiss={() => setMessage('')} />
        </div>
      ) : null}
    </FeedbackContext>
  )
}
