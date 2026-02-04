export type NotificationType =
  | 'TASK_STATUS_CHANGED'
  | 'APPLICATION_UPDATE'
  | 'TASK_ASSIGNED'
  | 'TASK_COMPLETED';

export interface Notification {
  _id: string;
  type: NotificationType;
  title: string;
  message: string;
  taskId?: {
    _id: string;
    title: string;
    status: string;
  } | string;
  read: boolean;
  createdAt: string;
}

export interface GetNotificationsResponse {
  success: boolean;
  data?: {
    notifications: Notification[];
    unreadCount: number;
  };
  error?: string;
}

export interface GetUnreadCountResponse {
  success: boolean;
  data?: {
    unreadCount: number;
  };
  error?: string;
}

export interface MarkNotificationReadResponse {
  success: boolean;
  data?: {
    notification: Notification;
  };
  error?: string;
}

export interface MarkAllReadResponse {
  success: boolean;
  data?: {
    message: string;
  };
  error?: string;
}
