import { useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button } from '../../../shared/ui/buttons/Button'
import { InlineAlert } from '../../../shared/ui/feedback/InlineAlert'
import { Input } from '../../../shared/ui/forms/Input'
import { parseOrdersUrl, serializeOrdersUrl, toOrdersApiPeriod } from '../routing/ordersUrl'

export function OrdersPeriodFilter() {
  const [searchParams, setSearchParams] = useSearchParams()
  const urlState = parseOrdersUrl(searchParams)
  const periodKey = `${urlState.startDate ?? ''}|${urlState.endDate ?? ''}`

  return <OrdersPeriodFilterForm key={periodKey} urlState={urlState} setSearchParams={setSearchParams} />
}

interface OrdersPeriodFilterFormProps {
  urlState: ReturnType<typeof parseOrdersUrl>
  setSearchParams: ReturnType<typeof useSearchParams>[1]
}

function OrdersPeriodFilterForm({ urlState, setSearchParams }: OrdersPeriodFilterFormProps) {
  const [startDate, setStartDate] = useState(urlState.startDate ?? '')
  const [endDate, setEndDate] = useState(urlState.endDate ?? '')
  const [error, setError] = useState<string>()

  function applyPeriod(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextState = { startDate: startDate || undefined, endDate: endDate || undefined, page: 1 }
    try {
      toOrdersApiPeriod(nextState)
      setError(undefined)
      setSearchParams(serializeOrdersUrl(nextState))
    } catch (cause) {
      setError(cause instanceof RangeError ? cause.message : 'Não foi possível aplicar o período.')
    }
  }

  function clearPeriod() {
    setStartDate('')
    setEndDate('')
    setError(undefined)
    setSearchParams(serializeOrdersUrl({ page: 1 }))
  }

  return (
    <form className="space-y-4" onSubmit={applyPeriod}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Data inicial" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
        <Input label="Data final" type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
      </div>
      {error ? <InlineAlert title={error} variant="error" /> : null}
      <div className="flex flex-wrap gap-3">
        <Button type="submit">Aplicar período</Button>
        <Button type="button" variant="secondary" onClick={clearPeriod}>Limpar período</Button>
      </div>
    </form>
  )
}
