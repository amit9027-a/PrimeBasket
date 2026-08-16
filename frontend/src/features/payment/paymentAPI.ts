import api from "@/api/axios";

export interface CreatePaymentOrderResponse {
  amount: number;
  orderId: string;
  currency: string;
}

export const createPaymentOrder = async (amount: number) => {
 return api.post<CreatePaymentOrderResponse>(
  `/payment/create-order?amount=${amount}`,
);
  };