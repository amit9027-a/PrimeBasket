import api from "@/api/axios";

export type ReturnStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "RECEIVED"
  | "REFUND_PENDING"
  | "REFUNDED"
  | "REFUND_FAILED";

export type RefundStatus =
  | "MANUAL_REQUIRED"
  | "NOT_REQUIRED"
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED";

export interface CreateReturnRequest {
  orderId: number;
  reason: string;
  description: string;
}

export interface ReturnRequestResponse {
  id: number;
  orderId: number;
  userId: number;
  customerEmail: string;
  orderTotal: number;
  reason: string;
  description: string | null;
  status: ReturnStatus;
  refundStatus: RefundStatus;
  adminNote: string | null;
  createdAt: string;
}

export const getMyReturnRequests = async () => {
  return api.get<ReturnRequestResponse[]>("/returns");
};

export const createReturnRequest = async (
  request: CreateReturnRequest,
) => {
  return api.post<ReturnRequestResponse>("/returns", request);
};