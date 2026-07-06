export const ordersFeature = {
  key: "orders",
  routes: {
    list: "/pedidos",
    detail: (id: string) => `/pedidos/${id}`,
  },
} as const;

export { formatOrderStatus, formatPaymentMethod } from "./order.labels";
