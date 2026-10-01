import React, { useState, useEffect } from 'react';
import { FileCheck, Plus, CheckCircle, Clock, XCircle, Search, Filter } from 'lucide-react';
import { getInstruments } from '../lib/instruments/instrument.service';

const Verifications = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVerifications = async () => {
      setLoading(true);
      const data = await getInstruments();
      setVerifications(data);
      setLoading(false);
    };
    loadVerifications();
  }, []);

  const filteredVerifications = verifications.filter(v => 
    v.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: verifications.length,
    passed: verifications.filter(v => v.status === 'VALID').length,
    pending: verifications.filter(v => v.status === 'PENDING_VERIFICATION' || v.status === 'DUE_SOON').length,
    failed: verifications.filter(v => v.status === 'EXPIRED').length,
  };

  return (
    <div className="animate-fade-in">
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', marginBottom: '0.25rem' }}>Verifications</h1>
          <p className="text-muted">Manage and track instrument verifications</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-primary">
            <Plus size={18} /> New Verification
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>Loading verifications...</div>
      ) : (
        <>
          <div className="dashboard-grid">
            <div className="glass-card animate-fade-in delay-100">
              <div className="metric-header">
                <div className="metric-icon blue">
                  <FileCheck size={24} />
                </div>
              </div>
              <div className="metric-value">{stats.total}</div>
              <div className="metric-label">Total Verifications</div>
            </div>
            <div className="glass-card animate-fade-in delay-200">
              <div className="metric-header">
                <div className="metric-icon green">
                  <CheckCircle size={24} />
                </div>
              </div>
              <div className="metric-value">{stats.passed}</div>
              <div className="metric-label">Valid (Passed)</div>
            </div>
            <div className="glass-card animate-fade-in delay-300">
              <div className="metric-header">
                <div className="metric-icon orange">
                  <Clock size={24} />
                </div>
              </div>
              <div className="metric-value">{stats.pending}</div>
              <div className="metric-label">Pending / Due Soon</div>
            </div>
            <div className="glass-card animate-fade-in delay-300">
              <div className="metric-header">
                <div className="metric-icon red">
                  <XCircle size={24} />
                </div>
              </div>
              <div className="metric-value">{stats.failed}</div>
              <div className="metric-label">Expired (Failed)</div>
            </div>
          </div>

          <div className="glass-panel delay-300" style={{ padding: '1.5rem', animation: 'fadeIn 0.4s ease forwards' }}>
            <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
              <div className="search-bar" style={{ maxWidth: '300px' }}>
                <Search size={18} className="text-muted" />
                <input 
                  type="text" 
                  placeholder="Search verifications..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', width: '100%' }}
                />
              </div>
              <button className="btn" style={{ border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                <Filter size={18} /> Filter
              </button>
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Verification ID</th>
                    <th>Instrument</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVerifications.map((ver) => (
                    <tr key={ver.id}>
                      <td style={{ fontWeight: '500', color: 'var(--accent-primary)' }}>{ver.id}</td>
                      <td>{ver.type}</td>
                      <td>{ver.lastVerified || 'Not Verified'}</td>
                      <td>
                        <span className={`badge ${ver.status === 'VALID' ? 'badge-success' : ver.status === 'EXPIRED' ? 'badge-danger' : 'badge-warning'}`}>
                          {ver.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        <button className="btn" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', padding: '0.25rem 0.75rem', border: '1px solid var(--border-color)' }}>
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="flex-between" style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
              <span className="text-muted" style={{ fontSize: '0.875rem' }}>
                Showing 1-{filteredVerifications.length} of {filteredVerifications.length} verifications
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', fontSize: '0.875rem' }}>Previous</button>
                <button className="btn" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', fontSize: '0.875rem' }}>Next</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Verifications;
