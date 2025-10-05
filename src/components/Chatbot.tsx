import React, { useState, ChangeEvent, KeyboardEvent, FormEvent } from 'react';
import { Bot, Send, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import timsoftLogo from '../assets/timsoft.png';
import './Chatbot.css';

interface Message {
  id: number;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

interface ChatbotProps {
  currentUser: { name: string; email: string; role: string };
}

const getUserInitials = (name?: string) => {
  if (!name) return '';
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const Chatbot: React.FC<ChatbotProps> = ({ currentUser }) => {
  const navigate = useNavigate();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm BrainBot, your AI assistant. How can I help you today?",
      isBot: true,
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputMessage,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // FIXED: Changed URL to backend port 5050 and correct route /ask
      const response = await fetch('http://localhost:3000/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: inputMessage }),
      });

      const data = await response.json();

      const botResponse: Message = {
        id: messages.length + 2,
        text: data.answer || 'Sorry, something went wrong.',
        isBot: true,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      setMessages(prev => [
        ...prev,
        {
          id: messages.length + 2,
          text: 'Error contacting AI server.',
          isBot: true,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
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

  return (
    <div
      style={{
        height: '100vh',
        width: '100vw',
        backgroundColor: '#fff',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          maxWidth: 600,
          width: '100%',
          height: '80vh',
          borderRadius: 16,
          backgroundColor: '#f9faff',
          boxShadow: '0 6px 20px rgba(0, 123, 255, 0.15)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '16px 24px',
            borderBottom: '2px solid #007bff',
            backgroundColor: '#e7f1ff',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          }}
        >
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              marginRight: 12,
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              color: '#007bff',
            }}
            aria-label="Back to Home"
          >
            <ArrowLeft size={24} />
          </button>

          {timsoftLogo && (
            <img
              src={timsoftLogo}
              alt="Timsoft Logo"
              style={{ width: 36, height: 36, marginRight: 12 }}
            />
          )}
          <Bot size={28} color="#007bff" />
          <h2 style={{ marginLeft: 12, color: '#007bff', fontWeight: 700 }}>
            BrainBot Assistant
          </h2>
          <span
            style={{
              marginLeft: 'auto',
              color: '#28a745',
              fontWeight: '600',
              fontSize: 14,
              backgroundColor: '#d4edda',
              padding: '6px 14px',
              borderRadius: 20,
              boxShadow: '0 0 6px #28a745aa',
            }}
          >
            Online
          </span>
        </div>

        {/* Messages */}
        <div
          className="chat-messages"
          style={{
            flexGrow: 1,
            overflowY: 'auto',
            padding: 16,
            backgroundColor: 'white',
            borderRadius: '0 0 16px 16px',
            border: '1px solid #007bff',
            margin: '12px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          {messages.map(message => (
            <div
              key={message.id}
              style={{
                alignSelf: message.isBot ? 'flex-start' : 'flex-end',
                maxWidth: '75%',
                backgroundColor: message.isBot ? '#e5e5ea' : '#007bff',
                color: message.isBot ? '#000' : '#fff',
                padding: '10px 14px',
                borderRadius: 16,
                boxShadow: '0 2px 5px rgb(0 0 0 / 0.1)',
                wordBreak: 'break-word',
              }}
            >
              <div>{message.text}</div>
              <div
                style={{
                  fontSize: 10,
                  textAlign: 'right',
                  marginTop: 4,
                  opacity: 0.6,
                }}
              >
                {formatTime(message.timestamp)}
              </div>
            </div>
          ))}

          {isTyping && (
            <div
              style={{
                fontStyle: 'italic',
                color: 'gray',
                marginTop: 8,
              }}
            >
              BrainBot is typing...
            </div>
          )}
        </div>

        {/* Input */}
        <form
          onSubmit={handleSendMessage}
          style={{
            display: 'flex',
            padding: '0 24px 24px',
            gap: 8,
            alignItems: 'center',
          }}
        >
          <textarea
            value={inputMessage}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
              setInputMessage(e.target.value)
            }
            onKeyPress={handleKeyPress}
            placeholder="Type your message here..."
            rows={2}
            style={{
              flexGrow: 1,
              resize: 'none',
              padding: 12,
              fontSize: 14,
              borderRadius: 12,
              border: '1px solid #007bff',
              boxShadow: 'inset 0 2px 6px rgb(0 0 0 / 0.1)',
            }}
          />
          <button
            type="submit"
            disabled={!inputMessage.trim()}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: 12,
              cursor: inputMessage.trim() ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chatbot;
