import React from 'react';
import Navbar from './Navbar';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
  currentUser: { name: string; email: string; role: string };
}

const Layout: React.FC<LayoutProps> = ({ children, onLogout, currentUser }) => {
  return (
    <div className="main-layout">
      <Navbar onLogout={onLogout} currentUser={currentUser} />
      <main className="layout-content">
        {children}
      </main>
    </div>
  );
};

export default Layout; 