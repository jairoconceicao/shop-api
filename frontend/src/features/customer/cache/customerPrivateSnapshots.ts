type ClearSnapshot = () => void

const snapshotsByCustomer = new Map<number, Set<ClearSnapshot>>()

export function registerCustomerPrivateSnapshot(customerId: number, clear: ClearSnapshot) {
  const snapshots = snapshotsByCustomer.get(customerId) ?? new Set<ClearSnapshot>()
  snapshots.add(clear)
  snapshotsByCustomer.set(customerId, snapshots)

  return () => {
    snapshots.delete(clear)
    if (snapshots.size === 0) snapshotsByCustomer.delete(customerId)
  }
}

export function clearCustomerPrivateSnapshots(customerId: number) {
  const snapshots = snapshotsByCustomer.get(customerId)
  snapshotsByCustomer.delete(customerId)
  snapshots?.forEach((clear) => clear())
}
