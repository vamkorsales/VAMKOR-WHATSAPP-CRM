import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Box, Paper, Typography, List, ListItem, ListItemButton, ListItemAvatar, 
  Avatar, ListItemText, TextField, IconButton, Divider, CircularProgress
} from '@mui/material';
import Send from '@mui/icons-material/Send';
import ChatIcon from '@mui/icons-material/Chat';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { supabase } from '../supabaseClient';
import { useAuth } from '../AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

function Chat() {
  const { token } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (token) fetchCustomers();
  }, [token]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchCustomers = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/customers`, { headers: { Authorization: `Bearer ${token}` } });
      setCustomers(res.data);
    } catch (err) {
      console.error('Failed to fetch customers:', err);
    }
  };

  const fetchMessages = async (customerId) => {
    try {
      const res = await axios.get(`${API_URL}/api/messages/${customerId}`, { headers: { Authorization: `Bearer ${token}` } });
      setMessages(res.data);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    }
  };

  const selectCustomer = (customer) => {
    setSelectedCustomer(customer);
    fetchMessages(customer.id);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedCustomer) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${fileName}`;

    try {
      // 1. Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('chat_attachments')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('chat_attachments')
        .getPublicUrl(filePath);

      // 3. Send Message via Backend
      const mediaType = file.type.startsWith('image/') ? 'image' : 
                        file.type.startsWith('video/') ? 'video' : 'document';
      
      const mockId = Date.now().toString();
      setMessages(prev => [...prev, { id: mockId, message: `[Media attached: ${file.name}]`, direction: 'out', media_url: publicUrl }]);

      await axios.post(`${API_URL}/api/messages`, {
        customerId: selectedCustomer.id,
        message: `[Media] ${file.name}`,
        direction: 'OUTBOUND',
        mediaUrl: publicUrl,
        mediaType: mediaType
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      fetchMessages(selectedCustomer.id);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload attachment.');
    } finally {
      setUploading(false);
      e.target.value = ''; // reset input
    }
  };

  const sendMessage = async (e) => {
    e?.preventDefault();
    if (!selectedCustomer || !newMessage.trim()) return;
    
    const tempMessage = newMessage;
    setNewMessage('');
    
    const mockId = Date.now().toString();
    setMessages(prev => [...prev, { id: mockId, message: tempMessage, direction: 'out' }]);

    try {
      await axios.post(`${API_URL}/api/messages`, {
        customerId: selectedCustomer.id,
        message: tempMessage,
        direction: 'OUTBOUND'
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      fetchMessages(selectedCustomer.id);
    } catch (err) {
      console.error('Failed to send message:', err);
      fetchMessages(selectedCustomer.id);
    }
  };

  return (
    <Box sx={{ display: 'flex', height: '100%', gap: 3, overflow: 'hidden' }}>
      
      {/* Conversations List */}
      <Paper elevation={0} sx={{ width: 350, display: 'flex', flexDirection: 'column', border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" fontWeight="bold">Conversations</Typography>
        </Box>
        <List sx={{ flex: 1, overflow: 'auto', p: 0 }}>
          {customers.map(customer => (
            <React.Fragment key={customer.id}>
              <ListItem disablePadding>
                <ListItemButton 
                  selected={selectedCustomer?.id === customer.id}
                  onClick={() => selectCustomer(customer)}
                  sx={{ p: 2 }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>{customer.name?.charAt(0) || '?'}</Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={customer.name} 
                    secondary={customer.phone}
                    primaryTypographyProps={{ fontWeight: selectedCustomer?.id === customer.id ? 'bold' : 'normal' }}
                  />
                </ListItemButton>
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
          {customers.length === 0 && (
            <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
              No conversations found
            </Box>
          )}
        </List>
      </Paper>

      {/* Main Chat Area */}
      <Paper elevation={0} sx={{ flex: 1, display: 'flex', flexDirection: 'column', border: '1px solid', borderColor: 'divider' }}>
        {selectedCustomer ? (
          <>
            {/* Chat Header */}
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>{selectedCustomer.name?.charAt(0) || '?'}</Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">{selectedCustomer.name}</Typography>
                <Typography variant="body2" color="text.secondary">{selectedCustomer.phone}</Typography>
              </Box>
            </Box>

            {/* Messages Area */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 2, bgcolor: '#F9FAFB' }}>
              {messages.map(msg => {
                const isOut = msg.direction === 'OUTBOUND' || msg.direction === 'out';
                return (
                  <Box key={msg.id} sx={{ display: 'flex', justifyContent: isOut ? 'flex-end' : 'flex-start' }}>
                    <Box 
                      sx={{ 
                        maxWidth: '70%', 
                        p: 2, 
                        borderRadius: 2,
                        bgcolor: isOut ? 'primary.main' : 'background.paper',
                        color: isOut ? 'primary.contrastText' : 'text.primary',
                        boxShadow: 1,
                        borderBottomRightRadius: isOut ? 0 : 8,
                        borderBottomLeftRadius: !isOut ? 0 : 8,
                      }}
                    >
                      {msg.media_url ? (
                        <Box sx={{ mb: 1 }}>
                          {msg.media_url.match(/\.(jpeg|jpg|gif|png)$/) ? (
                            <img src={msg.media_url} alt="attachment" style={{ maxWidth: '100%', borderRadius: 4 }} />
                          ) : (
                            <a href={msg.media_url} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>View Attachment</a>
                          )}
                        </Box>
                      ) : null}
                      <Typography variant="body1">{msg.message}</Typography>
                    </Box>
                  </Box>
                );
              })}
              <div ref={messagesEndRef} />
            </Box>

            {/* Input Area */}
            <Box component="form" onSubmit={sendMessage} sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', display: 'flex', gap: 1, bgcolor: 'background.paper', alignItems: 'center' }}>
              <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                onChange={handleFileUpload} 
              />
              <IconButton 
                color="secondary" 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? <CircularProgress size={24} /> : <AttachFileIcon />}
              </IconButton>
              
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                size="small"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 8 } }}
              />
              <IconButton 
                type="submit" 
                color="primary" 
                disabled={!newMessage.trim()}
                sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' }, '&.Mui-disabled': { bgcolor: 'action.disabledBackground' } }}
              >
                <Send />
              </IconButton>
            </Box>
          </>
        ) : (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'text.secondary' }}>
            <ChatIcon sx={{ fontSize: 64, opacity: 0.2, mb: 2 }} />
            <Typography variant="h6">Select a conversation to start messaging</Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
}

export default Chat;
