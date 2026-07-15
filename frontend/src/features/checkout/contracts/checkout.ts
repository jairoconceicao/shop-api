import { z } from 'zod'

import { deliveryAddressSchema } from '../../customer/contracts/customerProfile'

export { deliveryAddressSchema } from '../../customer/contracts/customerProfile'

export const paymentMethodSchema = z.enum(['Pix', 'Cartao', 'Boleto'])

export const checkoutFormSchema = z.object({
  enderecoEntrega: deliveryAddressSchema,
  formaPagamento: paymentMethodSchema,
}).strict()

export type PaymentMethod = z.infer<typeof paymentMethodSchema>
export type DeliveryAddress = z.infer<typeof deliveryAddressSchema>
export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>
