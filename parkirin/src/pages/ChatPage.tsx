// filepath: e:\Latihan-Coding\Hacktiv8\phase3\FINAL PROJECT\client\parkirin\src\pages\ChatPage.tsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  TextField,
  IconButton,
  Badge,
  Chip,
  InputAdornment,
  Alert,
} from '@mui/material';
import {
  Send,
  Search,
  MoreVert,
  Circle,
} from '@mui/icons-material';
import { useQuery, useMutation, useSubscription } from '@apollo/client';
import { toast } from 'react-toastify';

import {
  MY_CHATS,
  MESSAGES_BY_CHAT,
  SEND_MESSAGE,
  MESSAGE_SENT,
} from '../apollo/chatQueries';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import type { Chat, Message, User } from '../types/chat';

const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const targetUserId = searchParams.get('userId');

  const {
    data: chatsData,
    loading: chatsLoading
  } = useQuery<{ myChats: Chat[] }>(MY_CHATS);
  
  const {
    data: messagesData,
    loading: messagesLoading
  } = useQuery<{ messagesByChat: Message[] }>(MESSAGES_BY_CHAT, {
    variables: { chatId: selectedChatId },
    skip: !selectedChatId,
  });

  const [sendMessage] = useMutation(SEND_MESSAGE);

  // Subscribe to new messages
  useSubscription(MESSAGE_SENT, {
    variables: { chatId: selectedChatId },
    skip: !selectedChatId,
    onData: ({ data }) => {
      if (data?.data?.messageSent) {
        scrollToBottom();
      }
    },
  });

  const chats = useMemo(() => chatsData?.myChats || [], [chatsData]);
  const messages = useMemo(() => messagesData?.messagesByChat || [], [messagesData]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (targetUserId && chats.length > 0) {
      const existingChat = chats.find(chat => 
        chat.participants.some(p => p.id === targetUserId)
      );
      if (existingChat) {
        setSelectedChatId(existingChat.id);
      }
    } else if (chats.length > 0 && !selectedChatId) {
      setSelectedChatId(chats[0].id);
    }
  }, [targetUserId, chats, selectedChatId]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedChatId) return;

    try {
      await sendMessage({
        variables: {
          input: {
            chatId: selectedChatId,
            content: messageInput.trim(),
          },
        },
      });
      setMessageInput('');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message || 'Gagal mengirim pesan');
      }
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const getOtherParticipant = (chat: Chat): User | null => {
    return chat.participants.find(p => p.id !== user?.id) || null;
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else {
      return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
      });
    }
  };

  const filteredChats = chats.filter(chat => {
    const otherParticipant = getOtherParticipant(chat);
    return otherParticipant?.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const selectedChat = chats.find(chat => chat.id === selectedChatId);
  const otherParticipant = selectedChat ? getOtherParticipant(selectedChat) : null;

  if (!user) {
    return (
      <Container>
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Alert severity="warning">
            Silakan login untuk menggunakan fitur pesan.
          </Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 2, height: 'calc(100vh - 100px)' }}>      <Grid container spacing={2} sx={{ height: '100%' }}>
        {/* Chat List */}
        <Grid container size={{ xs: 12, md: 4 }}>
          <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column', width: '100%' }}>
            {/* Header */}
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6" gutterBottom>
                Pesan
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Cari kontak..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {/* Chat List */}
            <Box sx={{ flex: 1, overflow: 'auto' }}>
              {chatsLoading ? (
                <LoadingSpinner message="Memuat chat..." />
              ) : filteredChats.length > 0 ? (
                <List sx={{ p: 0 }}>
                  {filteredChats.map((chat) => {
                    const participant = getOtherParticipant(chat);
                    const isSelected = chat.id === selectedChatId;
                    const hasUnread = chat.unreadCount > 0;

                    return (                      <ListItem
                        key={chat.id}
                        onClick={() => setSelectedChatId(chat.id)}
                        sx={{
                          borderBottom: 1,
                          borderColor: 'divider',
                          backgroundColor: isSelected
                            ? 'action.selected'
                            : 'inherit',
                          '&:hover': {
                            backgroundColor: 'action.hover',
                          },
                          cursor: 'pointer',
                        }}
                      >
                        <ListItemAvatar>
                          <Badge
                            color="success"
                            variant="dot"
                            invisible={!participant?.isOnline}
                            overlap="circular"
                            anchorOrigin={{
                              vertical: 'bottom',
                              horizontal: 'right',
                            }}
                          >
                            <Avatar src={participant?.avatar}>
                              {participant?.name?.charAt(0)}
                            </Avatar>
                          </Badge>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography
                                sx={{
                                  flex: 1,
                                  fontWeight: hasUnread ? 600 : 'inherit',
                                }}
                              >
                                {participant?.name || 'Unknown'}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {chat.lastMessage && formatMessageTime(chat.lastMessage.createdAt)}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                  flex: 1,
                                  fontWeight: hasUnread ? 600 : 'inherit',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {chat.lastMessage?.content}
                              </Typography>
                              {hasUnread && (
                                <Chip
                                  size="small"
                                  label={chat.unreadCount}
                                  color="primary"
                                  sx={{ ml: 1 }}
                                />
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                    );
                  })}
                </List>
              ) : (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <Typography color="text.secondary">
                    {searchQuery
                      ? 'Tidak ada hasil pencarian'
                      : 'Belum ada pesan'}
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>        {/* Chat Window */}
        <Grid container size={{ xs: 12, md: 8 }}>
          <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column', width: '100%' }}>
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <Box
                  sx={{
                    p: 2,
                    borderBottom: 1,
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Avatar
                    src={otherParticipant?.avatar}
                    sx={{ width: 40, height: 40, mr: 2 }}
                  >
                    {otherParticipant?.name?.charAt(0)}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1">
                      {otherParticipant?.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Circle
                        sx={{
                          fontSize: 12,
                          mr: 0.5,
                          color: otherParticipant?.isOnline
                            ? 'success.main'
                            : 'text.disabled',
                        }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {otherParticipant?.isOnline ? 'Online' : 'Offline'}
                      </Typography>
                    </Box>
                  </Box>
                  <IconButton>
                    <MoreVert />
                  </IconButton>
                </Box>

                {/* Messages */}
                <Box
                  sx={{
                    flex: 1,
                    overflow: 'auto',
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {messagesLoading ? (
                    <LoadingSpinner message="Memuat pesan..." />
                  ) : messages.length > 0 ? (
                    messages.map((message, index) => {
                      const isMe = message.senderId === user?.id;
                      const showAvatar =
                        index === 0 ||
                        messages[index - 1].senderId !== message.senderId;

                      return (
                        <Box
                          key={message.id}
                          sx={{
                            display: 'flex',
                            flexDirection: isMe ? 'row-reverse' : 'row',
                            mb: 2,
                          }}
                        >
                          {!isMe && showAvatar && (
                            <Avatar
                              src={otherParticipant?.avatar}
                              sx={{ width: 32, height: 32, mr: 1 }}
                            >
                              {otherParticipant?.name?.charAt(0)}
                            </Avatar>
                          )}
                          <Box
                            sx={{
                              maxWidth: '70%',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: isMe ? 'flex-end' : 'flex-start',
                            }}
                          >
                            <Paper
                              sx={{
                                p: 1.5,
                                backgroundColor: isMe
                                  ? 'primary.main'
                                  : 'grey.100',
                                color: isMe ? 'primary.contrastText' : 'inherit',
                                borderRadius: 2,
                              }}
                            >
                              <Typography variant="body1">
                                {message.content}
                              </Typography>
                            </Paper>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ mt: 0.5 }}
                            >
                              {formatMessageTime(message.createdAt)}
                            </Typography>
                          </Box>
                        </Box>
                      );
                    })
                  ) : (
                    <Box
                      sx={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography color="text.secondary">
                        Belum ada pesan. Mulai percakapan sekarang!
                      </Typography>
                    </Box>
                  )}
                  <div ref={messagesEndRef} />
                </Box>

                {/* Message Input */}
                <Box
                  sx={{
                    p: 2,
                    borderTop: 1,
                    borderColor: 'divider',
                    backgroundColor: 'background.paper',
                  }}
                >                  <Grid container spacing={1} alignItems="flex-end">                    <Grid size="auto"  >
                      <TextField
                        fullWidth
                        multiline
                        maxRows={4}
                        placeholder="Tulis pesan..."
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        variant="outlined"
                        size="small"
                      />
                    </Grid>                    <Grid container size="auto">
                      <IconButton
                        color="primary"
                        onClick={handleSendMessage}
                        disabled={!messageInput.trim()}
                      >
                        <Send />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Box>
              </>
            ) : (
              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 3,
                  textAlign: 'center',
                }}
              >
                <div>
                  <Typography variant="h6" gutterBottom>
                    Selamat datang di Fitur Chat
                  </Typography>
                  <Typography color="text.secondary">
                    Pilih percakapan atau mulai chat dengan pemilik tempat parkir
                  </Typography>
                </div>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ChatPage;