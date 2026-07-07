import { z } from "zod";
import { requestJson } from "@/shared/api/http";
import { customerCreateSchema, customerUpdateSchema, type CustomerFormValues } from "@/features/customer/customer.schemas";
import type { CustomerDetail, CustomerIdResult } from "@/features/customer/customer.types";

const customerAddressSchema = z.object({
  logradouro: z.string(),
  numero: z.string(),
  complemento: z.string().nullable(),
  cep: z.string(),
  bairro: z.string(),
  cidade: z.string(),
  uf: z.string(),
});

const customerCellphoneSchema = z.object({
  ddd: z.string(),
  numero: z.string(),
  whatsApp: z.boolean(),
});

const customerDetailSchema = z.object({
  clienteId: z.number().int(),
  cpf: z.string(),
  nome: z.string(),
  dataNascimento: z.string(),
  email: z.string(),
  endereco: customerAddressSchema,
  celular: customerCellphoneSchema,
});

const customerDetailResponseSchema = z
  .object({
    status: z.boolean(),
    message: z.string(),
    data: customerDetailSchema,
  })
  .transform(({ data }) => mapCustomer(data));

const customerIdResponseSchema = z
  .object({
    status: z.boolean(),
    message: z.string(),
    data: z.object({
      clienteId: z.number().int(),
    }),
  })
  .transform(({ data }) => ({
    customerId: data.clienteId,
  } satisfies CustomerIdResult));

function mapCustomer(customer: z.infer<typeof customerDetailSchema>): CustomerDetail {
  return {
    customerId: customer.clienteId,
    cpf: customer.cpf,
    nome: customer.nome,
    dataNascimento: customer.dataNascimento,
    email: customer.email,
    endereco: {
      logradouro: customer.endereco.logradouro,
      numero: customer.endereco.numero,
      complemento: customer.endereco.complemento,
      cep: customer.endereco.cep,
      bairro: customer.endereco.bairro,
      cidade: customer.endereco.cidade,
      uf: customer.endereco.uf,
    },
    celular: {
      ddd: customer.celular.ddd,
      numero: customer.celular.numero,
      whatsApp: customer.celular.whatsApp,
    },
  };
}

export async function createCustomer(token: string, request: CustomerFormValues): Promise<CustomerIdResult> {
  const payload = customerCreateSchema.parse(request);

  return customerIdResponseSchema.parse(
    await requestJson<unknown>("/cliente", {
      method: "POST",
      token,
      body: payload,
    }),
  );
}

export async function getCustomerById(token: string, customerId: string | number): Promise<CustomerDetail> {
  return customerDetailResponseSchema.parse(
    await requestJson<unknown>(`/cliente/${customerId}`, {
      token,
    }),
  );
}

export async function getCustomerByCpf(token: string, cpf: string): Promise<CustomerDetail> {
  return customerDetailResponseSchema.parse(
    await requestJson<unknown>(`/cliente/cpf/${cpf}`, {
      token,
    }),
  );
}

export async function updateCustomer(
  token: string,
  customerId: string | number,
  request: CustomerFormValues,
): Promise<CustomerIdResult> {
  const payload = customerUpdateSchema.parse(request);

  return customerIdResponseSchema.parse(
    await requestJson<unknown>(`/cliente/${customerId}`, {
      method: "PUT",
      token,
      body: payload,
    }),
  );
}

export async function deleteCustomer(token: string, customerId: string | number): Promise<CustomerIdResult> {
  return customerIdResponseSchema.parse(
    await requestJson<unknown>(`/cliente/${customerId}`, {
      method: "DELETE",
      token,
    }),
  );
}
