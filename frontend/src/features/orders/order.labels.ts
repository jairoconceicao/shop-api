const paymentMethodLabels: Record<string, string> = {
  Pix: "Pix",
  Cartao: "Cartão de crédito",
  Boleto: "Boleto bancário",
};

const orderStatusLabels: Record<string, string> = {
  Criado: "Criado",
  EmProcessamento: "Em processamento",
  Processado: "Processado",
  Cancelado: "Cancelado",
  Devolvido: "Devolvido",
};

export function formatPaymentMethod(paymentMethod: string) {
  return paymentMethodLabels[paymentMethod] ?? paymentMethod;
}

export function formatOrderStatus(status: string) {
  return orderStatusLabels[status] ?? status;
}
