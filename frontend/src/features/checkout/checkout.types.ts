import type { CartItem } from "@/features/cart/cart.types";

export type CheckoutAddress = {
  logradouro: string;
  numero: string;
  complemento: string;
  cep: string;
  bairro: string;
  cidade: string;
  uf: string;
};

export type CheckoutPaymentMethod = "Pix" | "Cartao" | "Boleto";

export type CheckoutOrderRequest = {
  customerId: number;
  cartId: number;
  address: CheckoutAddress;
  paymentMethod: CheckoutPaymentMethod;
  orderDate: string;
  items: CartItem[];
};

export type CheckoutOrderResult = {
  orderId: number;
  customerId: number;
  orderDate: string;
  paymentMethod: CheckoutPaymentMethod;
  status: string;
  totalValue: number;
};

