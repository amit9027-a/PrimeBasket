import api from "@/api/axios";

export type PaymentMethod = "COD" | "CARD" | "UPI";

export interface CreatePaymentOrderResponse {
  amount: number;
  orderId: string;
  currency: string;
}

export interface PaymentVerificationPayload {
  shippingAddress: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  paymentMethod: "CARD" | "UPI";
  giftCardCode?: string | null;
}

export interface CodOrderPayload {
  shippingAddress: string;
  giftCardCode?: string | null;
}

export interface GiftCardQuoteResponse {
  code: string;
  cartTotal: number;
  availableBalance: number;
  discount: number;
  payableAmount: number;
}

export interface GiftCardQuotePayload {
  code: string;
}

export const createPaymentOrder = (giftCardCode?: string | null) =>
  api.post<CreatePaymentOrderResponse>(
    "/payment/create-order",
    giftCardCode ? { giftCardCode } : {},
  );

export const verifyPayment = (payload: PaymentVerificationPayload) =>
  api.post("/payment/verify", payload);

export const placeCodOrder = (payload: CodOrderPayload) =>
  api.post("/payment/cod", payload);

export const quoteGiftCard = (payload: GiftCardQuotePayload) =>
  api.post<GiftCardQuoteResponse>("/gift-cards/quote", payload);
