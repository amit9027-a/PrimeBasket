import api from "@/api/axios";

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export interface OrderItemResponse {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface OrderResponse {
  id: number;
  userId: number;
  customerEmail: string;
  totalAmount: number;
  shippingAddress: string;
  status: OrderStatus;
  createdAt: string;
  items: OrderItemResponse[];
}

export interface CreateOrderPayload {
  shippingAddress: string;
}

export interface UpdateOrderStatusPayload {
  status: OrderStatus;
}

export const placeOrder = (payload: CreateOrderPayload) => {
  return api.post<OrderResponse>("/orders", payload);
};

export const getOrders = () => {
  return api.get<OrderResponse[]>("/orders");
};

export const getOrderById = (id: number) => {
  return api.get<OrderResponse>(`/orders/${id}`);
};

export const cancelOrder = (id: number) => {
  return api.patch<OrderResponse>(`/orders/${id}/cancel`);
};

export const updateOrderStatus = (id: number, payload: UpdateOrderStatusPayload) => {
  return api.patch<OrderResponse>(`/orders/${id}/status`, payload);
};
