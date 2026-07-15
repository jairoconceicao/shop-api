import { z } from 'zod'

import { addressRequestSchema } from '../../customer/contracts/registration'

export const paymentMethodSchema = z.enum(['Pix', 'Cartao', 'Boleto'])

export const deliveryAddressSchema = addressRequestSchema.extend({
  complemento: addressRequestSchema.shape.complemento
    .unwrap()
    .min(1)
    .nullable()
    .optional(),
  cep: addressRequestSchema.shape.cep.regex(/^\d{8}$/),
  uf: addressRequestSchema.shape.uf.regex(/^[A-Za-z]{2}$/),
}).strict()

export const checkoutFormSchema = z.object({
  enderecoEntrega: deliveryAddressSchema,
  formaPagamento: paymentMethodSchema,
}).strict()

export type PaymentMethod = z.infer<typeof paymentMethodSchema>
export type DeliveryAddress = z.infer<typeof deliveryAddressSchema>
export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>
