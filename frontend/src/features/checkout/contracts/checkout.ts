import { z } from 'zod'

const requiredTextSchema = z.string().trim().min(1)

export const paymentMethodSchema = z.enum(['Pix', 'Cartao', 'Boleto'])

export const deliveryAddressSchema = z.object({
  logradouro: requiredTextSchema,
  numero: requiredTextSchema,
  complemento: requiredTextSchema.nullable().optional(),
  cep: z.string().regex(/^\d{8}$/),
  bairro: requiredTextSchema,
  cidade: requiredTextSchema,
  uf: z.string().regex(/^[A-Z]{2}$/),
}).strict()

export const checkoutFormSchema = z.object({
  enderecoEntrega: deliveryAddressSchema,
  formaPagamento: paymentMethodSchema,
}).strict()

export type PaymentMethod = z.infer<typeof paymentMethodSchema>
export type DeliveryAddress = z.infer<typeof deliveryAddressSchema>
export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>
