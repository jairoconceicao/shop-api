import { z } from "zod";

export const createCartSchema = z.object({
  customerId: z.number().int().positive("Informe um cliente válido."),
});

export const cartItemInputSchema = z.object({
  productId: z.number().int().positive("Informe um produto válido."),
  quantity: z.number().int().min(1, "Informe ao menos uma unidade."),
  unitValue: z.number().positive("Informe o valor unitário."),
});

export const cartItemQuantitySchema = z.object({
  quantity: z.number().int().min(1, "Informe ao menos uma unidade."),
});

export type CreateCartFormValues = z.infer<typeof createCartSchema>;
export type CartItemFormValues = z.infer<typeof cartItemInputSchema>;
export type CartItemQuantityFormValues = z.infer<typeof cartItemQuantitySchema>;

