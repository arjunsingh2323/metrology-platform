import React from 'react';
import { ShieldCheck, AlertTriangle, FileSignature, Clock } from 'lucide-react';

const AdminDashboard = () => {
  const stats = [
    { label: 'Active Licenses', value: '1,248', icon: ShieldCheck, color: 'blue' },
    { label: 'Pending Verifications', value: '342', icon: Clock, color: 'orange' },
    { label: 'Non-Compliant Entities', value: '28', icon: AlertTriangle, color: 'red' },
    { label: 'Recent Certificates', value: '89', icon: FileSignature, color: 'green' },
  ];

  const recentApplications = [
    { id: 'APP-2023-089', entity: 'Metro Supermart', type: 'Re-verification', status: 'Pending', date: 'Today, 10:30 AM' },
    { id: 'APP-2023-088', entity: 'Reliable Scales Inc.', type: 'Model Approval', status: 'Approved', date: 'Today, 09:15 AM' },
    { id: 'APP-2023-087', entity: 'City Fuel Station', type: 'Verification', status: 'Rejected', date: 'Yesterday' },
    { id: 'APP-2023-086', entity: 'Global Logistics', type: 'Re-verification', status: 'Approved', date: 'Yesterday' },
    { id: 'APP-2023-085', entity: 'Apex Weighbridges', type: 'License Renewal', status: 'Pending', date: 'Oct 24, 2023' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', marginBottom: '0.25rem' }}>Dashboard Overview</h1>
          <p className="text-muted">Welcome back! Here's what's happening with Legal Metrology today.</p>
        </div>
        <button className="btn btn-primary">
          Generate Report
        </button>
      </div>

      <div className="dashboard-grid">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className={`glass-card delay-${(i+1)*100}`}>
              <div className="metric-header">
                <div className={`metric-icon ${stat.color}`}>
                  <Icon size={20} />
                </div>
              </div>
              <div className="metric-value">{stat.value}</div>
              <div className="metric-label">{stat.label}</div>
            </div>
          );
        })}
      </div>

      <div className="glass-panel delay-300" style={{ padding: '1.5rem', animation: 'fadeIn 0.4s ease forwards' }}>
        <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem' }}>Recent Applications</h2>
          <a href="#" style={{ fontSize: '0.875rem' }}>View All</a>
        </div>
        
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>App ID</th>
                <th>Entity Name</th>
                <th>Application Type</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentApplications.map((app, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{app.id}</td>
                  <td>{app.entity}</td>
                  <td>{app.type}</td>
                  <td>
                    <span className={`badge ${
                      app.status === 'Approved' ? 'badge-success' : 
                      app.status === 'Pending' ? 'badge-warning' : 'badge-danger'
                    }`}>
                      {app.status}
                    </span>
                  </td>
                  <td>{app.date}</td>
                  <td>
                    <button style={{ color: 'var(--accent-primary)', fontSize: '0.875rem', fontWeight: '500' }}>Review</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
