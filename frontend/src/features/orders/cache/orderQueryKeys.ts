export const orderQueryKeys = {
  all: ['private', 'orders'] as const,
  lists: (customerId: number) =>
    ['private', 'orders', 'list', customerId] as const,
  list: (
    customerId: number,
    start: string | undefined,
    end: string | undefined,
    page: number,
    size: number,
  ) => [
    'private',
    'orders',
    'list',
    customerId,
    start ?? null,
    end ?? null,
    page,
    size,
  ] as const,
  details: (customerId: number) =>
    ['private', 'orders', 'detail', customerId] as const,
  detail: (customerId: number, orderId: number) =>
    ['private', 'orders', 'detail', customerId, orderId] as const,
}
