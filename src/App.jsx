import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { LayoutDashboard, Users, Scale, FileCheck, Settings, Bell, Search, Menu, LogOut, Calculator, AlertCircle, Bot } from 'lucide-react';
import AdminDashboard from './pages/AdminDashboard';
import InspectorDashboard from './pages/InspectorDashboard';
import InspectionExecution from './pages/InspectionExecution';
import TraderDashboard from './pages/TraderDashboard';
import InstrumentsPage from './pages/Instruments';
import InstrumentRegistrationForm from './pages/InstrumentRegistrationForm';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Verifications from './pages/Verifications';
import UsersPage from './pages/Users';
import SettingsPage from './pages/Settings';
import UncertaintyCalculator from './pages/UncertaintyCalculator';
import GrievancePortal from './pages/GrievancePortal';
import GrievanceManagement from './pages/GrievanceManagement';
import MetrologyAssistant from './pages/MetrologyAssistant';
import DemoSwitcher from './components/DemoSwitcher';
import MetrologyAiAssistant from './components/MetrologyAiAssistant';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Main Layout Component — Stripe-style horizontal navbar
const Layout = ({ children }) => {
  const location = useLocation();
  const { userProfile, logout } = useAuth();
  
  const navLinks = [
    { to: '/', label: 'Dashboard', icon: <LayoutDashboard size={16} />, match: (p) => p === '/' },
    { to: '/inspector', label: 'Inspector Queue', icon: <FileCheck size={16} />, match: (p) => p.startsWith('/inspector') },
    { to: '/trader', label: 'Trader Portal', icon: <Scale size={16} />, match: (p) => p.startsWith('/trader') },
    { to: '/instruments', label: 'Instruments', icon: <Scale size={16} />, match: (p) => p.startsWith('/instruments') },
    { to: '/verifications', label: 'Verifications', icon: <FileCheck size={16} />, match: (p) => p.startsWith('/verifications') },
    { to: '/uncertainty-calculator', label: 'Uncertainty Calc', icon: <Calculator size={16} />, match: (p) => p.startsWith('/uncertainty-calculator') },
    { to: '/complaints', label: 'Grievances', icon: <AlertCircle size={16} />, match: (p) => p.startsWith('/complaints') || p.startsWith('/track-complaint') || p.startsWith('/grievance-management') },
    { to: '/assistant', label: 'AI Assistant', icon: <Bot size={16} />, match: (p) => p.startsWith('/assistant') },
    { to: '/users', label: 'Users & Roles', icon: <Users size={16} />, match: (p) => p.startsWith('/users') },
    { to: '/settings', label: 'Settings', icon: <Settings size={16} />, match: (p) => p.startsWith('/settings') },
  ];

  return (
    <div className="app-layout">
      {/* Top Navbar */}
      <header className="stripe-navbar">
        <div className="navbar-inner">
          {/* Brand */}
          <div className="navbar-brand">
            <Scale size={22} color="var(--accent-primary)" />
            <span className="brand-text">Metrik</span>
          </div>

          {/* Nav Links */}
          <nav className="navbar-links">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`navbar-link ${link.match(location.pathname) ? 'active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Section */}
          <div className="navbar-actions">
            <div className="search-bar">
              <Search size={14} className="text-muted" />
              <input type="text" placeholder="Search..." style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', width: '140px', fontSize: '0.8125rem' }} />
            </div>
            <button className="btn-icon">
              <Bell size={18} />
            </button>
            <div className="navbar-user">
              <div className="user-avatar">
                {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="user-name">{userProfile?.name || 'User'}</span>
              <button onClick={logout} className="btn-icon logout-btn" title="Logout">
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="page-wrapper">
        <div className="page-content">
          {children}
        </div>
      </main>

      {/* Floating Metrology AI Assistant Widget */}
      <MetrologyAiAssistant />

      {/* Global Developer Quick Role Switcher */}
      <DemoSwitcher />
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
          <Route path="/inspector" element={<ProtectedRoute><Layout><InspectorDashboard /></Layout></ProtectedRoute>} />
          <Route path="/trader" element={<ProtectedRoute><Layout><TraderDashboard /></Layout></ProtectedRoute>} />
          <Route path="/inspect/:instrumentId" element={<ProtectedRoute><Layout><InspectionExecution /></Layout></ProtectedRoute>} />
          <Route path="/inspection-execution/:instrumentId" element={<ProtectedRoute><Layout><InspectionExecution /></Layout></ProtectedRoute>} />
          <Route path="/instruments" element={<ProtectedRoute><Layout><InstrumentsPage /></Layout></ProtectedRoute>} />
          <Route path="/instruments/new" element={<ProtectedRoute><Layout><InstrumentRegistrationForm /></Layout></ProtectedRoute>} />
          <Route path="/verifications" element={<ProtectedRoute><Layout><Verifications /></Layout></ProtectedRoute>} />
          <Route path="/uncertainty-calculator" element={<ProtectedRoute><Layout><UncertaintyCalculator /></Layout></ProtectedRoute>} />
          <Route path="/complaints" element={<ProtectedRoute><Layout><GrievancePortal /></Layout></ProtectedRoute>} />
          <Route path="/track-complaint" element={<ProtectedRoute><Layout><GrievancePortal /></Layout></ProtectedRoute>} />
          <Route path="/grievance-management" element={<ProtectedRoute><Layout><GrievanceManagement /></Layout></ProtectedRoute>} />
          <Route path="/assistant" element={<ProtectedRoute><Layout><MetrologyAssistant /></Layout></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><Layout><UsersPage /></Layout></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Layout><SettingsPage /></Layout></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
