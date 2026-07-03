import React from 'react';
import { Image as ImageIcon } from 'lucide-react';

export const Gallery: React.FC = () => {
  const galleryItems = [
    { title: 'Heritage Pottery Vessel', tag: 'Heritage Art', desc: 'Handcrafted terracotta vessel utilizing traditional Sorath wheel-turning techniques.' },
    { title: 'Ahmedabad Grand Hall Convocations', tag: 'Infrastructure', desc: 'The spacious, sunlit interiors of our community hall during the general assembly.' },
    { title: 'Annual Samuh Lagan Celebration', tag: 'Community Support', desc: 'Decorated stages and traditional welcomes at our annual mass marriage celebration.' },
    { title: 'Historic Stepwell Architecture', tag: 'Ancestral Roots', desc: 'A stepwell located near our native Sorath villages, historic inspiration for Vavadiya families.' },
    { title: 'Traditional Garba Courtyard', tag: 'Cultural Nights', desc: 'Earthy lighting arrangements for our Navratri Garba evenings in the courtyard.' },
    { title: 'Academic Honors Convocation', tag: 'Education Guild', desc: 'Our student welfare panels presenting merit awards and scholarship certificates.' },
  ];

  return (
    <div className="container section" id="gallery-page-container">
      <div className="section-header">
        <span className="badge">VISUAL ARCHIVES</span>
        <h1 className="section-title">Community Gallery</h1>
        <p className="section-subtitle">A collection of moments capturing our architectural spaces, ancestral crafts, and social gatherings.</p>
      </div>

      <div className="grid grid-3 gallery-grid" id="gallery-items-grid">
        {galleryItems.map((item, idx) => (
          <div key={idx} className="gallery-item-card" id={`gallery-item-${idx}`}>
            <div className="gallery-item-image">
              <ImageIcon size={48} className="gallery-placeholder-svg" />
              <span className="gallery-item-tag">{item.tag}</span>
            </div>
            <div className="gallery-item-info">
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          </div>
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
        .gallery-item-card {
          background-color: var(--bg-sand-lowest);
          border-radius: var(--border-radius-lg);
          border: 1px solid rgba(221, 192, 186, 0.3);
          overflow: hidden;
          box-shadow: var(--shadow-atmospheric);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          text-align: left;
        }
        .gallery-item-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-card-hover);
          border-color: var(--color-outline-variant);
        }
        .gallery-item-image {
          height: 200px;
          background-color: var(--bg-sand-container-high);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          color: var(--color-primary);
          border-bottom: 1px solid var(--color-outline-variant);
        }
        .gallery-placeholder-svg {
          opacity: 0.4;
          transition: transform 0.3s ease;
        }
        .gallery-item-card:hover .gallery-placeholder-svg {
          transform: scale(1.1);
        }
        .gallery-item-tag {
          position: absolute;
          bottom: 12px;
          left: 12px;
          background-color: rgba(44, 22, 14, 0.8);
          color: var(--bg-sand);
          font-family: var(--font-body);
          font-size: 11px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: var(--border-radius-full);
        }
        .gallery-item-info {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .gallery-item-info h3 {
          font-size: 18px;
          color: var(--color-text-dark);
        }
        .gallery-item-info p {
          font-family: var(--font-body);
          font-size: 13px;
          color: var(--color-text-muted);
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
};
