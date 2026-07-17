import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard, Users, CalendarDays, Megaphone, Images,
  BookMarked, ShieldCheck, History, X, Plus, Pencil, Trash2,
  Loader2, CheckCircle, XCircle, Eye,
  ChevronDown, ChevronUp, AlertTriangle, BookOpen, Upload, FileText,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/apiClient';
import { adminService } from '../services/adminService';
import type {
  AdminDashboardSummary, AdminMemberResponse, AdminBookingResponse,
  AdminCommitteeMemberResponse, AdminEventResponse, AdminNoticeResponse,
  AdminGalleryAlbumResponse, AdminGalleryImageResponse,
  AdminSurnameHistoryResponse, BookingReviewRequest,
  AdminAnnualReportResponse, AdminEventRegistrationsSummaryResponse,
  RegistrationRequestResponse
} from '../services/adminService';
import './AdminDashboard.css';

// ─── Helpers ────────────────────────────────────────────────────────────────

const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const cls = `badge-status badge-${status.toLowerCase().replace(/\s/g, '-')}`;
  return <span className={cls}>{status}</span>;
};

type AdminTab =
  | 'dashboard' | 'members' | 'registrations' | 'bookings'
  | 'committee' | 'events' | 'notices'
  | 'gallery' | 'history' | 'reports';


// ─── Loader / Empty ─────────────────────────────────────────────────────────

const Loader = () => (
  <div className="admin-loader">
    <Loader2 className="animate-spin" size={32} color="var(--color-primary)" />
    <span>Loading data...</span>
  </div>
);

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div className="admin-empty-state">
    <AlertTriangle size={40} />
    <p>{message}</p>
  </div>
);

// ─── Dashboard Summary ───────────────────────────────────────────────────────

const DashboardPanel: React.FC = () => {
  const [summary, setSummary] = useState<AdminDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminService.getDashboardSummary()
      .then(setSummary)
      .catch(() => setError('Failed to load dashboard summary.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;
  if (error) return <div className="admin-alert admin-alert-error">{error}</div>;
  if (!summary) return null;

  const cards = [
    { label: 'Total Members', value: summary.total_members_count, icon: <Users size={18} /> },
    { label: 'Pending Registrations', value: summary.pending_registrations_count || 0, icon: <UserPlus size={18} /> },
    { label: 'Approved Members', value: summary.approved_members_count ?? summary.verified_members_count, icon: <ShieldCheck size={18} /> },
    { label: 'Rejected Requests', value: summary.rejected_registrations_count || 0, icon: <AlertTriangle size={18} /> },
    { label: 'Verified Members', value: summary.verified_members_count, icon: <ShieldCheck size={18} /> },
    { label: 'Pending Bookings', value: summary.pending_bookings_count, icon: <BookMarked size={18} /> },
    { label: 'Upcoming Events', value: summary.upcoming_events_count, icon: <CalendarDays size={18} /> },
    { label: 'Active Notices', value: summary.active_notices_count, icon: <Megaphone size={18} /> },
    { label: 'Gallery Images', value: summary.gallery_images_count, icon: <Images size={18} /> },
    { label: 'Committee Members', value: summary.committee_members_count, icon: <Users size={18} /> },
  ];


  return (
    <div>
      <div className="admin-stats-grid">
        {cards.map((c, i) => (
          <div key={i} className="admin-stat-card">
            <div className="stat-icon">{c.icon}</div>
            <div className="stat-value">{c.value}</div>
            <div className="stat-label">{c.label}</div>
          </div>
        ))}
      </div>
      <div className="admin-alert admin-alert-success">
        ✓ Platform is operational. All modules are live and connected to the backend.
      </div>
    </div>
  );
};

// ─── Registration Requests Panel ─────────────────────────────────────────────

const RegistrationsPanel: React.FC = () => {
  const [requests, setRequests] = useState<RegistrationRequestResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    adminService.getRegistrationRequests()
      .then(setRequests)
      .catch(() => setError('Failed to load registration requests.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (req: RegistrationRequestResponse) => {
    setActionLoading(req.id);
    try {
      await adminService.approveRegistrationRequest(req.id);
      setSuccessMsg(`Registration for "${req.full_name}" approved successfully.`);
      load();
    } catch { setError('Failed to approve registration request.'); }
    finally { setActionLoading(null); setTimeout(() => setSuccessMsg(null), 3000); }
  };

  const handleReject = async (req: RegistrationRequestResponse) => {
    setActionLoading(req.id);
    try {
      await adminService.rejectRegistrationRequest(req.id);
      setSuccessMsg(`Registration for "${req.full_name}" rejected.`);
      load();
    } catch { setError('Failed to reject registration request.'); }
    finally { setActionLoading(null); setTimeout(() => setSuccessMsg(null), 3000); }
  };

  const filtered = requests.filter(r => {
    const matchSearch = r.full_name.toLowerCase().includes(search.toLowerCase()) || r.mobile.includes(search);
    const matchStatus = filterStatus === 'all' ? true : r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  if (loading) return <Loader />;

  return (
    <div>
      {successMsg && <div className="admin-alert admin-alert-success">{successMsg}</div>}
      {error && <div className="admin-alert admin-alert-error">{error}</div>}
      <div className="admin-toolbar">
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input className="admin-search-input" placeholder="Search by name or mobile..." value={search}
            onChange={e => setSearch(e.target.value)} id="admin-reg-search" />
          <div className="admin-filter-tabs">
            {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
              <button key={f} className={`admin-filter-tab ${filterStatus === f ? 'active' : ''}`}
                onClick={() => setFilterStatus(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-text-muted)' }}>
          {filtered.length} request{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>
      {filtered.length === 0 ? <EmptyState message="No registration requests found." /> : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th><th>Family Head Name</th><th>Mobile Number</th><th>Created Date</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id}>
                  <td>REG-{r.id}</td>
                  <td style={{ fontWeight: 600 }}>{r.full_name}</td>
                  <td>{r.mobile}</td>
                  <td style={{ fontSize: '12px' }}>{fmtDate(r.created_at)}</td>
                  <td><StatusBadge status={r.status} /></td>
                  <td>
                    {r.status === 'pending' ? (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          className="btn-action-icon btn-success"
                          title="Approve Registration"
                          disabled={actionLoading === r.id}
                          onClick={() => handleApprove(r)}
                        >
                          <CheckCircle size={15} />
                          <span style={{ marginLeft: '4px', fontSize: '12px' }}>Approve</span>
                        </button>
                        <button
                          className="btn-action-icon btn-danger"
                          title="Reject Registration"
                          disabled={actionLoading === r.id}
                          onClick={() => handleReject(r)}
                        >
                          <XCircle size={15} />
                          <span style={{ marginLeft: '4px', fontSize: '12px' }}>Reject</span>
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Reviewed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ─── Members Panel ───────────────────────────────────────────────────────────

const MembersPanel: React.FC = () => {
  const [members, setMembers] = useState<AdminMemberResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterVerified, setFilterVerified] = useState<'all' | 'verified' | 'unverified'>('all');
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<AdminMemberResponse | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    adminService.getMembers()
      .then(setMembers)
      .catch(() => setError('Failed to load members.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleVerify = async (member: AdminMemberResponse) => {
    setActionLoading(member.id);
    try {
      await adminService.toggleMemberVerification(member.id, !member.is_verified);
      setSuccessMsg(`Member "${member.full_name}" ${member.is_verified ? 'unverified' : 'verified'} successfully.`);
      load();
    } catch { setError('Failed to update verification status.'); }
    finally { setActionLoading(null); setTimeout(() => setSuccessMsg(null), 3000); }
  };

  const deleteMember = async () => {
    if (!deleteConfirm) return;
    setActionLoading(deleteConfirm.id);
    try {
      await adminService.deleteMember(deleteConfirm.id);
      setSuccessMsg(`Member "${deleteConfirm.full_name}" deleted.`);
      setDeleteConfirm(null);
      load();
    } catch { setError('Failed to delete member.'); }
    finally { setActionLoading(null); setTimeout(() => setSuccessMsg(null), 3000); }
  };

  const filtered = members.filter(m => {
    const matchSearch = m.full_name.toLowerCase().includes(search.toLowerCase()) ||
      m.mobile.includes(search) || (m.email || '').toLowerCase().includes(search.toLowerCase());
    const matchVerified = filterVerified === 'all' ? true :
      filterVerified === 'verified' ? m.is_verified : !m.is_verified;
    return matchSearch && matchVerified;
  });

  if (loading) return <Loader />;

  return (
    <div>
      {successMsg && <div className="admin-alert admin-alert-success">{successMsg}</div>}
      {error && <div className="admin-alert admin-alert-error">{error}</div>}
      <div className="admin-toolbar">
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input className="admin-search-input" placeholder="Search members..." value={search}
            onChange={e => setSearch(e.target.value)} id="admin-members-search" />
          <div className="admin-filter-tabs">
            {(['all', 'verified', 'unverified'] as const).map(f => (
              <button key={f} className={`admin-filter-tab ${filterVerified === f ? 'active' : ''}`}
                onClick={() => setFilterVerified(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-text-muted)' }}>
          {filtered.length} member{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>
      {filtered.length === 0 ? <EmptyState message="No members found." /> : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th><th>Name</th><th>Contact</th><th>Village</th><th>Status</th><th>Joined</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => (
                <tr key={m.id}>
                  <td>SSPV-{m.id}</td>
                  <td>{m.full_name}</td>
                  <td>
                    <div>{m.mobile}</div>
                    {m.email && <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{m.email}</div>}
                  </td>
                  <td>{m.village}</td>
                  <td><StatusBadge status={m.is_verified ? 'verified' : 'pending'} /></td>
                  <td style={{ fontSize: '12px' }}>{fmtDate(m.created_at)}</td>
                  <td>
                    <button
                      className={`btn-action-icon ${m.is_verified ? 'btn-danger' : 'btn-success'}`}
                      title={m.is_verified ? 'Revoke Verification' : 'Verify Member'}
                      onClick={() => toggleVerify(m)}
                      disabled={actionLoading === m.id}
                      id={`verify-member-${m.id}`}
                    >
                      {actionLoading === m.id ? <Loader2 size={14} className="animate-spin" /> : m.is_verified ? <XCircle size={14} /> : <CheckCircle size={14} />}
                    </button>
                    <button className="btn-action-icon btn-danger" title="Delete Member"
                      onClick={() => setDeleteConfirm(m)} id={`delete-member-${m.id}`}>
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="admin-modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <button className="admin-modal-close" onClick={() => setDeleteConfirm(null)}><X size={16} /></button>
            <h2>Confirm Delete</h2>
            <div className="admin-confirm-dialog">
              <AlertTriangle size={40} color="#dc2626" />
              <p>Are you sure you want to delete <strong>{deleteConfirm.full_name}</strong>? This action cannot be undone.</p>
              <div className="admin-modal-footer" style={{ justifyContent: 'center' }}>
                <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                <button className="btn btn-primary" style={{ background: '#dc2626', borderColor: '#dc2626' }}
                  onClick={deleteMember} disabled={actionLoading === deleteConfirm.id}>
                  {actionLoading === deleteConfirm.id ? 'Deleting...' : 'Delete Member'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Bookings Panel ──────────────────────────────────────────────────────────

const BookingsPanel: React.FC = () => {
  const [bookings, setBookings] = useState<AdminBookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewTarget, setReviewTarget] = useState<AdminBookingResponse | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<AdminBookingResponse | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [reviewForm, setReviewForm] = useState<BookingReviewRequest>({
    status: 'approved', amount: 0, payment_status: 'pending', admin_remark: ''
  });

  const load = useCallback(() => {
    setLoading(true);
    adminService.getBookings()
      .then(setBookings)
      .catch(() => setError('Failed to load bookings.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const openReview = (b: AdminBookingResponse) => {
    setReviewTarget(b);
    setReviewForm({
      status: (b.status === 'pending' ? 'approved' : b.status) as 'approved' | 'rejected',
      amount: parseFloat(b.amount) || 0,
      payment_status: (b.payment_status || 'pending') as 'pending' | 'paid' | 'refunded',
      admin_remark: b.admin_remark || ''
    });
  };

  const submitReview = async () => {
    if (!reviewTarget) return;
    setSubmitting(true);
    try {
      await adminService.reviewBooking(reviewTarget.id, reviewForm);
      setSuccessMsg('Booking updated successfully.');
      setReviewTarget(null);
      load();
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Failed to update booking.');
    } finally {
      setSubmitting(false);
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  const deleteBooking = async () => {
    if (!deleteConfirm) return;
    try {
      await adminService.deleteBooking(deleteConfirm.id);
      setSuccessMsg('Booking deleted.');
      setDeleteConfirm(null);
      load();
    } catch { setError('Failed to delete booking.'); }
    finally { setTimeout(() => setSuccessMsg(null), 3000); }
  };

  const statuses = ['all', 'pending', 'approved', 'rejected'];
  const filtered = bookings.filter(b => {
    const matchStatus = filterStatus === 'all' || b.status === filterStatus;
    const matchSearch = b.contact_name.toLowerCase().includes(search.toLowerCase()) ||
      b.hall.toLowerCase().includes(search.toLowerCase()) ||
      (b.event_name || '').toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  if (loading) return <Loader />;

  return (
    <div>
      {successMsg && <div className="admin-alert admin-alert-success">{successMsg}</div>}
      {error && <div className="admin-alert admin-alert-error">{error}</div>}
      <div className="admin-toolbar">
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input className="admin-search-input" placeholder="Search bookings..." value={search}
            onChange={e => setSearch(e.target.value)} id="admin-bookings-search" />
          <div className="admin-filter-tabs">
            {statuses.map(s => (
              <button key={s} className={`admin-filter-tab ${filterStatus === s ? 'active' : ''}`}
                onClick={() => setFilterStatus(s)}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>
      {filtered.length === 0 ? <EmptyState message="No bookings found." /> : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th><th>Contact</th><th>Hall</th><th>Date</th><th>Purpose</th>
                <th>Status</th><th>Amount</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => (
                <tr key={b.id}>
                  <td>#{b.id}</td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{b.contact_name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{b.contact_phone}</div>
                  </td>
                  <td>{b.hall}</td>
                  <td style={{ fontSize: '12px' }}>{fmtDate(b.booking_date)}</td>
                  <td style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {b.purpose}
                  </td>
                  <td><StatusBadge status={b.status} /></td>
                  <td>₹{parseFloat(b.amount).toFixed(2)}</td>
                  <td>
                    <button className="btn-action-icon" title="Review Booking" onClick={() => openReview(b)} id={`review-booking-${b.id}`}>
                      <Eye size={14} />
                    </button>
                    <button className="btn-action-icon btn-danger" title="Delete Booking" onClick={() => setDeleteConfirm(b)} id={`delete-booking-${b.id}`}>
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Review Modal */}
      {reviewTarget && (
        <div className="admin-modal-overlay" onClick={() => setReviewTarget(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <button className="admin-modal-close" onClick={() => setReviewTarget(null)}><X size={16} /></button>
            <h2>Review Booking #{reviewTarget.id}</h2>
            <p className="modal-subtitle">Update the booking status, amount, and leave an admin remark.</p>
            <div className="booking-detail-grid">
              <div className="booking-detail-item"><label>Contact</label><span>{reviewTarget.contact_name}</span></div>
              <div className="booking-detail-item"><label>Phone</label><span>{reviewTarget.contact_phone}</span></div>
              <div className="booking-detail-item"><label>Hall</label><span>{reviewTarget.hall}</span></div>
              <div className="booking-detail-item"><label>Date</label><span>{fmtDate(reviewTarget.booking_date)}</span></div>
              <div className="booking-detail-item"><label>Purpose</label><span>{reviewTarget.purpose}</span></div>
              <div className="booking-detail-item"><label>Members</label><span>{reviewTarget.member_count}</span></div>
            </div>
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label className="admin-form-label">Decision</label>
                <select className="admin-form-select" value={reviewForm.status}
                  onChange={e => setReviewForm(f => ({ ...f, status: e.target.value as 'approved' | 'rejected' }))} id="booking-review-status">
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Amount (₹)</label>
                <input className="admin-form-input" type="number" min="0" step="0.01"
                  value={reviewForm.amount} onChange={e => setReviewForm(f => ({ ...f, amount: parseFloat(e.target.value) || 0 }))}
                  id="booking-review-amount" />
              </div>
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Payment Status</label>
              <select className="admin-form-select" value={reviewForm.payment_status}
                onChange={e => setReviewForm(f => ({ ...f, payment_status: e.target.value as 'pending' | 'paid' | 'refunded' }))} id="booking-review-payment-status">
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Admin Remark</label>
              <textarea className="admin-form-textarea" value={reviewForm.admin_remark}
                onChange={e => setReviewForm(f => ({ ...f, admin_remark: e.target.value }))}
                placeholder="Optional remark visible to the member..." id="booking-review-remark" />
            </div>
            <div className="admin-modal-footer">
              <button className="btn btn-secondary" onClick={() => setReviewTarget(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={submitReview} disabled={submitting} id="booking-review-submit">
                {submitting ? 'Saving...' : 'Save Review'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="admin-modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <button className="admin-modal-close" onClick={() => setDeleteConfirm(null)}><X size={16} /></button>
            <h2>Delete Booking</h2>
            <div className="admin-confirm-dialog">
              <AlertTriangle size={36} color="#dc2626" />
              <p>Delete booking #{deleteConfirm.id} by <strong>{deleteConfirm.contact_name}</strong>?</p>
              <div className="admin-modal-footer" style={{ justifyContent: 'center' }}>
                <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                <button className="btn btn-primary" style={{ background: '#dc2626', borderColor: '#dc2626' }} onClick={deleteBooking}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Committee Panel ─────────────────────────────────────────────────────────

type CommitteeForm = {
  name: string; designation: string; phone: string; email: string;
  term_start: string; term_end: string; image_url: string; display_order: number; is_active: boolean;
};

const defaultCommitteeForm = (): CommitteeForm => ({
  name: '', designation: '', phone: '', email: '', term_start: '', term_end: '',
  image_url: '', display_order: 1, is_active: true
});

const CommitteePanel: React.FC = () => {
  const [items, setItems] = useState<AdminCommitteeMemberResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminCommitteeMemberResponse | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<AdminCommitteeMemberResponse | null>(null);
  const [form, setForm] = useState<CommitteeForm>(defaultCommitteeForm());
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    adminService.getCommittee().then(setItems).catch(() => setError('Failed to load committee.')).finally(() => setLoading(false));
  }, []);
  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditTarget(null); setForm(defaultCommitteeForm()); setShowModal(true); };
  const openEdit = (m: AdminCommitteeMemberResponse) => {
    setEditTarget(m);
    setForm({ name: m.name, designation: m.designation, phone: m.phone || '', email: m.email || '',
      term_start: m.term_start, term_end: m.term_end || '', image_url: m.image_url || '',
      display_order: m.display_order, is_active: m.is_active });
    setShowModal(true);
  };

  const submit = async () => {
    if (!form.name.trim() || !form.designation.trim() || !form.term_start) {
      setError('Name, designation, and term start are required.'); return;
    }
    setSubmitting(true);
    try {
      const payload = { ...form, phone: form.phone || undefined, email: form.email || undefined,
        term_end: form.term_end || undefined, image_url: form.image_url || undefined };
      if (editTarget) {
        await adminService.updateCommitteeMember(editTarget.id, payload);
        setSuccessMsg('Committee member updated.');
      } else {
        await adminService.createCommitteeMember(payload);
        setSuccessMsg('Committee member added.');
      }
      setShowModal(false); load();
    } catch (e: any) { setError(e.response?.data?.detail || 'Operation failed.'); }
    finally { setSubmitting(false); setTimeout(() => setSuccessMsg(null), 3000); }
  };

  const deleteItem = async () => {
    if (!deleteConfirm) return;
    try {
      await adminService.deleteCommitteeMember(deleteConfirm.id);
      setSuccessMsg('Member deleted.'); setDeleteConfirm(null); load();
    } catch { setError('Failed to delete.'); }
    finally { setTimeout(() => setSuccessMsg(null), 3000); }
  };

  if (loading) return <Loader />;

  return (
    <div>
      {successMsg && <div className="admin-alert admin-alert-success">{successMsg}</div>}
      {error && <div className="admin-alert admin-alert-error">{error}</div>}
      <div className="admin-toolbar">
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-text-muted)' }}>{items.length} member{items.length !== 1 ? 's' : ''}</span>
        <button className="btn btn-primary" onClick={openCreate} id="add-committee-member-btn" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', padding: '8px 16px' }}>
          <Plus size={15} /> Add Member
        </button>
      </div>
      {items.length === 0 ? <EmptyState message="No committee members yet." /> : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead><tr><th>Order</th><th>Name</th><th>Designation</th><th>Contact</th><th>Term</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {items.sort((a, b) => a.display_order - b.display_order).map(m => (
                <tr key={m.id}>
                  <td>{m.display_order}</td>
                  <td>{m.name}</td>
                  <td>{m.designation}</td>
                  <td style={{ fontSize: '12px' }}>{m.phone || m.email || '—'}</td>
                  <td style={{ fontSize: '12px' }}>{fmtDate(m.term_start)} – {m.term_end ? fmtDate(m.term_end) : 'Present'}</td>
                  <td><StatusBadge status={m.is_active ? 'active' : 'draft'} /></td>
                  <td>
                    <button className="btn-action-icon" onClick={() => openEdit(m)} id={`edit-committee-${m.id}`}><Pencil size={14} /></button>
                    <button className="btn-action-icon btn-danger" onClick={() => setDeleteConfirm(m)} id={`delete-committee-${m.id}`}><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <button className="admin-modal-close" onClick={() => setShowModal(false)}><X size={16} /></button>
            <h2>{editTarget ? 'Edit' : 'Add'} Committee Member</h2>
            <p className="modal-subtitle">Fill in the member details below.</p>
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label className="admin-form-label">Full Name *</label>
                <input className="admin-form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} id="committee-form-name" />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Designation *</label>
                <input className="admin-form-input" value={form.designation} onChange={e => setForm(f => ({ ...f, designation: e.target.value }))} id="committee-form-designation" />
              </div>
            </div>
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label className="admin-form-label">Phone</label>
                <input className="admin-form-input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} id="committee-form-phone" />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Email</label>
                <input className="admin-form-input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} id="committee-form-email" />
              </div>
            </div>
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label className="admin-form-label">Term Start *</label>
                <input className="admin-form-input" type="date" value={form.term_start} onChange={e => setForm(f => ({ ...f, term_start: e.target.value }))} id="committee-form-term-start" />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Term End</label>
                <input className="admin-form-input" type="date" value={form.term_end} onChange={e => setForm(f => ({ ...f, term_end: e.target.value }))} id="committee-form-term-end" />
              </div>
            </div>
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label className="admin-form-label">Display Order</label>
                <input className="admin-form-input" type="number" min="1" value={form.display_order} onChange={e => setForm(f => ({ ...f, display_order: parseInt(e.target.value) || 1 }))} id="committee-form-order" />
              </div>
              <div className="admin-form-group" style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '2px' }}>
                <label className="admin-form-checkbox-label">
                  <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} id="committee-form-active" />
                  Active Member
                </label>
              </div>
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Photo URL</label>
              <input className="admin-form-input" placeholder="https://..." value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} id="committee-form-image-url" />
              {form.image_url && <img src={form.image_url} alt="preview" className="img-url-preview" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
            </div>
            <div className="admin-modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={submit} disabled={submitting} id="committee-form-submit">{submitting ? 'Saving...' : editTarget ? 'Update' : 'Add Member'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="admin-modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <button className="admin-modal-close" onClick={() => setDeleteConfirm(null)}><X size={16} /></button>
            <h2>Delete Member</h2>
            <div className="admin-confirm-dialog">
              <AlertTriangle size={36} color="#dc2626" />
              <p>Delete <strong>{deleteConfirm.name}</strong>?</p>
              <div className="admin-modal-footer" style={{ justifyContent: 'center' }}>
                <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                <button className="btn btn-primary" style={{ background: '#dc2626', borderColor: '#dc2626' }} onClick={deleteItem}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Events Panel ────────────────────────────────────────────────────────────

type EventForm = {
  title: string; description: string; event_date: string; location: string;
  status: string; cover_image: string; is_featured: boolean;
  registration_deadline: string; max_capacity: string; form_fields: string[];
};

const defaultEventForm = (): EventForm => ({
  title: '', description: '', event_date: '', location: '', status: 'draft',
  cover_image: '', is_featured: false, registration_deadline: '', max_capacity: '',
  form_fields: ['name', 'mobile', 'member_count', 'remarks']
});

const EventsPanel: React.FC = () => {
  const [items, setItems] = useState<AdminEventResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminEventResponse | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<AdminEventResponse | null>(null);
  const [form, setForm] = useState<EventForm>(defaultEventForm());
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [viewRegEvent, setViewRegEvent] = useState<AdminEventResponse | null>(null);
  const [regSummary, setRegSummary] = useState<AdminEventRegistrationsSummaryResponse | null>(null);
  const [loadingRegs, setLoadingRegs] = useState(false);


  const load = useCallback(() => {
    setLoading(true);
    adminService.getEvents().then(setItems).catch(() => setError('Failed to load events.')).finally(() => setLoading(false));
  }, []);
  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditTarget(null); setForm(defaultEventForm()); setFormErrors({}); setError(null); setShowModal(true); };
  const openEdit = (ev: AdminEventResponse) => {
    setEditTarget(ev);
    setFormErrors({});
    setError(null);
    setForm({
      title: ev.title, description: ev.description, event_date: ev.event_date,
      location: ev.location, status: ev.status, cover_image: ev.cover_image || '',
      is_featured: ev.is_featured, registration_deadline: ev.registration_deadline || '',
      max_capacity: ev.max_capacity?.toString() || '',
      form_fields: ev.form_fields || ['name', 'mobile', 'member_count', 'remarks']
    });
    setShowModal(true);
  };

  const openViewRegistrations = async (ev: AdminEventResponse) => {
    setViewRegEvent(ev);
    setLoadingRegs(true);
    try {
      const summary = await adminService.getEventRegistrations(ev.id);
      setRegSummary(summary);
    } catch {
      setError('Failed to load event registrations.');
      setViewRegEvent(null);
    } finally {
      setLoadingRegs(false);
    }
  };


  const submit = async () => {
    setFormErrors({});
    setError(null);
    const errors: Record<string, string> = {};
    if (!form.title.trim()) {
      errors.title = 'Title is required.';
    } else if (form.title.trim().length < 2) {
      errors.title = 'Title must be at least 2 characters.';
    }
    if (!form.description.trim()) {
      errors.description = 'Description is required.';
    } else if (form.description.trim().length < 5) {
      errors.description = 'Description must be at least 5 characters.';
    }
    if (!form.event_date) {
      errors.event_date = 'Event Date is required.';
    } else if (isNaN(Date.parse(form.event_date))) {
      errors.event_date = 'Invalid date format.';
    }
    if (!form.location.trim()) {
      errors.location = 'Location is required.';
    } else if (form.location.trim().length < 2) {
      errors.location = 'Location must be at least 2 characters.';
    }
    if (form.registration_deadline && isNaN(Date.parse(form.registration_deadline))) {
      errors.registration_deadline = 'Invalid deadline date format.';
    }
    if (form.max_capacity !== undefined && form.max_capacity !== '') {
      const cap = Number(form.max_capacity);
      if (isNaN(cap) || !Number.isInteger(cap) || cap < 1) {
        errors.max_capacity = 'Max Capacity must be a positive integer (>= 1).';
      }
    }
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        title: form.title, description: form.description, event_date: form.event_date,
        location: form.location, status: form.status,
        cover_image: form.cover_image || undefined, is_featured: form.is_featured,
        registration_deadline: form.registration_deadline || undefined,
        max_capacity: form.max_capacity ? parseInt(form.max_capacity) : undefined,
        form_fields: form.form_fields
      };
      if (editTarget) { await adminService.updateEvent(editTarget.id, payload); setSuccessMsg('Event updated.'); }
      else { await adminService.createEvent(payload); setSuccessMsg('Event created.'); }
      setShowModal(false); load();
    } catch (e: any) {
      const errData = e.response?.data?.detail;
      if (Array.isArray(errData)) {
        const newErrors: Record<string, string> = {};
        const msgs: string[] = [];
        errData.forEach((item: any) => {
          const field = item.loc && item.loc[item.loc.length - 1];
          const msg = item.msg || 'Invalid value';
          if (field && typeof field === 'string') {
            newErrors[field] = msg;
          }
          msgs.push(`${field ? field + ': ' : ''}${msg}`);
        });
        setFormErrors(newErrors);
        setError(`Validation Error: ${msgs.join(' | ')}`);
      } else if (typeof errData === 'string') {
        setError(errData);
      } else if (errData && typeof errData === 'object') {
        setError(JSON.stringify(errData));
      } else {
        setError('Operation failed.');
      }
    } finally { setSubmitting(false); setTimeout(() => setSuccessMsg(null), 3000); }
  };

  const deleteItem = async () => {
    if (!deleteConfirm) return;
    try { await adminService.deleteEvent(deleteConfirm.id); setSuccessMsg('Event deleted.'); setDeleteConfirm(null); load(); }
    catch { setError('Failed to delete.'); }
    finally { setTimeout(() => setSuccessMsg(null), 3000); }
  };

  if (loading) return <Loader />;

  return (
    <div>
      {successMsg && <div className="admin-alert admin-alert-success">{successMsg}</div>}
      {error && <div className="admin-alert admin-alert-error">{error}</div>}
      <div className="admin-toolbar">
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-text-muted)' }}>{items.length} event{items.length !== 1 ? 's' : ''}</span>
        <button className="btn btn-primary" onClick={openCreate} id="add-event-btn" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', padding: '8px 16px' }}>
          <Plus size={15} /> Add Event
        </button>
      </div>
      {items.length === 0 ? <EmptyState message="No events yet." /> : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead><tr><th>Title</th><th>Date</th><th>Location</th><th>Status</th><th>Featured</th><th>Actions</th></tr></thead>
            <tbody>
              {items.map(ev => (
                <tr key={ev.id}>
                  <td style={{ fontWeight: 500 }}>{ev.title}</td>
                  <td style={{ fontSize: '12px' }}>{fmtDate(ev.event_date)}</td>
                  <td style={{ fontSize: '12px', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.location}</td>
                  <td><StatusBadge status={ev.status} /></td>
                  <td>{ev.is_featured ? '⭐ Yes' : 'No'}</td>
                  <td>
                    <button className="btn-action-icon" style={{ color: 'var(--color-primary)' }} onClick={() => openViewRegistrations(ev)} title="View Registrations" id={`view-reg-${ev.id}`}><Users size={14} /></button>
                    <button className="btn-action-icon" onClick={() => openEdit(ev)} id={`edit-event-${ev.id}`}><Pencil size={14} /></button>
                    <button className="btn-action-icon btn-danger" onClick={() => setDeleteConfirm(ev)} id={`delete-event-${ev.id}`}><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <button className="admin-modal-close" onClick={() => setShowModal(false)}><X size={16} /></button>
            <h2>{editTarget ? 'Edit' : 'Create'} Event</h2>
            <p className="modal-subtitle">Fill in the event information below.</p>
            <div className="admin-form-group">
              <label className="admin-form-label">Title *</label>
              <input className="admin-form-input" style={formErrors.title ? { borderColor: '#dc2626' } : {}} value={form.title} onChange={e => { setForm(f => ({ ...f, title: e.target.value })); if (formErrors.title) setFormErrors(err => ({ ...err, title: '' })); }} id="event-form-title" />
              {formErrors.title && <span style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px', display: 'block' }}>{formErrors.title}</span>}
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Description</label>
              <textarea className="admin-form-textarea" style={formErrors.description ? { borderColor: '#dc2626' } : {}} value={form.description} onChange={e => { setForm(f => ({ ...f, description: e.target.value })); if (formErrors.description) setFormErrors(err => ({ ...err, description: '' })); }} id="event-form-description" />
              {formErrors.description && <span style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px', display: 'block' }}>{formErrors.description}</span>}
            </div>
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label className="admin-form-label">Event Date *</label>
                <input className="admin-form-input" style={formErrors.event_date ? { borderColor: '#dc2626' } : {}} type="date" value={form.event_date} onChange={e => { setForm(f => ({ ...f, event_date: e.target.value })); if (formErrors.event_date) setFormErrors(err => ({ ...err, event_date: '' })); }} id="event-form-date" />
                {formErrors.event_date && <span style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px', display: 'block' }}>{formErrors.event_date}</span>}
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Status</label>
                <select className="admin-form-select" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} id="event-form-status">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Location *</label>
              <input className="admin-form-input" style={formErrors.location ? { borderColor: '#dc2626' } : {}} value={form.location} onChange={e => { setForm(f => ({ ...f, location: e.target.value })); if (formErrors.location) setFormErrors(err => ({ ...err, location: '' })); }} id="event-form-location" />
              {formErrors.location && <span style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px', display: 'block' }}>{formErrors.location}</span>}
            </div>
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label className="admin-form-label">Registration Deadline</label>
                <input className="admin-form-input" style={formErrors.registration_deadline ? { borderColor: '#dc2626' } : {}} type="date" value={form.registration_deadline} onChange={e => { setForm(f => ({ ...f, registration_deadline: e.target.value })); if (formErrors.registration_deadline) setFormErrors(err => ({ ...err, registration_deadline: '' })); }} id="event-form-deadline" />
                {formErrors.registration_deadline && <span style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px', display: 'block' }}>{formErrors.registration_deadline}</span>}
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Max Capacity</label>
                <input className="admin-form-input" style={formErrors.max_capacity ? { borderColor: '#dc2626' } : {}} type="number" min="1" value={form.max_capacity} onChange={e => { setForm(f => ({ ...f, max_capacity: e.target.value })); if (formErrors.max_capacity) setFormErrors(err => ({ ...err, max_capacity: '' })); }} id="event-form-capacity" />
                {formErrors.max_capacity && <span style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px', display: 'block' }}>{formErrors.max_capacity}</span>}
              </div>
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Cover Image URL</label>
              <input className="admin-form-input" placeholder="https://..." value={form.cover_image} onChange={e => setForm(f => ({ ...f, cover_image: e.target.value }))} id="event-form-cover-image" />
              {form.cover_image && <img src={form.cover_image} alt="preview" className="img-url-preview" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Registration Form Required Fields</label>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '4px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                  <input type="checkbox" checked={form.form_fields?.includes('name')} disabled /> Name (Required)
                </label>
                {['mobile', 'email', 'member_count', 'remarks'].map(field => (
                  <label key={field} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', textTransform: 'capitalize' }}>
                    <input
                      type="checkbox"
                      checked={form.form_fields?.includes(field)}
                      onChange={e => {
                        const checked = e.target.checked;
                        setForm(f => ({
                          ...f,
                          form_fields: checked
                            ? [...(f.form_fields || []), field]
                            : (f.form_fields || []).filter(x => x !== field)
                        }));
                      }}
                      id={`event-field-${field}`}
                    />
                    {field === 'member_count' ? 'Attendees Count' : field}
                  </label>
                ))}
              </div>
            </div>
            <label className="admin-form-checkbox-label">
              <input type="checkbox" checked={form.is_featured} onChange={e => setForm(f => ({ ...f, is_featured: e.target.checked }))} id="event-form-featured" />
              Mark as Featured Event
            </label>
            <div className="admin-modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={submit} disabled={submitting} id="event-form-submit">{submitting ? 'Saving...' : editTarget ? 'Update' : 'Create Event'}</button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="admin-modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <button className="admin-modal-close" onClick={() => setDeleteConfirm(null)}><X size={16} /></button>
            <h2>Delete Event</h2>
            <div className="admin-confirm-dialog">
              <AlertTriangle size={36} color="#dc2626" />
              <p>Delete <strong>{deleteConfirm.title}</strong>?</p>
              <div className="admin-modal-footer" style={{ justifyContent: 'center' }}>
                <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                <button className="btn btn-primary" style={{ background: '#dc2626', borderColor: '#dc2626' }} onClick={deleteItem}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewRegEvent && (
        <div className="admin-modal-overlay" onClick={() => setViewRegEvent(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px', width: '90%' }}>
            <button className="admin-modal-close" onClick={() => setViewRegEvent(null)}><X size={16} /></button>
            <h2>Registrations: {viewRegEvent.title}</h2>
            <p className="modal-subtitle">Summary and detailed attendee roster for this event.</p>

            {loadingRegs || !regSummary ? (
              <Loader />
            ) : (
              <div>
                <div className="admin-stats-grid" style={{ marginBottom: '20px', gridTemplateColumns: '1fr 1fr' }}>
                  <div className="admin-stat-card">
                    <div className="stat-value">{regSummary.total_registrations}</div>
                    <div className="stat-label">Total Registrations</div>
                  </div>
                  <div className="admin-stat-card">
                    <div className="stat-value">{regSummary.total_expected_attendees}</div>
                    <div className="stat-label">Expected Attendees</div>
                  </div>
                </div>

                {regSummary.registrations.length === 0 ? (
                  <EmptyState message="No registrations received yet for this event." />
                ) : (
                  <div className="admin-table-wrapper" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Mobile</th>
                          <th>Email</th>
                          <th>Attendees</th>
                          <th>Remarks</th>
                          <th>Registered At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {regSummary.registrations.map(reg => (
                          <tr key={reg.id}>
                            <td style={{ fontWeight: 600 }}>{reg.name}</td>
                            <td>{reg.mobile || '—'}</td>
                            <td>{reg.email || '—'}</td>
                            <td><span className="badge-status badge-approved" style={{ padding: '2px 8px' }}>{reg.member_count}</span></td>
                            <td style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{reg.remarks || '—'}</td>
                            <td style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{fmtDate(reg.created_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Notices Panel ───────────────────────────────────────────────────────────

type NoticeForm = {
  title: string; description: string; priority: string; publish_date: string;
  expiry_date: string; attachment: string; show_on_homepage: boolean; is_pinned: boolean; is_active: boolean;
};

const defaultNoticeForm = (): NoticeForm => ({
  title: '', description: '', priority: 'medium', publish_date: new Date().toISOString().split('T')[0],
  expiry_date: '', attachment: '', show_on_homepage: true, is_pinned: false, is_active: true
});

const NoticesPanel: React.FC = () => {
  const [items, setItems] = useState<AdminNoticeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminNoticeResponse | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<AdminNoticeResponse | null>(null);
  const [form, setForm] = useState<NoticeForm>(defaultNoticeForm());
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    adminService.getNotices().then(setItems).catch(() => setError('Failed to load notices.')).finally(() => setLoading(false));
  }, []);
  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditTarget(null); setForm(defaultNoticeForm()); setShowModal(true); };
  const openEdit = (n: AdminNoticeResponse) => {
    setEditTarget(n);
    setForm({
      title: n.title, description: n.description, priority: n.priority,
      publish_date: n.publish_date, expiry_date: n.expiry_date || '',
      attachment: n.attachment || '', show_on_homepage: n.show_on_homepage,
      is_pinned: n.is_pinned, is_active: n.is_active
    });
    setShowModal(true);
  };

  const submit = async () => {
    if (!form.title.trim() || !form.publish_date) { setError('Title and publish date are required.'); return; }
    setSubmitting(true);
    try {
      const payload = {
        title: form.title, description: form.description, priority: form.priority,
        publish_date: form.publish_date, expiry_date: form.expiry_date || undefined,
        attachment: form.attachment || undefined, show_on_homepage: form.show_on_homepage,
        is_pinned: form.is_pinned, is_active: form.is_active
      };
      if (editTarget) { await adminService.updateNotice(editTarget.id, payload); setSuccessMsg('Notice updated.'); }
      else { await adminService.createNotice(payload); setSuccessMsg('Notice created.'); }
      setShowModal(false); load();
    } catch (e: any) { setError(e.response?.data?.detail || 'Operation failed.'); }
    finally { setSubmitting(false); setTimeout(() => setSuccessMsg(null), 3000); }
  };

  const deleteItem = async () => {
    if (!deleteConfirm) return;
    try { await adminService.deleteNotice(deleteConfirm.id); setSuccessMsg('Notice deleted.'); setDeleteConfirm(null); load(); }
    catch { setError('Failed to delete.'); }
    finally { setTimeout(() => setSuccessMsg(null), 3000); }
  };

  if (loading) return <Loader />;

  return (
    <div>
      {successMsg && <div className="admin-alert admin-alert-success">{successMsg}</div>}
      {error && <div className="admin-alert admin-alert-error">{error}</div>}
      <div className="admin-toolbar">
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-text-muted)' }}>{items.length} notice{items.length !== 1 ? 's' : ''}</span>
        <button className="btn btn-primary" onClick={openCreate} id="add-notice-btn" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', padding: '8px 16px' }}>
          <Plus size={15} /> Add Notice
        </button>
      </div>
      {items.length === 0 ? <EmptyState message="No notices yet." /> : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead><tr><th>Title</th><th>Priority</th><th>Published</th><th>Expires</th><th>Status</th><th>Pinned</th><th>Actions</th></tr></thead>
            <tbody>
              {items.map(n => (
                <tr key={n.id}>
                  <td style={{ fontWeight: 500 }}>{n.title}</td>
                  <td><StatusBadge status={n.priority} /></td>
                  <td style={{ fontSize: '12px' }}>{fmtDate(n.publish_date)}</td>
                  <td style={{ fontSize: '12px' }}>{n.expiry_date ? fmtDate(n.expiry_date) : '—'}</td>
                  <td><StatusBadge status={n.is_active ? 'active' : 'draft'} /></td>
                  <td>{n.is_pinned ? '📌 Yes' : 'No'}</td>
                  <td>
                    <button className="btn-action-icon" onClick={() => openEdit(n)} id={`edit-notice-${n.id}`}><Pencil size={14} /></button>
                    <button className="btn-action-icon btn-danger" onClick={() => setDeleteConfirm(n)} id={`delete-notice-${n.id}`}><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <button className="admin-modal-close" onClick={() => setShowModal(false)}><X size={16} /></button>
            <h2>{editTarget ? 'Edit' : 'Create'} Notice</h2>
            <p className="modal-subtitle">Configure the notice settings below.</p>
            <div className="admin-form-group">
              <label className="admin-form-label">Title *</label>
              <input className="admin-form-input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} id="notice-form-title" />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Description</label>
              <textarea className="admin-form-textarea" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} id="notice-form-description" />
            </div>
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label className="admin-form-label">Priority</label>
                <select className="admin-form-select" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} id="notice-form-priority">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Publish Date *</label>
                <input className="admin-form-input" type="date" value={form.publish_date} onChange={e => setForm(f => ({ ...f, publish_date: e.target.value }))} id="notice-form-publish-date" />
              </div>
            </div>
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label className="admin-form-label">Expiry Date</label>
                <input className="admin-form-input" type="date" value={form.expiry_date} onChange={e => setForm(f => ({ ...f, expiry_date: e.target.value }))} id="notice-form-expiry-date" />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Attachment URL</label>
                <input className="admin-form-input" placeholder="https://..." value={form.attachment} onChange={e => setForm(f => ({ ...f, attachment: e.target.value }))} id="notice-form-attachment" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '8px' }}>
              <label className="admin-form-checkbox-label">
                <input type="checkbox" checked={form.show_on_homepage} onChange={e => setForm(f => ({ ...f, show_on_homepage: e.target.checked }))} id="notice-form-homepage" />
                Show on Homepage
              </label>
              <label className="admin-form-checkbox-label">
                <input type="checkbox" checked={form.is_pinned} onChange={e => setForm(f => ({ ...f, is_pinned: e.target.checked }))} id="notice-form-pinned" />
                Pin Notice
              </label>
              <label className="admin-form-checkbox-label">
                <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} id="notice-form-active" />
                Active
              </label>
            </div>
            <div className="admin-modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={submit} disabled={submitting} id="notice-form-submit">{submitting ? 'Saving...' : editTarget ? 'Update' : 'Create Notice'}</button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="admin-modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <button className="admin-modal-close" onClick={() => setDeleteConfirm(null)}><X size={16} /></button>
            <h2>Delete Notice</h2>
            <div className="admin-confirm-dialog">
              <AlertTriangle size={36} color="#dc2626" />
              <p>Delete <strong>{deleteConfirm.title}</strong>?</p>
              <div className="admin-modal-footer" style={{ justifyContent: 'center' }}>
                <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                <button className="btn btn-primary" style={{ background: '#dc2626', borderColor: '#dc2626' }} onClick={deleteItem}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Gallery Panel ───────────────────────────────────────────────────────────

const GalleryPanel: React.FC = () => {
  const [albums, setAlbums] = useState<AdminGalleryAlbumResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showAlbumModal, setShowAlbumModal] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminGalleryAlbumResponse | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<AdminGalleryAlbumResponse | null>(null);
  const [albumForm, setAlbumForm] = useState({ title: '', description: '', cover_image: '', display_order: 1 });
  const [submitting, setSubmitting] = useState(false);

  // Image management
  const [expandedAlbumId, setExpandedAlbumId] = useState<number | null>(null);
  const [albumImages, setAlbumImages] = useState<Record<number, AdminGalleryImageResponse[]>>({});
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageTargetAlbumId, setImageTargetAlbumId] = useState<number | null>(null);
  const [imageForm, setImageForm] = useState({ caption: '', image_url: '' });
  const [loadingImages, setLoadingImages] = useState<number | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    adminService.getGalleryAlbums().then(setAlbums).catch(() => setError('Failed to load gallery.')).finally(() => setLoading(false));
  }, []);
  useEffect(() => { load(); }, [load]);

  const loadImages = async (albumId: number) => {
    if (albumImages[albumId]) return;
    setLoadingImages(albumId);
    try {
      const res = await apiClient.get(`/public/gallery/albums/${albumId}`);
      const images = res.data?.images || [];
      setAlbumImages(prev => ({ ...prev, [albumId]: images }));
    } catch { setAlbumImages(prev => ({ ...prev, [albumId]: [] })); }
    finally { setLoadingImages(null); }
  };

  const toggleAlbum = async (albumId: number) => {
    if (expandedAlbumId === albumId) { setExpandedAlbumId(null); return; }
    setExpandedAlbumId(albumId);
    await loadImages(albumId);
  };

  const openCreateAlbum = () => { setEditTarget(null); setAlbumForm({ title: '', description: '', cover_image: '', display_order: 1 }); setShowAlbumModal(true); };
  const openEditAlbum = (a: AdminGalleryAlbumResponse) => {
    setEditTarget(a);
    setAlbumForm({ title: a.title, description: a.description || '', cover_image: a.cover_image || '', display_order: a.display_order });
    setShowAlbumModal(true);
  };

  const submitAlbum = async () => {
    if (!albumForm.title.trim()) { setError('Title is required.'); return; }
    setSubmitting(true);
    try {
      const payload = { ...albumForm, description: albumForm.description || undefined, cover_image: albumForm.cover_image || undefined };
      if (editTarget) { await adminService.updateGalleryAlbum(editTarget.id, payload); setSuccessMsg('Album updated.'); }
      else { await adminService.createGalleryAlbum(payload); setSuccessMsg('Album created.'); }
      setShowAlbumModal(false); load();
    } catch (e: any) { setError(e.response?.data?.detail || 'Operation failed.'); }
    finally { setSubmitting(false); setTimeout(() => setSuccessMsg(null), 3000); }
  };

  const deleteAlbum = async () => {
    if (!deleteConfirm) return;
    try { await adminService.deleteGalleryAlbum(deleteConfirm.id); setSuccessMsg('Album deleted.'); setDeleteConfirm(null); load(); }
    catch { setError('Failed to delete album.'); }
    finally { setTimeout(() => setSuccessMsg(null), 3000); }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
    const urls = files.map(f => URL.createObjectURL(f));
    setFilePreviews(prev => [...prev, ...urls]);
  };

  const removeSelectedFile = (index: number) => {
    URL.revokeObjectURL(filePreviews[index]);
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setFilePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const addImage = async () => {
    if (!imageTargetAlbumId) return;
    if (selectedFiles.length === 0 && !imageForm.image_url.trim()) {
      setError('Please choose local images or enter an Image URL.');
      return;
    }
    setSubmitting(true);
    setUploadProgress(null);
    try {
      if (selectedFiles.length > 0) {
        const newImages: AdminGalleryImageResponse[] = [];
        for (let i = 0; i < selectedFiles.length; i++) {
          setUploadProgress(`Uploading image ${i + 1} of ${selectedFiles.length}...`);
          const file = selectedFiles[i];
          const uploadRes = await adminService.uploadFile(file, 'gallery');
          const img = await adminService.addImageToAlbum(imageTargetAlbumId, {
            caption: imageForm.caption || undefined,
            image_url: uploadRes.url
          });
          newImages.push(img);
        }
        setAlbumImages(prev => ({ ...prev, [imageTargetAlbumId]: [...(prev[imageTargetAlbumId] || []), ...newImages] }));
        setSuccessMsg(`Successfully uploaded ${selectedFiles.length} image(s).`);
        selectedFiles.forEach((_, i) => URL.revokeObjectURL(filePreviews[i]));
        setSelectedFiles([]);
        setFilePreviews([]);
      } else {
        const img = await adminService.addImageToAlbum(imageTargetAlbumId, { caption: imageForm.caption || undefined, image_url: imageForm.image_url });
        setAlbumImages(prev => ({ ...prev, [imageTargetAlbumId]: [...(prev[imageTargetAlbumId] || []), img] }));
        setSuccessMsg('Image added.');
      }
      setShowImageModal(false);
      setImageForm({ caption: '', image_url: '' });
      setUploadProgress(null);
    } catch (e: any) {
      setError(e.response?.data?.detail || e.message || 'Failed to upload/add image.');
      setUploadProgress(null);
    } finally {
      setSubmitting(false);
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };


  const deleteImage = async (albumId: number, imageId: number) => {
    try {
      await adminService.deleteGalleryImage(imageId);
      setAlbumImages(prev => ({ ...prev, [albumId]: (prev[albumId] || []).filter(i => i.id !== imageId) }));
      setSuccessMsg('Image deleted.');
    } catch { setError('Failed to delete image.'); }
    finally { setTimeout(() => setSuccessMsg(null), 3000); }
  };

  if (loading) return <Loader />;

  return (
    <div>
      {successMsg && <div className="admin-alert admin-alert-success">{successMsg}</div>}
      {error && <div className="admin-alert admin-alert-error">{error}</div>}
      <div className="admin-toolbar">
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-text-muted)' }}>{albums.length} album{albums.length !== 1 ? 's' : ''}</span>
        <button className="btn btn-primary" onClick={openCreateAlbum} id="add-album-btn" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', padding: '8px 16px' }}>
          <Plus size={15} /> Add Album
        </button>
      </div>
      {albums.length === 0 ? <EmptyState message="No gallery albums yet." /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {albums.sort((a, b) => a.display_order - b.display_order).map(album => (
            <div key={album.id} style={{ border: '1px solid var(--color-outline-variant)', borderRadius: 'var(--border-radius-lg)', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', background: 'var(--bg-sand-container)', gap: '12px', cursor: 'pointer' }}
                onClick={() => toggleAlbum(album.id)}>
                {album.cover_image && <img src={album.cover_image} alt="" style={{ width: '44px', height: '44px', borderRadius: 'var(--border-radius-md)', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '15px', color: 'var(--color-text-dark)' }}>{album.title}</div>
                  {album.description && <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--color-text-muted)' }}>{album.description}</div>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button className="btn-action-icon" onClick={e => { e.stopPropagation(); openEditAlbum(album); }} id={`edit-album-${album.id}`}><Pencil size={14} /></button>
                  <button className="btn-action-icon btn-danger" onClick={e => { e.stopPropagation(); setDeleteConfirm(album); }} id={`delete-album-${album.id}`}><Trash2 size={14} /></button>
                  {expandedAlbumId === album.id ? <ChevronUp size={16} color="var(--color-text-muted)" /> : <ChevronDown size={16} color="var(--color-text-muted)" />}
                </div>
              </div>
              {expandedAlbumId === album.id && (
                <div style={{ padding: '16px', borderTop: '1px solid var(--color-outline-variant)' }}>
                  {loadingImages === album.id ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}><Loader2 size={24} className="animate-spin" color="var(--color-primary)" /></div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-text-muted)' }}>{(albumImages[album.id] || []).length} image{(albumImages[album.id] || []).length !== 1 ? 's' : ''}</span>
                        <button className="btn btn-secondary" style={{ fontSize: '12px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                          onClick={() => { setImageTargetAlbumId(album.id); setImageForm({ caption: '', image_url: '' }); setSelectedFiles([]); setFilePreviews([]); setShowImageModal(true); }}
                          id={`add-image-album-${album.id}`}>
                          <Plus size={13} /> Add Image
                        </button>

                      </div>
                      {(albumImages[album.id] || []).length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', fontSize: '13px' }}>No images in this album yet.</div>
                      ) : (
                        <div className="gallery-images-grid">
                          {(albumImages[album.id] || []).map(img => (
                            <div key={img.id} className="gallery-image-card">
                              <img src={img.image_url} alt={img.caption || ''} onError={e => { (e.target as HTMLImageElement).src = ''; }} />
                              {img.caption && <div className="img-caption">{img.caption}</div>}
                              <button className="img-delete-btn" onClick={() => deleteImage(album.id, img.id)} id={`delete-image-${img.id}`}>
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Album Modal */}
      {showAlbumModal && (
        <div className="admin-modal-overlay" onClick={() => setShowAlbumModal(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <button className="admin-modal-close" onClick={() => setShowAlbumModal(false)}><X size={16} /></button>
            <h2>{editTarget ? 'Edit' : 'Create'} Album</h2>
            <p className="modal-subtitle">Configure gallery album details.</p>
            <div className="admin-form-group">
              <label className="admin-form-label">Title *</label>
              <input className="admin-form-input" value={albumForm.title} onChange={e => setAlbumForm(f => ({ ...f, title: e.target.value }))} id="album-form-title" />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Description</label>
              <textarea className="admin-form-textarea" value={albumForm.description} onChange={e => setAlbumForm(f => ({ ...f, description: e.target.value }))} id="album-form-description" />
            </div>
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label className="admin-form-label">Cover Image URL</label>
                <input className="admin-form-input" placeholder="https://..." value={albumForm.cover_image} onChange={e => setAlbumForm(f => ({ ...f, cover_image: e.target.value }))} id="album-form-cover" />
                {albumForm.cover_image && <img src={albumForm.cover_image} alt="preview" className="img-url-preview" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Display Order</label>
                <input className="admin-form-input" type="number" min="1" value={albumForm.display_order} onChange={e => setAlbumForm(f => ({ ...f, display_order: parseInt(e.target.value) || 1 }))} id="album-form-order" />
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowAlbumModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={submitAlbum} disabled={submitting} id="album-form-submit">{submitting ? 'Saving...' : editTarget ? 'Update' : 'Create Album'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Image Modal */}
      {showImageModal && (
        <div className="admin-modal-overlay" onClick={() => !submitting && setShowImageModal(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <button className="admin-modal-close" onClick={() => !submitting && setShowImageModal(false)} disabled={submitting}><X size={16} /></button>
            <h2>Add Images</h2>
            <p className="modal-subtitle">Upload local images or provide a remote image URL.</p>
            
            <div className="admin-form-group" style={{ marginBottom: '16px' }}>
              <label className="admin-form-label" style={{ fontWeight: 600 }}>Local Device Upload</label>
              <input
                type="file"
                multiple
                accept="image/*"
                style={{ display: 'none' }}
                id="gallery-file-picker"
                onChange={handleFileSelect}
                disabled={submitting}
              />
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => document.getElementById('gallery-file-picker')?.click()}
                disabled={submitting}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '8px 14px' }}
              >
                <Upload size={14} /> Choose Images
              </button>
              
              {filePreviews.length > 0 && (
                <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '10px', background: 'var(--bg-sand-container)', padding: '10px', borderRadius: 'var(--border-radius-md)' }}>
                  {filePreviews.map((url, i) => (
                    <div key={i} style={{ position: 'relative', width: '64px', height: '64px' }}>
                      <img src={url} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--color-outline-variant)' }} />
                      <button
                        type="button"
                        onClick={() => removeSelectedFile(i)}
                        disabled={submitting}
                        style={{ position: 'absolute', top: -6, right: -6, background: '#dc2626', color: '#fff', borderRadius: '50%', width: 18, height: 18, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', padding: 0 }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <div style={{ width: '100%', fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                    {selectedFiles.length} image(s) selected for upload.
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '16px 0', color: 'var(--color-text-muted)', fontSize: '12px' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--color-outline-variant)' }} />
              <span>OR</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--color-outline-variant)' }} />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Remote Image URL</label>
              <input className="admin-form-input" placeholder="https://..." value={imageForm.image_url} onChange={e => setImageForm(f => ({ ...f, image_url: e.target.value }))} disabled={submitting || selectedFiles.length > 0} id="image-form-url" />
              {imageForm.image_url && <img src={imageForm.image_url} alt="preview" className="img-url-preview" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Caption (Optional)</label>
              <input className="admin-form-input" placeholder="Caption for selected image(s)..." value={imageForm.caption} onChange={e => setImageForm(f => ({ ...f, caption: e.target.value }))} disabled={submitting} id="image-form-caption" />
            </div>
            
            {uploadProgress && (
              <div className="admin-alert admin-alert-info" style={{ marginBottom: '12px', padding: '8px 12px', fontSize: '13px' }}>
                <Loader2 size={14} className="animate-spin" style={{ display: 'inline', marginRight: '6px' }} />
                {uploadProgress}
              </div>
            )}

            <div className="admin-modal-footer">
              <button className="btn btn-secondary" onClick={() => !submitting && setShowImageModal(false)} disabled={submitting}>Cancel</button>
              <button className="btn btn-primary" onClick={addImage} disabled={submitting} id="image-form-submit">
                {submitting ? (uploadProgress || 'Adding...') : selectedFiles.length > 0 ? `Upload ${selectedFiles.length} Image(s)` : 'Add Image'}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Delete Album Confirm */}
      {deleteConfirm && (
        <div className="admin-modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <button className="admin-modal-close" onClick={() => setDeleteConfirm(null)}><X size={16} /></button>
            <h2>Delete Album</h2>
            <div className="admin-confirm-dialog">
              <AlertTriangle size={36} color="#dc2626" />
              <p>Delete album <strong>{deleteConfirm.title}</strong> and all its images?</p>
              <div className="admin-modal-footer" style={{ justifyContent: 'center' }}>
                <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                <button className="btn btn-primary" style={{ background: '#dc2626', borderColor: '#dc2626' }} onClick={deleteAlbum}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── History Panel ───────────────────────────────────────────────────────────

type HistoryForm = { surname: string; native_region: string; history: string; description: string; };
const defaultHistoryForm = (): HistoryForm => ({ surname: '', native_region: '', history: '', description: '' });

const HistoryPanel: React.FC = () => {
  const [items, setItems] = useState<AdminSurnameHistoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminSurnameHistoryResponse | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<AdminSurnameHistoryResponse | null>(null);
  const [form, setForm] = useState<HistoryForm>(defaultHistoryForm());
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    adminService.getSurnameHistory().then(setItems).catch(() => setError('Failed to load history.')).finally(() => setLoading(false));
  }, []);
  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditTarget(null); setForm(defaultHistoryForm()); setShowModal(true); };
  const openEdit = (h: AdminSurnameHistoryResponse) => {
    setEditTarget(h);
    setForm({ surname: h.surname, native_region: h.native_region, history: h.history, description: h.description || '' });
    setShowModal(true);
  };

  const submit = async () => {
    if (!form.surname.trim() || !form.native_region.trim() || !form.history.trim()) {
      setError('Surname, native region, and history are required.'); return;
    }
    setSubmitting(true);
    try {
      const payload = { ...form, description: form.description || undefined };
      if (editTarget) { await adminService.updateSurnameHistory(editTarget.id, payload); setSuccessMsg('Surname history updated.'); }
      else { await adminService.createSurnameHistory(payload); setSuccessMsg('Surname history added.'); }
      setShowModal(false); load();
    } catch (e: any) { setError(e.response?.data?.detail || 'Operation failed.'); }
    finally { setSubmitting(false); setTimeout(() => setSuccessMsg(null), 3000); }
  };

  const deleteItem = async () => {
    if (!deleteConfirm) return;
    try { await adminService.deleteSurnameHistory(deleteConfirm.id); setSuccessMsg('Deleted.'); setDeleteConfirm(null); load(); }
    catch { setError('Failed to delete.'); }
    finally { setTimeout(() => setSuccessMsg(null), 3000); }
  };

  const filtered = items.filter(h =>
    h.surname.toLowerCase().includes(search.toLowerCase()) ||
    h.native_region.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Loader />;

  return (
    <div>
      {successMsg && <div className="admin-alert admin-alert-success">{successMsg}</div>}
      {error && <div className="admin-alert admin-alert-error">{error}</div>}
      <div className="admin-toolbar">
        <input className="admin-search-input" placeholder="Search surnames..." value={search} onChange={e => setSearch(e.target.value)} id="admin-history-search" />
        <button className="btn btn-primary" onClick={openCreate} id="add-history-btn" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', padding: '8px 16px' }}>
          <Plus size={15} /> Add Surname
        </button>
      </div>
      {filtered.length === 0 ? <EmptyState message="No surname history records found." /> : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead><tr><th>Surname</th><th>Native Region</th><th>Description</th><th>Added</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(h => (
                <tr key={h.id}>
                  <td style={{ fontWeight: 600 }}>{h.surname}</td>
                  <td>{h.native_region}</td>
                  <td style={{ fontSize: '12px', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.description || '—'}</td>
                  <td style={{ fontSize: '12px' }}>{fmtDate(h.created_at)}</td>
                  <td>
                    <button className="btn-action-icon" onClick={() => openEdit(h)} id={`edit-history-${h.id}`}><Pencil size={14} /></button>
                    <button className="btn-action-icon btn-danger" onClick={() => setDeleteConfirm(h)} id={`delete-history-${h.id}`}><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <button className="admin-modal-close" onClick={() => setShowModal(false)}><X size={16} /></button>
            <h2>{editTarget ? 'Edit' : 'Add'} Surname History</h2>
            <p className="modal-subtitle">Record ancestral lineage information.</p>
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label className="admin-form-label">Surname *</label>
                <input className="admin-form-input" value={form.surname} onChange={e => setForm(f => ({ ...f, surname: e.target.value }))} id="history-form-surname" />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Native Region *</label>
                <input className="admin-form-input" value={form.native_region} onChange={e => setForm(f => ({ ...f, native_region: e.target.value }))} id="history-form-region" />
              </div>
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Description / Trade</label>
              <input className="admin-form-input" placeholder="e.g. Pottery & Vessels" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} id="history-form-description" />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Full History *</label>
              <textarea className="admin-form-textarea" style={{ minHeight: '100px' }} value={form.history} onChange={e => setForm(f => ({ ...f, history: e.target.value }))} id="history-form-history" />
            </div>
            <div className="admin-modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={submit} disabled={submitting} id="history-form-submit">{submitting ? 'Saving...' : editTarget ? 'Update' : 'Add'}</button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="admin-modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <button className="admin-modal-close" onClick={() => setDeleteConfirm(null)}><X size={16} /></button>
            <h2>Delete Surname</h2>
            <div className="admin-confirm-dialog">
              <AlertTriangle size={36} color="#dc2626" />
              <p>Permanently delete <strong>{deleteConfirm.surname}</strong>?</p>
              <div className="admin-modal-footer" style={{ justifyContent: 'center' }}>
                <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                <button className="btn btn-primary" style={{ background: '#dc2626', borderColor: '#dc2626' }} onClick={deleteItem}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Annual Reports Panel ────────────────────────────────────────────────────

type ReportForm = {
  title: string;
  description: string;
  financial_year: string;
  file_url: string;
  display_order: number;
  is_published: boolean;
};

const defaultReportForm = (): ReportForm => ({
  title: '',
  description: '',
  financial_year: '2025-2026',
  file_url: '',
  display_order: 1,
  is_published: true
});

const ReportsPanel: React.FC = () => {
  const [items, setItems] = useState<AdminAnnualReportResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminAnnualReportResponse | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<AdminAnnualReportResponse | null>(null);
  const [form, setForm] = useState<ReportForm>(defaultReportForm());
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    adminService.getReports()
      .then(setItems)
      .catch(() => setError('Failed to load annual reports.'))
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => { load(); }, [load]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await apiClient.post('/admin/upload?category=reports', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data?.url) {
        setForm(f => ({ ...f, file_url: res.data.url }));
        setSuccessMsg('PDF uploaded successfully.');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'File upload failed.');
    } finally {
      setUploading(false);
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  const openCreate = () => {
    setEditTarget(null);
    setForm(defaultReportForm());
    setShowModal(true);
  };

  const openEdit = (r: AdminAnnualReportResponse) => {
    setEditTarget(r);
    setForm({
      title: r.title,
      description: r.description || '',
      financial_year: r.financial_year,
      file_url: r.file_url,
      display_order: r.display_order,
      is_published: r.is_published
    });
    setShowModal(true);
  };

  const submit = async () => {
    if (!form.title.trim() || !form.financial_year.trim() || !form.file_url.trim()) {
      setError('Title, Financial Year, and PDF File URL are required.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      if (editTarget) {
        await adminService.updateReport(editTarget.id, form);
        setSuccessMsg('Report updated successfully.');
      } else {
        await adminService.createReport(form);
        setSuccessMsg('Report created successfully.');
      }
      setShowModal(false);
      load();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Operation failed.');
    } finally {
      setSubmitting(false);
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  const deleteItem = async () => {
    if (!deleteConfirm) return;
    try {
      await adminService.deleteReport(deleteConfirm.id);
      setSuccessMsg('Report deleted successfully.');
      setDeleteConfirm(null);
      load();
    } catch {
      setError('Delete failed.');
    } finally {
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      {successMsg && <div className="admin-alert admin-alert-success">{successMsg}</div>}
      {error && <div className="admin-alert admin-alert-error">{error}</div>}
      <div className="admin-toolbar">
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-text-muted)' }}>
          {items.length} report{items.length !== 1 ? 's' : ''}
        </span>
        <button className="btn btn-primary" onClick={openCreate} id="add-report-btn" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', padding: '8px 16px' }}>
          <Plus size={15} /> Add Annual Report
        </button>
      </div>

      {items.length === 0 ? <EmptyState message="No annual reports published yet." /> : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Financial Year</th>
                <th>Order</th>
                <th>Status</th>
                <th>File</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(r => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 600 }}>{r.title}</td>
                  <td>{r.financial_year}</td>
                  <td>{r.display_order}</td>
                  <td>
                    <span className={`badge-status ${r.is_published ? 'badge-approved' : 'badge-pending'}`} style={{ padding: '2px 8px' }}>
                      {r.is_published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td>
                    <a href={r.file_url} target="_blank" rel="noopener noreferrer" className="admin-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--color-primary)' }}>
                      <FileText size={14} /> View PDF
                    </a>
                  </td>
                  <td>
                    <button className="btn-action-icon" onClick={() => openEdit(r)} id={`edit-report-${r.id}`}><Pencil size={14} /></button>
                    <button className="btn-action-icon btn-danger" onClick={() => setDeleteConfirm(r)} id={`delete-report-${r.id}`}><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <button className="admin-modal-close" onClick={() => setShowModal(false)}><X size={16} /></button>
            <h2>{editTarget ? 'Edit' : 'Upload'} Annual Report</h2>
            <p className="modal-subtitle">Upload or link PDF documents for community governance.</p>
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label className="admin-form-label">Report Title *</label>
                <input className="admin-form-input" placeholder="e.g. Annual Financial Report 2025" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} id="report-form-title" />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Financial Year *</label>
                <input className="admin-form-input" placeholder="e.g. 2025-2026" value={form.financial_year} onChange={e => setForm(f => ({ ...f, financial_year: e.target.value }))} id="report-form-year" />
              </div>
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Description</label>
              <textarea className="admin-form-textarea" placeholder="Brief overview of the report contents..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} id="report-form-desc" />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">PDF File URL or Upload *</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input className="admin-form-input" placeholder="https://.../report.pdf" value={form.file_url} onChange={e => setForm(f => ({ ...f, file_url: e.target.value }))} id="report-form-url" style={{ flex: 1 }} />
                <label className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', padding: '10px 14px', whiteSpace: 'nowrap' }}>
                  <Upload size={14} /> {uploading ? 'Uploading...' : 'Upload PDF'}
                  <input type="file" accept=".pdf,application/pdf" style={{ display: 'none' }} onChange={handleFileUpload} disabled={uploading} id="report-upload-input" />
                </label>
              </div>
            </div>
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label className="admin-form-label">Display Order</label>
                <input className="admin-form-input" type="number" value={form.display_order} onChange={e => setForm(f => ({ ...f, display_order: parseInt(e.target.value) || 1 }))} id="report-form-order" />
              </div>
              <div className="admin-form-group" style={{ justifyContent: 'center', display: 'flex' }}>
                <label className="admin-form-checkbox-label" style={{ marginTop: '20px' }}>
                  <input type="checkbox" checked={form.is_published} onChange={e => setForm(f => ({ ...f, is_published: e.target.checked }))} id="report-form-published" />
                  Publish Immediately
                </label>
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={submit} disabled={submitting || uploading} id="report-form-submit">{submitting ? 'Saving...' : editTarget ? 'Update' : 'Publish Report'}</button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="admin-modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <button className="admin-modal-close" onClick={() => setDeleteConfirm(null)}><X size={16} /></button>
            <h2>Delete Report</h2>
            <div className="admin-confirm-dialog">
              <AlertTriangle size={36} color="#dc2626" />
              <p>Delete <strong>{deleteConfirm.title}</strong>?</p>
              <div className="admin-modal-footer" style={{ justifyContent: 'center' }}>
                <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                <button className="btn btn-primary" style={{ background: '#dc2626', borderColor: '#dc2626' }} onClick={deleteItem}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main Admin Dashboard ────────────────────────────────────────────────────

const NAV_ITEMS: { id: AdminTab; label: string; icon: React.ReactNode; section?: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={15} />, section: 'Overview' },
  { id: 'registrations', label: 'Registration Requests', icon: <UserPlus size={15} />, section: 'Management' },
  { id: 'members', label: 'Members', icon: <Users size={15} /> },
  { id: 'bookings', label: 'Bookings', icon: <BookMarked size={15} /> },
  { id: 'committee', label: 'Committee', icon: <ShieldCheck size={15} /> },
  { id: 'events', label: 'Events', icon: <CalendarDays size={15} /> },
  { id: 'notices', label: 'Notices', icon: <Megaphone size={15} /> },
  { id: 'gallery', label: 'Gallery', icon: <Images size={15} /> },
  { id: 'history', label: 'Surname History', icon: <History size={15} /> },
  { id: 'reports', label: 'Annual Reports', icon: <BookOpen size={15} /> },
];

const PANEL_TITLES: Record<AdminTab, { title: string; desc: string }> = {
  dashboard: { title: 'Admin Dashboard', desc: 'Platform-wide statistics and operational overview.' },
  registrations: { title: 'Registration Requests', desc: 'Review, approve, and reject new community member registration requests.' },
  members: { title: 'Member Directory', desc: 'Manage all registered member profiles and verification status.' },
  bookings: { title: 'Booking Management', desc: 'Review, approve, reject, and manage all hall booking inquiries.' },
  committee: { title: 'Committee Management', desc: 'Add, edit, and remove committee members and their designations.' },
  events: { title: 'Event Management', desc: 'Create and manage community events published on the public website.' },
  notices: { title: 'Notice Management', desc: 'Manage announcements and alerts displayed across the platform.' },
  gallery: { title: 'Gallery Management', desc: 'Manage photo albums and images shown in the public gallery.' },
  history: { title: 'Surname History', desc: 'Manage ancestral genealogy records for community surnames.' },
  reports: { title: 'Annual Reports Management', desc: 'Upload, edit, delete, and publish annual PDF reports.' },
};

export const AdminDashboard: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.role === 'admin') {
      adminService.verifyRole()
        .then(res => setVerified(res.verified))
        .catch(() => setVerified(false))
        .finally(() => setVerifying(false));
    } else if (!isLoading) {
      setVerifying(false);
    }
  }, [isAuthenticated, isLoading, user]);

  // Show loading state
  if (isLoading || verifying) {
    return (
      <div className="admin-dashboard">
        <div className="container">
          <div className="admin-loader" style={{ minHeight: '60vh' }}>
            <Loader2 size={40} className="animate-spin" color="var(--color-primary)" />
            <span>Verifying admin access...</span>
          </div>
        </div>
      </div>
    );
  }

  // RBAC Guard: Only admin role can access
  if (!isAuthenticated || user?.role !== 'admin' || !verified) {
    return (
      <div className="admin-dashboard">
        <div className="container">
          <div className="admin-access-denied">
            <ShieldCheck size={64} color="var(--color-primary)" />
            <h2>Access Restricted</h2>
            <p>
              This area is exclusively for authorized administrators.
              {!isAuthenticated ? ' Please log in with your admin credentials.' : ' Your account does not have admin privileges.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const renderPanel = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardPanel />;
      case 'registrations': return <RegistrationsPanel />;
      case 'members': return <MembersPanel />;
      case 'bookings': return <BookingsPanel />;
      case 'committee': return <CommitteePanel />;
      case 'events': return <EventsPanel />;
      case 'notices': return <NoticesPanel />;
      case 'gallery': return <GalleryPanel />;
      case 'history': return <HistoryPanel />;
      case 'reports': return <ReportsPanel />;
      default: return <DashboardPanel />;
    }
  };


  const { title, desc } = PANEL_TITLES[activeTab];
  let prevSection = '';

  return (
    <div className="admin-dashboard" id="admin-dashboard-container">
      <div className="container">
        <div className="admin-layout">
          {/* Sidebar */}
          <aside className="admin-sidebar">
            <div className="admin-sidebar-header">
              <h3>⚙ Admin Panel</h3>
              <p>{user?.email || 'Administrator'}</p>
            </div>
            {NAV_ITEMS.map(item => {
              const showSection = item.section && item.section !== prevSection;
              if (item.section) prevSection = item.section;
              return (
                <React.Fragment key={item.id}>
                  {showSection && <div className="admin-nav-section-label">{item.section}</div>}
                  <button
                    className={`admin-nav-btn ${activeTab === item.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(item.id)}
                    id={`admin-nav-${item.id}`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                </React.Fragment>
              );
            })}
          </aside>

          {/* Main Panel */}
          <main className="admin-main-panel" id="admin-main-panel">
            <div className="admin-panel-header">
              <div>
                <h1>{title}</h1>
                <p>{desc}</p>
              </div>
            </div>
            {renderPanel()}
          </main>
        </div>
      </div>

      {/* Spinner keyframe */}
      <style>{`
        @keyframes admin-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: admin-spin 1s linear infinite; }
      `}</style>
    </div>
  );
};
