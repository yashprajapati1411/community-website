import React, { useState, useEffect } from 'react';
import { Shield, Users, Loader2 } from 'lucide-react';
import { publicService } from '../services/publicService';
import type { CommitteeMemberResponse } from '../services/publicService';

export const Committee: React.FC = () => {
  const [members, setMembers] = useState<CommitteeMemberResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCommittee = async () => {
      try {
        setIsLoading(true);
        const data = await publicService.getCommittee();
        setMembers(data);
      } catch (err) {
        setError('Failed to load committee members. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCommittee();
  }, []);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const colors = ['var(--color-primary)', 'var(--color-secondary)', 'var(--color-tertiary)'];

  // Separate executives from general members
  const execKeywords = ['president', 'vice', 'secretary', 'treasurer', 'chair'];
  const executives = members.filter(m => 
    execKeywords.some(k => m.designation.toLowerCase().includes(k)) || m.display_order <= 3
  );
  const generalMembers = members.filter(m => !executives.includes(m));

  return (
    <div className="container section" id="committee-page-container">
      <div className="section-header">
        <span className="badge">LEADERSHIP BOARD</span>
        <h1 className="section-title">Current Committee</h1>
        <p className="section-subtitle">Meet the visionary leaders who guide SSPV Mandala with integrity, transparency, and a commitment to progress.</p>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <Loader2 className="animate-spin" size={36} color="var(--color-primary)" />
        </div>
      ) : error ? (
        <div className="alert alert-error" style={{ textAlign: 'center', padding: '20px', marginBottom: '40px' }}>
          {error}
        </div>
      ) : members.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-text-light)' }}>
          <p>No committee members currently published.</p>
        </div>
      ) : (
        <>
          {/* Executive Council */}
          {executives.length > 0 && (
            <div className="executive-section" style={{ marginBottom: '60px' }}>
              <h2 className="sub-title">Executive Officers</h2>
              <div className="grid grid-3">
                {executives.map((exec, idx) => (
                  <div key={exec.id} className="card card-primary exec-card" id={`exec-${idx}`}>
                    {exec.image_url ? (
                      <img src={exec.image_url} alt={exec.name} style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto 16px' }} />
                    ) : (
                      <div className="avatar-large" style={{ backgroundColor: colors[idx % colors.length] }}>
                        <span>{getInitials(exec.name)}</span>
                      </div>
                    )}
                    <h3 className="exec-name">{exec.name}</h3>
                    <p className="exec-role">{exec.designation}</p>
                    <p className="exec-exp">
                      <Shield size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                      {exec.term_start ? `Active since ${exec.term_start.split('-')[0]}` : 'Active Member'}
                    </p>
                    <p className="exec-desc">{exec.email ? `Contact: ${exec.email}` : 'Dedicated to community governance and cultural preservation.'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* General Committee Members */}
          {generalMembers.length > 0 && (
            <div className="general-section">
              <h2 className="sub-title">Committee Departments</h2>
              <div className="grid grid-3">
                {generalMembers.map((member, idx) => (
                  <div key={member.id} className="member-card-mini" id={`member-${idx}`}>
                    {member.image_url ? (
                      <img src={member.image_url} alt={member.name} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <div className="member-icon-mini">
                        <Users size={18} />
                      </div>
                    )}
                    <div className="member-info-mini">
                      <h4 className="member-name-mini">{member.name}</h4>
                      <p className="member-role-mini">{member.designation}</p>
                      <span className="member-dept-badge">{member.phone || 'Committee Member'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

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
