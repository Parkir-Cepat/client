import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useSubscription } from '@apollo/client';
import { gql } from '@apollo/client';

const GET_ROOM_MESSAGES = gql`
  query GetRoomMessages($roomId: ID!, $limit: Int) {
    getRoomMessages(room_id: $roomId, limit: $limit) {
      _id
      message
      user_id
      createdAt
    }
  }
`;

const SEND_MESSAGE = gql`
  mutation SendMessage($input: SendMessageInput!) {
    sendMessage(input: $input) {
      _id
      message
      createdAt
    }
  }
`;

const MESSAGE_RECEIVED = gql`
  subscription MessageReceived($roomId: ID!) {
    messageReceived(room_id: $roomId) {
      _id
      message
      sender {
        name
        avatar
      }
      createdAt
    }
  }
`;

const Chat = () => {
  const [roomId] = useState('default-room'); // This should come from props or context
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const { data: messagesData, loading } = useQuery(GET_ROOM_MESSAGES, {
    variables: { roomId, limit: 50 }
  });

  const [sendMessage] = useMutation(SEND_MESSAGE);

  const { data: subscriptionData } = useSubscription(MESSAGE_RECEIVED, {
    variables: { roomId }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messagesData, subscriptionData]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await sendMessage({
        variables: {
          input: {
            room_id: roomId,
            message: newMessage
          }
        }
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-h-96 bg-white rounded-lg shadow-lg">
      <div className="bg-blue-600 text-white p-4 rounded-t-lg">
        <h2 className="text-lg font-semibold">Chat with Parking Owner</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messagesData?.getRoomMessages?.map((message) => (
          <div key={message._id} className="flex flex-col">
            <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
              <p className="text-sm">{message.message}</p>
              <span className="text-xs text-gray-500">
                {new Date(message.createdAt).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;