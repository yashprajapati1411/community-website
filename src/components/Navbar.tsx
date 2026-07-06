import React, { useState } from 'react';
import { Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isLoggedIn?: boolean;
  setIsLoggedIn?: (login: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About Us' },
    { id: 'committee', label: 'Committee' },
    { id: 'booking', label: 'Booking' },
    { id: 'events', label: 'Events' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'history', label: 'History' },
    { id: 'portal', label: 'Members Portal' },
  ];

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
    window.scrollTo(0, 0);
  };

  const handleLoginToggle = async () => {
    if (isAuthenticated) {
      await logout();
      setActiveTab('home');
    } else {
      setActiveTab('portal');
    }
    setMobileMenuOpen(false);
    window.scrollTo(0, 0);
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <a 
          href="#home" 
          className="navbar-brand" 
          onClick={(e) => { e.preventDefault(); handleNavClick('home'); }}
          id="nav-brand-logo"
        >
          <span>SSPV MANDALA</span>
          <span className="navbar-brand-sub">Heritage Earth</span>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="desktop-nav">
          <ul className="navbar-links">
            {navItems.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className={item.id === 'portal' ? `navbar-portal-btn ${activeTab === 'portal' ? 'active' : ''}` : `navbar-link ${activeTab === item.id ? 'active' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(item.id);
                  }}
                  id={`nav-link-${item.id}`}
                >
                  {item.id === 'portal' ? (isAuthenticated ? 'Member Portal' : 'Member Login') : item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Desktop Logout Button */}
        {isAuthenticated && (
          <div className="md-flex-desktop">
            <button 
              className="btn btn-outline"
              onClick={handleLoginToggle}
              id="login-btn-desktop"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '14px', marginLeft: '12px' }}
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        )}

        {/* Mobile Menu Icon */}
        <button 
          className="mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Menu"
          id="mobile-nav-toggle"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Sidebar/Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-menu">
          <ul className="mobile-menu-links">
            {navItems.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className={item.id === 'portal' ? `mobile-portal-btn ${activeTab === 'portal' ? 'active' : ''}` : `mobile-menu-link ${activeTab === item.id ? 'active' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(item.id);
                  }}
                  id={`mobile-nav-link-${item.id}`}
                >
                  {item.id === 'portal' ? (isAuthenticated ? 'Member Portal' : 'Member Login') : item.label}
                </a>
              </li>
            ))}
            {isAuthenticated && (
              <li style={{ marginTop: '20px' }}>
                <button 
                  className="btn btn-outline" 
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  onClick={handleLoginToggle}
                  id="login-btn-mobile"
                >
                  <LogOut size={16} /> Logout
                </button>
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Extra styles for Navigation layout since we are using Vanilla CSS */}
      <style>{`
        .desktop-nav {
          display: flex;
          align-items: center;
        }
        .mobile-toggle {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          color: var(--color-primary);
        }
        .md-flex-desktop {
          display: flex;
        }
        .mobile-menu {
          position: absolute;
          top: 80px;
          left: 0;
          width: 100%;
          background-color: var(--bg-sand);
          border-bottom: 1px solid var(--color-outline-variant);
          padding: 20px;
          box-shadow: var(--shadow-premium);
          z-index: 99;
          animation: slideDown 0.25s ease-out;
        }
        .mobile-menu-links {
          display: flex;
          flex-direction: column;
          gap: 16px;
          list-style: none;
        }
        .mobile-menu-link {
          font-family: var(--font-body);
          font-size: 16px;
          font-weight: 500;
          color: var(--color-text-muted);
          text-decoration: none;
          display: block;
          padding: 10px 14px;
          border-radius: var(--border-radius-md);
        }
        .mobile-menu-link.active, .mobile-menu-link:hover {
          color: var(--color-primary);
          background-color: var(--bg-sand-container);
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .navbar-portal-btn {
          background-color: var(--color-primary);
          color: white !important;
          font-family: var(--font-body);
          font-weight: 600;
          font-size: 14px;
          padding: 8px 20px;
          border-radius: var(--border-radius-full);
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(159, 64, 45, 0.2);
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          margin-left: 12px;
          border: 1px solid var(--color-primary);
        }
        .navbar-portal-btn:hover {
          background-color: var(--color-primary-container);
          border-color: var(--color-primary-container);
          transform: translateY(-2px);
          box-shadow: 0 6px 14px rgba(159, 64, 45, 0.35);
        }
        .navbar-portal-btn.active {
          background-color: var(--color-primary-container);
          border-color: var(--color-primary-container);
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .mobile-portal-btn {
          background-color: var(--color-primary);
          color: white !important;
          font-family: var(--font-body);
          font-weight: 600;
          font-size: 15px;
          padding: 10px 14px;
          border-radius: var(--border-radius-full);
          text-decoration: none;
          display: block;
          text-align: center;
          box-shadow: 0 4px 10px rgba(159, 64, 45, 0.2);
          transition: all 0.25s ease;
          margin-top: 10px;
        }
        .mobile-portal-btn:hover, .mobile-portal-btn.active {
          background-color: var(--color-primary-container);
        }

        @media (max-width: 1024px) {
          .navbar-links {
            display: none;
          }
          .md-flex-desktop {
            display: none;
          }
          .mobile-toggle {
            display: block;
          }
        }
      `}</style>
    </header>
  );
};
