export type OrderPaymentMethod = "Pix" | "Cartao" | "Boleto";

export type OrderStatus = "Criado" | "EmProcessamento" | "Processado" | "Cancelado" | "Devolvido";

export type OrderAddress = {
  logradouro: string;
  numero: string;
  complemento: string;
  cep: string;
  bairro: string;
  cidade: string;
  uf: string;
};

export type OrderItem = {
  itemId: number;
  productId: number;
  quantity: number;
  unitValue: number;
};

export type OrderSummary = {
  orderId: number;
  cartId: number;
  customerId: number;
  deliveryAddress: OrderAddress;
  orderDate: string;
  paymentMethod: OrderPaymentMethod;
  status: OrderStatus;
  items: OrderItem[];
  totalItems: number;
  totalValue: number;
};

export type OrderListPage = {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  hasNext: boolean;
  hasPrevious: boolean;
  items: OrderSummary[];
};

export type OrderDetail = OrderSummary;

export type OrderCancelResult = {
  orderId: number;
  customerId: number;
  orderDate: string;
  status: OrderStatus;
};

export type OrderSearchFilters = {
  cpf: string;
  dataInicio?: string;
  dataFim?: string;
  page: number;
  size: number;
};
