import React, { useState, useEffect } from 'react';
import { CheckCircle, Info, Landmark, MapPin, Send, Loader2, AlertCircle, Calendar as CalendarIcon, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { bookingService } from '../services/bookingService';
import type { BookingInquiryResponse } from '../services/bookingService';

export const Booking: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [knownBookedDates, setKnownBookedDates] = useState<string[]>([]);
  const [checkingDay, setCheckingDay] = useState<number | null>(null);
  const [availabilityStatus, setAvailabilityStatus] = useState<{ date: string; available: boolean; message: string } | null>(null);

  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  // Form state
  const [formData, setFormData] = useState({
    name: user?.email?.split('@')[0] || '',
    phone: '',
    facility: 'The Grand Hall',
    startDate: '',
    endDate: '',
    details: '',
    eventName: '',
    memberCount: 100,
  });

  const [submitted, setSubmitted] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState<{ start: string | null, end: string | null }>({ start: null, end: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // History state
  const [history, setHistory] = useState<BookingInquiryResponse[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  // Auto-fill name from email when authenticated user changes
  useEffect(() => {
    if (user?.email && !formData.name) {
      setFormData(prev => ({ ...prev, name: user.email?.split('@')[0] || '' }));
    }
  }, [user]);

  const fetchHistory = async () => {
    if (!isAuthenticated) {
      setHistory([]);
      return;
    }
    setIsLoadingHistory(true);
    setHistoryError(null);
    try {
      const data = await bookingService.getHistory();
      setHistory(data);
      // Automatically map approved dates for this facility to knownBookedDates
      const bookedDates: string[] = [];
      data.forEach(item => {
        if (item.status === 'approved' && item.booking_date && item.hall === formData.facility) {
          if (!bookedDates.includes(item.booking_date)) {
            bookedDates.push(item.booking_date);
          }
        }
      });
      setKnownBookedDates(prev => Array.from(new Set([...prev, ...bookedDates])));
    } catch (err: any) {
      setHistoryError(err.response?.data?.detail || 'Failed to load booking history.');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [isAuthenticated]);

  const year = currentMonth.getFullYear();
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const totalDays = new Date(year, currentMonth.getMonth() + 1, 0).getDate();
  const startDayOffset = new Date(year, currentMonth.getMonth(), 1).getDay();

  const getFormattedDate = (day: number) => {
    const y = currentMonth.getFullYear();
    const m = String(currentMonth.getMonth() + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const handlePrevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleDateClick = async (day: number) => {
    const formattedDate = getFormattedDate(day);
    if (knownBookedDates.includes(formattedDate)) return;

    if (!isAuthenticated) {
      alert('Please log in to your Member Portal account to check real-time availability and select dates.');
      return;
    }

    // Check real-time availability with backend
    setCheckingDay(day);
    setAvailabilityStatus(null);
    try {
      const isAvail = await bookingService.checkAvailability(formattedDate, formData.facility);
      if (!isAvail) {
        setKnownBookedDates(prev => Array.from(new Set([...prev, formattedDate])));
        setAvailabilityStatus({
          date: formattedDate,
          available: false,
          message: `❌ ${formData.facility} is already reserved for ${formattedDate}.`
        });
        setCheckingDay(null);
        return;
      } else {
        setAvailabilityStatus({
          date: formattedDate,
          available: true,
          message: `✅ ${formData.facility} is available on ${formattedDate}!`
        });
      }
    } catch (err: any) {
      setAvailabilityStatus({
        date: formattedDate,
        available: false,
        message: `Error checking availability: ${err.response?.data?.detail || 'Server error'}`
      });
      setCheckingDay(null);
      return;
    } finally {
      setCheckingDay(null);
    }

    if (!selectedDateRange.start || (selectedDateRange.start && selectedDateRange.end)) {
      setSelectedDateRange({ start: formattedDate, end: null });
      setFormData(prev => ({ ...prev, startDate: formattedDate }));
    } else if (formattedDate >= selectedDateRange.start) {
      setSelectedDateRange(prev => ({ ...prev, end: formattedDate }));
      setFormData(prev => ({ ...prev, endDate: formattedDate }));
    } else {
      setSelectedDateRange({ start: formattedDate, end: null });
      setFormData(prev => ({ ...prev, startDate: formattedDate, endDate: '' }));
    }
  };

  const isSelected = (day: number) => {
    const formattedDate = getFormattedDate(day);
    if (selectedDateRange.start === formattedDate) return true;
    if (selectedDateRange.end === formattedDate) return true;
    if (selectedDateRange.start && selectedDateRange.end) {
      return formattedDate > selectedDateRange.start && formattedDate < selectedDateRange.end;
    }
    return false;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFacilityChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFacility = e.target.value;
    setFormData(prev => ({ ...prev, facility: newFacility }));
    if (history.length > 0) {
      const bookedDates: string[] = [];
      history.forEach(item => {
        if (item.status === 'approved' && item.booking_date && item.hall === newFacility) {
          if (!bookedDates.includes(item.booking_date)) {
            bookedDates.push(item.booking_date);
          }
        }
      });
      setKnownBookedDates(bookedDates);
    } else {
      setKnownBookedDates([]);
    }
    if (formData.startDate && isAuthenticated) {
      try {
        const isAvail = await bookingService.checkAvailability(formData.startDate, newFacility);
        setAvailabilityStatus({
          date: formData.startDate,
          available: isAvail,
          message: isAvail 
            ? `✅ ${newFacility} is available on ${formData.startDate}!` 
            : `❌ ${newFacility} is currently reserved for ${formData.startDate}.`
        });
      } catch {
        // Ignore silent error on facility change
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!isAuthenticated) {
      setSubmitError('You must be logged in to your Member Portal account to submit a booking inquiry.');
      return;
    }

    if (!formData.name.trim() || !formData.phone.trim() || !formData.startDate || !formData.eventName.trim()) {
      setSubmitError('Please fill out all required fields (Name, Phone, Facility, Event Name, Attendees, and Start Date).');
      return;
    }

    // Clean phone number (backend expects strictly ^\d{10}$)
    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setSubmitError('Contact number must be exactly 10 digits (e.g. 9876543210) without spaces or country code.');
      return;
    }

    // Validate date is in the future
    const today = new Date().toISOString().split('T')[0];
    if (formData.startDate <= today) {
      setSubmitError('Booking start date must be in the future.');
      return;
    }

    const purposeText = formData.details.trim() 
      ? formData.details.trim() 
      : `${formData.eventName} at ${formData.facility} (${formData.startDate}${formData.endDate ? ' to ' + formData.endDate : ''})`;

    if (purposeText.length < 5) {
      setSubmitError('Please provide a slightly more descriptive purpose or requirements (at least 5 characters).');
      return;
    }

    setIsSubmitting(true);
    try {
      await bookingService.submitInquiry({
        contact_name: formData.name.trim(),
        contact_phone: cleanPhone,
        booking_date: formData.startDate,
        purpose: purposeText,
        hall: formData.facility,
        event_name: formData.eventName.trim(),
        member_count: Number(formData.memberCount) || 100,
      });
      setSubmitted(true);
      // Refresh booking history automatically after successful submission
      await fetchHistory();
    } catch (err: any) {
      setSubmitError(err.response?.data?.detail || 'Failed to submit booking inquiry. Please check your inputs and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setFormData({
      name: user?.email?.split('@')[0] || '',
      phone: '',
      facility: 'The Grand Hall',
      startDate: '',
      endDate: '',
      details: '',
      eventName: '',
      memberCount: 100,
    });
    setSelectedDateRange({ start: null, end: null });
    setSubmitted(false);
    setSubmitError(null);
    setAvailabilityStatus(null);
  };

  const renderCalendarDays = () => {
    const cells = [];
    // Render blank cells for start offsets
    for (let i = 0; i < startDayOffset; i++) {
      cells.push(<div key={`empty-${i}`} className="calendar-cell empty"></div>);
    }
    // Render active day cells
    for (let day = 1; day <= totalDays; day++) {
      const formattedDate = getFormattedDate(day);
      const isBooked = knownBookedDates.includes(formattedDate);
      const isDaySelected = isSelected(day);
      const isChecking = checkingDay === day;
      
      let dayClass = 'calendar-cell';
      if (isBooked) dayClass += ' booked';
      else if (isDaySelected) dayClass += ' selected';
      else dayClass += ' available';

      cells.push(
        <button
          key={`day-${day}`}
          type="button"
          className={dayClass}
          onClick={() => handleDateClick(day)}
          disabled={isBooked || isChecking}
          aria-label={`${isBooked ? 'Booked' : 'Available'} ${monthName.split(' ')[0]} ${day}, ${year}`}
        >
          {isChecking ? <Loader2 size={14} className="spin-animation" /> : day}
        </button>
      );
    }
    return cells;
  };

  return (
    <div className="container section" id="booking-page-container">
      <div className="section-header">
        <span className="badge">BOOKINGS & HOUSING</span>
        <h1 className="section-title">Hall & Hostel Booking</h1>
        <p className="section-subtitle">Reserve spaces for weddings, community meetings, seminars, or guest stays. Check availability and send your inquiry below.</p>
      </div>

      {/* Property Showcase Grid */}
      <div className="property-gallery-grid" style={{ marginBottom: '40px' }}>
        <div className="property-card">
          <div className="property-image-container">
            <img src="/sspv_grand_hall.png" alt="The Grand Hall & Courtyard" className="property-image" />
            <div className="property-badge">Capacity: 500 Guests</div>
          </div>
          <div className="property-card-body">
            <div className="property-card-title-row">
              <Landmark size={20} className="property-icon" />
              <h3>The Grand Hall & Courtyard</h3>
            </div>
            <p>Our main grand hall is fully air-conditioned, featuring luxury heritage architectural pillars, professional sound systems, premium round dining tables, and an attached state-of-the-art industrial catering kitchen. Ideal for marriages, family celebrations, large community meets, and conventions.</p>
          </div>
        </div>

        <div className="property-card">
          <div className="property-image-container">
            <img src="/sspv_hostel_room.png" alt="Guest Hostel Rooms" className="property-image" />
            <div className="property-badge">A/C Double Rooms</div>
          </div>
          <div className="property-card-body">
            <div className="property-card-title-row">
              <MapPin size={20} className="property-icon-sec" />
              <h3>Guest Hostel Rooms</h3>
            </div>
            <p>We provide well-maintained, clean, double-bed guest accommodations featuring double beds, wardrobes, study desks, attached modern showers, and central pure drinking water. Priority is given to visiting outstation members and families of community functions.</p>
          </div>
        </div>
      </div>

      <div className="inquiry-header-divider">
        <h2>Availability & Inquiry</h2>
        <div className="divider-line"></div>
      </div>

      <div className="grid grid-12 booking-interactive-layout">
        {/* Left Side: Interactive Calendar */}
        <div className="booking-calendar-col">
          <div className="calendar-card" id="calendar-card-interactive">
            <div className="calendar-header-wrapper" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h3 style={{ margin: 0 }}>{monthName} Availability</h3>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    className="btn btn-secondary"
                    style={{ padding: '4px 10px', minHeight: '28px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    aria-label="Previous Month"
                  >
                    <ChevronLeft size={14} /> Prev
                  </button>
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    className="btn btn-secondary"
                    style={{ padding: '4px 10px', minHeight: '28px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    aria-label="Next Month"
                  >
                    Next <ChevronRight size={14} />
                  </button>
                </div>
              </div>
              <div className="calendar-legends">
                <div className="legend-item">
                  <span className="legend-dot available"></span>
                  <span>Available</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot booked"></span>
                  <span>Booked</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot selected"></span>
                  <span>Selected</span>
                </div>
              </div>
            </div>

            <div className="calendar-grid-header">
              <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
            </div>
            <div className="calendar-days-grid">
              {renderCalendarDays()}
            </div>
            <div className="calendar-tip">
              <Info size={14} />
              <span>Click on any available date to select your starting date and check real-time reservation status.</span>
            </div>

            {availabilityStatus && (
              <div className={`availability-alert ${availabilityStatus.available ? 'avail-success' : 'avail-error'}`}>
                {availabilityStatus.message}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Inquiry Form */}
        <div className="booking-form-col">
          <div className="form-card">
            {submitted ? (
              <div className="submission-success" id="booking-success-message">
                <CheckCircle size={54} className="success-icon" />
                <h2>Inquiry Submitted!</h2>
                <p>Thank you, <strong>{formData.name}</strong>. Our booking manager will review the availability for <strong>{formData.facility}</strong> from <strong>{formData.startDate}</strong> to <strong>{formData.endDate || formData.startDate}</strong> and contact you at <strong>{formData.phone}</strong> within 24 hours.</p>
                <button className="btn btn-primary" onClick={handleResetForm} style={{ marginTop: '20px' }}>
                  Submit Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="inquiry-form-fields" id="booking-inquiry-form">
                <h3 className="form-title">Booking Inquiry Form</h3>
                
                {submitError && (
                  <div className="availability-alert avail-error" style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <AlertCircle size={16} />
                      <span>{submitError}</span>
                    </div>
                  </div>
                )}

                <div className="grid grid-2" style={{ gap: '16px', marginBottom: '14px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label htmlFor="name-input">Full Name *</label>
                    <input
                      id="name-input"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your name"
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label htmlFor="phone-input">Contact Number *</label>
                    <input
                      id="phone-input"
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Exactly 10 digits"
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label htmlFor="facility-select">Select Facility *</label>
                  <select
                    id="facility-select"
                    name="facility"
                    value={formData.facility}
                    onChange={handleFacilityChange}
                  >
                    <option>The Grand Hall</option>
                    <option>Hostel Guest Accommodation</option>
                    <option>Both Hall & Hostel</option>
                  </select>
                </div>

                <div className="grid grid-2" style={{ gap: '16px', marginBottom: '14px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label htmlFor="event-name-input">Event Name *</label>
                    <input
                      id="event-name-input"
                      type="text"
                      name="eventName"
                      value={formData.eventName}
                      onChange={handleInputChange}
                      placeholder="e.g. Wedding Reception"
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label htmlFor="member-count-input">Expected Attendees *</label>
                    <input
                      id="member-count-input"
                      type="number"
                      name="memberCount"
                      min="1"
                      max="1000"
                      value={formData.memberCount}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-2" style={{ gap: '16px', marginBottom: '14px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label htmlFor="start-date-input">Start Date *</label>
                    <input
                      id="start-date-input"
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label htmlFor="end-date-input">End Date</label>
                    <input
                      id="end-date-input"
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label htmlFor="details-textarea">Additional Requirements</label>
                  <textarea
                    id="details-textarea"
                    name="details"
                    value={formData.details}
                    onChange={handleInputChange}
                    placeholder="Catering, seating layout, etc."
                    rows={2}
                  />
                </div>

                <button type="submit" className="btn btn-primary form-submit-btn" id="booking-submit-btn" disabled={isSubmitting} style={{ padding: '12px' }}>
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="spin-animation" /> Submitting Inquiry...
                    </>
                  ) : (
                    <>
                      Submit Inquiry <Send size={14} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Booking Inquiry History Section */}
      <div className="inquiry-header-divider" style={{ marginTop: '50px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>My Booking Inquiry History</h2>
          {isAuthenticated && (
            <button 
              type="button" 
              className="btn btn-outline" 
              onClick={fetchHistory} 
              disabled={isLoadingHistory}
              style={{ padding: '6px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <RefreshCw size={14} className={isLoadingHistory ? 'spin-animation' : ''} /> Refresh History
            </button>
          )}
        </div>
        <div className="divider-line"></div>
      </div>

      <div className="history-section-wrapper">
        {!isAuthenticated ? (
          <div className="booking-empty-state">
            <Info size={32} className="empty-icon" />
            <p>Please log in to your Member Portal account to view your reservation inquiry history.</p>
          </div>
        ) : isLoadingHistory ? (
          <div className="booking-loading-state">
            <Loader2 size={36} className="spin-animation" style={{ color: 'var(--color-primary)' }} />
            <p>Loading your booking inquiry history...</p>
          </div>
        ) : historyError ? (
          <div className="booking-error-state">
            <AlertCircle size={32} className="error-icon" />
            <p>{historyError}</p>
            <button className="btn btn-outline" onClick={fetchHistory} style={{ marginTop: '12px' }}>Try Again</button>
          </div>
        ) : history.length === 0 ? (
          <div className="booking-empty-state">
            <CalendarIcon size={36} className="empty-icon" />
            <h3>No Reservation Inquiries Found</h3>
            <p>You have not submitted any hall or hostel booking inquiries yet. Select an available date on the calendar above to send your first request.</p>
          </div>
        ) : (
          <div className="booking-table-container">
            <table className="booking-history-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Submitted On</th>
                  <th>Event & Purpose</th>
                  <th>Facility</th>
                  <th>Target Date</th>
                  <th>Guests</th>
                  <th>Status</th>
                  <th>Admin Remark</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.id}>
                    <td><strong>#{item.id}</strong></td>
                    <td>{new Date(item.created_at).toLocaleDateString()}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--color-text-dark)' }}>{item.event_name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.purpose}</div>
                    </td>
                    <td><span className="facility-badge">{item.hall}</span></td>
                    <td><strong>{item.booking_date}</strong></td>
                    <td>{item.member_count}</td>
                    <td>
                      <span className={`status-badge status-${item.status}`}>
                        {item.status === 'approved' && '✅ Approved'}
                        {item.status === 'pending' && '⏳ Pending Review'}
                        {item.status === 'rejected' && '❌ Rejected'}
                        {!['approved', 'pending', 'rejected'].includes(item.status) && item.status}
                      </span>
                    </td>
                    <td>{item.admin_remark || <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .spin-animation { animation: spin 1s linear infinite; }

        .availability-alert {
          margin-top: 16px;
          padding: 10px 14px;
          border-radius: var(--border-radius-md);
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 600;
        }
        .avail-success { background-color: var(--bg-sand-lowest); color: var(--color-secondary); border: 1px solid var(--color-secondary); }
        .avail-error { background-color: var(--bg-sand-dim); color: var(--color-primary); border: 1px solid var(--color-primary); }

        .booking-empty-state, .booking-loading-state, .booking-error-state {
          background-color: var(--bg-sand-lowest);
          border: 1px solid var(--color-outline-variant);
          border-radius: var(--border-radius-lg);
          padding: 40px 20px;
          text-align: center;
          box-shadow: var(--shadow-atmospheric);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
        .booking-empty-state h3 { margin: 0; font-size: 18px; color: var(--color-text-dark); }
        .booking-empty-state p, .booking-loading-state p, .booking-error-state p { margin: 0; font-family: var(--font-body); font-size: 14px; color: var(--color-text-muted); max-width: 450px; }
        .empty-icon { color: var(--color-text-muted); opacity: 0.5; }
        .error-icon { color: var(--color-primary); }

        .booking-table-container {
          background-color: var(--bg-sand-lowest);
          border: 1px solid var(--color-outline-variant);
          border-radius: var(--border-radius-lg);
          overflow-x: auto;
          box-shadow: var(--shadow-atmospheric);
        }
        .booking-history-table {
          width: 100%;
          border-collapse: collapse;
          font-family: var(--font-body);
          font-size: 14px;
          text-align: left;
        }
        .booking-history-table th {
          background-color: var(--bg-sand-container);
          color: var(--color-text-dark);
          font-weight: 700;
          padding: 14px 18px;
          border-bottom: 2px solid var(--color-outline-variant);
          white-space: nowrap;
        }
        .booking-history-table td {
          padding: 14px 18px;
          border-bottom: 1px solid var(--color-outline-variant);
          color: var(--color-text-dark);
          vertical-align: middle;
        }
        .booking-history-table tr:last-child td {
          border-bottom: none;
        }
        .booking-history-table tr:hover td {
          background-color: var(--bg-sand-low);
        }
        .facility-badge {
          background-color: var(--bg-sand-low);
          border: 1px solid var(--color-outline-variant);
          padding: 4px 10px;
          border-radius: var(--border-radius-full);
          font-size: 12px;
          font-weight: 600;
          white-space: nowrap;
        }
        .status-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: var(--border-radius-full);
          font-size: 12px;
          font-weight: 700;
          white-space: nowrap;
        }
        .status-approved { background-color: var(--bg-sand-lowest); color: var(--color-secondary); border: 1px solid var(--color-secondary); }
        .status-pending { background-color: var(--bg-sand-container); color: var(--color-primary); border: 1px solid var(--color-primary-container); }
        .status-rejected { background-color: #ffebee; color: #c62828; border: 1px solid #ef9a9a; }

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

        /* Property Gallery Showcase */
        .property-gallery-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 30px;
          text-align: left;
        }
        @media (max-width: 768px) {
          .property-gallery-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }
        }
        .property-card {
          background-color: var(--bg-sand-lowest);
          border: 1px solid var(--color-outline-variant);
          border-radius: var(--border-radius-xl);
          overflow: hidden;
          box-shadow: var(--shadow-atmospheric);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          display: flex;
          flex-direction: column;
        }
        .property-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-premium);
        }
        .property-image-container {
          position: relative;
          width: 100%;
          height: 240px;
          overflow: hidden;
          background-color: var(--bg-sand-low);
        }
        .property-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        .property-card:hover .property-image {
          transform: scale(1.04);
        }
        .property-badge {
          position: absolute;
          bottom: 15px;
          right: 15px;
          background-color: rgba(26, 17, 16, 0.85);
          color: var(--bg-sand-lowest);
          padding: 5px 12px;
          font-family: var(--font-body);
          font-size: 11px;
          font-weight: 700;
          border-radius: var(--border-radius-full);
          letter-spacing: 0.5px;
        }
        .property-card-body {
          padding: 20px 24px;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }
        .property-card-title-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }
        .property-card-title-row h3 {
          font-size: 19px;
          margin: 0;
          color: var(--color-text-dark);
        }
        .property-icon {
          color: var(--color-primary);
        }
        .property-icon-sec {
          color: var(--color-secondary);
        }
        .property-card-body p {
          font-family: var(--font-body);
          font-size: 14px;
          color: var(--color-text-muted);
          line-height: 1.55;
          margin: 0;
        }

        /* Inquiry Section Divider */
        .inquiry-header-divider {
          margin: 40px 0 24px 0;
          text-align: left;
        }
        .inquiry-header-divider h2 {
          font-size: 24px;
          color: var(--color-text-dark);
          margin-bottom: 8px;
        }
        .divider-line {
          height: 3px;
          width: 50px;
          background-color: var(--color-primary);
          border-radius: var(--border-radius-full);
        }

        /* Calendar & Form Split Grid Layout */
        .booking-interactive-layout {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          gap: 30px;
          text-align: left;
        }
        .booking-calendar-col {
          grid-column: span 6;
        }
        .booking-form-col {
          grid-column: span 6;
        }
        @media (max-width: 1024px) {
          .booking-calendar-col, .booking-form-col {
            grid-column: span 12;
          }
        }

        /* Calendar Styling */
        .calendar-card {
          background-color: var(--bg-sand-lowest);
          border: 1px solid var(--color-outline-variant);
          border-radius: var(--border-radius-lg);
          padding: 24px;
          box-shadow: var(--shadow-atmospheric);
        }
        .calendar-header-wrapper {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 12px;
        }
        .calendar-header-wrapper h3 {
          font-size: 20px;
          margin: 0;
        }
        .calendar-legends {
          display: flex;
          gap: 12px;
          font-family: var(--font-body);
          font-size: 11px;
          color: var(--color-text-muted);
        }
        .legend-item {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .legend-dot {
          width: 10px;
          height: 10px;
          border-radius: var(--border-radius-full);
          display: inline-block;
        }
        .legend-dot.available { background-color: var(--bg-sand-lowest); border: 1px solid var(--color-outline); }
        .legend-dot.booked { background-color: var(--bg-sand-dim); }
        .legend-dot.selected { background-color: var(--color-primary); }

        .calendar-grid-header {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          text-align: center;
          font-family: var(--font-body);
          font-weight: 700;
          font-size: 13px;
          color: var(--color-text-muted);
          margin-bottom: 12px;
        }
        .calendar-days-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 8px;
        }
        .calendar-cell {
          aspect-ratio: 1.25;
          border-radius: var(--border-radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .calendar-cell.empty {
          cursor: default;
          background: transparent;
        }
        .calendar-cell.available {
          background-color: var(--bg-sand-lowest);
          border: 1px solid rgba(221, 192, 186, 0.3);
          color: var(--color-text-dark);
        }
        .calendar-cell.available:hover {
          background-color: var(--bg-sand-container);
          color: var(--color-primary);
          border-color: var(--color-primary-container);
        }
        .calendar-cell.booked {
          background-color: var(--bg-sand-dim);
          color: var(--color-text-muted);
          opacity: 0.6;
          cursor: not-allowed;
        }
        .calendar-cell.selected {
          background-color: var(--color-primary);
          color: var(--color-on-primary);
          box-shadow: 0 4px 10px rgba(159, 64, 45, 0.3);
        }
        .calendar-tip {
          display: flex;
          gap: 8px;
          align-items: center;
          margin-top: 16px;
          font-family: var(--font-body);
          font-size: 12px;
          color: var(--color-text-muted);
        }

        /* Form Styling */
        .form-card {
          background-color: var(--bg-sand-lowest);
          border: 1px solid var(--color-outline-variant);
          border-radius: var(--border-radius-lg);
          padding: 24px;
          box-shadow: var(--shadow-atmospheric);
          height: 100%;
        }
        .form-title {
          font-size: 20px;
          margin: 0 0 16px 0;
          border-bottom: 2px solid var(--color-outline-variant);
          padding-bottom: 8px;
          color: var(--color-text-dark);
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 5px;
          margin-bottom: 0px;
        }
        .form-group label {
          font-family: var(--font-body);
          font-size: 12px;
          font-weight: 700;
          color: var(--color-text-dark);
        }
        .form-group input, .form-group select, .form-group textarea {
          font-family: var(--font-body);
          font-size: 14px;
          padding: 10px 14px;
          background-color: var(--bg-sand-low);
          border: 1px solid var(--color-outline-variant);
          border-radius: var(--border-radius-md);
          color: var(--color-text-dark);
          outline: none;
          transition: all 0.2s ease;
        }
        .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
          background-color: var(--bg-sand-lowest);
          border-color: var(--color-primary);
          box-shadow: 0 0 0 1px var(--color-primary);
        }
        .form-submit-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-weight: 600;
          font-family: var(--font-body);
        }
        
        .submission-success {
          text-align: center;
          padding: 20px 10px;
        }
        .success-icon {
          color: var(--color-secondary);
          margin-bottom: 16px;
        }
        .submission-success h2 {
          font-size: 24px;
          margin: 0 0 10px 0;
        }
        .submission-success p {
          font-family: var(--font-body);
          color: var(--color-text-muted);
          font-size: 14px;
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
};
