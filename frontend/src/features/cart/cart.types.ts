export type CartId = number;

export type CartItem = {
  itemId: number;
  productId: number;
  quantity: number;
  unitValue: number;
};

export type Cart = {
  cartId: CartId;
  customerId: number;
  createdAt: string;
  items: CartItem[];
};

export type CartRef = {
  cartId: CartId;
  customerId: number;
  createdAt: string;
};

export type CartItemInput = {
  productId: number;
  quantity: number;
  unitValue: number;
};

export type CartItemQuantityInput = {
  quantity: number;
};

