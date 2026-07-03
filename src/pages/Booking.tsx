import React, { useState } from 'react';
import { CheckCircle, Info, Landmark, MapPin, Send } from 'lucide-react';

export const Booking: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    facility: 'The Grand Hall',
    startDate: '',
    endDate: '',
    details: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState<{ start: number | null, end: number | null }>({ start: null, end: null });

  // Mock Booked Dates for July 2026 (1-indexed)
  const bookedDates = [4, 5, 11, 12, 18, 19, 25, 26]; // Weekends are booked

  // Calendar parameters for July 2026
  const monthName = 'July 2026';
  const totalDays = 31;
  const startDayOffset = 3; // July 2026 starts on Wednesday (so 3 offset days: Sun, Mon, Tue empty)

  const handleDateClick = (day: number) => {
    if (bookedDates.includes(day)) return;

    if (!selectedDateRange.start || (selectedDateRange.start && selectedDateRange.end)) {
      setSelectedDateRange({ start: day, end: null });
      setFormData(prev => ({ ...prev, startDate: `2026-07-${day < 10 ? '0' + day : day}` }));
    } else if (day >= selectedDateRange.start) {
      setSelectedDateRange(prev => ({ ...prev, end: day }));
      setFormData(prev => ({ ...prev, endDate: `2026-07-${day < 10 ? '0' + day : day}` }));
    } else {
      setSelectedDateRange({ start: day, end: null });
      setFormData(prev => ({ ...prev, startDate: `2026-07-${day < 10 ? '0' + day : day}`, endDate: '' }));
    }
  };

  const isSelected = (day: number) => {
    if (selectedDateRange.start === day) return true;
    if (selectedDateRange.end === day) return true;
    if (selectedDateRange.start && selectedDateRange.end) {
      return day > selectedDateRange.start && day < selectedDateRange.end;
    }
    return false;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.startDate) {
      alert('Please fill out Name, Phone, and select a Start Date.');
      return;
    }
    setSubmitted(true);
  };

  const handleResetForm = () => {
    setFormData({
      name: '',
      phone: '',
      facility: 'The Grand Hall',
      startDate: '',
      endDate: '',
      details: '',
    });
    setSelectedDateRange({ start: null, end: null });
    setSubmitted(false);
  };

  const renderCalendarDays = () => {
    const cells = [];
    // Render blank cells for start offsets
    for (let i = 0; i < startDayOffset; i++) {
      cells.push(<div key={`empty-${i}`} className="calendar-cell empty"></div>);
    }
    // Render active day cells
    for (let day = 1; day <= totalDays; day++) {
      const isBooked = bookedDates.includes(day);
      const isDaySelected = isSelected(day);
      
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
          disabled={isBooked}
          aria-label={`${isBooked ? 'Booked' : 'Available'} July ${day}, 2026`}
        >
          {day}
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
            <div className="calendar-header-wrapper">
              <h3>{monthName} Availability</h3>
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
              <span>Click on any available date to select your starting date and range.</span>
            </div>
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
                      placeholder="Phone number"
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label htmlFor="facility-select">Select Facility</label>
                  <select
                    id="facility-select"
                    name="facility"
                    value={formData.facility}
                    onChange={handleInputChange}
                  >
                    <option>The Grand Hall</option>
                    <option>Hostel Guest Accommodation</option>
                    <option>Both Hall & Hostel</option>
                  </select>
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

                <button type="submit" className="btn btn-primary form-submit-btn" id="booking-submit-btn" style={{ padding: '12px' }}>
                  Submit Inquiry <Send size={14} />
                </button>
              </form>
            )}
          </div>
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
