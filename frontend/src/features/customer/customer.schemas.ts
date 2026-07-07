import { z } from "zod";

export function normalizeCpf(value: string) {
  return value.replace(/\D/g, "");
}

function normalizeDigits(value: string) {
  return value.replace(/\D/g, "");
}

const cpfSchema = z
  .string()
  .trim()
  .transform(normalizeCpf)
  .refine((value) => value.length === 11, {
    message: "Informe um CPF válido.",
  });

const dateSchema = z
  .string()
  .trim()
  .refine((value) => value.length > 0 && !Number.isNaN(new Date(value).getTime()), {
    message: "Informe uma data de nascimento válida.",
  });

const emailSchema = z.string().trim().min(1, "Informe o e-mail.").email("Informe um e-mail válido.");

const requiredTextSchema = (message: string) => z.string().trim().min(1, message);

const cepSchema = z
  .string()
  .trim()
  .transform(normalizeDigits)
  .refine((value) => value.length === 8, {
    message: "Informe um CEP válido.",
  });

const dddSchema = z
  .string()
  .trim()
  .transform(normalizeDigits)
  .refine((value) => value.length === 2, {
    message: "Informe um DDD válido.",
  });

const phoneSchema = z
  .string()
  .trim()
  .transform(normalizeDigits)
  .refine((value) => value.length >= 8 && value.length <= 9, {
    message: "Informe um número de celular válido.",
  });

const ufSchema = z
  .string()
  .trim()
  .transform((value) => value.toUpperCase())
  .refine((value) => value.length === 2, {
    message: "Informe uma UF válida.",
  });

const optionalComplementSchema = z.string().trim().transform((value) => value);

const customerFormBaseSchema = z.object({
  cpf: cpfSchema,
  nome: requiredTextSchema("Informe o nome do cliente."),
  dataNascimento: dateSchema,
  email: emailSchema,
  logradouro: requiredTextSchema("Informe o logradouro."),
  numero: requiredTextSchema("Informe o número."),
  complemento: optionalComplementSchema,
  cep: cepSchema,
  bairro: requiredTextSchema("Informe o bairro."),
  cidade: requiredTextSchema("Informe a cidade."),
  uf: ufSchema,
  ddd: dddSchema,
  numeroCelular: phoneSchema,
  whatsApp: z.boolean().default(false),
});

const customerRequestSchema = customerFormBaseSchema.transform((values) => ({
  cpf: values.cpf,
  nome: values.nome,
  dataNascimento: values.dataNascimento,
  email: values.email,
  endereco: {
    logradouro: values.logradouro,
    numero: values.numero,
    complemento: values.complemento.length > 0 ? values.complemento : null,
    cep: values.cep,
    bairro: values.bairro,
    cidade: values.cidade,
    uf: values.uf,
  },
  celular: {
    ddd: values.ddd,
    numero: values.numeroCelular,
    whatsApp: values.whatsApp,
  },
}));

export const customerCreateSchema = customerFormBaseSchema
  .extend({
    senha: z.string().trim().min(6, "A senha precisa ter pelo menos 6 caracteres."),
  })
  .transform((values) => ({
    cpf: values.cpf,
    nome: values.nome,
    dataNascimento: values.dataNascimento,
    email: values.email,
    senha: values.senha,
    endereco: {
      logradouro: values.logradouro,
      numero: values.numero,
      complemento: values.complemento.length > 0 ? values.complemento : null,
      cep: values.cep,
      bairro: values.bairro,
      cidade: values.cidade,
      uf: values.uf,
    },
    celular: {
      ddd: values.ddd,
      numero: values.numeroCelular,
      whatsApp: values.whatsApp,
    },
  }));

export const customerUpdateSchema = customerRequestSchema;

const optionalCustomerIdSchema = z.preprocess(
  (value) => {
    if (typeof value === "string" && value.trim().length === 0) {
      return undefined;
    }

    return value;
  },
  z.coerce.number().int().positive("Informe um ID válido.").optional(),
);

export const customerLookupSchema = z.object({
  customerId: optionalCustomerIdSchema,
  cpf: z
    .string()
    .trim()
    .transform(normalizeCpf)
    .refine((value) => value.length === 0 || value.length === 11, {
      message: "Informe um CPF válido.",
    }),
});

export type CustomerFormValues = z.input<typeof customerCreateSchema>;
export type CustomerLookupFormValues = z.input<typeof customerLookupSchema>;
