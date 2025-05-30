import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useSubscription } from '@apollo/client';
import { gql } from '@apollo/client';
import { GET_ROOM_MESSAGES, GET_MY_ROOMS } from '../../graphql/queries';
import { CREATE_ROOM } from '../../graphql/mutations';
import useAuthStore from '../../store/authStore';
import { UserIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

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
  const { user } = useAuthStore();

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
      <div className="flex flex-col justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f16634]"></div>
        <span className="ml-2 text-[#f16634] font-semibold">
          {isCreatingRoom ? 'Membuat chat room...' : 'Memuat chat...'}
        </span>
      </div>
    );
  }
  return (
    <div className="flex flex-col h-[70vh] max-h-[600px] bg-white rounded-xl shadow-lg mx-auto my-8 max-w-2xl">
      {/* Header dengan icon chat */}
      <div className="bg-[#f16634] text-white p-4 rounded-t-xl flex items-center space-x-2">
        <ChatBubbleLeftRightIcon className="w-6 h-6" />
        <h2 className="text-lg font-bold">
          {roomsData?.getMyRooms?.find(room => room._id === roomId)?.name || 'Chat'}
        </h2>
        {roomsData?.getMyRooms?.length > 1 && (
          <div className="text-sm opacity-90 ml-2">
            Room: {roomsData.getMyRooms.find(room => room._id === roomId)?.name}
          </div>
        )}
      </div>
      {/* End Header */}
      {!roomId ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center text-gray-500">
            <p>Belum ada chat room</p>
            <button
              onClick={handleCreateDefaultRoom}
              disabled={isCreatingRoom}
              className="mt-2 px-4 py-2 bg-[#f16634] text-white rounded-full font-semibold shadow hover:bg-[#d45528] disabled:opacity-50"
            >
              {isCreatingRoom ? 'Membuat...' : 'Buat Chat Room'}
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Bubble chat modern */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#f9fafb] rounded-b-xl">
            {messagesData?.getRoomMessages?.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p>Belum ada pesan. Mulai percakapan!</p>
              </div>
            ) : (
              messagesData?.getRoomMessages?.map((message) => {
                const isOwn = user && message.sender && (user._id === message.sender._id);
                return (
                  <div
                    key={message._id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    {/* Avatar untuk lawan bicara */}
                    {!isOwn && (
                      <div className="flex-shrink-0 mr-2">
                        {message.sender?.avatar ? (
                          <img
                            src={message.sender.avatar}
                            alt={message.sender.name}
                            className="w-8 h-8 rounded-full object-cover border-2 border-[#f16634]"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center border-2 border-[#f16634]">
                            <UserIcon className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                      </div>
                    )}
                    {/* Bubble chat */}
                    <div
                      className={`max-w-[80%] flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}
                    >
                      {/* Nama pengirim untuk lawan bicara */}
                      {!isOwn && message.sender?.name && (
                        <span className="text-xs text-[#f16634] font-bold mb-1 px-1">
                          {message.sender.name}
                        </span>
                      )}
                      <div
                        className={`px-4 py-2 rounded-2xl shadow border text-sm ${
                          isOwn
                            ? 'bg-[#ffe5d1] text-[#f16634] rounded-br-md'
                            : 'bg-white text-gray-800 rounded-bl-md'
                        }`}
                      >
                        {message.message}
                      </div>
                      <span className="text-xs text-gray-400 mt-1">
                        {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
          {/* End Bubble chat */}
          {/* Input chat modern */}
          <form onSubmit={handleSendMessage} className="p-4 border-t bg-white rounded-b-xl">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Ketik pesan..."
                className="flex-1 px-3 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-[#f16634] focus:border-[#f16634] placeholder:text-gray-400"
                disabled={!roomId}
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || !roomId}
                className="px-5 py-2 bg-[#f16634] text-white rounded-full font-semibold shadow hover:bg-[#d45528] disabled:bg-gray-300 disabled:cursor-not-allowed transition"
              >
                Kirim
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default Chat;