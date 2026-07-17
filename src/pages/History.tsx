import React, { useState, useEffect } from 'react';
import { Search, MapPin, Users, Award, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { publicService } from '../services/publicService';
import type { SurnameHistoryResponse } from '../services/publicService';

export const History: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [surnames, setSurnames] = useState<SurnameHistoryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedSurname, setSelectedSurname] = useState<SurnameHistoryResponse | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        const data = await publicService.getSurnameHistory();
        setSurnames(data);
      } catch (err) {
        setError('Failed to load surname histories. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleViewDetails = async (item: SurnameHistoryResponse) => {
    try {
      setSelectedSurname(item);
      const detailed = await publicService.getSurnameHistoryById(item.id);
      setSelectedSurname(detailed);
    } catch (err) {
      console.error('Failed to load detailed surname history:', err);
    }
  };

  const filteredSurnames = surnames.filter(s =>
    s.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.description && s.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    s.native_region.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="history-page" id="surnames-history-container">
      <div className="container" style={{ padding: '60px 20px' }}>
        {/* Header */}
        <div className="section-header">
          <span className="badge">GENEALOGICAL ROOTS</span>
          <h1 className="section-title">Surnames History</h1>
          <p className="section-subtitle">
            Discover the ancestral guilds, historical trades, and native regions of our primary community branches.
          </p>
        </div>

        {/* Search Bar */}
        <div className="search-bar-wrapper">
          <div className="search-input-container">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search surname, ancestral trade, or native region..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="surname-search-input"
              id="history-search-input"
            />
          </div>
        </div>

        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <Loader2 className="animate-spin" size={36} color="var(--color-primary)" />
          </div>
        ) : error ? (
          <div className="alert alert-error" style={{ textAlign: 'center', padding: '20px', marginBottom: '40px' }}>
            {error}
          </div>
        ) : surnames.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-text-light)' }}>
            <p>No surname history records published at this time.</p>
          </div>
        ) : (
          <>
            {/* Vertical Cards Responsive Grid */}
            <motion.div 
              className="grid grid-3 history-grid"
              layout
            >
              <AnimatePresence mode="popLayout">
                {filteredSurnames.map((item) => {
                  const trade = item.description || 'Traditional Heritage Guild';
                  const originText = item.history;
                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.4 }}
                      className="surname-grid-card"
                      id={`surname-card-${item.surname.toLowerCase()}`}
                    >
                      <div className="card-top-accent"></div>
                      <div className="card-main-content">
                        <h3 className="card-surname-title">{item.surname}</h3>
                        <div className="card-trade-badge">{trade}</div>
                        
                        <p className="card-short-desc">
                          {originText.length > 95 ? originText.substring(0, 95) + '...' : originText}
                        </p>

                        <div className="card-metadata-section">
                          <div className="meta-row">
                            <MapPin size={14} className="meta-icon" />
                            <span>{item.native_region}</span>
                          </div>
                          <div className="meta-row">
                            <Users size={14} className="meta-icon" />
                            <span>Community Branch</span>
                          </div>
                        </div>
                      </div>

                      <div className="card-actions">
                        <button 
                          onClick={() => handleViewDetails(item)}
                          className="btn btn-secondary card-details-btn"
                        >
                          View Details
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>

            {filteredSurnames.length === 0 && (
              <div className="no-history-results">
                <p>No surnames match your query. Try searching another name or native region.</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Surname Details Modal Popup */}
      <AnimatePresence>
        {selectedSurname && (
          <div className="modal-overlay" onClick={() => setSelectedSurname(null)}>
            <motion.div 
              className="modal-content-card"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
            >
              <button 
                className="modal-close-btn"
                onClick={() => setSelectedSurname(null)}
                aria-label="Close details"
              >
                <X size={20} />
              </button>

              <div className="modal-header-section">
                <span className="modal-badge">Ancestral Registry</span>
                <h2>{selectedSurname.surname} Lineage</h2>
                <div className="modal-tag-row">
                  <span className="modal-tag"><Award size={13} /> {selectedSurname.description || 'Traditional Heritage Guild'}</span>
                  <span className="modal-tag"><MapPin size={13} /> {selectedSurname.native_region}</span>
                </div>
              </div>

              <div className="modal-body-section">
                <h3>Ancestral Origins & Historical Trade</h3>
                <p>{selectedSurname.history}</p>

                <div className="modal-stats-box">
                  <div className="modal-stat-data">
                    <Users size={20} />
                    <div>
                      <strong>100+ Active Families</strong>
                      <span>Verified members in the digital directory</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer-section">
                <button 
                  className="btn btn-primary"
                  onClick={() => setSelectedSurname(null)}
                  style={{ width: '100%' }}
                >
                  Close Details
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .history-page {
          background-color: var(--bg-sand);
          min-height: calc(100vh - 80px);
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
        
        .search-bar-wrapper {
          max-width: 540px;
          margin: 0 auto 48px auto;
        }
        
        .search-input-container {
          position: relative;
          display: flex;
          align-items: center;
        }
        
        .search-icon {
          position: absolute;
          left: 16px;
          color: var(--color-outline);
        }
        
        .surname-search-input {
          width: 100%;
          padding: 14px 20px 14px 48px;
          border-radius: var(--border-radius-full);
          border: 1px solid var(--color-outline-variant);
          background-color: var(--bg-sand-lowest);
          font-family: var(--font-body);
          font-size: 15px;
          color: var(--color-text-dark);
          outline: none;
          box-shadow: var(--shadow-atmospheric);
          transition: all 0.25s ease;
        }
        
        .surname-search-input:focus {
          border-color: var(--color-primary);
          box-shadow: 0 4px 15px rgba(159, 64, 45, 0.1);
        }

        .history-grid {
          margin-bottom: 40px;
        }
        
        .surname-grid-card {
          background-color: var(--bg-sand-lowest);
          border-radius: var(--border-radius-lg);
          border: 1px solid rgba(221, 192, 186, 0.3);
          box-shadow: var(--shadow-atmospheric);
          display: flex;
          flex-direction: column;
          text-align: left;
          position: relative;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .surname-grid-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-card-hover);
          border-color: var(--color-outline-variant);
        }
        
        .card-top-accent {
          height: 5px;
          background-color: var(--color-primary);
          width: 100%;
        }
        
        .card-main-content {
          padding: 24px;
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .card-surname-title {
          font-family: var(--font-header);
          font-size: 24px;
          font-weight: 700;
          color: var(--color-text-dark);
        }
        
        .card-trade-badge {
          align-self: flex-start;
          font-family: var(--font-body);
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--color-secondary);
          background-color: var(--color-secondary-container);
          padding: 4px 10px;
          border-radius: var(--border-radius-md);
        }
        
        .card-short-desc {
          font-family: var(--font-body);
          font-size: 14px;
          color: var(--color-text-muted);
          line-height: 1.55;
        }
        
        .card-metadata-section {
          border-top: 1px solid rgba(221, 192, 186, 0.2);
          padding-top: 14px;
          margin-top: auto;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .meta-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-body);
          font-size: 12px;
          color: var(--color-text-muted);
        }
        
        .meta-icon {
          color: var(--color-primary);
        }
        
        .card-actions {
          padding: 0 24px 24px 24px;
        }
        
        .card-details-btn {
          width: 100%;
          padding: 10px;
          font-size: 13px;
        }
        
        .no-history-results {
          padding: 60px 20px;
          background-color: var(--bg-sand-low);
          border-radius: var(--border-radius-lg);
          border: 1px dashed var(--color-outline-variant);
          text-align: center;
          color: var(--color-text-muted);
          font-family: var(--font-body);
        }

        /* Modal Popup Styles */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background-color: rgba(44, 22, 14, 0.6);
          backdrop-filter: blur(4px);
          z-index: 200;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        
        .modal-content-card {
          background-color: var(--bg-sand-lowest);
          border-radius: var(--border-radius-xl);
          width: 100%;
          max-width: 500px;
          box-shadow: 0 20px 50px rgba(44, 22, 14, 0.3);
          border: 1px solid var(--color-outline-variant);
          overflow: hidden;
          position: relative;
          text-align: left;
        }
        
        .modal-close-btn {
          position: absolute;
          top: 16px;
          right: 16px;
          background: none;
          border: none;
          color: var(--color-outline);
          cursor: pointer;
          width: 32px;
          height: 32px;
          border-radius: var(--border-radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        
        .modal-close-btn:hover {
          background-color: var(--bg-sand-low);
          color: var(--color-primary);
        }
        
        .modal-header-section {
          padding: 30px 30px 20px 30px;
          background-color: var(--bg-sand-low);
          border-bottom: 1px solid var(--color-outline-variant);
        }
        
        .modal-badge {
          display: inline-block;
          font-family: var(--font-body);
          font-size: 10px;
          font-weight: 700;
          color: var(--color-primary);
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 8px;
        }
        
        .modal-header-section h2 {
          font-family: var(--font-header);
          font-size: 28px;
          color: var(--color-text-dark);
          margin-bottom: 12px;
        }
        
        .modal-tag-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        
        .modal-tag {
          font-family: var(--font-body);
          font-size: 11px;
          font-weight: 600;
          color: var(--color-text-muted);
          background-color: var(--bg-sand-lowest);
          border: 1px solid var(--color-outline-variant);
          padding: 4px 10px;
          border-radius: var(--border-radius-full);
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .modal-body-section {
          padding: 30px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .modal-body-section h3 {
          font-family: var(--font-header);
          font-size: 18px;
          color: var(--color-text-dark);
        }
        
        .modal-body-section p {
          font-family: var(--font-body);
          font-size: 14px;
          line-height: 1.6;
          color: var(--color-text-muted);
        }
        
        .modal-stats-box {
          background-color: var(--bg-sand-low);
          border-radius: var(--border-radius-lg);
          border: 1px solid var(--color-outline-variant);
          padding: 16px;
          margin-top: 10px;
        }
        
        .modal-stat-data {
          display: flex;
          align-items: center;
          gap: 12px;
          color: var(--color-primary);
        }
        
        .modal-stat-data strong {
          display: block;
          font-size: 14px;
          color: var(--color-text-dark);
        }
        
        .modal-stat-data span {
          display: block;
          font-size: 11px;
          color: var(--color-text-muted);
          font-family: var(--font-body);
        }
        
        .modal-footer-section {
          padding: 0 30px 30px 30px;
        }
      `}</style>
    </div>
  );
};
