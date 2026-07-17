import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Loader2, X } from 'lucide-react';
import { publicService } from '../services/publicService';
import type { GalleryAlbumResponse, GalleryAlbumWithImagesResponse } from '../services/publicService';

export const Gallery: React.FC = () => {
  const [albums, setAlbums] = useState<GalleryAlbumResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedAlbum, setSelectedAlbum] = useState<GalleryAlbumWithImagesResponse | null>(null);
  const [albumError, setAlbumError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        setIsLoading(true);
        const data = await publicService.getGalleryAlbums();
        setAlbums(data);
      } catch (err) {
        setError('Failed to load gallery albums. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAlbums();
  }, []);

  const handleAlbumClick = async (id: number) => {
    try {
      setAlbumError(null);
      const albumData = await publicService.getGalleryAlbumById(id);
      setSelectedAlbum(albumData);
    } catch (err) {
      console.error('Failed to load album details:', err);
      setAlbumError('Unable to load album details right now. Please try again or verify your connection.');
    }
  };

  return (
    <div className="container section" id="gallery-page-container">
      <div className="section-header">
        <span className="badge">VISUAL ARCHIVES</span>
        <h1 className="section-title">Community Gallery</h1>
        <p className="section-subtitle">A collection of moments capturing our architectural spaces, ancestral crafts, and social gatherings.</p>
      </div>

      {albumError && (
        <div className="alert alert-error" style={{ textAlign: 'center', padding: '14px 20px', marginBottom: '24px', borderRadius: '8px', backgroundColor: '#ffebee', color: '#c62828', border: '1px solid #ef9a9a', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', fontFamily: 'var(--font-body)' }}>
          <span>{albumError}</span>
          <button onClick={() => setAlbumError(null)} style={{ background: 'none', border: 'none', color: '#c62828', cursor: 'pointer', fontWeight: 700, fontSize: '16px', lineHeight: 1 }}>✕</button>
        </div>
      )}

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <Loader2 className="animate-spin" size={36} color="var(--color-primary)" />
        </div>
      ) : error ? (
        <div className="alert alert-error" style={{ textAlign: 'center', padding: '20px', marginBottom: '40px' }}>
          {error}
        </div>
      ) : albums.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-text-light)' }}>
          <p>No gallery albums currently published.</p>
        </div>
      ) : (
        <div className="grid grid-3 gallery-grid" id="gallery-items-grid">
          {albums.map((item, idx) => (
            <div 
              key={item.id} 
              className="gallery-item-card" 
              id={`gallery-item-${idx}`}
              onClick={() => handleAlbumClick(item.id)}
              style={{ cursor: 'pointer' }}
            >
              <div className="gallery-item-image">
                {item.cover_image ? (
                  <img src={item.cover_image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <ImageIcon size={48} className="gallery-placeholder-svg" />
                )}
                <span className="gallery-item-tag">Album #{item.id}</span>
              </div>
              <div className="gallery-item-info">
                <h3>{item.title}</h3>
                <p>{item.description || 'Explore moments from this community event.'}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Album Details Modal */}
      {selectedAlbum && (
        <div className="modal-overlay" onClick={() => setSelectedAlbum(null)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="modal-content-card" onClick={(e) => e.stopPropagation()} style={{ backgroundColor: 'var(--bg-sand)', padding: '30px', borderRadius: '12px', maxWidth: '800px', width: '100%', maxHeight: '85vh', overflowY: 'auto', position: 'relative' }}>
            <button 
              onClick={() => setSelectedAlbum(null)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-dark)' }}
            >
              <X size={24} />
            </button>
            <h2 style={{ fontFamily: 'var(--font-header)', color: 'var(--color-primary)', marginBottom: '8px' }}>{selectedAlbum.title}</h2>
            <p style={{ color: 'var(--color-text-light)', marginBottom: '24px' }}>{selectedAlbum.description}</p>
            
            {selectedAlbum.images && selectedAlbum.images.length > 0 ? (
              <div className="grid grid-3" style={{ gap: '16px' }}>
                {selectedAlbum.images.map(img => (
                  <div key={img.id} style={{ borderRadius: '8px', overflow: 'hidden', backgroundColor: 'var(--bg-sand-lowest)', border: '1px solid var(--color-outline-variant)' }}>
                    <img src={img.image_url} alt={img.caption || selectedAlbum.title} style={{ width: '100%', height: '150px', objectFit: 'cover', display: 'block' }} />
                    {img.caption && <p style={{ padding: '8px', fontSize: '12px', textAlign: 'center' }}>{img.caption}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-light)' }}>No images published in this album yet.</p>
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
