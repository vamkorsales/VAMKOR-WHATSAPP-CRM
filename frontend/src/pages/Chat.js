import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, MessageSquare } from 'lucide-react';
import './Chat.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

function Chat() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchCustomers = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/customers`);
      setCustomers(res.data);
    } catch (err) {
      console.error('Failed to fetch customers:', err);
    }
  };

  const fetchMessages = async (customerId) => {
    try {
      const res = await axios.get(`${API_URL}/api/messages/${customerId}`);
      setMessages(res.data);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    }
  };

  const selectCustomer = (customer) => {
    setSelectedCustomer(customer);
    fetchMessages(customer.id);
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
        direction: 'out'
      });
      fetchMessages(selectedCustomer.id);
    } catch (err) {
      console.error('Failed to send message:', err);
      fetchMessages(selectedCustomer.id);
    }
  };

  return (
    <div className="chat-container">
      <aside className="customers glass-panel">
        <h2>Conversations</h2>
        <ul>
          {customers.map(customer => (
            <li 
              key={customer.id} 
              onClick={() => selectCustomer(customer)}
              className={selectedCustomer?.id === customer.id ? 'active' : ''}
            >
              <div className="customer-name">{customer.name}</div>
              <div className="customer-phone">{customer.phone}</div>
            </li>
          ))}
          {customers.length === 0 && (
            <li style={{textAlign: 'center', opacity: 0.5, pointerEvents: 'none'}}>
              No conversations found
            </li>
          )}
        </ul>
      </aside>
      
      <main className="chat-main glass-panel">
        {selectedCustomer ? (
          <>
            <div className="chat-header">
              <div className="avatar">
                {selectedCustomer.name.charAt(0)}
              </div>
              <div>
                <h2>{selectedCustomer.name}</h2>
                <div className="subtitle">{selectedCustomer.phone}</div>
              </div>
            </div>
            
            <div className="messages">
              {messages.map(msg => (
                <div key={msg.id} className={`message-wrapper ${msg.direction}`}>
                  <div className="message-bubble">
                    {msg.message}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            
            <form className="input-area" onSubmit={sendMessage}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
              />
              <button type="submit" disabled={!newMessage.trim()}>
                <Send size={20} />
              </button>
            </form>
          </>
        ) : (
          <div className="empty-state">
            <MessageSquare size={64} opacity={0.5} />
            <p>Select a conversation to start messaging</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default Chat;
