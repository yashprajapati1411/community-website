import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar, Heart } from 'lucide-react';
import { publicService } from '../services/publicService';
import type { NoticeResponse } from '../services/publicService';

export const Marquee: React.FC = () => {
  const [notices, setNotices] = useState<NoticeResponse[]>([]);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const data = await publicService.getNotices();
        setNotices(data);
      } catch (err) {
        console.error('Failed to load marquee notices:', err);
      }
    };
    fetchNotices();
  }, []);

  const items = notices.length > 0 
    ? notices.map(n => ({
        text: `${n.title} ${n.description ? `- ${n.description}` : ''}`,
        icon: n.priority === 'high' ? <Sparkles size={16} /> : n.priority === 'medium' ? <Calendar size={16} /> : <Heart size={16} />
      }))
    : [{ text: 'Welcome to Shree Sorathiya Prajapati Vikas Mandala - Community Portal & Events', icon: <Sparkles size={16} /> }];

  return (
    <div className="marquee-wrapper" id="marquee-ticker">
      <div className="marquee-content">
        {/* Render twice for seamless infinite loop scroll */}
        {[...items, ...items].map((item, idx) => (
          <div key={idx} className="marquee-item">
            <span className="marquee-icon">{item.icon}</span>
            <span className="marquee-text">{item.text}</span>
            <span className="marquee-divider">•</span>
          </div>
        ))}
      </div>

      <style>{`
        .marquee-wrapper {
          background-color: var(--bg-sand-container-high);
          border-y: 1px solid var(--color-outline-variant);
          padding: 14px 0;
          overflow: hidden;
          position: relative;
          white-space: nowrap;
          width: 100%;
        }
        .marquee-content {
          display: inline-flex;
          align-items: center;
          animation: scrollMarquee 30s linear infinite;
        }
        .marquee-content:hover {
          animation-play-state: paused;
        }
        .marquee-item {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 0 20px;
        }
        .marquee-icon {
          display: flex;
          align-items: center;
          color: var(--color-primary);
        }
        .marquee-text {
          font-family: var(--font-body);
          font-weight: 600;
          font-size: 14px;
          color: var(--color-text-dark);
        }
        .marquee-divider {
          color: var(--color-outline-variant);
          margin-left: 20px;
          font-weight: bold;
        }
        @keyframes scrollMarquee {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-50%, 0, 0);
          }
        }
      `}</style>
    </div>
  );
};
