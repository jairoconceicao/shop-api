export const ordersFeature = {
  key: "orders",
  routes: {
    list: "/pedidos",
    detail: (id: string) => `/pedidos/${id}`,
  },
} as const;

export { cancelOrder, getOrderById, getOrdersByCpf } from "./orders.api";
export { normalizeCpf, orderSearchSchema } from "./orders.schemas";
export type { OrderSearchFormValues } from "./orders.schemas";
export { formatOrderStatus, formatPaymentMethod } from "./order.labels";
export type {
  OrderAddress,
  OrderCancelResult,
  OrderDetail,
  OrderItem,
  OrderListPage,
  OrderPaymentMethod,
  OrderSearchFilters,
  OrderStatus,
  OrderSummary,
} from "./orders.types";
