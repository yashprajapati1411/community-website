import React from 'react';
import { Eye, Target, Flag } from 'lucide-react';

export const VisionMissionGoals: React.FC = () => {
  const pillars = [
    {
      title: 'Vision',
      description: 'To foster a united, prosperous, and culturally vibrant community that honors its traditional roots while embracing future possibilities and educational advancement.',
      icon: <Eye size={24} />,
      classType: 'card-primary',
    },
    {
      title: 'Mission',
      description: 'Providing steadfast social support, specialized education infrastructure, and an accessible digital platform for cohesion and directory mapping across generations.',
      icon: <Target size={24} />,
      classType: 'card-secondary',
    },
    {
      title: 'Goals',
      description: 'Expand youth mentorship councils, double the reach of medical/educational welfare funds, and optimize our community spaces (halls/hostels) for seamless use.',
      icon: <Flag size={24} />,
      classType: 'card-tertiary',
    },
  ];

  return (
    <section className="section pillars-section" id="vision-mission-goals">
      <div className="container">
        <div className="section-header">
          <span className="badge">OUR ANCHORS</span>
          <h2 className="section-title">Our Guiding Pillars</h2>
          <p className="section-subtitle">The enduring values and objectives that direct our community's growth and support services.</p>
        </div>

        <div className="grid grid-3">
          {pillars.map((pillar, index) => (
            <div key={index} className={`card ${pillar.classType} bento-card`} id={`pillar-${pillar.title.toLowerCase()}`}>
              <div className="icon-wrapper">
                {pillar.icon}
              </div>
              <h3 className="card-title">{pillar.title}</h3>
              <p className="card-desc">{pillar.description}</p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .pillars-section {
          background-color: var(--bg-sand);
        }
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
        .bento-card {
          display: flex;
          flex-direction: column;
          gap: 16px;
          text-align: left;
        }
        .icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 52px;
          height: 52px;
          border-radius: var(--border-radius-full);
          background-color: var(--bg-sand-container);
          color: var(--color-primary);
        }
        #pillar-vision .icon-wrapper {
          background-color: var(--bg-sand-container);
          color: var(--color-primary);
        }
        #pillar-mission .icon-wrapper {
          background-color: var(--color-secondary-container);
          color: var(--color-secondary);
        }
        #pillar-goals .icon-wrapper {
          background-color: var(--color-tertiary-container);
          color: var(--color-tertiary);
        }
        .card-title {
          font-size: 24px;
          margin-bottom: 8px;
        }
        .card-desc {
          color: var(--color-text-muted);
          font-family: var(--font-body);
          font-size: 15px;
          line-height: 1.6;
          flex-grow: 1;
        }
      `}</style>
    </section>
  );
};
