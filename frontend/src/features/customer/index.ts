export const customerFeature = {
  key: "customer",
  routes: {
    root: "/cliente",
  },
} as const;

export { createCustomer, deleteCustomer, getCustomerByCpf, getCustomerById, updateCustomer } from "./customer.api";
export { customerCreateSchema, customerLookupSchema, customerUpdateSchema, normalizeCpf } from "./customer.schemas";
export type { CustomerFormValues } from "./customer.schemas";
export type {
  CustomerAddress,
  CustomerCellphone,
  CustomerDetail,
  CustomerFormDraft,
  CustomerIdResult,
} from "./customer.types";
