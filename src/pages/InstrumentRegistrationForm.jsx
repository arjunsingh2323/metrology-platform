import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addInstrument } from '../lib/instruments/instrument.service';
import { ChevronRight, ChevronLeft, Check, UploadCloud, AlertCircle } from 'lucide-react';

const InstrumentRegistrationForm = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState(false);
  
  const [formData, setFormData] = useState({
    // Step 1
    owner: '',
    contactPerson: '',
    premises: '',
    district: '',
    // Step 2
    type: 'Platform Scale',
    manufacturer: '',
    model: '',
    serialNumber: '',
    // Step 3
    capacity: '',
    unit: 'kg',
    leastCount: '',
    // Step 4
    documents: []
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear duplicate warning if serial number changes
    if (e.target.name === 'serialNumber') setDuplicateWarning(false);
  };

  const simulateDuplicateCheck = () => {
    // For demo: if they type 'DUPLICATE' we trigger the warning
    if (formData.serialNumber.toUpperCase() === 'DUPLICATE') {
      setDuplicateWarning(true);
      return true;
    }
    return false;
  };

  const nextStep = () => {
    if (step === 2 && !duplicateWarning && simulateDuplicateCheck()) {
      return; // Stop them to show warning
    }
    setStep(prev => Math.min(prev + 1, 5));
  };
  
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async () => {
    setLoading(true);
    const result = await addInstrument(formData);
    setLoading(false);
    
    if (result.success) {
      alert(`Instrument registered successfully! ID: ${result.id}`);
      navigate('/instruments');
    } else {
      alert('Error registering instrument.');
    }
  };

  // Field renderer helper
  const renderField = (label, name, type = 'text', placeholder = '', required = true) => (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500', fontSize: '0.875rem' }}>
        {label} {required && <span style={{ color: 'var(--accent-danger)' }}>*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        style={{
          width: '100%',
          padding: '0.75rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
          background: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
          outline: 'none'
        }}
      />
    </div>
  );

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', marginBottom: '0.5rem' }}>Register Instrument</h1>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {[1, 2, 3, 4, 5].map(s => (
            <React.Fragment key={s}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: step >= s ? 'var(--accent-primary)' : 'var(--border-color)',
                color: step >= s ? '#fff' : 'var(--text-muted)',
                fontWeight: '600', fontSize: '0.875rem'
              }}>
                {step > s ? <Check size={16} /> : s}
              </div>
              {s < 5 && <div style={{ height: '2px', flexGrow: 1, background: step > s ? 'var(--accent-primary)' : 'var(--border-color)' }}></div>}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="glass-card">
        {step === 1 && (
          <div className="animate-fade-in">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Step 1: Ownership & Premises</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {renderField('Business / Owner Name', 'owner', 'text', 'e.g. Acme Traders')}
              {renderField('Contact Person', 'contactPerson', 'text', 'e.g. John Doe')}
              {renderField('Premises / Location Name', 'premises', 'text', 'e.g. Main Market Branch')}
              {renderField('District', 'district', 'text', 'e.g. Mysuru')}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Step 2: Instrument Identity</h2>
            
            {duplicateWarning && (
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--accent-danger)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', color: 'var(--accent-danger)' }}>
                <AlertCircle size={20} />
                <div>
                  <h4 style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Possible Duplicate Found</h4>
                  <p style={{ fontSize: '0.875rem' }}>An instrument with this serial number already exists. Are you sure you want to proceed?</p>
                  <button className="btn" style={{ marginTop: '0.5rem', background: 'var(--accent-danger)', color: '#fff', fontSize: '0.75rem', padding: '0.25rem 0.5rem' }} onClick={() => setDuplicateWarning(false)}>
                    Ignore and Continue
                  </button>
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500', fontSize: '0.875rem' }}>Instrument Type *</label>
                <select name="type" value={formData.type} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                  <option>Platform Scale</option>
                  <option>Electronic Counter Scale</option>
                  <option>Fuel Dispensing Measure</option>
                  <option>Analytical Balance</option>
                </select>
              </div>
              {renderField('Manufacturer', 'manufacturer', 'text', 'e.g. Reliable Scales Inc')}
              {renderField('Model Number', 'model', 'text', 'e.g. PRO-2000')}
              {renderField('Serial Number', 'serialNumber', 'text', 'e.g. SN-AX99231 (Try typing DUPLICATE)')}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-in">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Step 3: Technical Specifications</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {renderField('Maximum Capacity', 'capacity', 'number', 'e.g. 30')}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500', fontSize: '0.875rem' }}>Unit *</label>
                <select name="unit" value={formData.unit} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                  <option>kg</option>
                  <option>g</option>
                  <option>mg</option>
                  <option>Liters</option>
                </select>
              </div>
              {renderField('Least Count / Resolution', 'leastCount', 'text', 'e.g. 1g')}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="animate-fade-in">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Step 4: Documents & Evidence</h2>
            
            <div style={{ border: '2px dashed var(--border-color)', padding: '3rem', textAlign: 'center', borderRadius: 'var(--radius-lg)', background: 'rgba(202, 134, 67, 0.02)' }}>
              <UploadCloud size={48} style={{ color: 'var(--accent-primary)', margin: '0 auto 1rem auto' }} />
              <h3 style={{ marginBottom: '0.5rem', fontWeight: '500' }}>Drag & Drop Photos</h3>
              <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>Upload Identification Plate, Front View, and Purchase Invoice.</p>
              <button className="btn" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                Browse Files
              </button>
            </div>
            
          </div>
        )}

        {step === 5 && (
          <div className="animate-fade-in">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Step 5: Review & Submit</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div>
                <h3 style={{ fontSize: '0.875rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Identity</h3>
                <p><strong>{formData.owner || '-'}</strong></p>
                <p className="text-muted">{formData.premises || '-'}, {formData.district}</p>
                <p className="text-muted">Contact: {formData.contactPerson || '-'}</p>
              </div>
              <div>
                <h3 style={{ fontSize: '0.875rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Instrument</h3>
                <p><strong>{formData.type}</strong></p>
                <p className="text-muted">{formData.manufacturer} ({formData.model})</p>
                <p className="text-muted">S/N: {formData.serialNumber}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
          <button 
            className="btn" 
            onClick={prevStep} 
            disabled={step === 1 || loading}
            style={{ opacity: step === 1 ? 0.5 : 1, background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}
          >
            <ChevronLeft size={16} /> Back
          </button>
          
          {step < 5 ? (
            <button className="btn btn-primary" onClick={nextStep} disabled={duplicateWarning}>
              Next Step <ChevronRight size={16} />
            </button>
          ) : (
            <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Registering...' : 'Complete Registration'} <Check size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstrumentRegistrationForm;
