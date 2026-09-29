import React, { useState, useEffect } from 'react';
import { getInstruments, getInstrumentStats, seedDatabase } from '../lib/instruments/instrument.service';
import InstrumentKpiCards from '../components/instruments/InstrumentKpiCards';
import InstrumentFilters from '../components/instruments/InstrumentFilters';
import InstrumentTable from '../components/instruments/InstrumentTable';
import { Plus, Database } from 'lucide-react';
import { Link } from 'react-router-dom';

const InstrumentsPage = () => {
  const [instruments, setInstruments] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const data = await getInstruments();
    setInstruments(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSeed = async () => {
    await seedDatabase();
    alert('Firestore seeded with demo data!');
    loadData();
  };

  const stats = getInstrumentStats(instruments);

  return (
    <div className="animate-fade-in">
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', marginBottom: '0.25rem' }}>Instruments Registry</h1>
          <p className="text-muted">Master registry of weighing & measuring instruments</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn" style={{ border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }} onClick={handleSeed}>
            <Database size={18} /> Seed Firestore
          </button>
          <Link to="/instruments/new" className="btn btn-primary" style={{ textDecoration: 'none' }}>
            <Plus size={18} /> Add Instrument
          </Link>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>Loading instruments...</div>
      ) : (
        <>
          <InstrumentKpiCards stats={stats} />
          
          <div className="glass-panel delay-300" style={{ padding: '1.5rem', animation: 'fadeIn 0.4s ease forwards' }}>
            <InstrumentFilters />
            <InstrumentTable instruments={instruments} />
            
            <div className="flex-between" style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
              <span className="text-muted" style={{ fontSize: '0.875rem' }}>
                Showing 1-{instruments.length} of {instruments.length} instruments
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

export default InstrumentsPage;
