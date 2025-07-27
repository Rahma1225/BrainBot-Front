import React, { useState, useEffect, useRef } from 'react';
import type { FormEvent, ChangeEvent, KeyboardEvent } from 'react';
import { MessageCircle, Send, Bot, Clock, User, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import './Chatbot.css';
import timsoftLogo from '../assets/timsoft.png';
import { apiService } from '../services/api';

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

const defaultWelcomeMessage: Message = {
  id: 0,
  text: "Hi, how can I help you today?",
  isBot: true,
  timestamp: new Date()
};

const getUserInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const Chatbot: React.FC<ChatbotProps> = ({ currentUser }) => {
  const [conversations, setConversations] = useState<Array<{ id: string; title: string; createdAt: string }>>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null); // Add ref for .chat-messages
  const [pendingBotMessage, setPendingBotMessage] = useState<string | null>(null);
  const [animatingBot, setAnimatingBot] = useState(false);
  const [lastUpdatedConvId, setLastUpdatedConvId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [animatedTitle, setAnimatedTitle] = useState<string>("");
  const [isAnimatingTitle, setIsAnimatingTitle] = useState(false);
  const [sendingFirstMessage, setSendingFirstMessage] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Fetch conversations for sidebar
  const fetchConversationsList = async () => {
    try {
      const data = await apiService.getConversationsList();
      setConversations(data);
      // Auto-select the first conversation if none selected
      if (!selectedConversationId && data.length > 0) {
        setSelectedConversationId(data[0].id);
      }
    } catch (err) {
      setConversations([]);
    }
  };

  // Fetch messages for selected conversation
  const fetchMessages = async (conversationId: string) => {
    try {
      const history = await apiService.getConversationMessages(conversationId);
      setMessages(
        history.map((conv, idx) => [
          { id: idx * 2 + 1, text: conv.prompt, isBot: false, timestamp: new Date(conv.timestamp) },
          { id: idx * 2 + 2, text: conv.response, isBot: true, timestamp: new Date(conv.timestamp) }
        ]).flat()
      );
    } catch (err) {
      setMessages([]);
    }
  };

  // Initial load: conversations and messages
  useEffect(() => {
    fetchConversationsList();
  }, []);

  // When selectedConversationId changes, fetch its messages
  useEffect(() => {
    if (selectedConversationId && selectedConversationId !== '' && !sendingFirstMessage) {
      fetchMessages(selectedConversationId);
    } else if (!selectedConversationId || selectedConversationId === '') {
      setMessages([defaultWelcomeMessage]);
    }
  }, [selectedConversationId, sendingFirstMessage]);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    if (messagesEndRef.current && messagesContainerRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      // Also scroll the container directly as backup
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (messages.length > 0) {
      // Immediate scroll
      scrollToBottom();
      // Delayed scroll to ensure it works even if DOM is still updating
      setTimeout(() => scrollToBottom(), 50);
      setTimeout(() => scrollToBottom(), 150);
    }
  }, [messages]);

  // Scroll to bottom when conversation changes (to show latest messages)
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => scrollToBottom(), 200);
    }
  }, [selectedConversationId]);

  // Scroll to bottom when bot is typing
  useEffect(() => {
    if (isTyping || pendingBotMessage) {
      setTimeout(() => scrollToBottom(), 50);
    }
  }, [isTyping, pendingBotMessage]);

  // Scroll to bottom when user starts typing (to show input area)
  useEffect(() => {
    if (inputMessage.trim()) {
      setTimeout(() => scrollToBottom(), 100);
    }
  }, [inputMessage]);

  // Scroll to bottom when messages are loaded
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => scrollToBottom(), 100);
    }
  }, [messages]);

  // Force scroll to bottom on component mount
  useEffect(() => {
    setTimeout(() => scrollToBottom(), 500);
  }, []);

  // Handle scroll events to show/hide scroll button
  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom);
    }
  };

  // New Chat button handler
  const handleNewChat = async () => {
    // Prevent creating a new conversation if the current one has no messages
    if (selectedConversationId && messages.length === 0) {
      setNotification('⚠️ Please send a message in the current conversation before starting a new one.');
      setTimeout(() => setNotification(null), 2000);
      return;
    }
    const newConv = await apiService.createConversation();
    await fetchConversationsList();
    setSelectedConversationId(newConv.id);
    setMessages([]);
  };

  // Select conversation from sidebar
  const handleSelectConversation = (id: string) => {
    setSelectedConversationId(id);
  };

  // Send message in selected conversation
  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    setIsTyping(true);

    let conversationId = selectedConversationId;
    let isTempConv = false;

    // Always add the user's message to the UI immediately
    setMessages(prev => {
      if (!conversationId) {
        // No conversation: show welcome + user message
        if (prev.length === 1 && prev[0].id === 0) {
          return [
            prev[0],
            {
              id: 1,
              text: inputMessage,
              isBot: false,
              timestamp: new Date()
            }
          ];
        }
        if (prev.length === 0) {
          return [
            defaultWelcomeMessage,
            {
              id: 1,
              text: inputMessage,
              isBot: false,
              timestamp: new Date()
            }
          ];
        }
      }
      // Conversation exists or already started
      return [
        ...prev,
        {
          id: prev.length + 1,
          text: inputMessage,
          isBot: false,
          timestamp: new Date()
        }
      ];
    });
    setInputMessage('');

    // Now handle conversation creation and backend calls
    if (!conversationId) {
      conversationId = 'temp';
      setSelectedConversationId('temp');
      isTempConv = true;
      setSendingFirstMessage(true);
    }

    try {
      if (isTempConv) {
        const newConv = await apiService.createConversation();
        await fetchConversationsList();
        setSelectedConversationId(newConv.id);
        conversationId = newConv.id;
      }
      // Send to backend and get bot response
      const botMsg = await apiService.addMessageToConversation(conversationId, inputMessage);
      // Animate bot response
      setAnimatingBot(true);
      setPendingBotMessage("");
      const fullText = botMsg.response;
      let currentText = "";
      let i = 0;
      const typeNext = async () => {
        if (i < fullText.length) {
          currentText += fullText[i];
          setPendingBotMessage(currentText);
          i++;
          setTimeout(typeNext, 18); // Typing speed
        } else {
          setMessages(prev => [...prev, {
            id: prev.length + 1,
            text: fullText,
            isBot: true,
            timestamp: new Date(botMsg.timestamp)
          }]);
          setPendingBotMessage(null);
          setAnimatingBot(false);
          setIsTyping(false);
          setLastUpdatedConvId(conversationId);
          setSendingFirstMessage(false); // Allow fetchMessages again
          await fetchConversationsList();
          await fetchMessages(conversationId);
          setTimeout(() => setLastUpdatedConvId(null), 900);
        }
      };
      typeNext();
    } catch (error) {
      setMessages(prev => [
        ...prev,
        { id: prev.length + 1, text: 'Sorry, there was an error.', isBot: true, timestamp: new Date() }
      ]);
      setIsTyping(false);
      setSendingFirstMessage(false);
    }
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

  // Determine assistant name based on role
  let assistantName = 'BrainBot Assistant';
  if (currentUser.role === 'support') assistantName = 'BrainBot PMI Assistant';
  else if (currentUser.role === 'consultant') assistantName = 'BrainBot FLEX Assistant';

  const handleDeleteConversation = async (id: string) => {
    try {
      await apiService.deleteConversation(id);
      await fetchConversationsList();
      // If the deleted conversation was selected, select another or clear
      if (selectedConversationId === id) {
        const updated = conversations.filter(c => c.id !== id);
        setSelectedConversationId(updated.length > 0 ? updated[0].id : '');
        setMessages([]);
      }
    } catch (err) {
      // Optionally show error
    }
  };

  // Animate conversation title letter by letter
  const animateTitle = (fullTitle: string) => {
    setIsAnimatingTitle(true);
    let current = "";
    let i = 0;
    const typeNext = () => {
      if (i < fullTitle.length) {
        current += fullTitle[i];
        setAnimatedTitle(current);
        i++;
        setTimeout(typeNext, 30); // Animation speed
      } else {
        setIsAnimatingTitle(false);
      }
    };
    typeNext();
  };

  // When the selected conversation changes, animate its title
  useEffect(() => {
    if (selectedConversationId) {
      const conv = conversations.find(c => c.id === selectedConversationId);
      if (conv) {
        animateTitle(conv.title || "Untitled");
      }
    } else {
      setAnimatedTitle("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConversationId, conversations]);

  return (
    <div className="chatbot-container">
      {notification && (
        <div className="chat-notification">
          {notification}
        </div>
      )}
      <div className="chatbot-sidebar">
        <div className="sidebar-header">
          <h3>Conversations</h3>
          <button className="new-chat-btn" onClick={handleNewChat}>New Chat</button>
        </div>
        <div className="conversations-list">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={`conversation-item${selectedConversationId === conv.id ? ' selected' : ''}`}
              onClick={() => handleSelectConversation(conv.id)}
            >
              <div className="conversation-title">
                {selectedConversationId === conv.id && isAnimatingTitle ? animatedTitle : conv.title || 'Untitled'}
              </div>
              <button
                className="delete-conv-btn"
                title="Delete conversation"
                onClick={e => { e.stopPropagation(); handleDeleteConversation(conv.id); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: 8 }}
              >
                <Trash2 size={16} color="#ef4444" />
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="chatbot-main">
        <div className="chatbot-main-card">
          <div className="chat-header">
            <div className="chat-header-content">
              <img src={timsoftLogo} alt="Timsoft Logo" style={{ width: '32px', height: '32px', marginRight: '8px', verticalAlign: 'middle' }} />
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }} aria-hidden="true"><path d="M12 8V4H8"></path><rect width="16" height="12" x="4" y="8" rx="2"></rect><path d="M2 14h2"></path><path d="M20 14h2"></path><path d="M15 13v2"></path><path d="M9 13v2"></path></svg>
              <div className="chat-info" style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                <h2 style={{ margin: 0 }}>{assistantName}</h2>
                <span className="chat-status">Online</span>
              </div>
            </div>
          </div>
          <div className="chat-messages" ref={messagesContainerRef} onScroll={handleScroll}>
            {messages.length > 0 && messages.map((message, idx) => {
              // Display timestamp above each user-bot pair (i.e., before user message)
              const isUser = !message.isBot;
              const showTimestamp = isUser || idx === 0;
              return (
                <React.Fragment key={message.id}>
                  {showTimestamp && (
                    <div className="message-timestamp" style={{ textAlign: 'center', color: '#64748b', fontSize: '0.85rem', margin: '0.5rem 0 0.2rem 0' }}>
                      {message.timestamp.toLocaleString()}
                    </div>
                  )}
                  <div className={`message ${message.isBot ? 'bot' : 'user'}`}>
                    <div className="message-avatar">
                      {message.isBot ? <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }} aria-hidden="true"><path d="M12 8V4H8"></path><rect width="16" height="12" x="4" y="8" rx="2"></rect><path d="M2 14h2"></path><path d="M20 14h2"></path><path d="M15 13v2"></path><path d="M9 13v2"></path></svg> : <span>{getUserInitials(currentUser.name)}</span>}
                    </div>
                    <div className="message-content">
                      <div className="message-text">
                        <ReactMarkdown>{message.text.replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\+/g, '\n')}</ReactMarkdown>
                      </div>
                      <div className="message-time">{formatTime(message.timestamp)}</div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
            {/* Animated bot message */}
            {pendingBotMessage && (
              <div className="message bot">
                <div className="message-avatar">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }} aria-hidden="true"><path d="M12 8V4H8"></path><rect width="16" height="12" x="4" y="8" rx="2"></rect><path d="M2 14h2"></path><path d="M20 14h2"></path><path d="M15 13v2"></path><path d="M9 13v2"></path></svg>
                </div>
                <div className="message-content">
                  <div className="message-text">{pendingBotMessage}</div>
                </div>
              </div>
            )}
            {isTyping && !animatingBot && (
              <div className="message bot typing">
                <div className="message-avatar">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }} aria-hidden="true"><path d="M12 8V4H8"></path><rect width="16" height="12" x="4" y="8" rx="2"></rect><path d="M2 14h2"></path><path d="M20 14h2"></path><path d="M15 13v2"></path><path d="M9 13v2"></path></svg>
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
            <div ref={messagesEndRef} />
            {showScrollButton && (
              <button 
                className="scroll-to-bottom-btn"
                onClick={scrollToBottom}
                title="Scroll to bottom"
                style={{
                  position: 'absolute',
                  bottom: '100px',
                  right: '20px',
                  width: '50px',
                  height: '50px',
                  background: '#2563eb',
                  color: 'white',
                  border: '3px solid #ffffff',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 12px rgba(37,99,235,0.4)',
                  zIndex: 100,
                  transition: 'opacity 0.3s ease, transform 0.3s ease'
                }}
              >
                ↓
              </button>
            )}
          </div>
          <div className="chat-input">
            <form onSubmit={handleSendMessage} className="input-form">
              <textarea
                value={inputMessage}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="💬 CLICK HERE TO TYPE YOUR MESSAGE - Press Enter to send..."
                className="message-input"
                rows={1}
                style={{ backgroundColor: '#ffffff' }}
              />
              <button type="submit" className="send-btn" disabled={!inputMessage.trim()}>
                <span style={{ width: '100%', height: '100%', textAlign: 'center', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', verticalAlign: 'middle', fontSize: '1.7rem', lineHeight: 1, color: 'white' }}>
                  →
                </span>
              </button>
            </form>
          </div>
        </div>
      </div>
      {/* Fallback input area - always visible */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: '260px',
        right: 0,
        background: '#f7fafd',
        padding: '1rem 1.5rem',
        borderTop: '1px solid #e5e7eb',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        minHeight: '80px'
      }}>
        <form onSubmit={handleSendMessage} style={{
          display: 'flex',
          gap: '0.7rem',
          alignItems: 'center',
          width: '100%',
          background: '#ffffff',
          borderRadius: '8px',
          padding: '0.5rem'
        }}>
          <textarea
            value={inputMessage}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="💬 CLICK HERE TO TYPE YOUR MESSAGE - Press Enter to send..."
            style={{
              flex: 1,
              padding: '0.7rem 1rem',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '1rem',
              background: 'white',
              color: '#1e293b',
              fontWeight: 500,
              resize: 'none',
              minHeight: '36px',
              maxHeight: '90px',
              width: '100%',
              outline: 'none'
            }}
            rows={1}
          />
          <button type="submit" disabled={!inputMessage.trim()} style={{
            width: '38px',
            height: '38px',
            background: '#2563eb',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.1rem'
          }}>
            <span style={{ fontSize: '1.7rem', lineHeight: 1 }}>→</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chatbot;