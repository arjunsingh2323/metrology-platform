import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  getGrievances, 
  updateGrievanceStatus, 
  GRIEVANCE_CATEGORIES, 
  GRIEVANCE_STATUSES 
} from '../lib/grievances/grievance.service';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Search, 
  Filter, 
  UserCheck, 
  Eye, 
  Lock, 
  MessageSquare, 
  X,
  FileCheck
} from 'lucide-react';

const GrievanceManagement = () => {
  const { userProfile } = useAuth();
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [districtFilter, setDistrictFilter] = useState(userProfile?.district || 'ALL');

  // Review Modal State
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [publicNote, setPublicNote] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [updating, setUpdating] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const data = await getGrievances(userProfile?.role || 'INSPECTOR', userProfile?.uid);
    setGrievances(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [userProfile]);

  // Open Adjudication Modal
  const handleOpenReview = (g) => {
    setSelectedGrievance(g);
    setNewStatus(g.status);
    setPublicNote('');
    setInternalNote('');
  };

  // Submit Status Update
  const handleSaveStatus = async (e) => {
    e.preventDefault();
    if (!selectedGrievance) return;

    setUpdating(true);
    const result = await updateGrievanceStatus(
      selectedGrievance.id,
      newStatus,
      publicNote,
      internalNote,
      { name: userProfile?.name || 'Authorized Inspector', role: userProfile?.role || 'INSPECTOR' }
    );
    setUpdating(false);

    if (result.success) {
      setSelectedGrievance(null);
      loadData();
    } else {
      alert(`Update failed: ${result.error}`);
    }
  };

  // Filtered dataset
  const filteredGrievances = grievances.filter(g => {
    const matchesSearch = 
      g.referenceId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.complainantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.subject?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || g.status === statusFilter;
    const matchesCategory = categoryFilter === 'ALL' || g.category === categoryFilter;
    const matchesDistrict = districtFilter === 'ALL' || g.district === districtFilter;

    return matchesSearch && matchesStatus && matchesCategory && matchesDistrict;
  });

  // KPI Metrics
  const stats = {
    total: grievances.length,
    underReview: grievances.filter(g => g.status === 'UNDER_REVIEW').length,
    awaitingInfo: grievances.filter(g => g.status === 'AWAITING_INFO').length,
    resolved: grievances.filter(g => g.status === 'RESOLVED').length
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '3rem' }}>
      
      {/* Header */}
      <div className="flex-between" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <FileCheck size={26} color="var(--accent-primary)" />
            <h1 style={{ fontSize: '1.875rem', margin: 0 }}>Grievance Administration Desk</h1>
          </div>
          <p className="text-muted" style={{ margin: 0, fontSize: '0.9375rem' }}>
            Investigate citizen complaints, schedule scale re-verifications, and record enforcement decisions.
          </p>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="dashboard-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="glass-card">
          <div className="metric-header">
            <div className="metric-icon blue"><AlertTriangle size={20} /></div>
          </div>
          <div className="metric-value">{stats.total}</div>
          <div className="metric-label">Total Registered Grievances</div>
        </div>
        <div className="glass-card">
          <div className="metric-header">
            <div className="metric-icon orange"><Clock size={20} /></div>
          </div>
          <div className="metric-value">{stats.underReview}</div>
          <div className="metric-label">In-Field Inquiries (Active)</div>
        </div>
        <div className="glass-card">
          <div className="metric-header">
            <div className="metric-icon yellow"><MessageSquare size={20} /></div>
          </div>
          <div className="metric-value">{stats.awaitingInfo}</div>
          <div className="metric-label">Awaiting Merchant Response</div>
        </div>
        <div className="glass-card">
          <div className="metric-header">
            <div className="metric-icon green"><CheckCircle2 size={20} /></div>
          </div>
          <div className="metric-value">{stats.resolved}</div>
          <div className="metric-label">Resolved / Compounded</div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '0.75rem', alignItems: 'center' }}>
          
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search reference, merchant, complainant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '0.5rem 0.75rem 0.5rem 2.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.8125rem', outline: 'none' }}
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.8125rem', outline: 'none' }}
            >
              <option value="ALL">All Statuses</option>
              {GRIEVANCE_STATUSES.map(s => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.8125rem', outline: 'none' }}
            >
              <option value="ALL">All Categories</option>
              {GRIEVANCE_CATEGORIES.map(c => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.8125rem', outline: 'none' }}
            >
              <option value="ALL">All Districts</option>
              <option value="Mysuru">Mysuru District</option>
              <option value="Bengaluru">Bengaluru District</option>
              <option value="Hubballi">Hubballi District</option>
              <option value="Mangaluru">Mangaluru District</option>
            </select>
          </div>

        </div>
      </div>

      {/* Main Table */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            Loading grievance queue...
          </div>
        ) : filteredGrievances.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <CheckCircle2 size={36} style={{ margin: '0 auto 0.5rem auto', opacity: 0.5 }} />
            <p>No complaints matching the selected filters.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ref ID</th>
                  <th>Target Entity</th>
                  <th>District</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Assigned Officer</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredGrievances.map(g => (
                  <tr key={g.id}>
                    <td style={{ fontWeight: 600, fontFamily: 'monospace', color: 'var(--accent-primary)' }}>
                      {g.referenceId}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{g.businessName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{g.premises}</div>
                    </td>
                    <td>{g.district}</td>
                    <td style={{ fontSize: '0.8125rem' }}>{g.category?.replace('_', ' ')}</td>
                    <td>
                      <span className={`badge ${
                        g.status === 'RESOLVED' ? 'badge-success' :
                        g.status === 'UNDER_REVIEW' ? 'badge-warning' : 'badge-info'
                      }`}>
                        {g.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      {g.assignedTo?.name || <span style={{ color: 'var(--accent-danger)' }}>Unassigned</span>}
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      {new Date(g.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => handleOpenReview(g)}
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.625rem' }}
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review & Adjudication Modal */}
      {selectedGrievance && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '1rem' }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', background: 'var(--bg-secondary)' }}>
            
            <div className="flex-between" style={{ marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Official Investigation Docket:</span>
                <h2 style={{ fontSize: '1.25rem', margin: 0, fontFamily: 'monospace', color: 'var(--accent-primary)' }}>
                  {selectedGrievance.referenceId}
                </h2>
              </div>
              <button
                type="button"
                className="btn-icon"
                onClick={() => setSelectedGrievance(null)}
              >
                <X size={20} />
              </button>
            </div>

            {/* Complaint Summary */}
            <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                {selectedGrievance.subject}
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                {selectedGrievance.description}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <div><strong>Complainant:</strong> {selectedGrievance.complainantName} ({selectedGrievance.contactPhone})</div>
                <div><strong>Target Entity:</strong> {selectedGrievance.businessName} ({selectedGrievance.premises})</div>
              </div>
            </div>

            {/* Action Form */}
            <form onSubmit={handleSaveStatus}>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
                  Update Case Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  style={{ width: '100%', padding: '0.625rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', outline: 'none' }}
                >
                  {GRIEVANCE_STATUSES.map(s => (
                    <option key={s.id} value={s.id}>{s.label} — {s.description}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
                  Public Status Note (Visible on Citizen Reference Tracker)
                </label>
                <input
                  type="text"
                  value={publicNote}
                  onChange={(e) => setPublicNote(e.target.value)}
                  placeholder="e.g. Officer dispatched for verification; merchant issued inspection summons."
                  style={{ width: '100%', padding: '0.625rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', outline: 'none' }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem', background: 'rgba(99, 91, 255, 0.04)', padding: '0.875rem', borderRadius: 'var(--radius-md)', border: '1px dashed var(--accent-primary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--accent-primary)', marginBottom: '0.375rem' }}>
                  <Lock size={14} />
                  <span>Confidential Internal Inspector Note (Staff Eyes Only)</span>
                </div>
                <textarea
                  rows="3"
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  placeholder="Private case assessment, compounding fee receipts, or legal prosecution notes..."
                  style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.8125rem', outline: 'none' }}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="btn"
                  onClick={() => setSelectedGrievance(null)}
                  style={{ border: '1px solid var(--border-color)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="btn btn-primary"
                >
                  {updating ? 'Saving Changes...' : 'Save Adjudication'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default GrievanceManagement;
