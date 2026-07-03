import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';

interface FooterProps {
  setActiveTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab }) => {
  const handleLinkClick = (tab: string) => {
    setActiveTab(tab);
    window.scrollTo(0, 0);
  };

  return (
    <footer className="footer-section">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand-col">
            <h3 className="footer-logo">SSPV Mandala</h3>
            <p className="footer-desc">
              Dedicated to the preservation of culture, community unity, and empowerment of the Shree Sorathiya Prajapati Vikas community.
            </p>
            <div className="social-links">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="social-icon" aria-label="Facebook">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="social-icon" aria-label="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="social-icon" aria-label="YouTube">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
              </a>
            </div>
          </div>

          <div className="footer-links-col">
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links-list">
              <li><a href="#home" onClick={(e) => { e.preventDefault(); handleLinkClick('home'); }}>Home</a></li>
              <li><a href="#about" onClick={(e) => { e.preventDefault(); handleLinkClick('about'); }}>About Us</a></li>
              <li><a href="#committee" onClick={(e) => { e.preventDefault(); handleLinkClick('committee'); }}>Committee</a></li>
              <li><a href="#booking" onClick={(e) => { e.preventDefault(); handleLinkClick('booking'); }}>Hall Booking</a></li>
              <li><a href="#events" onClick={(e) => { e.preventDefault(); handleLinkClick('events'); }}>Events</a></li>
              <li><a href="#history" onClick={(e) => { e.preventDefault(); handleLinkClick('history'); }}>Surnames History</a></li>
            </ul>
          </div>

          <div className="footer-contact-col">
            <h4 className="footer-heading">Contact Info</h4>
            <ul className="footer-contact-list">
              <li>
                <MapPin size={16} className="contact-icon-svg" />
                <span>SSPV Mandala Hall, Ashram Road, Near Riverfront, Ahmedabad, Gujarat 380009</span>
              </li>
              <li>
                <Phone size={16} className="contact-icon-svg" />
                <span>+91 79 2658 4829</span>
              </li>
              <li>
                <Mail size={16} className="contact-icon-svg" />
                <span>info@sorathiyaprajapati.org</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Shree Sorathiya Prajapati Vikas Mandala, Ahmedabad. All rights reserved.</p>
          <div className="footer-legal">
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
          </div>
        </div>
      </div>

      <style>{`
        .footer-section {
          background-color: var(--bg-sand-container-low);
          border-top: 1px solid var(--color-outline-variant);
          padding: 60px 0 30px 0;
          margin-top: auto;
        }
        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1.5fr;
          gap: 40px;
          margin-bottom: 40px;
        }
        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr;
            gap: 30px;
          }
        }
        .footer-logo {
          font-family: var(--font-header);
          font-size: 28px;
          color: var(--color-primary);
          margin-bottom: 16px;
        }
        .footer-desc {
          color: var(--color-text-muted);
          font-size: 15px;
          margin-bottom: 24px;
          line-height: 1.6;
        }
        .social-links {
          display: flex;
          gap: 12px;
        }
        .social-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: var(--border-radius-full);
          background-color: var(--bg-sand-lowest);
          border: 1px solid var(--color-outline-variant);
          color: var(--color-primary);
          transition: all 0.2s ease;
        }
        .social-icon:hover {
          background-color: var(--color-primary);
          color: var(--color-on-primary);
          transform: translateY(-2px);
        }
        .footer-heading {
          font-family: var(--font-header);
          font-size: 20px;
          color: var(--color-text-dark);
          margin-bottom: 20px;
          border-bottom: 2px solid var(--color-outline-variant);
          padding-bottom: 8px;
          display: inline-block;
        }
        .footer-links-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .footer-links-list a {
          color: var(--color-text-muted);
          font-size: 15px;
          text-decoration: none;
          transition: color 0.2s ease;
        }
        .footer-links-list a:hover {
          color: var(--color-primary);
        }
        .footer-contact-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .footer-contact-list li {
          display: flex;
          gap: 12px;
          color: var(--color-text-muted);
          font-size: 15px;
          line-height: 1.5;
        }
        .contact-icon-svg {
          flex-shrink: 0;
          color: var(--color-primary);
          margin-top: 3px;
        }
        .footer-bottom {
          border-top: 1px solid var(--color-outline-variant);
          padding-top: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: var(--color-text-muted);
          font-size: 14px;
        }
        @media (max-width: 768px) {
          .footer-bottom {
            flex-direction: column;
            gap: 12px;
            text-align: center;
          }
        }
        .footer-legal {
          display: flex;
          gap: 20px;
        }
        .footer-legal a {
          color: var(--color-text-muted);
          text-decoration: none;
        }
        .footer-legal a:hover {
          color: var(--color-primary);
        }
      `}</style>
    </footer>
  );
};
