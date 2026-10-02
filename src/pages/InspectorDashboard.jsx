import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useAuth } from '../contexts/AuthContext';
import { getInstruments } from '../lib/instruments/instrument.service';
import { 
  getOfflineInspectionsCount, 
  syncOfflineInspections 
} from '../lib/pwaSync';
import { 
  ShieldAlert, 
  MapPin, 
  Scale, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Filter,
  Building,
  Lock,
  QrCode,
  X,
  Camera,
  LayoutGrid,
  Map as MapIcon,
  Wifi,
  WifiOff,
  RefreshCw
} from 'lucide-react';

// Leaflet GIS Map View Sub-Component
const InspectorMapView = ({ instruments, onStartInspection, selectedDistrict }) => {
  // Filter instruments showing PENDING_VERIFICATION or DUE_SOON with valid gpsLocation
  const pendingOrDueSoon = useMemo(() => {
    return instruments.filter(inst => 
      (inst.status === 'PENDING_VERIFICATION' || inst.status === 'DUE_SOON') &&
      inst.gpsLocation?.lat && inst.gpsLocation?.lng
    );
  }, [instruments]);

  // District Lat/Lng Centers
  const districtCenters = {
    Mysuru: [12.2958, 76.6394],
    Bengaluru: [12.9716, 77.5946],
    Hubballi: [15.3647, 75.1240],
    Mangaluru: [12.9141, 74.8560],
    ALL: [12.9716, 77.5946]
  };

  const center = districtCenters[selectedDistrict] || districtCenters.Mysuru;

  // Custom marker pin rendering
  const createMarkerIcon = (status) => {
    const color = status === 'PENDING_VERIFICATION' ? '#df1b41' : '#ffb800';
    return L.divIcon({
      className: 'custom-leaflet-marker',
      html: `<div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.35);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 14px;
      ">📍</div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });
  };

  return (
    <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
      <div className="flex-between" style={{ marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1.125rem', color: 'var(--text-primary)', margin: 0 }}>
            Geospatial Inspection GIS Map
          </h3>
          <p className="text-muted" style={{ fontSize: '0.8125rem', margin: 0 }}>
            Displaying map markers for all instruments with <strong>PENDING_VERIFICATION</strong> or <strong>DUE_SOON</strong> status.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8125rem', fontWeight: 600 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--accent-danger)' }}></span> 
            Pending Verification ({pendingOrDueSoon.filter(i => i.status === 'PENDING_VERIFICATION').length})
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--accent-warning)' }}></span> 
            Due Soon ({pendingOrDueSoon.filter(i => i.status === 'DUE_SOON').length})
          </span>
        </div>
      </div>

      <div style={{ height: '520px', width: '100%', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
        <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {pendingOrDueSoon.map(inst => (
            <Marker 
              key={inst.id} 
              position={[inst.gpsLocation.lat, inst.gpsLocation.lng]}
              icon={createMarkerIcon(inst.status)}
            >
              <Popup>
                <div style={{ padding: '0.25rem', minWidth: '210px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                    <span className={`badge ${inst.status === 'PENDING_VERIFICATION' ? 'badge-danger' : 'badge-warning'}`} style={{ fontSize: '0.7rem' }}>
                      {inst.status === 'PENDING_VERIFICATION' ? 'PENDING' : 'DUE SOON'}
                    </span>
                    <strong style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>{inst.id}</strong>
                  </div>
                  <h4 style={{ margin: '0.25rem 0', fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {inst.type}
                  </h4>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.625rem' }}>
                    <strong>Premises:</strong> {inst.premises}
                  </div>
                  <button 
                    onClick={() => onStartInspection(inst.id)}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '0.375rem 0.625rem', fontSize: '0.75rem', justifyContent: 'center' }}
                  >
                    <span>Start Inspection</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

const InspectorDashboard = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  const [instruments, setInstruments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('PRIORITY'); // 'PRIORITY' | 'ALL' | 'PENDING' | 'DUE_SOON'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'map'

  const [selectedDistrict, setSelectedDistrict] = useState(userProfile?.district || 'Mysuru');
  const isInspector = userProfile?.role === 'INSPECTOR' || userProfile?.role === 'ADMIN';

  // Persistent Connection & PWA Sync State
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineCount, setOfflineCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  // QR Scanner Modal State
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [manualId, setManualId] = useState('');
  const [scanError, setScanError] = useState(null);
  const scannerRef = useRef(null);

  // Connection & IndexedDB PWA Sync Listener
  useEffect(() => {
    const updateOfflineState = async () => {
      const count = await getOfflineInspectionsCount();
      setOfflineCount(count);
    };

    updateOfflineState();

    const handleOnline = async () => {
      setIsOnline(true);
      setIsSyncing(true);

      // Perform sync from IndexedDB 'metrik-offline-db' to database
      try {
        const syncedRecords = await syncOfflineInspections();
        console.log(`Synced ${syncedRecords} offline inspections to database.`);
      } catch (err) {
        console.error("Sync error:", err);
      } finally {
        setTimeout(async () => {
          setOfflineCount(await getOfflineInspectionsCount());
          setIsSyncing(false);
        }, 1800);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      updateOfflineState();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const fetchDistrictInstruments = async () => {
      setLoading(true);
      setError(null);
      try {
        const allInstruments = await getInstruments();
        
        // Filter by matching inspector district or return all if 'ALL' selected
        const districtFiltered = allInstruments.filter(inst => {
          if (selectedDistrict === 'ALL') return true;
          const instDist = inst.district || 'Mysuru';
          return instDist.toLowerCase() === selectedDistrict.toLowerCase();
        });

        setInstruments(districtFiltered);
      } catch (err) {
        console.error("Error loading inspector dashboard instruments:", err);
        setError("Failed to load instruments for your district.");
      } finally {
        setLoading(false);
      }
    };

    fetchDistrictInstruments();
  }, [selectedDistrict]);

  // Handle QR Camera Scanner Lifecycle
  useEffect(() => {
    let html5QrCode = null;

    if (isScannerOpen) {
      setScanError(null);
      const timer = setTimeout(() => {
        try {
          html5QrCode = new Html5Qrcode("qr-reader");
          scannerRef.current = html5QrCode;

          const config = { fps: 10, qrbox: { width: 240, height: 240 } };

          html5QrCode.start(
            { facingMode: "environment" },
            config,
            (decodedText) => {
              console.log("QR Code Scanned:", decodedText);
              handleScannedPayload(decodedText);
              if (html5QrCode && html5QrCode.isScanning) {
                html5QrCode.stop().catch(err => console.warn("Camera stop warning:", err));
              }
              setIsScannerOpen(false);
            },
            (errorMessage) => {
              // Ignore frame parse errors
            }
          ).catch((err) => {
            console.warn("Camera permission / init error:", err);
            setScanError("Camera access unavailable. You can enter the Instrument ID manually below.");
          });
        } catch (e) {
          console.warn("Scanner setup error:", e);
          setScanError("Camera access unavailable. Use manual ID entry below.");
        }
      }, 300);

      return () => {
        clearTimeout(timer);
        if (html5QrCode && html5QrCode.isScanning) {
          html5QrCode.stop().catch(err => console.warn("Cleanup camera stop warning:", err));
        }
      };
    }
  }, [isScannerOpen]);

  // Helper to extract instrumentId from QR Payload URL or raw text
  const handleScannedPayload = (payloadText) => {
    if (!payloadText) return;
    let extractedId = payloadText.trim();

    if (payloadText.includes('/')) {
      const parts = payloadText.split('/');
      extractedId = parts[parts.length - 1] || payloadText;
    }

    navigate(`/inspect/${extractedId}`);
  };

  const handleCloseScanner = () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current.stop().catch(err => console.warn("Close scanner error:", err));
    }
    setIsScannerOpen(false);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualId.trim()) {
      handleScannedPayload(manualId.trim());
      setIsScannerOpen(false);
    }
  };

  // Prioritize PENDING_VERIFICATION & DUE_SOON, followed by EXPIRED and VALID
  const prioritizedInstruments = useMemo(() => {
    let filtered = [...instruments];

    if (filterType === 'PRIORITY') {
      filtered = filtered.filter(inst => 
        inst.status === 'PENDING_VERIFICATION' || inst.status === 'DUE_SOON'
      );
    } else if (filterType === 'PENDING') {
      filtered = filtered.filter(inst => inst.status === 'PENDING_VERIFICATION');
    } else if (filterType === 'DUE_SOON') {
      filtered = filtered.filter(inst => inst.status === 'DUE_SOON');
    } else if (filterType === 'EXPIRED') {
      filtered = filtered.filter(inst => inst.status === 'EXPIRED');
    } else if (filterType === 'VALID') {
      filtered = filtered.filter(inst => inst.status === 'VALID');
    }

    const priorityMap = {
      'PENDING_VERIFICATION': 0,
      'DUE_SOON': 1,
      'EXPIRED': 2,
      'VALID': 3
    };

    return filtered.sort((a, b) => {
      const pA = priorityMap[a.status] ?? 4;
      const pB = priorityMap[b.status] ?? 4;
      return pA - pB;
    });
  }, [instruments, filterType]);

  // Stats calculation
  const priorityCount = useMemo(() => {
    return instruments.filter(i => i.status === 'PENDING_VERIFICATION' || i.status === 'DUE_SOON').length;
  }, [instruments]);

  const pendingCount = useMemo(() => {
    return instruments.filter(i => i.status === 'PENDING_VERIFICATION').length;
  }, [instruments]);

  const dueSoonCount = useMemo(() => {
    return instruments.filter(i => i.status === 'DUE_SOON').length;
  }, [instruments]);

  // Handler for starting inspection
  const handleStartInspection = (instrumentId) => {
    navigate(`/inspect/${instrumentId}`);
  };

  // Strictly enforce INSPECTOR role
  if (!isInspector && userProfile) {
    return (
      <div className="animate-fade-in" style={{ padding: '3rem 1rem', textAlign: 'center' }}>
        <div className="glass-panel" style={{ maxWidth: '500px', margin: '0 auto', padding: '2.5rem' }}>
          <div className="metric-icon red" style={{ margin: '0 auto 1.25rem auto', width: '56px', height: '56px' }}>
            <Lock size={28} />
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', color: 'var(--accent-danger)' }}>
            Access Restricted
          </h2>
          <p className="text-muted" style={{ marginBottom: '1.5rem', fontSize: '0.9375rem' }}>
            This page is strictly reserved for users with the <strong>INSPECTOR</strong> role. You are currently logged in as <strong>{userProfile?.role || 'User'}</strong>.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ position: 'relative', minHeight: '80vh' }}>
      {/* Header Section */}
      <div className="flex-between" style={{ marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', background: 'var(--bg-secondary)', padding: '0.25rem 0.625rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <MapPin size={14} color="var(--accent-primary)" />
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>District:</span>
              <select 
                value={selectedDistrict} 
                onChange={(e) => setSelectedDistrict(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="Mysuru">Mysuru District</option>
                <option value="Bengaluru">Bengaluru District</option>
                <option value="Hubballi">Hubballi District</option>
                <option value="Mangaluru">Mangaluru District</option>
                <option value="ALL">All Districts</option>
              </select>
            </div>

            {/* Persistent Connection Status Widget */}
            <div style={{ display: 'inline-flex', alignItems: 'center' }}>
              {isSyncing ? (
                <span className="badge badge-info" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', background: 'rgba(0, 212, 255, 0.15)', color: '#00768f', padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}>
                  <RefreshCw size={14} style={{ animation: 'spin 1.5s linear infinite' }} />
                  <span>Syncing to Database...</span>
                </span>
              ) : isOnline ? (
                <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}>
                  <Wifi size={14} />
                  <span>Online & Synced</span>
                </span>
              ) : (
                <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', background: 'rgba(255, 184, 0, 0.18)', color: '#b38100', padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}>
                  <WifiOff size={14} />
                  <span>Offline: {offlineCount} Inspections Saved Locally</span>
                </span>
              )}
            </div>

            <span className="badge badge-success">Official Inspector Portal</span>
          </div>
          <h1 style={{ fontSize: '1.875rem', marginBottom: '0.25rem' }}>Inspector Queue & Inspections</h1>
          <p className="text-muted">Review and execute pending verifications assigned to {userProfile?.name || 'Inspector'}.</p>
        </div>

        {/* View Mode Toggle & Filter Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* View Mode Switcher */}
          <div className="glass-panel" style={{ padding: '0.25rem', display: 'flex', gap: '0.25rem' }}>
            <button 
              className={`btn ${viewMode === 'grid' ? 'btn-primary' : ''}`}
              style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid size={14} />
              <span>Grid View</span>
            </button>

            <button 
              className={`btn ${viewMode === 'map' ? 'btn-primary' : ''}`}
              style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}
              onClick={() => setViewMode('map')}
            >
              <MapIcon size={14} />
              <span>Map View</span>
            </button>
          </div>

          {/* Clean Filter Button Tabs */}
          {viewMode === 'grid' && (
            <div className="glass-panel" style={{ padding: '0.375rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <Filter size={16} className="text-muted" />
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>Filter:</span>
              <button 
                className={`btn ${filterType === 'PRIORITY' ? 'btn-primary' : ''}`} 
                style={{ padding: '0.25rem 0.625rem', fontSize: '0.8125rem', height: '28px' }}
                onClick={() => setFilterType('PRIORITY')}
              >
                Priority ({priorityCount})
              </button>
              <button 
                className={`btn ${filterType === 'PENDING' ? 'btn-primary' : ''}`}
                style={{ padding: '0.25rem 0.625rem', fontSize: '0.8125rem', height: '28px' }}
                onClick={() => setFilterType('PENDING')}
              >
                Pending ({pendingCount})
              </button>
              <button 
                className={`btn ${filterType === 'DUE_SOON' ? 'btn-primary' : ''}`}
                style={{ padding: '0.25rem 0.625rem', fontSize: '0.8125rem', height: '28px' }}
                onClick={() => setFilterType('DUE_SOON')}
              >
                Due Soon ({dueSoonCount})
              </button>
              <button 
                className={`btn ${filterType === 'ALL' ? 'btn-primary' : ''}`}
                style={{ padding: '0.25rem 0.625rem', fontSize: '0.8125rem', height: '28px' }}
                onClick={() => setFilterType('ALL')}
              >
                All ({instruments.length})
              </button>
            </div>
          )}
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="dashboard-grid">
        <div className="glass-card delay-100">
          <div className="metric-header">
            <div className="metric-icon orange">
              <Clock size={20} />
            </div>
            <span className="badge badge-warning">High Priority</span>
          </div>
          <div className="metric-value">{priorityCount}</div>
          <div className="metric-label">Immediate Inspection Required</div>
        </div>

        <div className="glass-card delay-200">
          <div className="metric-header">
            <div className="metric-icon red">
              <AlertTriangle size={20} />
            </div>
            <span className="badge badge-danger">Unverified</span>
          </div>
          <div className="metric-value">{pendingCount}</div>
          <div className="metric-label">Pending Verification</div>
        </div>

        <div className="glass-card delay-300">
          <div className="metric-header">
            <div className="metric-icon blue">
              <Scale size={20} />
            </div>
            <span className="badge badge-info">Expiring Soon</span>
          </div>
          <div className="metric-value">{dueSoonCount}</div>
          <div className="metric-label">Verification Due Within 30 Days</div>
        </div>
      </div>

      {/* View Mode Switching: Grid View vs Map View */}
      {loading ? (
        <div className="glass-panel text-muted" style={{ padding: '3rem', textAlign: 'center' }}>
          Loading district instruments...
        </div>
      ) : error ? (
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--accent-danger)' }}>
          <ShieldAlert size={32} style={{ marginBottom: '0.5rem' }} />
          <p>{error}</p>
        </div>
      ) : viewMode === 'map' ? (
        <InspectorMapView 
          instruments={instruments} 
          onStartInspection={handleStartInspection} 
          selectedDistrict={selectedDistrict}
        />
      ) : prioritizedInstruments.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <CheckCircle2 size={40} color="var(--accent-success)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Priority Inspections Pending!</h3>
          <p className="text-muted">All registered instruments in {selectedDistrict} district are up to date and verified.</p>
        </div>
      ) : (
        <div className="inspector-cards-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.25rem'
        }}>
          {prioritizedInstruments.map((inst, index) => {
            const isPending = inst.status === 'PENDING_VERIFICATION';
            const isDueSoon = inst.status === 'DUE_SOON';
            const isExpired = inst.status === 'EXPIRED';

            return (
              <div 
                key={inst.id || index} 
                className={`glass-card delay-${((index % 3) + 1) * 100}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between',
                  borderLeft: isPending 
                    ? '4px solid var(--accent-danger)' 
                    : isDueSoon 
                    ? '4px solid var(--accent-warning)' 
                    : '4px solid var(--border-color)',
                  position: 'relative'
                }}
              >
                <div>
                  {/* Top Header & Status */}
                  <div className="flex-between" style={{ marginBottom: '0.875rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div className="metric-icon blue" style={{ width: '32px', height: '32px' }}>
                        <Scale size={16} />
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                        {inst.id}
                      </span>
                    </div>

                    <span className={`badge ${
                      isPending ? 'badge-danger' :
                      isDueSoon ? 'badge-warning' :
                      isExpired ? 'badge-danger' : 'badge-success'
                    }`}>
                      {isPending ? 'PENDING VERIFICATION' :
                       isDueSoon ? 'DUE SOON' :
                       isExpired ? 'EXPIRED' : 'VALID'}
                    </span>
                  </div>

                  {/* Instrument Details */}
                  <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                    {inst.type || 'Weighing Scale'}
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', width: '85px' }}>District:</span>
                      <span className="badge badge-info" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <MapPin size={10} /> {inst.district || selectedDistrict}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', width: '85px' }}>Serial No:</span>
                      <strong style={{ fontFamily: 'monospace', color: 'var(--text-primary)' }}>{inst.serialNumber}</strong>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <Building size={14} className="text-muted" style={{ marginTop: '0.2rem', flexShrink: 0 }} />
                      <div>
                        <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{inst.owner || 'Registered Trader'}</span>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{inst.premises}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div style={{ paddingTop: '0.875rem', borderTop: '1px solid var(--border-color)', marginTop: 'auto' }}>
                  <button 
                    className="btn btn-primary"
                    style={{ width: '100%', justifyContent: 'center' }}
                    onClick={() => handleStartInspection(inst.id)}
                  >
                    <span>Start Inspection</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Action Button (FAB): Scan to Inspect */}
      <button
        onClick={() => setIsScannerOpen(true)}
        className="btn-fab animate-pulse-ring"
        style={{
          position: 'fixed',
          bottom: '2.5rem',
          right: '2.5rem',
          zIndex: 999,
          background: 'linear-gradient(135deg, var(--accent-primary) 0%, #4a3aff 100%)',
          color: '#ffffff',
          padding: '0.875rem 1.5rem',
          borderRadius: '9999px',
          boxShadow: '0 10px 25px -5px rgba(99, 91, 255, 0.5), 0 8px 16px -8px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.625rem',
          fontWeight: 700,
          fontSize: '0.9375rem',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          cursor: 'pointer',
          transition: 'all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1)'
        }}
      >
        <QrCode size={22} />
        <span>Scan to Inspect</span>
      </button>

      {/* QR Camera Scanner Modal Dialog */}
      {isScannerOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(10, 37, 64, 0.75)',
          backdropFilter: 'blur(8px)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justify: 'center',
          padding: '1rem'
        }}>
          <div className="glass-panel animate-fade-in" style={{
            maxWidth: '460px',
            width: '100%',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.75rem',
            position: 'relative',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)'
          }}>
            {/* Modal Header */}
            <div className="flex-between" style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div className="metric-icon blue" style={{ width: '36px', height: '36px' }}>
                  <Camera size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.125rem', margin: 0, color: 'var(--text-primary)' }}>
                    Scan Instrument QR Code
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Point camera at scale/weighbridge QR seal
                  </div>
                </div>
              </div>
              <button 
                className="btn-icon" 
                onClick={handleCloseScanner}
                style={{ color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* WebRTC Camera Reader Container */}
            <div 
              id="qr-reader" 
              style={{ 
                width: '100%', 
                borderRadius: 'var(--radius-lg)', 
                overflow: 'hidden', 
                border: '2px dashed var(--accent-primary)',
                minHeight: '260px',
                background: 'var(--bg-primary)',
                marginBottom: '1.25rem'
              }} 
            />

            {scanError && (
              <div style={{ 
                fontSize: '0.8125rem', 
                color: 'var(--accent-danger)', 
                background: 'rgba(223, 27, 65, 0.08)', 
                padding: '0.625rem 0.875rem', 
                borderRadius: 'var(--radius-md)', 
                marginBottom: '1rem' 
              }}>
                {scanError}
              </div>
            )}

            {/* Manual ID Input Fallback */}
            <form onSubmit={handleManualSubmit} style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.375rem' }}>
                Or Enter Instrument / Serial ID Manually:
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  placeholder="e.g. LM-2026-894123 or SN-AX99231" 
                  value={manualId}
                  onChange={(e) => setManualId(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '0.625rem 0.875rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem',
                    outline: 'none'
                  }}
                />
                <button type="submit" className="btn btn-primary">
                  Inspect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InspectorDashboard;
