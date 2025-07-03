import React, { useState } from 'react';
import type { FormEvent, ChangeEvent, KeyboardEvent } from 'react';
import { MessageCircle, Send, Bot, Clock, User } from 'lucide-react';
import './Chatbot.css';
import timsoftLogo from '../assets/timsoft.png';

interface Message {
  id: number;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

interface Conversation {
  id: number;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messageCount: number;
}

interface ChatbotProps {
  currentUser: { name: string; email: string; role: string };
}

const getUserInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const Chatbot: React.FC<ChatbotProps> = ({ currentUser }) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: 'Hello! I\'m BrainBot, your AI assistant. How can I help you today?', isBot: true, timestamp: new Date() }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversations] = useState<Conversation[]>([
    {
      id: 1,
      title: 'Project Discussion',
      lastMessage: 'Can you help me with the API integration?',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      messageCount: 15
    },
    {
      id: 2,
      title: 'Technical Support',
      lastMessage: 'The system is working perfectly now.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      messageCount: 8
    },
    {
      id: 3,
      title: 'General Questions',
      lastMessage: 'Thank you for the detailed explanation!',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      messageCount: 12
    }
  ]);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputMessage,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const botResponse: Message = {
        id: messages.length + 2,
        text: `I understand you said: "${inputMessage}". This is a demo response. In a real application, this would be processed by an AI model.`,
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e as any);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return 'Today';
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-sidebar">
        <div className="sidebar-header">
          <h3>Previous Conversations</h3>
          <button className="new-chat-btn">
            <MessageCircle size={16} />
            New Chat
          </button>
        </div>
        <div className="conversations-list">
          {conversations.map((conversation) => (
            <div key={conversation.id} className="conversation-item">
              <div className="conversation-content">
                <h4 className="conversation-title">{conversation.title}</h4>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="chatbot-main">
        <div className="chat-header">
          <div className="chat-header-content">
            <img src={timsoftLogo} alt="Timsoft Logo" style={{ width: '32px', height: '32px', marginRight: '8px', verticalAlign: 'middle' }} />
            <Bot size={24} className="chat-icon" />
            <div className="chat-info">
              <h2>BrainBot Assistant</h2>
              <span className="chat-status">Online</span>
            </div>
          </div>
        </div>
        
        <div className="chat-messages">
          {messages.map((message) => (
            <div key={message.id} className={`message ${message.isBot ? 'bot' : 'user'}`}>
              <div className="message-avatar">
                {message.isBot ? <Bot size={20} /> : <span>{getUserInitials(currentUser.name)}</span>}
              </div>
              <div className="message-content">
                <div className="message-text">{message.text}</div>
                <div className="message-time">{formatTime(message.timestamp)}</div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="message bot typing">
              <div className="message-avatar">
                <Bot size={20} />
              </div>
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="chat-input">
          <form onSubmit={handleSendMessage} className="input-form">
            <textarea
              value={inputMessage}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message here..."
              className="message-input"
              rows={1}
            />
            <button type="submit" className="send-btn" disabled={!inputMessage.trim()}>
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chatbot; 