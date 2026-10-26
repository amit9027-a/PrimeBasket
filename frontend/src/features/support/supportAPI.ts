
import api from "@/api/axios";

export type SupportStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";

export interface SupportMessage {
  id: number;
  senderId: number;
  senderName: string;
  senderRole: string;
  message: string;
  createdAt: string;
  readByAdmin?: boolean;
  readByCustomer?: boolean;
}

export interface SupportConversation {
  id: number;
  subject: string;
  status: SupportStatus;
  customerId: number;
  customerName: string;
  customerEmail: string;
  createdAt: string;
  updatedAt: string;
  unreadCount: number;
  messages: SupportMessage[];
}

export interface CreateSupportConversationRequest {
  subject: string;
  message: string;
}

export interface SendSupportMessageRequest {
  message: string;
}

export async function createSupportConversation(
  request: CreateSupportConversationRequest,
): Promise<SupportConversation> {
  const response = await api.post<SupportConversation>(
    "/support/conversations",
    request,
  );

  return response.data;
}

export async function getMySupportConversations(): Promise<
  SupportConversation[]
> {
  const response = await api.get<SupportConversation[]>(
    "/support/conversations",
  );

  return response.data;
}

export async function getAllSupportConversations(): Promise<
  SupportConversation[]
> {
  const response = await api.get<SupportConversation[]>(
    "/support/admin/conversations",
  );

  return response.data;
}

export async function getSupportConversation(
  id: number,
): Promise<SupportConversation> {
  const response = await api.get<SupportConversation>(
    `/support/conversations/${id}`,
  );

  return response.data;
}

export async function markSupportConversationAsRead(
  id: number,
): Promise<SupportConversation> {
  const response = await api.patch<SupportConversation>(
    `/support/conversations/${id}/read`,
  );

  return response.data;
}

export async function sendSupportMessage(
  id: number,
  message: string,
): Promise<SupportConversation> {
  const response = await api.post<SupportConversation>(
    `/support/conversations/${id}/messages`,
    { message },
  );

  return response.data;
}

export async function updateSupportStatus(
  id: number,
  status: SupportStatus,
): Promise<SupportConversation> {
  const response = await api.patch<SupportConversation>(
    `/support/admin/conversations/${id}/status`,
    { status },
  );

  return response.data;
}
