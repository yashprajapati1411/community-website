import React from 'react';
import { Shield, Users } from 'lucide-react';

export const Committee: React.FC = () => {
  const executives = [
    {
      name: 'Shri Rameshbhai Prajapati',
      role: 'President',
      experience: '30+ Years of Public Service',
      description: 'Steward of community heritage, guiding the trust with dedication to cultural preservation and integration of youth services.',
      initials: 'RP',
      color: 'var(--color-primary)',
    },
    {
      name: 'Smt. Bhavnaben Patel',
      role: 'Vice President',
      experience: '20+ Years of Welfare Focus',
      description: 'Focusing on women welfare modules, educational trusts, and organizing student advancement seminars.',
      initials: 'BP',
      color: 'var(--color-secondary)',
    },
    {
      name: 'Shri Dineshbhai Mistry',
      role: 'General Secretary',
      experience: '15+ Years in Operations',
      description: 'Ensuring seamless operations of booking, communications, database administration, and outreach programs.',
      initials: 'DM',
      color: 'var(--color-tertiary)',
    },
  ];

  const generalMembers = [
    { name: 'Amitbhai Prajapati', role: 'Cultural Coordinator', dept: 'Festivals & Samuh Lagan' },
    { name: 'Geetaben Solanki', role: 'Welfare Head', dept: 'Medical & Scholarship Funds' },
    { name: 'Rajeshbhai Chavda', role: 'Treasurer', dept: 'Audits & Asset Management' },
    { name: 'Snehaben Parmar', role: 'Events Manager', dept: 'Hall Booking Coordinator' },
    { name: 'Kantibhai Rathod', role: 'Advisory Board Member', dept: 'Legal & Heritage Counsel' },
    { name: 'Nitinbhai Vaghela', role: 'IT & Communications Head', dept: 'Digital Directory & Portal' },
  ];

  return (
    <div className="container section" id="committee-page-container">
      <div className="section-header">
        <span className="badge">LEADERSHIP BOARD</span>
        <h1 className="section-title">Current Committee</h1>
        <p className="section-subtitle">Meet the visionary leaders who guide SSPV Mandala with integrity, transparency, and a commitment to progress.</p>
      </div>

      {/* Executive Council */}
      <div className="executive-section" style={{ marginBottom: '60px' }}>
        <h2 className="sub-title">Executive Officers</h2>
        <div className="grid grid-3">
          {executives.map((exec, idx) => (
            <div key={idx} className="card card-primary exec-card" id={`exec-${idx}`}>
              <div className="avatar-large" style={{ backgroundColor: exec.color }}>
                <span>{exec.initials}</span>
              </div>
              <h3 className="exec-name">{exec.name}</h3>
              <p className="exec-role">{exec.role}</p>
              <p className="exec-exp">
                <Shield size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                {exec.experience}
              </p>
              <p className="exec-desc">{exec.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* General Committee Members */}
      <div className="general-section">
        <h2 className="sub-title">Committee Departments</h2>
        <div className="grid grid-3">
          {generalMembers.map((member, idx) => (
            <div key={idx} className="member-card-mini" id={`member-${idx}`}>
              <div className="member-icon-mini">
                <Users size={18} />
              </div>
              <div className="member-info-mini">
                <h4 className="member-name-mini">{member.name}</h4>
                <p className="member-role-mini">{member.role}</p>
                <span className="member-dept-badge">{member.dept}</span>
              </div>
            </div>
          ))}
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
        .sub-title {
          font-size: 28px;
          text-align: center;
          margin-bottom: 36px;
          color: var(--color-text-dark);
          position: relative;
        }
        .exec-card {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 32px 24px;
        }
        .avatar-large {
          width: 100px;
          height: 100px;
          border-radius: var(--border-radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-family: var(--font-header);
          font-size: 32px;
          font-weight: bold;
          margin-bottom: 20px;
          box-shadow: var(--shadow-atmospheric);
          border: 4px solid var(--bg-sand-lowest);
        }
        .exec-name {
          font-size: 22px;
          margin-bottom: 6px;
        }
        .exec-role {
          font-family: var(--font-body);
          font-weight: 700;
          font-size: 13px;
          text-transform: uppercase;
          color: var(--color-primary);
          letter-spacing: 1px;
          margin-bottom: 8px;
        }
        .exec-exp {
          font-family: var(--font-body);
          font-size: 13px;
          color: var(--color-text-muted);
          background-color: var(--bg-sand-low);
          padding: 4px 12px;
          border-radius: var(--border-radius-full);
          margin-bottom: 16px;
          border: 1px solid var(--color-outline-variant);
        }
        .exec-desc {
          font-family: var(--font-body);
          font-size: 14px;
          line-height: 1.6;
          color: var(--color-text-muted);
        }
        
        .member-card-mini {
          background-color: var(--bg-sand-lowest);
          border: 1px solid rgba(221, 192, 186, 0.3);
          border-radius: var(--border-radius-lg);
          padding: 20px;
          display: flex;
          gap: 16px;
          align-items: flex-start;
          box-shadow: var(--shadow-atmospheric);
          transition: all 0.25s ease;
        }
        .member-card-mini:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-premium);
          border-color: var(--color-outline-variant);
        }
        .member-icon-mini {
          width: 40px;
          height: 40px;
          border-radius: var(--border-radius-full);
          background-color: var(--bg-sand-low);
          color: var(--color-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .member-info-mini {
          text-align: left;
        }
        .member-name-mini {
          font-size: 18px;
          margin-bottom: 4px;
          color: var(--color-text-dark);
        }
        .member-role-mini {
          font-family: var(--font-body);
          font-size: 13px;
          color: var(--color-text-muted);
          margin-bottom: 8px;
        }
        .member-dept-badge {
          display: inline-block;
          font-family: var(--font-body);
          font-size: 11px;
          font-weight: 600;
          background-color: var(--color-secondary-container);
          color: var(--color-on-secondary-container);
          padding: 3px 8px;
          border-radius: var(--border-radius-md);
        }
      `}</style>
    </div>
  );
};
