import React from 'react';
import { Landmark, Compass, Award } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="container section" id="about-page-container">
      <div className="section-header">
        <span className="badge">WHO WE ARE</span>
        <h1 className="section-title">About Our Mandala</h1>
        <p className="section-subtitle">A heritage of dedication, craftsmanship, and community service since 1974.</p>
      </div>

      <div className="grid grid-2 info-grid" style={{ alignItems: 'center', marginBottom: '60px' }}>
        <div className="about-text">
          <h3 style={{ fontSize: '28px', marginBottom: '16px' }}>Our Historical Context</h3>
          <p style={{ marginBottom: '16px', color: 'var(--color-text-muted)', fontSize: '16px', lineHeight: '1.7' }}>
            The Shree Sorathiya Prajapati Vikas Mandala was founded in Ahmedabad by visionary elders to unite, support, and uplift families originating from the Sorath region of Saurashtra, Gujarat. Historically recognized for their clay craftsmanship (pottery) and building architecture, the community has transitioned into modern trades, professions, and academic leadership.
          </p>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '16px', lineHeight: '1.7' }}>
            For over five decades, the Mandala has functioned as a central trust, maintaining community halls, guest hostels, organizing student scholarship guilds, and celebrating collective social milestones.
          </p>
        </div>
        <div className="about-visual">
          <div className="about-card-mock">
            <Landmark size={64} className="about-mock-icon" />
            <h4 style={{ fontFamily: 'var(--font-header)', fontSize: '20px', marginTop: '16px' }}>Ahmedabad Head Office</h4>
            <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginTop: '8px' }}>
              Established in 1974. Managing trust activities, facility reservations, and regional welfare councils.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-3 core-values">
        <div className="card card-primary value-card">
          <Compass className="value-icon" />
          <h3>Cultural Continuity</h3>
          <p>We respect and archive our ancestral histories, traditional pottery symbols, and lineages, ensuring they are shared with future generations.</p>
        </div>
        <div className="card card-secondary value-card">
          <Compass className="value-icon" />
          <h3>Educational Support</h3>
          <p>Through our annual scholarship drives and career counseling panels, we ensure every deserving student receives financial backing.</p>
        </div>
        <div className="card card-tertiary value-card">
          <Award className="value-icon" />
          <h3>Social Cohesion</h3>
          <p>We organize mass marriage events (Samuh Lagan), senior citizen welfare meets, and annual Navratri gatherings to maintain strong community bonds.</p>
        </div>
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
        .about-card-mock {
          background-color: var(--bg-sand-container);
          border: 1px dashed var(--color-outline);
          border-radius: var(--border-radius-xl);
          padding: 40px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          max-width: 380px;
          margin: 0 auto;
        }
        .about-mock-icon {
          color: var(--color-primary);
        }
        .value-card {
          text-align: left;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .value-icon {
          color: var(--color-primary);
        }
      `}</style>
    </div>
  );
};
