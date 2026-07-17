import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Loader2, X, CheckCircle } from 'lucide-react';
import { publicService } from '../services/publicService';
import type { EventResponse, EventRegistrationRequest } from '../services/publicService';

export const Events: React.FC = () => {
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedEvent, setSelectedEvent] = useState<EventResponse | null>(null);
  const [regForm, setRegForm] = useState<EventRegistrationRequest>({
    name: '',
    mobile: '',
    email: '',
    member_count: 1,
    remarks: ''
  });
  const [regSubmitting, setRegSubmitting] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);


  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const data = await publicService.getEvents();
        setEvents(data);
      } catch (err) {
        setError('Failed to load upcoming events. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleOpenRegister = (evt: EventResponse) => {
    setSelectedEvent(evt);
    setRegForm({
      name: '',
      mobile: '',
      email: '',
      member_count: 1,
      remarks: ''
    });
    setRegSuccess(false);
    setRegError(null);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;
    if (!regForm.name.trim()) {
      setRegError('Please enter your name.');
      return;
    }
    setRegSubmitting(true);
    setRegError(null);
    try {
      await publicService.registerForEvent(selectedEvent.id, {
        name: regForm.name,
        mobile: regForm.mobile || undefined,
        email: regForm.email || undefined,
        member_count: Number(regForm.member_count) || 1,
        remarks: regForm.remarks || undefined
      });
      setRegSuccess(true);
      setTimeout(() => {
        setSelectedEvent(null);
        setRegSuccess(false);
      }, 2500);
    } catch (err: any) {
      setRegError(err.response?.data?.detail || 'Failed to register for the event. Please try again.');
    } finally {
      setRegSubmitting(false);
    }
  };

  const activeFields = selectedEvent?.form_fields && selectedEvent.form_fields.length > 0 
    ? selectedEvent.form_fields 
    : ['name', 'mobile', 'member_count', 'remarks'];


  return (
    <div className="container section" id="events-page-container">
      <div className="section-header">
        <span className="badge">COMMUNITY FORUMS</span>
        <h1 className="section-title">Mandala Events</h1>
        <p className="section-subtitle">Stay connected with our upcoming gatherings, educational drives, and seasonal celebrations.</p>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <Loader2 className="animate-spin" size={36} color="var(--color-primary)" />
        </div>
      ) : error ? (
        <div className="alert alert-error" style={{ textAlign: 'center', padding: '20px', marginBottom: '40px' }}>
          {error}
        </div>
      ) : events.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-text-light)' }}>
          <p>No upcoming community events scheduled at this time.</p>
        </div>
      ) : (
        <div className="events-timeline" id="events-list">
          {events.map((evt, idx) => (
            <article key={evt.id} className="event-timeline-card card" id={`event-card-${idx}`}>
              <div className="event-date-badge">
                <Calendar size={18} style={{ color: 'var(--color-primary)' }} />
                <span>{new Date(evt.event_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
              </div>
              <div className="event-timeline-content">
                <h3>{evt.title}</h3>
                <div className="event-meta-info">
                  <span className="meta-item">
                    <Clock size={14} />
                    {evt.registration_deadline ? `Reg Deadline: ${evt.registration_deadline}` : '10:00 AM onwards'}
                  </span>
                  <span className="meta-item">
                    <MapPin size={14} />
                    {evt.location}
                  </span>
                </div>
                <p className="event-description">{evt.description}</p>
                <button 
                  className="btn btn-outline" 
                  style={{ marginTop: '16px', padding: '8px 20px' }}
                  onClick={() => handleOpenRegister(evt)}
                  id={`register-btn-${evt.id}`}
                >
                  Register for Event
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {selectedEvent && (
        <div className="event-modal-overlay" onClick={() => setSelectedEvent(null)}>
          <div className="event-modal" onClick={e => e.stopPropagation()}>
            <button className="event-modal-close" onClick={() => setSelectedEvent(null)}>
              <X size={18} />
            </button>

            {regSuccess ? (
              <div style={{ textAlign: 'center', padding: '30px 10px' }}>
                <CheckCircle size={54} color="#10b981" style={{ margin: '0 auto 16px' }} />
                <h3 style={{ fontSize: '22px', marginBottom: '8px', color: 'var(--color-text-dark)' }}>Registration Confirmed!</h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '15px' }}>
                  We have recorded your registration for <strong>{selectedEvent.title}</strong>. We look forward to seeing you!
                </p>
              </div>
            ) : (
              <form onSubmit={handleRegisterSubmit}>
                <h2 style={{ fontSize: '20px', marginBottom: '6px', color: 'var(--color-text-dark)' }}>
                  Register for {selectedEvent.title}
                </h2>
                <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '20px' }}>
                  Please fill out the required information below to confirm your attendance.
                </p>

                {regError && (
                  <div className="alert alert-error" style={{ marginBottom: '16px', fontSize: '13px', padding: '10px' }}>
                    {regError}
                  </div>
                )}

                {activeFields.includes('name') && (
                  <div className="event-form-group">
                    <label>Full Name *</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Enter your full name" 
                      value={regForm.name} 
                      onChange={e => setRegForm(f => ({ ...f, name: e.target.value }))} 
                      id="reg-form-name"
                    />
                  </div>
                )}

                {activeFields.includes('mobile') && (
                  <div className="event-form-group">
                    <label>Mobile Number *</label>
                    <input 
                      type="tel" 
                      required 
                      placeholder="e.g. +91 98765 43210" 
                      value={regForm.mobile} 
                      onChange={e => setRegForm(f => ({ ...f, mobile: e.target.value }))} 
                      id="reg-form-mobile"
                    />
                  </div>
                )}

                {activeFields.includes('email') && (
                  <div className="event-form-group">
                    <label>Email Address</label>
                    <input 
                      type="email" 
                      placeholder="Enter your email address" 
                      value={regForm.email} 
                      onChange={e => setRegForm(f => ({ ...f, email: e.target.value }))} 
                      id="reg-form-email"
                    />
                  </div>
                )}

                {activeFields.includes('member_count') && (
                  <div className="event-form-group">
                    <label>Number of Attendees *</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="20" 
                      required 
                      value={regForm.member_count} 
                      onChange={e => setRegForm(f => ({ ...f, member_count: parseInt(e.target.value) || 1 }))} 
                      id="reg-form-count"
                    />
                  </div>
                )}

                {activeFields.includes('remarks') && (
                  <div className="event-form-group">
                    <label>Remarks / Special Requirements</label>
                    <textarea 
                      rows={3} 
                      placeholder="Any notes or special requirements..." 
                      value={regForm.remarks} 
                      onChange={e => setRegForm(f => ({ ...f, remarks: e.target.value }))} 
                      id="reg-form-remarks"
                    />
                  </div>
                )}

                <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setSelectedEvent(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={regSubmitting} id="reg-submit-btn">
                    {regSubmitting ? 'Submitting...' : 'Confirm Registration'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
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
        .event-modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
          backdrop-filter: blur(4px);
        }
        .event-modal {
          background: white;
          border-radius: var(--border-radius-lg);
          padding: 30px;
          max-width: 500px;
          width: 100%;
          position: relative;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
          max-height: 90vh;
          overflow-y: auto;
        }
        .event-modal-close {
          position: absolute;
          top: 20px; right: 20px;
          background: transparent;
          border: none;
          cursor: pointer;
          color: var(--color-text-muted);
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
        }
        .event-modal-close:hover {
          background-color: var(--bg-sand-low);
          color: var(--color-text-dark);
        }
        .event-form-group {
          margin-bottom: 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .event-form-group label {
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 600;
          color: var(--color-text-dark);
        }
        .event-form-group input,
        .event-form-group textarea {
          padding: 10px 14px;
          border-radius: var(--border-radius-md);
          border: 1px solid var(--color-outline-variant);
          font-family: var(--font-body);
          font-size: 14px;
          color: var(--color-text-dark);
          transition: border-color 0.2s ease;
        }
        .event-form-group input:focus,
        .event-form-group textarea:focus {
          outline: none;
          border-color: var(--color-primary);
        }
      `}</style>
    </div>
  );
};
