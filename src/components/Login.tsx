import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import timsoftLogo from '../assets/timsoft.png';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: verificationCode })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        localStorage.setItem("user", JSON.stringify(data.user));
        // Check if user came from opinion sign-in
        const redirectFlag = localStorage.getItem("opinionSignIn");
        if (redirectFlag === "true") {
          localStorage.removeItem("opinionSignIn");
          navigate("/");
        } else if (data.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/chatbot');
        }
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Server error. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <button onClick={() => navigate('/')} className="back-to-landing-btn">
          <ArrowLeft size={16} /> Back
        </button>

        <div className="login-header">
          <div className="login-logo">
            <img src={timsoftLogo} alt="Timsoft" className="timsoft-logo" />
            <span>BrainBot</span>
          </div>
          <h1 className="login-title">Welcome to BrainBot</h1>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="verificationCode">Verification Code</label>
            <div className="password-field-container">
              <input
                type={showPassword ? 'text' : 'password'}
                name="verificationCode"
                value={verificationCode}
                onChange={e => setVerificationCode(e.target.value)}
                required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
