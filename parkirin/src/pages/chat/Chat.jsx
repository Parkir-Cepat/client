import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useSubscription } from '@apollo/client';
import { gql } from '@apollo/client';
import { useLocation, useNavigate } from 'react-router-dom';
import { GET_ROOM_MESSAGES } from '../../graphql/queries';
import useAuthStore from '../../store/authStore';
import { UserIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import ChatRoomSelector from '../../components/chat/ChatRoomSelector';

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
  const messagesEndRef = useRef(null);
  const { user } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

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

  // Handle URL parameter for room selection
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const roomFromUrl = searchParams.get('room');
    
    if (roomFromUrl && roomFromUrl !== roomId) {
      setRoomId(roomFromUrl);
      // Clean URL after selecting room
      navigate('/dashboard/chat', { replace: true });
    }
  }, [location.search, roomId, navigate]);

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

  return (
    <div className="flex h-[80vh] bg-white rounded-xl shadow-lg mx-auto my-8 w-full">
      {/* Room Selector Sidebar */}
      <ChatRoomSelector 
        onRoomSelect={setRoomId} 
        selectedRoomId={roomId} 
      />
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {!roomId ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center text-gray-500">
              <ChatBubbleLeftRightIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Pilih Chat Room</h3>
              <p>Pilih room dari sidebar atau buat room baru untuk mulai chat</p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="bg-[#f16634] text-white p-4 flex items-center space-x-3">
              <ChatBubbleLeftRightIcon className="w-6 h-6" />
              <div className="flex-1">
                <h2 className="text-lg font-bold">
                  {messagesData ? 'Chat Room' : 'Loading...'}
                </h2>
              </div>
            </div>
            
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#f9fafb]">
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
                      
                      {/* Bubble pesan */}
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                          isOwn
                            ? 'bg-[#f16634] text-white rounded-br-md'
                            : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md'
                        }`}
                      >
                        {/* Nama pengirim untuk lawan bicara */}
                        {!isOwn && (
                          <div className="text-xs text-gray-500 mb-1 font-medium">
                            {message.sender?.name || 'Anonymous'}
                          </div>
                        )}
                        
                        {/* Isi pesan */}
                        <div className="text-sm leading-relaxed">
                          {message.message}
                        </div>
                        
                        {/* Timestamp */}
                        <div className={`text-xs mt-2 ${isOwn ? 'text-white/70' : 'text-gray-400'}`}>
                          {new Date(message.created_at).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                      
                      {/* Avatar untuk pesan sendiri */}
                      {isOwn && (
                        <div className="flex-shrink-0 ml-2">
                          {user?.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-8 h-8 rounded-full object-cover border-2 border-[#f16634]"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-[#f16634] rounded-full flex items-center justify-center border-2 border-[#f16634]">
                              <UserIcon className="w-5 h-5 text-white" />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Message Input */}
            <div className="p-4 bg-white border-t border-gray-200">
              <form onSubmit={handleSendMessage} className="flex space-x-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Ketik pesan..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-[#f16634] focus:border-[#f16634] outline-none"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="px-6 py-3 bg-[#f16634] text-white rounded-full font-semibold hover:bg-[#d45528] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Kirim
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Chat;