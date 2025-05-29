import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useSubscription } from '@apollo/client';
import { gql } from '@apollo/client';
import { GET_ROOM_MESSAGES, GET_MY_ROOMS } from '../../graphql/queries';
import { CREATE_ROOM } from '../../graphql/mutations';

const SEND_MESSAGE = gql`
  mutation SendMessage($input: SendMessageInput!) {
    sendMessage(input: $input) {
      _id
      message
      created_at
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
      created_at
    }
  }
`;

const Chat = () => {
  const [roomId, setRoomId] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch user's rooms
  const { data: roomsData, loading: roomsLoading } = useQuery(GET_MY_ROOMS);

  // Create room mutation
  const [createRoom] = useMutation(CREATE_ROOM);
  // Fetch messages for the selected room
  const { data: messagesData } = useQuery(GET_ROOM_MESSAGES, {
    variables: { roomId, limit: 50 },
    skip: !roomId
  });

  // Send message mutation
  const [sendMessage] = useMutation(SEND_MESSAGE);

  // Subscribe to new messages
  const { data: subscriptionData } = useSubscription(MESSAGE_RECEIVED, {
    variables: { roomId },
    skip: !roomId
  });
  const handleCreateDefaultRoom = async () => {
    if (isCreatingRoom) return;
    
    setIsCreatingRoom(true);
    try {
      const { data } = await createRoom({
        variables: {
          input: {
            name: 'General Chat',
            type: 'general'
          }
        },
        refetchQueries: [{ query: GET_MY_ROOMS }]
      });
      
      if (data?.createRoom) {
        setRoomId(data.createRoom._id);
      }
    } catch (error) {
      console.error('Error creating default room:', error);
    } finally {
      setIsCreatingRoom(false);
    }
  };

  // Auto-select first room or create default room
  useEffect(() => {
    if (!roomsLoading && roomsData?.getMyRooms) {
      const rooms = roomsData.getMyRooms;
      if (rooms.length > 0) {
        // Use the first available room
        setRoomId(rooms[0]._id);
      } else {
        // Create a default general chat room if none exists
        handleCreateDefaultRoom();
      }
    }
  }, [roomsData, roomsLoading, handleCreateDefaultRoom]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messagesData, subscriptionData]);
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !roomId) return;

    try {
      await sendMessage({
        variables: {
          input: {
            room_id: roomId,
            message: newMessage
          }
        },
        refetchQueries: [
          {
            query: GET_ROOM_MESSAGES,
            variables: { roomId, limit: 50 }
          }
        ]
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Show loading state while fetching rooms or creating room
  if (roomsLoading || isCreatingRoom) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-2">
          {isCreatingRoom ? 'Creating chat room...' : 'Loading chat...'}
        </span>
      </div>
    );
  }
  return (
    <div className="flex flex-col h-screen max-h-96 bg-white rounded-lg shadow-lg">
      <div className="bg-blue-600 text-white p-4 rounded-t-lg">
        <h2 className="text-lg font-semibold">
          {roomsData?.getMyRooms?.find(room => room._id === roomId)?.name || 'Chat'}
        </h2>
        {roomsData?.getMyRooms?.length > 1 && (
          <div className="text-sm opacity-90">
            Room: {roomsData.getMyRooms.find(room => room._id === roomId)?.name}
          </div>
        )}
      </div>
      
      {!roomId ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center text-gray-500">
            <p>No chat room available</p>
            <button
              onClick={handleCreateDefaultRoom}
              disabled={isCreatingRoom}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isCreatingRoom ? 'Creating...' : 'Create Chat Room'}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messagesData?.getRoomMessages?.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messagesData?.getRoomMessages?.map((message) => (
                <div key={message._id} className="flex flex-col">
                  <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
                    {message.sender && (
                      <div className="text-xs font-semibold text-gray-700 mb-1">
                        {message.sender.name}
                      </div>
                    )}
                    <p className="text-sm">{message.message}</p>
                    <span className="text-xs text-gray-500 mt-1">
                      {new Date(message.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))
            )}
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
                disabled={!roomId}
              />
              <button
                type="submit"
                disabled={!roomId || !newMessage.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default Chat;