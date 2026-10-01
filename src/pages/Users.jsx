import React, { useState } from 'react';
import { Users as UsersIcon, Plus, UserCheck, UserX, Shield, Search, Filter } from 'lucide-react';

const Users = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const mockUsers = [
    { id: 'USR-001', name: 'Alice Admin', email: 'alice@example.com', role: 'Admin', status: 'Active', lastLogin: '2026-10-28 09:00' },
    { id: 'USR-002', name: 'Bob Inspector', email: 'bob@example.com', role: 'Inspector', status: 'Active', lastLogin: '2026-10-27 14:30' },
    { id: 'USR-003', name: 'Charlie Viewer', email: 'charlie@example.com', role: 'Viewer', status: 'Inactive', lastLogin: '2026-09-15 11:20' },
    { id: 'USR-004', name: 'Diana Tech', email: 'diana@example.com', role: 'Technician', status: 'Active', lastLogin: '2026-10-28 08:45' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', marginBottom: '0.25rem' }}>User Management</h1>
          <p className="text-muted">Manage system users, roles, and access permissions</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-primary">
            <Plus size={18} /> Add User
          </button>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="glass-card animate-fade-in delay-100">
          <div className="metric-header">
            <div className="metric-icon blue">
              <UsersIcon size={24} />
            </div>
          </div>
          <div className="metric-value">42</div>
          <div className="metric-label">Total Users</div>
        </div>
        <div className="glass-card animate-fade-in delay-200">
          <div className="metric-header">
            <div className="metric-icon green">
              <UserCheck size={24} />
            </div>
          </div>
          <div className="metric-value">38</div>
          <div className="metric-label">Active Users</div>
        </div>
        <div className="glass-card animate-fade-in delay-300">
          <div className="metric-header">
            <div className="metric-icon red">
              <UserX size={24} />
            </div>
          </div>
          <div className="metric-value">4</div>
          <div className="metric-label">Inactive Users</div>
        </div>
        <div className="glass-card animate-fade-in delay-300">
          <div className="metric-header">
            <div className="metric-icon orange">
              <Shield size={24} />
            </div>
          </div>
          <div className="metric-value">5</div>
          <div className="metric-label">Admin Roles</div>
        </div>
      </div>

      <div className="glass-panel delay-300" style={{ padding: '1.5rem', animation: 'fadeIn 0.4s ease forwards' }}>
        <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
          <div className="search-bar" style={{ maxWidth: '300px' }}>
            <Search size={18} className="text-muted" />
            <input 
              type="text" 
              placeholder="Search users..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', width: '100%' }}
            />
          </div>
          <button className="btn" style={{ border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
            <Filter size={18} /> Filter Roles
          </button>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className="user-avatar" style={{ width: '32px', height: '32px', fontSize: '0.875rem' }}>
                        {user.name.charAt(0)}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{user.name}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-secondary)' }}>
                      {user.role === 'Admin' && <Shield size={14} />}
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${user.status === 'Active' ? 'badge-success' : 'badge-danger'}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="text-muted">{user.lastLogin}</td>
                  <td>
                    <button className="btn" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', padding: '0.25rem 0.75rem', border: '1px solid var(--border-color)' }}>
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="flex-between" style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
          <span className="text-muted" style={{ fontSize: '0.875rem' }}>
            Showing 1-{mockUsers.length} of {mockUsers.length} users
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', fontSize: '0.875rem' }}>Previous</button>
            <button className="btn" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', fontSize: '0.875rem' }}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;
