import type { User } from './index';

export type { User };

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  createdAt: string;
  read: boolean;
}

export interface Chat {
  id: string;
  participants: User[];
  lastMessage?: {
    content: string;
    createdAt: string;
  };
  unreadCount: number;
  bookingId?: string;
  createdAt: string;
}
