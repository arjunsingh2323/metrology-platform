import React from 'react';
import { Settings as SettingsIcon, Bell, Shield, Database, Save, Globe, Palette } from 'lucide-react';

const Settings = () => {
  return (
    <div className="animate-fade-in">
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', marginBottom: '0.25rem' }}>Settings</h1>
          <p className="text-muted">Configure system preferences and application settings</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-primary">
            <Save size={18} /> Save Changes
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem' }}>
        {/* Settings Navigation Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {[
            { icon: <SettingsIcon size={16} />, label: 'General', active: true },
            { icon: <Bell size={16} />, label: 'Notifications' },
            { icon: <Shield size={16} />, label: 'Security' },
            { icon: <Palette size={16} />, label: 'Appearance' },
            { icon: <Database size={16} />, label: 'Database & Backup' },
            { icon: <Globe size={16} />, label: 'Localization' },
          ].map((item) => (
            <button
              key={item.label}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.625rem',
                padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem', fontWeight: item.active ? '600' : '500',
                color: item.active ? 'var(--accent-primary)' : 'var(--text-secondary)',
                background: item.active ? 'rgba(99, 91, 255, 0.06)' : 'transparent',
                border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%',
                transition: 'all 0.15s ease',
              }}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </div>

        {/* Settings Content Area */}
        <div className="glass-panel" style={{ padding: '2rem', minHeight: '500px' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            General Settings
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Setting Item */}
            <div>
              <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                Organization Name
              </label>
              <input 
                type="text" 
                defaultValue="Acme Metrology Corp"
                style={{ 
                  width: '100%', 
                  padding: '0.75rem 1rem', 
                  borderRadius: 'var(--radius-md)', 
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  outline: 'none'
                }} 
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                This name will appear on official reports and certificates.
              </p>
            </div>

            {/* Setting Item */}
            <div>
              <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                Support Email
              </label>
              <input 
                type="email" 
                defaultValue="support@acmemetrology.com"
                style={{ 
                  width: '100%', 
                  padding: '0.75rem 1rem', 
                  borderRadius: 'var(--radius-md)', 
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  outline: 'none'
                }} 
              />
            </div>

            {/* Setting Toggle */}
            <div className="flex-between" style={{ padding: '1rem', background: 'rgba(202, 134, 67, 0.05)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>
              <div>
                <h4 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>Maintenance Mode</h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Disable access for non-admin users during updates.</p>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <div style={{ position: 'relative' }}>
                  <input type="checkbox" style={{ display: 'none' }} />
                  <div style={{ width: '48px', height: '24px', background: 'var(--border-color)', borderRadius: '12px', transition: 'all 0.3s' }}>
                    <div style={{ width: '20px', height: '20px', background: 'white', borderRadius: '50%', position: 'absolute', top: '2px', left: '2px', transition: 'all 0.3s', boxShadow: 'var(--shadow-sm)' }}></div>
                  </div>
                </div>
              </label>
            </div>

             {/* Setting Toggle */}
             <div className="flex-between" style={{ padding: '1rem', background: 'rgba(202, 134, 67, 0.05)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>
              <div>
                <h4 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>Auto-Archive Old Records</h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Automatically move records older than 5 years to cold storage.</p>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <div style={{ position: 'relative' }}>
                  <input type="checkbox" defaultChecked style={{ display: 'none' }} />
                  <div style={{ width: '48px', height: '24px', background: 'var(--accent-success)', borderRadius: '12px', transition: 'all 0.3s' }}>
                    <div style={{ width: '20px', height: '20px', background: 'white', borderRadius: '50%', position: 'absolute', top: '2px', right: '2px', transition: 'all 0.3s', boxShadow: 'var(--shadow-sm)' }}></div>
                  </div>
                </div>
              </label>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
