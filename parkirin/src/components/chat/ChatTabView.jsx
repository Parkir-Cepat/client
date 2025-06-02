import React from 'react';
import { ChatBubbleLeftRightIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks';
import { useChatStore } from '../../store/chatStore';
import ChatList from './ChatList';
import LandownerContactList from './LandownerContactList';

const ChatTabView = ({ onRoomSelect, selectedRoomId }) => {
  const { user } = useAuth();
  const { activeView, setActiveView } = useChatStore();
  
  // Only show contacts tab for regular users, not landowners
  const showContactsTab = user?.role === 'user';

  const tabs = [
    {
      id: 'chats',
      name: 'Chats',
      icon: ChatBubbleLeftRightIcon,
      count: null // Could be unread count
    }
  ];

  // Add contacts tab only for regular users
  if (showContactsTab) {
    tabs.push({
      id: 'contacts',
      name: 'Contacts',
      icon: UserGroupIcon,
      count: null
    });
  }

  const handleTabChange = (tabId) => {
    setActiveView(tabId);
  };

  const handleContactSelect = (room) => {
    // Switch to chats tab when a contact is selected and a room is created
    setActiveView('chats');
    if (onRoomSelect) {
      onRoomSelect(room);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Tab Navigation */}
      {showContactsTab && (
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => {
            const isActive = activeView === tab.id;
            const Icon = tab.icon;
            
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex-1 flex items-center justify-center px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5 mr-2" />
                {tab.name}
                {tab.count && (
                  <span className="ml-2 bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeView === 'chats' ? (
          <ChatList
            onRoomSelect={onRoomSelect}
            selectedRoomId={selectedRoomId}
            showSearch={true}
            compact={false}
          />
        ) : activeView === 'contacts' ? (
          <LandownerContactList
            onContactSelect={handleContactSelect}
            compact={false}
          />
        ) : null}
      </div>
    </div>
  );
};

export default ChatTabView;
