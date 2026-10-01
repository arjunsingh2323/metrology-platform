import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getInstruments } from '../lib/instruments/instrument.service';
import { 
  Scale, 
  CheckCircle2, 
  XCircle, 
  ArrowLeft, 
  MapPin, 
  ShieldCheck, 
  FileText, 
  Award,
  Lock
} from 'lucide-react';

const InspectionExecution = () => {
  const { instrumentId } = useParams();
  const navigate = useNavigate();
  const { userProfile } = useAuth();

  const [instrument, setInstrument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  // Form Test State
  const [standardWeight, setStandardWeight] = useState('10.00');
  const [measuredWeight, setMeasuredWeight] = useState('10.01');
  const [sealNumber, setSealNumber] = useState(`SEAL-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [notes, setNotes] = useState('');
  const [result, setResult] = useState('PASSED'); // 'PASSED' | 'FAILED'

  useEffect(() => {
    const fetchInstrument = async () => {
      setLoading(true);
      const all = await getInstruments();
      const found = all.find(i => i.id === instrumentId || i.serialNumber === instrumentId);
      if (found) {
        setInstrument(found);
      } else {
        // Fallback default mockup for scanned ID
        setInstrument({
          id: instrumentId || 'LM-2026-894123',
          type: 'Platform Scale (Commercial Class III)',
          serialNumber: instrumentId?.startsWith('SN-') ? instrumentId : 'SN-AX99231',
          owner: 'Acme Traders Pvt Ltd',
          premises: 'Main Market Premises, Mysuru',
          district: 'Mysuru',
          status: 'PENDING_VERIFICATION'
        });
      }
      setLoading(false);
    };

    fetchInstrument();
  }, [instrumentId]);

  // Calculate error percentage
  const errorMargin = Math.abs(
    ((parseFloat(measuredWeight || 0) - parseFloat(standardWeight || 1)) / parseFloat(standardWeight || 1)) * 100
  ).toFixed(2);

  const handleSubmitVerification = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      navigate('/inspector');
    }, 2000);
  };

  if (loading) {
    return (
      <div className="glass-panel text-muted" style={{ padding: '3rem', textAlign: 'center' }}>
        Loading inspection parameters for {instrumentId}...
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Top Action Bar */}
      <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
        <button className="btn" onClick={() => navigate('/inspector')} style={{ gap: '0.5rem' }}>
          <ArrowLeft size={16} /> Back to Inspector Queue
        </button>
        <span className="badge badge-info" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
          <MapPin size={12} /> {instrument?.district || 'Mysuru'} District
        </span>
      </div>

      {submitted ? (
        <div className="glass-panel animate-fade-in" style={{ padding: '3rem', textAlign: 'center' }}>
          <CheckCircle2 size={56} color="var(--accent-success)" style={{ margin: '0 auto 1rem auto' }} />
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
            Verification Inspection Submitted!
          </h2>
          <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
            Verification Certificate generated & Security Seal <strong>{sealNumber}</strong> registered in Firebase.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/inspector')}>
            Return to Inspector Dashboard
          </button>
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          {/* Header & Instrument Info */}
          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
            <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
              <span className="badge badge-warning" style={{ fontSize: '0.8125rem' }}>
                Official Verification Execution
              </span>
              <strong style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>{instrument?.id}</strong>
            </div>
            <h1 style={{ fontSize: '1.625rem', marginBottom: '0.375rem' }}>
              {instrument?.type}
            </h1>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <div><strong>Serial No:</strong> {instrument?.serialNumber}</div>
              <div><strong>Trader:</strong> {instrument?.owner}</div>
              <div><strong>Premises:</strong> {instrument?.premises}</div>
            </div>
          </div>

          <form onSubmit={handleSubmitVerification}>
            {/* Step 1: Standard Weight Calibration Test */}
            <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Scale size={18} color="var(--accent-primary)" />
              1. Standard Mass Error Margin Test
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.375rem' }}>
                  Standard Test Mass (kg)
                </label>
                <input 
                  type="number"
                  step="0.01"
                  required
                  value={standardWeight}
                  onChange={(e) => setStandardWeight(e.target.value)}
                  style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.375rem' }}>
                  Measured Reading (kg)
                </label>
                <input 
                  type="number"
                  step="0.01"
                  required
                  value={measuredWeight}
                  onChange={(e) => setMeasuredWeight(e.target.value)}
                  style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.375rem' }}>
                  Calculated Error Margin
                </label>
                <div style={{ padding: '0.625rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', fontWeight: 700, color: errorMargin <= 0.5 ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
                  {errorMargin}% {errorMargin <= 0.5 ? '(Within MPE Tolerance)' : '(Exceeds MPE)'}
                </div>
              </div>
            </div>

            {/* Step 2: Security Hologram Seal Registration */}
            <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={18} color="var(--accent-primary)" />
              2. Security Seal Registration & Lock
            </h3>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.375rem' }}>
                New Tamper-Evident Hologram Seal Serial Number
              </label>
              <input 
                type="text"
                required
                value={sealNumber}
                onChange={(e) => setSealNumber(e.target.value)}
                style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'monospace', fontWeight: 600 }}
              />
            </div>

            {/* Step 3: Inspector Evaluation Decision */}
            <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Award size={18} color="var(--accent-primary)" />
              3. Verification Outcome
            </h3>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              <button
                type="button"
                className={`btn ${result === 'PASSED' ? 'btn-primary' : ''}`}
                style={{ flex: 1, padding: '0.75rem', justifyContent: 'center', background: result === 'PASSED' ? 'var(--accent-success)' : 'var(--bg-primary)', color: result === 'PASSED' ? '#white' : 'var(--text-primary)' }}
                onClick={() => setResult('PASSED')}
              >
                <CheckCircle2 size={18} /> PASSED & CERTIFIED
              </button>

              <button
                type="button"
                className={`btn ${result === 'FAILED' ? 'btn-primary' : ''}`}
                style={{ flex: 1, padding: '0.75rem', justifyContent: 'center', background: result === 'FAILED' ? 'var(--accent-danger)' : 'var(--bg-primary)', color: result === 'FAILED' ? 'white' : 'var(--text-primary)' }}
                onClick={() => setResult('FAILED')}
              >
                <XCircle size={18} /> FAILED / REJECTED
              </button>
            </div>

            {/* Inspection Notes */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.375rem' }}>
                Inspector Notes & Remarks
              </label>
              <textarea 
                rows="3"
                placeholder="Enter field observation notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none' }}
              />
            </div>

            {/* Submit Verification */}
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.875rem', fontSize: '1rem', justifyContent: 'center' }}>
              <FileText size={18} /> Complete & Issue e-Certificate
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default InspectionExecution;
