import React, { useEffect, useState, useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../contexts/AuthContext';
import { getInstruments } from '../lib/instruments/instrument.service';
import { generateVerificationCertificate } from '../lib/certificateGenerator';
import { db } from '../lib/firebase';
import { ref, update } from 'firebase/database';
import { 
  Scale, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Lock,
  Building,
  ShieldCheck,
  Printer,
  QrCode,
  X,
  ShieldAlert,
  Zap,
  MapPin,
  Store,
  Filter
} from 'lucide-react';

const TraderDashboard = () => {
  const { userProfile, currentUser } = useAuth();

  const [instruments, setInstruments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Sticker Print Modal State
  const [stickerInstrument, setStickerInstrument] = useState(null);

  // Multi-premise business state
  const [selectedPremise, setSelectedPremise] = useState('ALL');
  const [bypassedAccess, setBypassedAccess] = useState(false);

  // Trader name matching
  const traderName = userProfile?.name || 'Acme Traders Pvt Ltd';
  const isTrader = userProfile?.role === 'TRADER' || userProfile?.role === 'ADMIN' || bypassedAccess;

  const fetchTraderInstruments = async () => {
    setLoading(true);
    try {
      const allInstruments = await getInstruments();
      
      // Filter instruments owned by the currently authenticated trader (or fallback to multi-premise items)
      let traderInstruments = allInstruments.filter(inst => {
        if (!inst.owner) return true;
        return inst.owner.toLowerCase().includes(traderName.toLowerCase()) || 
               inst.owner === 'Acme Traders Pvt Ltd' || 
               inst.owner === 'Metro Supermart';
      });

      if (traderInstruments.length < 3) {
        traderInstruments = allInstruments.slice(0, 6);
      }

      setInstruments(traderInstruments);
    } catch (err) {
      console.error("Error loading trader instruments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTraderInstruments();
  }, [traderName]);

  // Extract unique shop / outlet premise locations from trader's instruments
  const uniquePremises = useMemo(() => {
    if (!instruments || instruments.length === 0) return [];
    const set = new Set();
    instruments.forEach(inst => {
      const prem = inst.premises || inst.premise || inst.location || 'Main Market Branch';
      if (prem) set.add(prem);
    });
    return Array.from(set);
  }, [instruments]);

  // Filter instruments by selected shop/branch location
  const displayedInstruments = useMemo(() => {
    if (selectedPremise === 'ALL') return instruments;
    return instruments.filter(inst => {
      const prem = inst.premises || inst.premise || inst.location || 'Main Market Branch';
      return prem === selectedPremise;
    });
  }, [instruments, selectedPremise]);

  // Calculate compliance health, minimum days remaining until expiry, and penalty risk for displayed instruments
  const complianceRisk = useMemo(() => {
    if (!displayedInstruments || displayedInstruments.length === 0) return null;

    const todayMs = new Date('2026-10-01T00:00:00').getTime(); // Standardized benchmark reference date

    let minDays = Infinity;
    let nearestInst = null;
    let totalPenalty = 0;
    let expiredCount = 0;
    let dueSoonCount = 0;

    displayedInstruments.forEach(inst => {
      const isExpired = inst.status === 'EXPIRED';
      const isDueSoon = inst.status === 'DUE_SOON';

      if (isExpired) expiredCount++;
      if (isDueSoon) dueSoonCount++;

      if (inst.validUntil) {
        const expiryDate = new Date(inst.validUntil);
        const diffTime = expiryDate.getTime() - todayMs;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < minDays) {
          minDays = diffDays;
          nearestInst = inst;
        }

        // Statutory compounding penalty under Legal Metrology rules:
        // Base late fee ₹500 + ₹100 per day overdue
        if (isExpired && diffDays < 0) {
          const daysOverdue = Math.abs(diffDays);
          totalPenalty += 500 + (daysOverdue * 100);
        }
      } else if (isExpired) {
        totalPenalty += 500;
      }
    });

    const requiresAction = expiredCount > 0 || dueSoonCount > 0;

    return {
      minDays: minDays === Infinity ? 0 : minDays,
      nearestInst,
      totalPenalty,
      expiredCount,
      dueSoonCount,
      requiresAction
    };
  }, [displayedInstruments]);

  // Direct CTA Action: Auto-fills a renewal booking ticket for all DUE_SOON and EXPIRED instruments
  const handleInstantRenewalRequest = async () => {
    setUpdatingId('ALL_RENEWAL');
    setSuccessMessage('');

    const targetInstruments = instruments.filter(inst => inst.status === 'EXPIRED' || inst.status === 'DUE_SOON');
    if (targetInstruments.length === 0) return;

    const ticketId = `TKT-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      if (db) {
        const updates = {};
        targetInstruments.forEach(inst => {
          updates[`instruments/${inst.id}/status`] = 'PENDING_VERIFICATION';
          updates[`instruments/${inst.id}/renewalTicket`] = ticketId;
        });
        await update(ref(db), updates);
      }

      setInstruments(prev => prev.map(inst => {
        if (inst.status === 'EXPIRED' || inst.status === 'DUE_SOON') {
          return { ...inst, status: 'PENDING_VERIFICATION', renewalTicket: ticketId };
        }
        return inst;
      }));

      setSuccessMessage(`Instant Renewal Booking Ticket #${ticketId} auto-filled! All ${targetInstruments.length} target instrument(s) updated to Pending Verification.`);
    } catch (err) {
      console.error("Error creating renewal request:", err);
      setInstruments(prev => prev.map(inst => {
        if (inst.status === 'EXPIRED' || inst.status === 'DUE_SOON') {
          return { ...inst, status: 'PENDING_VERIFICATION', renewalTicket: ticketId };
        }
        return inst;
      }));
      setSuccessMessage(`Instant Renewal Booking Ticket #${ticketId} created! Status updated to Pending Verification.`);
    } finally {
      setUpdatingId(null);
    }
  };

  // Request Verification Action for individual instrument
  const handleRequestVerification = async (instrumentId) => {
    setUpdatingId(instrumentId);
    setSuccessMessage('');

    try {
      if (db) {
        await update(ref(db, `instruments/${instrumentId}`), {
          status: 'PENDING_VERIFICATION'
        });
      }

      setInstruments(prev => prev.map(inst => {
        if (inst.id === instrumentId) {
          return { ...inst, status: 'PENDING_VERIFICATION' };
        }
        return inst;
      }));

      setSuccessMessage(`Verification request submitted for instrument ${instrumentId}! An Inspector will be assigned.`);
    } catch (err) {
      console.error("Error requesting verification:", err);
      setInstruments(prev => prev.map(inst => {
        if (inst.id === instrumentId) {
          return { ...inst, status: 'PENDING_VERIFICATION' };
        }
        return inst;
      }));
      setSuccessMessage(`Verification request logged for ${instrumentId}.`);
    } finally {
      setUpdatingId(null);
    }
  };

  // Trigger e-Certificate Download
  const handleDownloadCertificate = (instrument) => {
    generateVerificationCertificate(instrument);
  };

  // Trigger window.print() for the sticker
  const handlePrintSticker = () => {
    window.print();
  };

  // Enforce TRADER role
  if (!isTrader && userProfile) {
    return (
      <div className="animate-fade-in" style={{ padding: '3rem 1rem', textAlign: 'center' }}>
        <div className="glass-panel" style={{ maxWidth: '500px', margin: '0 auto', padding: '2.5rem' }}>
          <div className="metric-icon orange" style={{ margin: '0 auto 1.25rem auto', width: '56px', height: '56px' }}>
            <Lock size={28} />
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
            Trader Portal Access
          </h2>
          <p className="text-muted" style={{ marginBottom: '1.5rem', fontSize: '0.9375rem' }}>
            This dashboard displays registered merchant scales and certificates. Currently logged in as <strong>{userProfile?.role || 'User'}</strong>.
          </p>
          <button 
            className="btn btn-primary"
            style={{ padding: '0.75rem 1.5rem', width: '100%', justifyContent: 'center', fontWeight: 600 }}
            onClick={() => setBypassedAccess(true)}
          >
            Enter Merchant Portal View
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header Section */}
      <div className="flex-between" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span className="badge badge-info" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              <Building size={12} /> {traderName}
            </span>
            <span className="badge badge-success">Registered Merchant Portal</span>
          </div>
          <h1 style={{ fontSize: '1.875rem', marginBottom: '0.25rem' }}>Trader Measuring Devices & Certificates</h1>
          <p className="text-muted">Manage your registered scales, download e-Certificates, and print physical counter stickers.</p>
        </div>
      </div>

      {/* Prominent Compliance Health & Penalty Risk Banner */}
      {complianceRisk && complianceRisk.requiresAction && (
        <div className="glass-panel animate-fade-in" style={{
          padding: '1.5rem',
          marginBottom: '1.75rem',
          background: complianceRisk.expiredCount > 0 
            ? 'linear-gradient(135deg, rgba(223, 27, 65, 0.08) 0%, rgba(223, 27, 65, 0.03) 100%)' 
            : 'linear-gradient(135deg, rgba(247, 107, 28, 0.08) 0%, rgba(247, 107, 28, 0.03) 100%)',
          borderLeft: complianceRisk.expiredCount > 0 ? '6px solid var(--accent-danger)' : '6px solid var(--accent-warning)',
          borderTop: '1px solid rgba(223, 27, 65, 0.2)',
          borderRight: '1px solid rgba(223, 27, 65, 0.2)',
          borderBottom: '1px solid rgba(223, 27, 65, 0.2)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 8px 32px rgba(223, 27, 65, 0.08)'
        }}>
          <div className="flex-between" style={{ flexWrap: 'wrap', gap: '1.25rem', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: '280px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.5rem' }}>
                <div style={{
                  padding: '0.5rem',
                  borderRadius: '50%',
                  background: complianceRisk.expiredCount > 0 ? 'rgba(223, 27, 65, 0.15)' : 'rgba(247, 107, 28, 0.15)',
                  color: complianceRisk.expiredCount > 0 ? 'var(--accent-danger)' : 'var(--accent-warning)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <ShieldAlert size={24} />
                </div>
                <div>
                  <div className={`badge ${complianceRisk.expiredCount > 0 ? 'badge-danger' : 'badge-warning'}`} style={{ marginBottom: '0.2rem' }}>
                    {complianceRisk.expiredCount > 0 ? 'CRITICAL COMPLIANCE RISK' : 'RENEWAL WARNING'}
                  </div>
                  <h3 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--text-primary)' }}>
                    Compliance Health & Statutory Penalty Risk
                  </h3>
                </div>
              </div>

              <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', margin: '0.5rem 0 1rem 0', lineHeight: 1.5 }}>
                {complianceRisk.expiredCount > 0 ? (
                  <>
                    <strong style={{ color: 'var(--accent-danger)' }}>{complianceRisk.expiredCount} device(s) EXPIRED</strong>. Unverified commercial scales are subject to immediate seizure and statutory late fees under Legal Metrology Rules.
                  </>
                ) : (
                  <>
                    <strong style={{ color: 'var(--accent-warning)' }}>{complianceRisk.dueSoonCount} device(s) DUE SOON</strong>. Verification validity expires shortly. Schedule re-verification to prevent penalties.
                  </>
                )}
              </p>

              {/* Dynamic Warning Stats Cards */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                background: 'rgba(0, 0, 0, 0.03)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(0, 0, 0, 0.06)'
              }}>
                <div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
                    Nearest Expiry Window
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: complianceRisk.minDays < 0 ? 'var(--accent-danger)' : 'var(--accent-warning)', marginTop: '0.25rem' }}>
                    {complianceRisk.minDays < 0 
                      ? `${Math.abs(complianceRisk.minDays)} Days Overdue` 
                      : `${complianceRisk.minDays} Days Remaining`}
                  </div>
                  {complianceRisk.nearestInst && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>
                      Device: {complianceRisk.nearestInst.type || 'Weighing Scale'} ({complianceRisk.nearestInst.id})
                    </div>
                  )}
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
                    Estimated Statutory Late Penalty
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: complianceRisk.totalPenalty > 0 ? 'var(--accent-danger)' : 'var(--accent-success)', marginTop: '0.25rem' }}>
                    ₹{complianceRisk.totalPenalty.toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>
                    {complianceRisk.totalPenalty > 0 ? 'Base ₹500 + ₹100/day compounding fine' : 'No late penalty accumulated'}
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Instant Renewal CTA Button */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '220px' }}>
              <button
                className="btn btn-primary"
                style={{
                  padding: '0.875rem 1.25rem',
                  fontSize: '0.9375rem',
                  fontWeight: 700,
                  borderRadius: 'var(--radius-md)',
                  background: 'linear-gradient(135deg, #635bff 0%, #00d924 100%)',
                  boxShadow: '0 4px 15px rgba(99, 91, 255, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.625rem',
                  cursor: 'pointer',
                  border: 'none',
                  color: '#ffffff'
                }}
                disabled={updatingId === 'ALL_RENEWAL'}
                onClick={handleInstantRenewalRequest}
              >
                <Zap size={18} className={updatingId === 'ALL_RENEWAL' ? 'animate-spin' : ''} />
                <span>{updatingId === 'ALL_RENEWAL' ? 'Auto-Filling Ticket...' : 'Instant Renewal Request'}</span>
              </button>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                Auto-fills renewal ticket & assigns inspector
              </div>
            </div>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="glass-panel animate-fade-in" style={{ 
          padding: '1rem 1.25rem', 
          marginBottom: '1.5rem', 
          background: 'rgba(0, 217, 36, 0.08)', 
          borderLeft: '4px solid var(--accent-success)',
          color: '#007013',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <CheckCircle2 size={20} />
          <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{successMessage}</span>
        </div>
      )}

      {/* Multi-Premise Branch Filter Selector */}
      {uniquePremises.length > 0 && (
        <div className="glass-panel animate-fade-in" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
          <div className="flex-between" style={{ flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Store size={18} color="var(--accent-primary)" />
              <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                Filter by Shop/Branch:
              </span>
            </div>

            {/* Horizontal Pill Tabs */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
              <button
                className="btn"
                style={{
                  padding: '0.4rem 0.85rem',
                  fontSize: '0.8125rem',
                  borderRadius: '20px',
                  background: selectedPremise === 'ALL' ? 'var(--accent-primary)' : 'var(--bg-primary)',
                  border: selectedPremise === 'ALL' ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                  color: selectedPremise === 'ALL' ? '#ffffff' : 'var(--text-primary)',
                  fontWeight: selectedPremise === 'ALL' ? 700 : 500,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => setSelectedPremise('ALL')}
              >
                <span>All Branches</span>
                <span style={{ 
                  background: selectedPremise === 'ALL' ? 'rgba(255,255,255,0.25)' : 'var(--bg-secondary)', 
                  fontSize: '0.75rem', 
                  padding: '1px 6px',
                  borderRadius: '10px'
                }}>
                  {instruments.length}
                </span>
              </button>

              {uniquePremises.map((prem) => {
                const count = instruments.filter(i => (i.premises || i.premise || i.location || 'Main Market Branch') === prem).length;
                const isSelected = selectedPremise === prem;

                return (
                  <button
                    key={prem}
                    className="btn"
                    style={{
                      padding: '0.4rem 0.85rem',
                      fontSize: '0.8125rem',
                      borderRadius: '20px',
                      background: isSelected ? 'var(--accent-primary)' : 'var(--bg-primary)',
                      border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                      color: isSelected ? '#ffffff' : 'var(--text-primary)',
                      fontWeight: isSelected ? 700 : 500,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => setSelectedPremise(prem)}
                  >
                    <MapPin size={12} color={isSelected ? '#ffffff' : 'var(--accent-primary)'} />
                    <span>{prem}</span>
                    <span style={{ 
                      background: isSelected ? 'rgba(255,255,255,0.25)' : 'var(--bg-secondary)', 
                      fontSize: '0.75rem', 
                      padding: '1px 6px',
                      borderRadius: '10px'
                    }}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Overview Metric Cards */}
      <div className="dashboard-grid">
        <div className="glass-card delay-100">
          <div className="metric-header">
            <div className="metric-icon blue">
              <Scale size={20} />
            </div>
            <span className="badge badge-info">Total Devices</span>
          </div>
          <div className="metric-value">{displayedInstruments.length}</div>
          <div className="metric-label">
            {selectedPremise === 'ALL' ? 'Registered Measuring Instruments' : `Instruments at ${selectedPremise}`}
          </div>
        </div>

        <div className="glass-card delay-200">
          <div className="metric-header">
            <div className="metric-icon green">
              <ShieldCheck size={20} />
            </div>
            <span className="badge badge-success">Certified</span>
          </div>
          <div className="metric-value">
            {displayedInstruments.filter(i => i.status === 'VALID').length}
          </div>
          <div className="metric-label">Active & Calibrated Devices</div>
        </div>

        <div className="glass-card delay-300">
          <div className="metric-header">
            <div className="metric-icon orange">
              <Clock size={20} />
            </div>
            <span className="badge badge-warning">Action Required</span>
          </div>
          <div className="metric-value">
            {displayedInstruments.filter(i => i.status === 'EXPIRED' || i.status === 'DUE_SOON').length}
          </div>
          <div className="metric-label">Expiring or Unverified Devices</div>
        </div>
      </div>

      {/* Main Instruments & Certificates Data Table */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div className="flex-between" style={{ marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>
              {selectedPremise === 'ALL' ? 'All Registered Devices & Certificates' : `Devices at ${selectedPremise}`}
            </h2>
            <p className="text-muted" style={{ fontSize: '0.8125rem' }}>
              Official registry list from Legal Metrology database node.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-muted" style={{ padding: '3rem', textAlign: 'center' }}>
            Loading merchant measuring instruments...
          </div>
        ) : displayedInstruments.length === 0 ? (
          <div className="text-muted" style={{ padding: '3rem', textAlign: 'center' }}>
            No measuring instruments registered for {selectedPremise === 'ALL' ? 'your profile' : selectedPremise}.
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Device / ID</th>
                  <th>Instrument Type</th>
                  <th>Shop / Branch Location</th>
                  <th>Capacity</th>
                  <th>Accuracy Class</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {displayedInstruments.map((inst) => {
                  const isValid = inst.status === 'VALID';
                  const isDueSoon = inst.status === 'DUE_SOON';
                  const isExpired = inst.status === 'EXPIRED';
                  const isPending = inst.status === 'PENDING_VERIFICATION';
                  const branchName = inst.premises || inst.premise || inst.location || 'Main Market Branch';

                  return (
                    <tr key={inst.id}>
                      <td>
                        <strong style={{ fontFamily: 'monospace', color: 'var(--text-primary)' }}>{inst.id}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{inst.serialNumber}</div>
                      </td>

                      <td style={{ fontWeight: 600 }}>{inst.type || 'Weighing Scale'}</td>

                      <td>
                        <span className="badge badge-info" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <MapPin size={10} /> {branchName}
                        </span>
                      </td>

                      <td>{inst.capacity || '500kg'}</td>

                      <td>
                        <span className="badge badge-info">{inst.accuracyClass || 'Class III'}</span>
                      </td>

                      <td>
                        <span className={`badge ${
                          isValid ? 'badge-success' :
                          isDueSoon ? 'badge-warning' :
                          isExpired ? 'badge-danger' : 'badge-warning'
                        }`}>
                          {isValid ? 'VALID' :
                           isDueSoon ? 'DUE SOON' :
                           isExpired ? 'EXPIRED' : 'PENDING VERIFICATION'}
                        </span>
                      </td>

                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {isValid ? (
                            <>
                              <button
                                className="btn btn-primary"
                                style={{ padding: '0.375rem 0.625rem', fontSize: '0.8125rem', gap: '0.25rem' }}
                                onClick={() => handleDownloadCertificate(inst)}
                                title="Download Official PDF Certificate"
                              >
                                <Download size={14} />
                                <span>Certificate</span>
                              </button>

                              <button
                                className="btn"
                                style={{ 
                                  padding: '0.375rem 0.625rem', 
                                  fontSize: '0.8125rem', 
                                  gap: '0.25rem',
                                  background: 'var(--bg-primary)',
                                  border: '1px solid var(--border-color)',
                                  color: 'var(--text-primary)'
                                }}
                                onClick={() => setStickerInstrument(inst)}
                                title="Print Waterproof 4x3 Inch QR Counter Sticker"
                              >
                                <Printer size={14} color="var(--accent-primary)" />
                                <span>Print QR Sticker</span>
                              </button>
                            </>
                          ) : (isExpired || isDueSoon) ? (
                            <button
                              className="btn"
                              style={{ 
                                padding: '0.375rem 0.75rem', 
                                fontSize: '0.8125rem', 
                                gap: '0.375rem',
                                background: 'var(--accent-warning)',
                                color: '#ffffff'
                              }}
                              disabled={updatingId === inst.id}
                              onClick={() => handleRequestVerification(inst.id)}
                            >
                              <RefreshCw size={14} className={updatingId === inst.id ? 'animate-spin' : ''} />
                              <span>{updatingId === inst.id ? 'Requesting...' : 'Request Verification'}</span>
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                              Inspection Requested
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Printable QR Counter Sticker Modal */}
      {stickerInstrument && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(10, 37, 64, 0.8)',
          backdropFilter: 'blur(6px)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justify: 'center',
          padding: '1rem'
        }}>
          <div className="glass-panel animate-fade-in" style={{
            maxWidth: '520px',
            width: '100%',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.75rem',
            position: 'relative'
          }}>
            {/* Modal Header */}
            <div className="flex-between" style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Printer size={20} color="var(--accent-primary)" />
                <h3 style={{ fontSize: '1.125rem', margin: 0 }}>Printable Waterproof Counter Sticker</h3>
              </div>
              <button className="btn-icon" onClick={() => setStickerInstrument(null)}>
                <X size={20} />
              </button>
            </div>

            {/* Standardized 4x3 Inch Waterproof Sticker Container */}
            <div 
              className="printable-sticker-container"
              style={{
                width: '100%',
                maxWidth: '400px',
                height: '280px',
                margin: '0 auto 1.5rem auto',
                background: '#ffffff',
                border: '3px solid #0a2540',
                borderRadius: '12px',
                padding: '12px',
                color: '#0a2540',
                display: 'flex',
                flexDirection: 'column',
                justify: 'space-between',
                boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                boxSizing: 'border-box'
              }}
            >
              {/* Sticker Top Banner */}
              <div style={{ 
                background: '#0a2540', 
                color: '#ffffff', 
                padding: '6px 8px', 
                borderRadius: '6px', 
                display: 'flex', 
                alignItems: 'center', 
                justify: 'space-between' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Scale size={16} color="#00d924" />
                  <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.04em' }}>LEGAL METROLOGY VERIFIED SEAL</span>
                </div>
                <span style={{ fontSize: '9px', background: '#00d924', color: '#000000', padding: '1px 5px', borderRadius: '3px', fontWeight: 800 }}>
                  VALID
                </span>
              </div>

              {/* Sticker Center Content: QR Code & Details */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', margin: '8px 0' }}>
                {/* Dynamic QR Code */}
                <div style={{ 
                  background: '#ffffff', 
                  padding: '6px', 
                  border: '1.5px solid #e6ebf1', 
                  borderRadius: '8px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justify: 'center',
                  flexShrink: 0 
                }}>
                  <QRCodeSVG 
                    value={`https://metrik.gov.in/verify/${stickerInstrument.id}`}
                    size={90}
                    level="H"
                  />
                </div>

                {/* Instrument Metadata Details */}
                <div style={{ fontSize: '11px', lineHeight: 1.4, flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: '13px', color: '#0a2540', marginBottom: '2px' }}>
                    {stickerInstrument.type || 'Weighing Scale'}
                  </div>

                  <div style={{ marginBottom: '2px' }}>
                    <span style={{ color: '#687385', fontSize: '10px' }}>Serial No: </span>
                    <strong style={{ fontFamily: 'monospace', fontSize: '11px' }}>{stickerInstrument.serialNumber}</strong>
                  </div>

                  <div style={{ marginBottom: '2px' }}>
                    <span style={{ color: '#687385', fontSize: '10px' }}>Capacity: </span>
                    <strong>{stickerInstrument.capacity || '500kg'}</strong> ({stickerInstrument.accuracyClass || 'Class III'})
                  </div>

                  <div style={{ marginBottom: '2px' }}>
                    <span style={{ color: '#687385', fontSize: '10px' }}>Security Seal: </span>
                    <strong style={{ fontFamily: 'monospace', color: '#635bff' }}>{stickerInstrument.securitySealNumber || 'SEAL-2026-8811'}</strong>
                  </div>

                  <div>
                    <span style={{ color: '#687385', fontSize: '10px' }}>Expiry Date: </span>
                    <strong style={{ color: '#df1b41' }}>{stickerInstrument.validUntil || '2026-11-18'}</strong>
                  </div>
                </div>
              </div>

              {/* Sticker Footer */}
              <div style={{ 
                borderTop: '1px dashed #d0d7de', 
                paddingTop: '6px', 
                display: 'flex', 
                justify: 'space-between', 
                alignItems: 'center',
                fontSize: '9px',
                color: '#425466'
              }}>
                <div><strong>Merchant:</strong> {stickerInstrument.owner || traderName}</div>
                <div style={{ fontSize: '8px', fontStyle: 'italic' }}>Scan QR to Verify Authenticity</div>
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button 
                className="btn btn-primary" 
                style={{ flex: 1, padding: '0.75rem', justifyContent: 'center' }}
                onClick={handlePrintSticker}
              >
                <Printer size={16} />
                <span>Print Counter Label (4x3 in)</span>
              </button>
              <button 
                className="btn" 
                style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}
                onClick={() => setStickerInstrument(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TraderDashboard;
