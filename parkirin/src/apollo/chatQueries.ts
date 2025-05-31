import { gql } from '@apollo/client';

export const MY_CHATS = gql`
  query GetMyChats {
    myChats {
      id
      participants {
        id
        name
        isOnline
        avatar
      }
      lastMessage {
        content
        createdAt
      }
      unreadCount
      createdAt
    }
  }
`;

export const MESSAGES_BY_CHAT = gql`
  query GetMessagesByChat($chatId: ID!) {
    messagesByChat(chatId: $chatId) {
      id
      senderId
      content
      createdAt
      read
    }
  }
`;

export const SEND_MESSAGE = gql`
  mutation SendMessage($input: SendMessageInput!) {
    sendMessage(input: $input) {
      id
      senderId
      content
      createdAt
      read
    }
  }
`;

export const MESSAGE_SENT = gql`
  subscription OnMessageSent($chatId: ID!) {
    messageSent(chatId: $chatId) {
      id
      senderId
      content
      createdAt
      read
    }
  }
`;
