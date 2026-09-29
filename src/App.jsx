import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { LayoutDashboard, Users, Scale, FileCheck, Settings, Bell, Search, Menu, LogOut } from 'lucide-react';
import AdminDashboard from './pages/AdminDashboard';
import InstrumentsPage from './pages/Instruments';
import InstrumentRegistrationForm from './pages/InstrumentRegistrationForm';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Main Layout Component
const Layout = ({ children }) => {
  const location = useLocation();
  const { userProfile, logout } = useAuth();
  
  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <Scale className="text-accent-primary" size={28} color="var(--accent-primary)" />
          <span className="sidebar-brand">Metrik</span>
        </div>
        <nav className="sidebar-nav">
          <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
            <LayoutDashboard size={20} />
            Dashboard
          </Link>
          <Link to="/instruments" className={`nav-item ${location.pathname.startsWith('/instruments') ? 'active' : ''}`}>
            <Scale size={20} />
            Instruments
          </Link>
          <Link to="/verifications" className={`nav-item ${location.pathname.startsWith('/verifications') ? 'active' : ''}`}>
            <FileCheck size={20} />
            Verifications
          </Link>
          <Link to="/users" className={`nav-item ${location.pathname.startsWith('/users') ? 'active' : ''}`}>
            <Users size={20} />
            Users & Roles
          </Link>
          <Link to="/settings" className={`nav-item ${location.pathname.startsWith('/settings') ? 'active' : ''}`}>
            <Settings size={20} />
            Settings
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="topbar">
          <div className="flex-center" style={{ gap: '1rem' }}>
            <button className="btn-icon" style={{ display: 'none' }} id="menu-btn">
              <Menu size={20} />
            </button>
            <div className="search-bar">
              <Search size={16} className="text-muted" />
              <input type="text" placeholder="Search records, IDs..." style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', width: '100%' }} />
            </div>
          </div>
          
          <div className="flex-center" style={{ gap: '1rem' }}>
            <button className="btn-icon">
              <Bell size={20} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingLeft: '1rem', borderLeft: '1px solid var(--border-color)' }}>
              <div className="user-avatar">
                {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)' }}>{userProfile?.name || 'User'}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{userProfile?.role || 'Guest'}</span>
              </div>
              <button onClick={logout} style={{ marginLeft: '0.5rem', cursor: 'pointer', color: 'var(--accent-danger)' }} title="Logout">
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </header>

        <div className="page-content">
          {children}
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Protected Routes wrapped in Layout */}
          <Route path="/" element={<ProtectedRoute><Layout><AdminDashboard /></Layout></ProtectedRoute>} />
          <Route path="/instruments" element={<ProtectedRoute><Layout><InstrumentsPage /></Layout></ProtectedRoute>} />
          <Route path="/instruments/new" element={<ProtectedRoute><Layout><InstrumentRegistrationForm /></Layout></ProtectedRoute>} />
          <Route path="/verifications" element={<ProtectedRoute><Layout><div className="animate-fade-in text-muted">Verifications Module Coming Soon</div></Layout></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><Layout><div className="animate-fade-in text-muted">User Management Coming Soon</div></Layout></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Layout><div className="animate-fade-in text-muted">Settings Coming Soon</div></Layout></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
