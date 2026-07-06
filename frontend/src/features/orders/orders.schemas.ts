import { z } from "zod";

export function normalizeCpf(value: string) {
  return value.replace(/\D/g, "");
}

const cpfSchema = z
  .string()
  .trim()
  .transform(normalizeCpf)
  .refine((value) => value.length === 0 || value.length === 11, {
    message: "Informe um CPF válido.",
  });

const optionalDateTimeSchema = z
  .string()
  .trim()
  .refine((value) => value.length === 0 || !Number.isNaN(new Date(value).getTime()), {
    message: "Informe uma data válida.",
  });

export const orderSearchSchema = z
  .object({
    cpf: cpfSchema,
    dataInicio: optionalDateTimeSchema.default(""),
    dataFim: optionalDateTimeSchema.default(""),
    page: z.coerce.number().int().positive().default(1),
    size: z.coerce.number().int().positive().max(100).default(10),
  })
  .superRefine((value, context) => {
    if (!value.cpf) {
      return;
    }

    if (value.dataInicio && value.dataFim) {
      const start = new Date(value.dataInicio);
      const end = new Date(value.dataFim);

      if (start.getTime() > end.getTime()) {
        context.addIssue({
          code: "custom",
          path: ["dataFim"],
          message: "A data final precisa ser maior ou igual à inicial.",
        });
      }
    }
  });

export type OrderSearchFormValues = z.input<typeof orderSearchSchema>;
