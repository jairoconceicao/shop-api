import { z } from "zod";

export const checkoutPaymentMethodSchema = z.enum(["Pix", "Cartao", "Boleto"]);

export const checkoutAddressSchema = z.object({
  logradouro: z.string().trim().min(3, "Informe o logradouro."),
  numero: z.string().trim().min(1, "Informe o número."),
  complemento: z.string().trim().optional().default(""),
  cep: z
    .string()
    .trim()
    .regex(/^\d{8}$/, "Informe um CEP com 8 dígitos."),
  bairro: z.string().trim().min(2, "Informe o bairro."),
  cidade: z.string().trim().min(2, "Informe a cidade."),
  uf: z
    .string()
    .trim()
    .length(2, "Informe a UF com 2 letras.")
    .transform((value) => value.toUpperCase()),
});

export const checkoutFormSchema = z.object({
  paymentMethod: checkoutPaymentMethodSchema,
  address: checkoutAddressSchema,
});

export type CheckoutPaymentMethodFormValues = z.infer<typeof checkoutPaymentMethodSchema>;
export type CheckoutAddressFormValues = z.infer<typeof checkoutAddressSchema>;
export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

