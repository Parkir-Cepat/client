import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { 
  GET_PUBLIC_ROOMS, 
  GET_MY_ROOMS,
} from '../../graphql/queries';
import { 
  CREATE_ROOM, 
  JOIN_ROOM 
} from '../../graphql/mutations';
import { 
  ChatBubbleLeftRightIcon,
  UsersIcon,
  PlusIcon,
  LockClosedIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

const ChatRoomSelector = ({ onRoomSelect, selectedRoomId }) => {
  const [activeTab, setActiveTab] = useState('my-rooms');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newRoomData, setNewRoomData] = useState({
    name: '',
    type: 'general',
    privacy: 'public',
    max_participants: ''
  });
  
  // Queries
  const { data: myRoomsData, loading: myRoomsLoading } = useQuery(GET_MY_ROOMS);
  const { data: publicRoomsData, loading: publicRoomsLoading } = useQuery(GET_PUBLIC_ROOMS, {
    variables: { limit: 20 },
    skip: activeTab !== 'public-rooms'
  });

  // Mutations
  const [createRoom] = useMutation(CREATE_ROOM);
  const [joinRoom] = useMutation(JOIN_ROOM);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    try {
      const { data } = await createRoom({
        variables: {
          input: {
            name: newRoomData.name,
            type: newRoomData.type,
            privacy: newRoomData.privacy,
            max_participants: newRoomData.max_participants ? parseInt(newRoomData.max_participants) : null
          }
        },
        refetchQueries: [{ query: GET_MY_ROOMS }, { query: GET_PUBLIC_ROOMS }]
      });
      
      if (data?.createRoom) {
        onRoomSelect(data.createRoom._id);
        setShowCreateForm(false);
        setNewRoomData({ name: '', type: 'general', privacy: 'public', max_participants: '' });
      }
    } catch (error) {
      console.error('Error creating room:', error);
    }
  };

  const handleJoinRoom = async (roomId) => {
    try {
      await joinRoom({
        variables: { input: { room_id: roomId } },
        refetchQueries: [{ query: GET_MY_ROOMS }]
      });
      onRoomSelect(roomId);
    } catch (error) {
      console.error('Error joining room:', error);
    }
  };

  const renderRoomItem = (room, showJoinButton = false) => {
    const isSelected = selectedRoomId === room._id;
    const isPrivate = room.privacy === 'private';
    const isFull = room.is_full;
    
    return (
      <div
        key={room._id}
        className={`p-3 rounded-lg border transition-all cursor-pointer ${
          isSelected 
            ? 'bg-[#f16634] text-white border-[#f16634]' 
            : 'bg-white hover:bg-orange-50 border-gray-200'
        }`}
        onClick={() => !showJoinButton && onRoomSelect(room._id)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isSelected ? 'bg-white/20' : 'bg-gray-100'
            }`}>
              {isPrivate ? (
                <LockClosedIcon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-gray-500'}`} />
              ) : (
                <GlobeAltIcon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-gray-500'}`} />
              )}
            </div>
            
            <div className="flex-1">
              <h4 className={`font-medium ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                {room.name}
              </h4>
              <div className="flex items-center space-x-2 mt-1">
                <UsersIcon className={`w-4 h-4 ${isSelected ? 'text-white/70' : 'text-gray-400'}`} />
                <span className={`text-sm ${isSelected ? 'text-white/70' : 'text-gray-500'}`}>
                  {room.participant_count} {room.max_participants && `/ ${room.max_participants}`}
                </span>
                {isFull && (
                  <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">
                    Penuh
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {showJoinButton && !isSelected && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleJoinRoom(room._id);
              }}
              disabled={isFull}
              className="px-3 py-1 bg-[#f16634] text-white text-sm rounded-full hover:bg-[#d45528] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isFull ? 'Penuh' : 'Join'}
            </button>
          )}
        </div>
        
        {room.last_message && (
          <div className={`mt-2 text-sm ${isSelected ? 'text-white/80' : 'text-gray-600'}`}>
            <span className="truncate">{room.last_message.message}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
          <ChatBubbleLeftRightIcon className="w-6 h-6 text-[#f16634]" />
          <span>Chat Rooms</span>
        </h2>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('my-rooms')}
          className={`flex-1 py-3 px-4 text-sm font-medium ${
            activeTab === 'my-rooms'
              ? 'border-b-2 border-[#f16634] text-[#f16634] bg-orange-50'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          My Rooms
        </button>
        <button
          onClick={() => setActiveTab('public-rooms')}
          className={`flex-1 py-3 px-4 text-sm font-medium ${
            activeTab === 'public-rooms'
              ? 'border-b-2 border-[#f16634] text-[#f16634] bg-orange-50'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Public Rooms
        </button>
      </div>

      {/* Create Room Button */}
      <div className="p-4">
        <button
          onClick={() => setShowCreateForm(true)}
          className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-[#f16634] text-white rounded-lg hover:bg-[#d45528] transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Create New Room</span>
        </button>
      </div>

      {/* Room List */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'my-rooms' && (
          <div className="space-y-3">
            {myRoomsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#f16634]"></div>
              </div>
            ) : myRoomsData?.getMyRooms?.length > 0 ? (
              myRoomsData.getMyRooms.map(room => renderRoomItem(room))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <ChatBubbleLeftRightIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Belum ada room chat</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'public-rooms' && (
          <div className="space-y-3">
            {publicRoomsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#f16634]"></div>
              </div>
            ) : publicRoomsData?.getPublicRooms?.length > 0 ? (
              publicRoomsData.getPublicRooms.map(room => renderRoomItem(room, true))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <GlobeAltIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Belum ada public room</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Room Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 max-w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Create New Room</h3>
            
            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room Name
                </label>
                <input
                  type="text"
                  value={newRoomData.name}
                  onChange={(e) => setNewRoomData({...newRoomData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f16634] focus:border-[#f16634]"
                  placeholder="Enter room name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Privacy
                </label>
                <select
                  value={newRoomData.privacy}
                  onChange={(e) => setNewRoomData({...newRoomData, privacy: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f16634] focus:border-[#f16634]"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Participants (Optional)
                </label>
                <input
                  type="number"
                  value={newRoomData.max_participants}
                  onChange={(e) => setNewRoomData({...newRoomData, max_participants: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f16634] focus:border-[#f16634]"
                  placeholder="Leave empty for unlimited"
                  min="2"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 bg-[#f16634] text-white rounded-lg hover:bg-[#d45528]"
                >
                  Create Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatRoomSelector; 