import { api } from "./client";
import type {
  GetNotificationsResponse,
  GetUnreadCountResponse,
  MarkNotificationReadResponse,
  MarkAllReadResponse,
} from "../types/notificationTypes";

// Get all notifications for the current user
export const getNotificationsApi = async (params?: {
  read?: boolean;
  limit?: number;
}): Promise<GetNotificationsResponse> => {
  const res = await api.get<GetNotificationsResponse>("/notifications", {
    params,
  });
  return res.data;
};

// Get unread notification count
export const getUnreadCountApi = async (): Promise<GetUnreadCountResponse> => {
  const res = await api.get<GetUnreadCountResponse>(
    "/notifications/unread-count"
  );
  return res.data;
};

// Mark a single notification as read
export const markNotificationReadApi = async (
  id: string
): Promise<MarkNotificationReadResponse> => {
  const res = await api.put<MarkNotificationReadResponse>(
    `/notifications/${id}/read`
  );
  return res.data;
};

// Mark all notifications as read
export const markAllNotificationsReadApi =
  async (): Promise<MarkAllReadResponse> => {
    const res = await api.put<MarkAllReadResponse>("/notifications/read-all");
    return res.data;
  };
