import React from 'react';
import { Marquee } from '../components/Marquee';
import { VisionMissionGoals } from '../components/VisionMissionGoals';
import { Users, Award, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

interface HomeProps {
  setActiveTab: (tab: string) => void;
}

export const Home: React.FC<HomeProps> = ({ setActiveTab }) => {
  const stats = [
    { number: '5,000+', label: 'Registered Families', sub: 'United across India & Abroad', icon: <Users size={24} /> },
    { number: '50+', label: 'Years of Legacy', sub: 'A history of service and unity', icon: <Award size={24} /> },
    { number: '12+', label: 'Annual Cultural Initiatives', sub: 'Empowering growth & preservation', icon: <Calendar size={24} /> },
  ];

  return (
    <div className="home-page" id="home-page-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="container hero-container-centered">
          <motion.div 
            className="hero-content-centered"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.span 
              className="hero-badge"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Welcome to our community
            </motion.span>
            
            <motion.h1 
              className="hero-title-large"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Stewardship, Heritage, and Connection
            </motion.h1>
            
            <motion.p 
              className="hero-desc-centered"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              Empowering the Shree Sorathiya Prajapati Vikas community through unity, cultural preservation, and collective progress.
            </motion.p>
            
            <motion.div 
              className="hero-actions-centered"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <button 
                className="btn btn-primary"
                onClick={() => setActiveTab('portal')}
                id="hero-join-btn"
                style={{ padding: '14px 32px', fontSize: '15px' }}
              >
                Join Our Mandala
              </button>
              <button 
                className="btn btn-hero-outline"
                onClick={() => setActiveTab('events')}
                id="hero-events-btn"
                style={{ padding: '14px 32px', fontSize: '15px' }}
              >
                Explore Events
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Floating Statistics Strip */}
      <motion.div 
        className="floating-stats-wrapper"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        <div className="container">
          <div className="floating-stats-card">
            <div className="floating-stat-item">
              <span className="floating-stat-num">5000+</span>
              <span className="floating-stat-lbl">Families</span>
            </div>
            <div className="floating-stat-divider"></div>
            <div className="floating-stat-item">
              <span className="floating-stat-num">50+</span>
              <span className="floating-stat-lbl">Years of Service</span>
            </div>
            <div className="floating-stat-divider"></div>
            <div className="floating-stat-item">
              <span className="floating-stat-num">12</span>
              <span className="floating-stat-lbl">Active Programs</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Continuously Scrolling Events Marquee */}
      <Marquee />

      {/* Vision, Mission, Goals Grid */}
      <VisionMissionGoals />

      {/* Quick Statistics Section */}
      <section className="section stats-section" id="stats-indicators">
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, idx) => (
              <div key={idx} className="stat-card" id={`stat-card-${idx}`}>
                <div className="stat-icon">{stat.icon}</div>
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
                <div className="stat-sub">{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        .hero-section {
          position: relative;
          min-height: 520px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-image: url('https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&q=80&w=1800');
          background-size: cover;
          background-position: center;
          padding: 100px 0;
          color: white;
          text-align: center;
        }
        
        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(44, 22, 14, 0.45) 0%, rgba(44, 22, 14, 0.65) 100%);
          z-index: 1;
        }
        
        .hero-container-centered {
          position: relative;
          z-index: 2;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        
        .hero-content-centered {
          max-width: 800px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }
        
        .hero-badge {
          background-color: rgba(255, 255, 255, 0.9);
          color: var(--color-primary);
          font-family: var(--font-body);
          font-weight: 700;
          font-size: 13px;
          letter-spacing: 1px;
          text-transform: uppercase;
          padding: 8px 20px;
          border-radius: var(--border-radius-full);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        .hero-title-large {
          font-family: var(--font-header);
          font-size: 54px;
          font-weight: 700;
          line-height: 1.15;
          color: white;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
          margin-bottom: 8px;
        }
        
        @media (max-width: 768px) {
          .hero-title-large {
            font-size: 38px;
          }
          .hero-section {
            min-height: 450px;
            padding: 80px 0;
          }
        }
        
        .hero-desc-centered {
          font-family: var(--font-body);
          font-size: 18px;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.95);
          text-shadow: 0 1px 5px rgba(0, 0, 0, 0.2);
          max-width: 650px;
          margin-bottom: 12px;
        }
        
        @media (max-width: 768px) {
          .hero-desc-centered {
            font-size: 15px;
          }
        }
        
        .hero-actions-centered {
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
        }
        
        .btn-hero-outline {
          background-color: rgba(255, 255, 255, 0.15);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.5);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-family: var(--font-body);
          font-weight: 600;
          font-size: 14px;
          border-radius: var(--border-radius-full);
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          text-decoration: none;
        }
        
        .btn-hero-outline:hover {
          background-color: white;
          color: var(--color-primary);
          border-color: white;
          transform: translateY(-2px);
          box-shadow: var(--shadow-premium);
        }
        
        /* Floating Stats Styling */
        .floating-stats-wrapper {
          position: relative;
          z-index: 10;
          margin-top: -45px;
          margin-bottom: 25px;
        }
        
        .floating-stats-card {
          background-color: var(--bg-sand-lowest);
          border-radius: var(--border-radius-full);
          border: 1px solid var(--color-outline-variant);
          box-shadow: var(--shadow-premium);
          display: flex;
          justify-content: space-around;
          align-items: center;
          padding: 18px 40px;
          max-width: 860px;
          margin: 0 auto;
        }
        
        @media (max-width: 768px) {
          .floating-stats-wrapper {
            margin-top: -30px;
            padding: 0 15px;
          }
          .floating-stats-card {
            border-radius: var(--border-radius-lg);
            flex-direction: column;
            gap: 16px;
            padding: 20px;
          }
          .floating-stat-divider {
            display: none;
          }
        }
        
        .floating-stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .floating-stat-num {
          font-family: var(--font-header);
          font-size: 32px;
          font-weight: 700;
          color: var(--color-primary);
          line-height: 1.2;
        }
        
        .floating-stat-lbl {
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 700;
          color: var(--color-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .floating-stat-divider {
          height: 36px;
          width: 1px;
          background-color: var(--color-outline-variant);
        }
        
        /* Stats Styling */
        .stats-section {
          background-color: var(--bg-sand-lowest);
          border-y: 1px solid var(--color-outline-variant);
          padding: 60px 0;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--gutter);
          text-align: center;
        }
        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }
        }
        .stat-card {
          padding: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .stat-icon {
          width: 50px;
          height: 50px;
          border-radius: var(--border-radius-full);
          background-color: var(--bg-sand-low);
          color: var(--color-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }
        .stat-number {
          font-family: var(--font-header);
          font-size: 44px;
          color: var(--color-primary);
          font-weight: 700;
          margin-bottom: 8px;
        }
        .stat-label {
          font-family: var(--font-body);
          font-weight: 700;
          font-size: 16px;
          color: var(--color-text-dark);
          margin-bottom: 4px;
        }
        .stat-sub {
          font-family: var(--font-body);
          font-size: 14px;
          color: var(--color-text-muted);
        }
      `}</style>
    </div>
  );
};
