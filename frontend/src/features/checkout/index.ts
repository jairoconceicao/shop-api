export const checkoutFeature = {
  key: "checkout",
  routes: {
    root: "/checkout",
  },
} as const;

export { createOrder } from "./checkout.api";
export {
  checkoutAddressSchema,
  checkoutFormSchema,
  checkoutPaymentMethodSchema,
} from "./checkout.schemas";
export type {
  CheckoutAddressFormValues,
  CheckoutFormValues,
  CheckoutPaymentMethodFormValues,
} from "./checkout.schemas";
export type { CheckoutAddress, CheckoutOrderRequest, CheckoutOrderResult, CheckoutPaymentMethod } from "./checkout.types";
