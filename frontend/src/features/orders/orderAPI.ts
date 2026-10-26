
import api from "@/api/axios";

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type OrderPaymentMethod =
  | "COD"
  | "RAZORPAY"
  | "CARD"
  | "UPI";

export type OrderPaymentStatus =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "REFUNDED";

export interface OrderItemResponse {
  id?: number;
  productId?: number;
  productName?: string;
  name?: string;
  imageUrl?: string;
  quantity: number;
  price: number;
  subtotal?: number;
}

export interface OrderResponse {
  id: number;
  userId?: number;
  customerEmail?: string;
  totalAmount: number;
  shippingAddress: string;
  status: OrderStatus;
  createdAt: string;
  items: OrderItemResponse[];
  paymentMethod?: OrderPaymentMethod;
  paymentStatus?: OrderPaymentStatus;
}

export interface UpdateOrderStatusPayload {
  status: OrderStatus;
}

export const getOrders = () =>
  api.get<OrderResponse[]>("/orders");

export const getOrderById = (id: number | string) =>
  api.get<OrderResponse>(`/orders/${id}`);

export const cancelOrder = (id: number | string) =>
  api.patch<OrderResponse>(`/orders/${id}/cancel`);

export const updateOrderStatus = (
  id: number | string,
  payload: UpdateOrderStatusPayload
) =>
  api.patch<OrderResponse>(
    `/orders/${id}/status`,
    payload
  );
