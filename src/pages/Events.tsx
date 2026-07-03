import React from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';

export const Events: React.FC = () => {
  const upcomingEvents = [
    {
      title: 'Annual Samuh Lagan (Mass Marriage)',
      date: 'December 24, 2026',
      time: '08:00 AM onwards',
      location: 'SSPV Grand Hall, Ahmedabad',
      desc: 'Our signature annual initiative assisting young couples in starting their lives with shared community support. Registration is open.',
    },
    {
      title: 'Navratri Garba Mahotsav',
      date: 'October 10 - 18, 2026',
      time: '08:30 PM to 12:00 AM',
      location: 'SSPV Courtyard Garden, Ahmedabad',
      desc: 'Nine nights of traditional Garba and Dandiya Raas, celebrating our community heritage with music, awards, and food stalls.',
    },
    {
      title: 'Educational Scholarship Assembly',
      date: 'August 15, 2026',
      time: '10:00 AM to 01:00 PM',
      location: 'SSPV Seminar Hall, Ahmedabad',
      desc: 'Distributing annual merit scholarships to high-achieving students of the Sorathiya Prajapati community. Guest speech by senior academics.',
    },
  ];

  return (
    <div className="container section" id="events-page-container">
      <div className="section-header">
        <span className="badge">COMMUNITY FORUMS</span>
        <h1 className="section-title">Mandala Events</h1>
        <p className="section-subtitle">Stay connected with our upcoming gatherings, educational drives, and seasonal celebrations.</p>
      </div>

      <div className="events-timeline" id="events-list">
        {upcomingEvents.map((evt, idx) => (
          <article key={idx} className="event-timeline-card card" id={`event-card-${idx}`}>
            <div className="event-date-badge">
              <Calendar size={18} style={{ color: 'var(--color-primary)' }} />
              <span>{evt.date}</span>
            </div>
            <div className="event-timeline-content">
              <h3>{evt.title}</h3>
              <div className="event-meta-info">
                <span className="meta-item">
                  <Clock size={14} />
                  {evt.time}
                </span>
                <span className="meta-item">
                  <MapPin size={14} />
                  {evt.location}
                </span>
              </div>
              <p className="event-description">{evt.desc}</p>
              <button className="btn btn-outline" style={{ marginTop: '16px', padding: '8px 20px' }}>
                Register for Event
              </button>
            </div>
          </article>
        ))}
      </div>

      <style>{`
        .badge {
          display: inline-block;
          font-family: var(--font-body);
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: var(--color-primary);
          background-color: var(--bg-sand-container);
          padding: 6px 16px;
          border-radius: var(--border-radius-full);
          margin-bottom: 12px;
          border: 1px solid var(--color-outline-variant);
        }
        .events-timeline {
          max-width: 800px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .event-timeline-card {
          display: flex;
          gap: 30px;
          padding: 30px;
          text-align: left;
          align-items: flex-start;
        }
        @media (max-width: 768px) {
          .event-timeline-card {
            flex-direction: column;
            gap: 16px;
          }
        }
        .event-date-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          background-color: var(--bg-sand-low);
          padding: 8px 16px;
          border-radius: var(--border-radius-md);
          font-family: var(--font-body);
          font-weight: 600;
          font-size: 14px;
          color: var(--color-text-dark);
          border: 1px solid var(--color-outline-variant);
          flex-shrink: 0;
        }
        .event-timeline-content h3 {
          font-size: 24px;
          margin-bottom: 8px;
          color: var(--color-text-dark);
        }
        .event-meta-info {
          display: flex;
          gap: 20px;
          font-family: var(--font-body);
          font-size: 13px;
          color: var(--color-text-muted);
          margin-bottom: 14px;
          flex-wrap: wrap;
        }
        .meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .event-description {
          font-family: var(--font-body);
          font-size: 15px;
          line-height: 1.6;
          color: var(--color-text-muted);
        }
      `}</style>
    </div>
  );
};
