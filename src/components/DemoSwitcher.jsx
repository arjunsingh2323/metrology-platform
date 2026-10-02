import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Zap, 
  ShieldCheck, 
  Store, 
  Crown, 
  X, 
  CheckCircle2, 
  ChevronUp, 
  UserCheck 
} from 'lucide-react';

const DEMO_PROFILES = [
  {
    id: 'inspector',
    label: 'Inspector View',
    name: 'Rajesh Kumar',
    role: 'INSPECTOR',
    district: 'Mysuru',
    state: 'Karnataka',
    email: 'inspector.mysuru@metrology.gov.in',
    uid: 'demo-inspector-uid',
    route: '/inspector',
    badgeClass: 'badge-info',
    icon: <ShieldCheck size={18} color="#635bff" />,
    description: 'Field Inspector (Mysuru District)'
  },
  {
    id: 'trader',
    label: 'Merchant View',
    name: 'Acme Traders',
    role: 'TRADER',
    district: 'Mysuru',
    state: 'Karnataka',
    email: 'contact@acmetraders.com',
    uid: 'demo-trader-uid',
    route: '/trader',
    badgeClass: 'badge-warning',
    icon: <Store size={18} color="#f76b1c" />,
    description: 'Registered Scaling Merchant'
  },
  {
    id: 'admin',
    label: 'Admin View',
    name: 'Controller of Metrology',
    role: 'ADMIN',
    district: 'Statewide',
    state: 'Karnataka',
    email: 'controller@metrology.gov.in',
    uid: 'demo-admin-uid',
    route: '/',
    badgeClass: 'badge-success',
    icon: <Crown size={18} color="#00d924" />,
    description: 'State Executive Controller'
  },
  {
    id: 'citizen',
    label: 'Citizen View',
    name: 'Ananya Sharma',
    role: 'CITIZEN',
    district: 'Mysuru',
    state: 'Karnataka',
    email: 'ananya.sharma@example.com',
    uid: 'demo-citizen-uid',
    route: '/complaints',
    badgeClass: 'badge-info',
    icon: <UserCheck size={18} color="#00d4ff" />,
    description: 'Consumer / Public Complainant'
  }
];

const DemoSwitcher = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { userProfile, switchRoleProfile } = useAuth();
  const navigate = useNavigate();

  const currentRole = userProfile?.role || 'INSPECTOR';

  const handleSelectProfile = (profile) => {
    // 1. Update AuthContext user & role state
    switchRoleProfile({
      uid: profile.uid,
      name: profile.name,
      role: profile.role,
      district: profile.district,
      state: profile.state,
      email: profile.email
    });

    // 2. Immediately push route to corresponding dashboard
    navigate(profile.route);
  };

  return (
    <div 
      className="demo-switcher-container" 
      style={{ 
        position: 'fixed', 
        bottom: '20px', 
        right: '20px', 
        zIndex: 999999,
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      {/* Floating Expanded Popover Menu */}
      {isOpen && (
        <div 
          className="glass-panel animate-fade-in" 
          style={{ 
            width: '320px', 
            padding: '1.25rem', 
            marginBottom: '0.75rem', 
            borderRadius: 'var(--radius-xl)', 
            background: 'var(--bg-secondary)', 
            backdropFilter: 'blur(16px)', 
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)', 
            border: '1px solid var(--border-color)' 
          }}
        >
          {/* Header */}
          <div className="flex-between" style={{ marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ 
                padding: '6px', 
                borderRadius: '8px', 
                background: 'linear-gradient(135deg, #635bff 0%, #00d924 100%)', 
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Zap size={16} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Quick Role Switcher
                </h4>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Switch demo persona in 1-click
                </div>
              </div>
            </div>

            <button 
              className="btn-icon" 
              onClick={() => setIsOpen(false)}
              style={{ width: '28px', height: '28px' }}
              title="Close Switcher"
            >
              <X size={16} />
            </button>
          </div>

          {/* Persona Selection List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {DEMO_PROFILES.map((profile) => {
              const isActive = currentRole === profile.role;

              return (
                <button
                  key={profile.id}
                  onClick={() => handleSelectProfile(profile)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    background: isActive ? 'rgba(99, 91, 255, 0.12)' : 'var(--bg-primary)',
                    border: isActive ? '1.5px solid var(--accent-primary)' : '1px solid var(--border-color)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.borderColor = 'var(--accent-primary)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.borderColor = 'var(--border-color)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ 
                      padding: '8px', 
                      borderRadius: '8px', 
                      background: 'var(--bg-secondary)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>
                      {profile.icon}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '2px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                          {profile.label}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {profile.name} ({profile.district})
                      </div>
                    </div>
                  </div>

                  {isActive ? (
                    <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', padding: '2px 6px', fontSize: '0.6875rem' }}>
                      <CheckCircle2 size={10} /> Active
                    </span>
                  ) : (
                    <span className="badge" style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)', fontSize: '0.6875rem' }}>
                      Switch
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Persona Footer Status */}
          <div style={{ 
            marginTop: '1rem', 
            paddingTop: '0.75rem', 
            borderTop: '1px dashed var(--border-color)', 
            fontSize: '0.75rem', 
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <UserCheck size={12} color="var(--accent-success)" />
              <span>Current: <strong>{userProfile?.name || 'Rajesh Kumar'}</strong></span>
            </div>
            <span className="badge badge-info" style={{ fontSize: '0.6875rem' }}>
              {currentRole}
            </span>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.625rem 1.125rem',
          borderRadius: '30px',
          background: 'linear-gradient(135deg, #0a2540 0%, #1a1f36 100%)',
          color: '#ffffff',
          border: '1.5px solid rgba(99, 91, 255, 0.4)',
          boxShadow: '0 8px 24px rgba(10, 37, 64, 0.35)',
          cursor: 'pointer',
          fontWeight: 700,
          fontSize: '0.8125rem',
          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          float: 'right'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 12px 28px rgba(99, 91, 255, 0.45)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(10, 37, 64, 0.35)';
        }}
      >
        <span style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #635bff 0%, #00d924 100%)',
          color: '#ffffff'
        }}>
          <Zap size={12} />
        </span>
        <span>⚡ Quick Role Switcher</span>
        <ChevronUp 
          size={14} 
          style={{ 
            transition: 'transform 0.3s ease',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
          }} 
        />
      </button>
    </div>
  );
};

export default DemoSwitcher;
