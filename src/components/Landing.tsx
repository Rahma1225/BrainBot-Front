import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Bot, Zap, Users, ArrowRight, Menu, X } from 'lucide-react';
import timsoftLogo from '../assets/timsoft.png';
import './Landing.css';

const Landing: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');
  };

  const features = [
    {
      icon: <Bot className="feature-icon" />,
      title: 'AI-Powered Conversations',
      description: 'Experience natural conversations with our advanced AI chatbot that understands context and provides intelligent responses.'
    },
    {
      icon: <Zap className="feature-icon" />,
      title: 'Lightning Fast',
      description: 'Get instant responses with our optimized AI engine that processes queries in milliseconds.'
    },
    {
      icon: <Users className="feature-icon" />,
      title: 'Multi-User Support',
      description: 'Perfect for teams and businesses. Manage multiple users and conversations efficiently.'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Marketing Manager',
      content: 'This chatbot has revolutionized our customer support. Response times improved by 80%.',
      avatar: '👩‍💼'
    },
    {
      name: 'Mike Chen',
      role: 'Startup Founder',
      content: 'The AI is incredibly intelligent. It handles complex queries that used to require human intervention.',
      avatar: '👨‍💻'
    },
    {
      name: 'Emily Davis',
      role: 'Customer Success',
      content: 'Our customers love the instant responses. It\'s like having a support team available 24/7.',
      avatar: '👩‍🎓'
    }
  ];

  return (
    <div className="landing-container">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-content">
          <div className="nav-logo">
            <img src={timsoftLogo} alt="Timsoft" className="timsoft-logo" />
            <span>BrainBot</span>
          </div>
          <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
            <a href="#features">Features</a>
            <a href="#testimonials">Testimonials</a>
            <button className="nav-login-btn" onClick={handleLoginClick}>
              Sign In
            </button>
          </div>
          <button 
            className="mobile-menu-btn"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              The Future of
              <span className="gradient-text"> Conversations</span>
            </h1>
            <p className="hero-description">
              Experience the next generation of AI-powered chatbots. Intelligent, fast, and secure conversations that transform how you interact with technology.
            </p>
            <div className="hero-buttons">
              <button className="primary-btn" onClick={handleLoginClick}>
                Get Started
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
          <div className="hero-visual">
            <div className="chat-demo">
              <div className="chat-header">
                <div className="chat-avatar">
                  <Bot size={20} />
                </div>
                <span>AI Assistant</span>
              </div>
              <div className="chat-messages">
                <div className="message bot-message">
                  Hello! How can I help you today?
                </div>
                <div className="message user-message">
                  Can you help me with customer support?
                </div>
                <div className="message bot-message">
                  Absolutely! I can handle inquiries, provide solutions, and escalate when needed. What's your question?
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="container">
          <div className="section-header">
            <h2>Why Choose Our BrainBot?</h2>
            <p>Powerful features that make conversations meaningful and efficient</p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon-container">
                  {feature.icon}
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Testimonials Section */}
      <section id="testimonials" className="testimonials-section">
        <div className="container">
          <div className="section-header">
            <h2>What Our Users Say</h2>
            <p>Join thousands of satisfied customers worldwide</p>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="testimonial-content">
                  <p>"{testimonial.content}"</p>
                </div>
                <div className="testimonial-author">
                  <div className="author-avatar">{testimonial.avatar}</div>
                  <div className="author-info">
                    <h4>{testimonial.name}</h4>
                    <span>{testimonial.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <div className="footer-logo">
                <img src={timsoftLogo} alt="Timsoft" className="timsoft-logo" />
                <span>BrainBot by Timsoft</span>
              </div>
              <p>Revolutionizing conversations with AI-powered intelligence.</p>
            </div>
            <div className="footer-section">
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#integrations">Integrations</a>
            </div>
            <div className="footer-section">
              <h4>Company</h4>
              <a href="#about">About</a>
              <a href="#blog">Blog</a>
              <a href="#careers">Careers</a>
            </div>
            <div className="footer-section">
              <h4>Support</h4>
              <a href="#help">Help Center</a>
              <a href="#contact">Contact</a>
              <a href="#status">Status</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 BrainBot by Timsoft. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing; 