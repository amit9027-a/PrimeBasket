
import api from "@/api/axios";

export interface GiftCard {
  id: number;
  code: string;
  initialAmount: number;
  balance: number;
  active: boolean;
  expiryDate: string | null;
  createdAt: string;
}

export interface CreateGiftCardPayload {
  amount: number;
  expiryDate: string | null;
}

export interface GiftCardQuoteRequest {
  code: string;
}

export interface GiftCardQuoteResponse {
  code: string;
  cartTotal: number;
  availableBalance: number;
  discount: number;
  payableAmount: number;
}

export const createGiftCard = (payload: CreateGiftCardPayload) =>
  api.post<GiftCard>("/gift-cards/admin", payload);

export const getGiftCards = () =>
  api.get<GiftCard[]>("/gift-cards/admin");

export const updateGiftCardStatus = (id: number, active: boolean) =>
  api.patch<GiftCard>(`/gift-cards/admin/${id}/status`, { active });

export const checkGiftCardBalance = (code: string) =>
  api.get<GiftCard>("/gift-cards/balance", {
    params: { code },
  });

export const quoteGiftCard = (payload: GiftCardQuoteRequest) =>
  api.post<GiftCardQuoteResponse>("/gift-cards/quote", payload);

export const getGiftCardHistory = () =>
  api.get("/gift-cards/history");
