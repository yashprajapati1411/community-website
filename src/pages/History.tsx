import React, { useState } from 'react';
import { Search, MapPin, Users, Award, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SurnameItem {
  surname: string;
  trade: string;
  region: string;
  count: number;
  origin: string;
}

export const History: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSurname, setSelectedSurname] = useState<SurnameItem | null>(null);

  const surnamesData: SurnameItem[] = [
    {
      surname: 'Kukadiya',
      trade: 'Pottery & Vessels',
      region: 'Sorath District',
      count: 142,
      origin: 'Derived from ancient pottery guilds in Saurashtra. Renowned for creating robust grain containers and clay-baked structural piping.',
    },
    {
      surname: 'Chandegra',
      trade: 'Temple Architecture',
      region: 'Coastal Gujarat',
      count: 98,
      origin: 'Historically credited with kiln-fired brick masonry. Contributed to early mediaeval temple bases and civic stepwell foundations.',
    },
    {
      surname: 'Vavadiya',
      trade: 'Stepwell Irrigation',
      region: 'Saurashtra Plains',
      count: 120,
      origin: 'Derived from the stepwells (Vav) they managed. Integrators of clay-pipe water channels for agrarian irrigation grids.',
    },
    {
      surname: 'Gohil',
      trade: 'Terracotta Sculpting',
      region: 'Bhavnagar Region',
      count: 110,
      origin: 'Associated with artistic clay figures, royal murals, and festive miniature pottery requested by regional courts.',
    },
    {
      surname: 'Parmar',
      trade: 'Trade & Commerce',
      region: 'Rajkot Guilds',
      count: 215,
      origin: 'Pioneered the commerce of earthenware. Established regional guilds which protected artisan rights across western India.',
    },
    {
      surname: 'Chauhan',
      trade: 'Scribes & Education',
      region: 'Ahmedabad Chapter',
      count: 185,
      origin: 'Associated with recording trust records, community genealogies, and pioneering early primary educational trusts.',
    },
    {
      surname: 'Mistry',
      trade: 'Architectural Design',
      region: 'Kutch Borderlands',
      count: 130,
      origin: 'Craftsmen of architectural wood-turning and structural clay roofs. Key advisors for early dome masonry.',
    },
    {
      surname: 'Prajapati',
      trade: 'Clay Artisanry',
      region: 'Sorath Base',
      count: 320,
      origin: 'The original lineage name representing clay creation. Considered keepers of the ancient wheel-turning heritage.',
    },
    {
      surname: 'Solanki',
      trade: 'Kiln Operations',
      region: 'Saurashtra Coast',
      count: 115,
      origin: 'Masters of temperature control and wood-fired kilns. Managed large-scale glazing operations for utility pots.',
    },
    {
      surname: 'Chavda',
      trade: 'Earthenware Supply',
      region: 'Mehsana Chapter',
      count: 94,
      origin: 'Spearheaded logistics of distribution across trade paths. Handled caravans supplying ceramic tiles to urban markets.',
    },
    {
      surname: 'Vaghela',
      trade: 'Agricultural Clay',
      region: 'Gir Borders',
      count: 88,
      origin: 'Specialists in agricultural clay linings for storage wells and water cisterns to prevent seepage.',
    },
    {
      surname: 'Rathod',
      trade: 'Utility Tooling',
      region: 'Surendranagar',
      count: 104,
      origin: 'Designed specialty clay tools used by other artisans, including mold frames, turning pins, and grinding pads.',
    },
  ];

  const filteredSurnames = surnamesData.filter(s =>
    s.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.trade.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.region.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="history-page" id="surnames-history-container">
      <div className="container" style={{ padding: '60px 20px' }}>
        {/* Header */}
        <div className="section-header">
          <span className="badge">GENEALOGICAL ROOTS</span>
          <h1 className="section-title">Surnames History</h1>
          <p className="section-subtitle">
            Discover the ancestral guilds, historical trades, and native regions of our twelve primary community branches.
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

        {/* Vertical Cards Responsive Grid */}
        <motion.div 
          className="grid grid-3 history-grid"
          layout
        >
          <AnimatePresence mode="popLayout">
            {filteredSurnames.map((item) => (
              <motion.div
                key={item.surname}
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
                  <div className="card-trade-badge">{item.trade}</div>
                  
                  <p className="card-short-desc">
                    {item.origin.length > 95 ? item.origin.substring(0, 95) + '...' : item.origin}
                  </p>

                  <div className="card-metadata-section">
                    <div className="meta-row">
                      <MapPin size={14} className="meta-icon" />
                      <span>{item.region}</span>
                    </div>
                    <div className="meta-row">
                      <Users size={14} className="meta-icon" />
                      <span>{item.count} Families Registered</span>
                    </div>
                  </div>
                </div>

                <div className="card-actions">
                  <button 
                    onClick={() => setSelectedSurname(item)}
                    className="btn btn-secondary card-details-btn"
                  >
                    View Details
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredSurnames.length === 0 && (
          <div className="no-history-results">
            <p>No surnames match your query. Try searching another name or native region.</p>
          </div>
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
                  <span className="modal-tag"><Award size={13} /> {selectedSurname.trade}</span>
                  <span className="modal-tag"><MapPin size={13} /> {selectedSurname.region}</span>
                </div>
              </div>

              <div className="modal-body-section">
                <h3>Ancestral Origins & Historical Trade</h3>
                <p>{selectedSurname.origin}</p>

                <div className="modal-stats-box">
                  <div className="modal-stat-data">
                    <Users size={20} />
                    <div>
                      <strong>{selectedSurname.count} Active Families</strong>
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
