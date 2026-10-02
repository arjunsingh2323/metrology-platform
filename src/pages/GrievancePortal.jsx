import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  AlertCircle, 
  Search, 
  Send, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  MapPin, 
  FileText, 
  Paperclip, 
  ArrowRight, 
  Copy, 
  Filter,
  Check,
  Building,
  User,
  Phone,
  Mail,
  Scale
} from 'lucide-react';
import { 
  GRIEVANCE_CATEGORIES, 
  GRIEVANCE_STATUSES, 
  submitGrievance, 
  getGrievances, 
  getGrievanceByReference,
  validateGrievanceAttachment 
} from '../lib/grievances/grievance.service';

const GrievancePortal = () => {
  const { userProfile, currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('SUBMIT'); // 'SUBMIT' | 'TRACK' | 'MY_COMPLAINTS'

  // Submission Form State
  const [formData, setFormData] = useState({
    complainantName: userProfile?.name || '',
    contactEmail: userProfile?.email || '',
    contactPhone: '',
    category: 'SHORT_WEIGHING',
    subject: '',
    description: '',
    businessName: '',
    premises: '',
    district: userProfile?.district || 'Mysuru',
    instrumentId: ''
  });

  const [attachment, setAttachment] = useState(null);
  const [attachmentError, setAttachmentError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(null);

  // Tracking Search State
  const [trackingId, setTrackingId] = useState('');
  const [trackedRecord, setTrackedRecord] = useState(null);
  const [trackError, setTrackError] = useState(null);
  const [searching, setSearching] = useState(false);

  // My Complaints State
  const [myComplaints, setMyComplaints] = useState([]);
  const [loadingComplaints, setLoadingComplaints] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Load user's complaints when switching to MY_COMPLAINTS tab
  useEffect(() => {
    if (activeTab === 'MY_COMPLAINTS') {
      const loadUserComplaints = async () => {
        setLoadingComplaints(true);
        const all = await getGrievances(userProfile?.role || 'CITIZEN', currentUser?.uid);
        // Complainant sees their own or demo merchant records
        const userUid = currentUser?.uid;
        const filtered = all.filter(c => 
          c.userId === userUid || 
          c.contactEmail === userProfile?.email ||
          c.userId === 'demo-trader-uid'
        );
        setMyComplaints(filtered);
        setLoadingComplaints(false);
      };
      loadUserComplaints();
    }
  }, [activeTab, currentUser, userProfile]);

  // Handle Form Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle File Upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validation = validateGrievanceAttachment(file);
      if (!validation.valid) {
        setAttachmentError(validation.error);
        setAttachment(null);
        return;
      }
      setAttachmentError(null);
      setAttachment(file);
    }
  };

  // Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmissionSuccess(null);

    const result = await submitGrievance({
      ...formData,
      evidenceUrl: attachment ? URL.createObjectURL(attachment) : null
    }, currentUser);

    setSubmitting(false);

    if (result.success) {
      setSubmissionSuccess(result.grievance);
      // Reset form
      setFormData({
        complainantName: userProfile?.name || '',
        contactEmail: userProfile?.email || '',
        contactPhone: '',
        category: 'SHORT_WEIGHING',
        subject: '',
        description: '',
        businessName: '',
        premises: '',
        district: userProfile?.district || 'Mysuru',
        instrumentId: ''
      });
      setAttachment(null);
    } else {
      alert(`Error submitting grievance: ${result.error}`);
    }
  };

  // Handle Track Query
  const handleTrackQuery = async (e) => {
    e?.preventDefault();
    if (!trackingId.trim()) return;

    setSearching(true);
    setTrackError(null);
    setTrackedRecord(null);

    const found = await getGrievanceByReference(trackingId, userProfile?.role || 'CITIZEN');
    setSearching(false);

    if (found) {
      setTrackedRecord(found);
    } else {
      setTrackError(`No complaint found matching Reference ID "${trackingId.trim().toUpperCase()}". Please verify the code.`);
    }
  };

  // Quick Copy Reference ID
  const handleCopy = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '3rem' }}>
      
      {/* Top Banner */}
      <div className="flex-between" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <AlertCircle size={26} color="var(--accent-primary)" />
            <h1 style={{ fontSize: '1.875rem', margin: 0 }}>Complaint & Grievance Tracking</h1>
          </div>
          <p className="text-muted" style={{ margin: 0, fontSize: '0.9375rem' }}>
            Report faulty weighing instruments, tampered security seals, or track existing legal metrology cases.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', background: 'var(--bg-secondary)', padding: '0.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          <button
            type="button"
            onClick={() => { setActiveTab('SUBMIT'); setSubmissionSuccess(null); }}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              background: activeTab === 'SUBMIT' ? 'var(--accent-primary)' : 'transparent',
              color: activeTab === 'SUBMIT' ? '#ffffff' : 'var(--text-secondary)',
              transition: 'all 0.15s ease'
            }}
          >
            File Complaint
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('TRACK')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              background: activeTab === 'TRACK' ? 'var(--accent-primary)' : 'transparent',
              color: activeTab === 'TRACK' ? '#ffffff' : 'var(--text-secondary)',
              transition: 'all 0.15s ease'
            }}
          >
            Track Reference
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('MY_COMPLAINTS')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              background: activeTab === 'MY_COMPLAINTS' ? 'var(--accent-primary)' : 'transparent',
              color: activeTab === 'MY_COMPLAINTS' ? '#ffffff' : 'var(--text-secondary)',
              transition: 'all 0.15s ease'
            }}
          >
            My Complaints
          </button>
        </div>
      </div>

      {/* TAB 1: FILE COMPLAINT */}
      {activeTab === 'SUBMIT' && (
        <>
          {submissionSuccess ? (
            <div className="glass-panel animate-fade-in" style={{ padding: '3rem', textAlign: 'center', maxWidth: '650px', margin: '0 auto' }}>
              <CheckCircle2 size={56} color="var(--accent-success)" style={{ margin: '0 auto 1rem auto' }} />
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                Complaint Successfully Registered!
              </h2>
              <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
                Your report has been logged and assigned for official legal metrology review.
              </p>

              <div style={{ background: 'var(--bg-primary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Unique Complaint Reference ID:</div>
                  <strong style={{ fontSize: '1.25rem', color: 'var(--accent-primary)', fontFamily: 'monospace' }}>
                    {submissionSuccess.referenceId}
                  </strong>
                </div>
                <button
                  type="button"
                  className="btn"
                  onClick={() => handleCopy(submissionSuccess.referenceId)}
                  style={{ gap: '0.375rem', border: '1px solid var(--border-color)' }}
                >
                  {copiedId ? <Check size={16} color="var(--accent-success)" /> : <Copy size={16} />}
                  <span>{copiedId ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setTrackingId(submissionSuccess.referenceId);
                    setActiveTab('TRACK');
                    setTrackedRecord(submissionSuccess);
                  }}
                >
                  Track This Complaint
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => setSubmissionSuccess(null)}
                  style={{ border: '1px solid var(--border-color)' }}
                >
                  Submit Another
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="glass-panel animate-fade-in" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                <ShieldAlert size={20} color="var(--accent-primary)" />
                <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Lodge Legal Metrology Infraction Notice</h2>
              </div>

              {/* Complainant Identity Section */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                  1. Complainant Contact Details
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="complainantName"
                      required
                      value={formData.complainantName}
                      onChange={handleChange}
                      placeholder="Your name"
                      style={{ width: '100%', padding: '0.625rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="contactEmail"
                      required
                      value={formData.contactEmail}
                      onChange={handleChange}
                      placeholder="contact@example.com"
                      style={{ width: '100%', padding: '0.625rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
                      Mobile Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="contactPhone"
                      required
                      value={formData.contactPhone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      style={{ width: '100%', padding: '0.625rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', outline: 'none' }}
                    />
                  </div>
                </div>
              </div>

              {/* Infraction Category & Subject */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                  2. Incident Information
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
                      Infraction Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      style={{ width: '100%', padding: '0.625rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', outline: 'none' }}
                    >
                      {GRIEVANCE_CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
                      Subject / Brief Summary *
                    </label>
                    <input
                      type="text"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="e.g. Platform scale reading 850g for 1000g calibration test"
                      style={{ width: '100%', padding: '0.625rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', outline: 'none' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
                    Detailed Description *
                  </label>
                  <textarea
                    name="description"
                    required
                    rows="4"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Provide full details: when it happened, exact measurement discrepancies, behavior of the merchant, and any observed seal condition."
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', outline: 'none', resize: 'vertical' }}
                  />
                </div>
              </div>

              {/* Entity / Premises Details */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                  3. Merchant / Premises Under Complaint
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
                      Business / Shop Name *
                    </label>
                    <input
                      type="text"
                      name="businessName"
                      required
                      value={formData.businessName}
                      onChange={handleChange}
                      placeholder="e.g. Acme Supermart"
                      style={{ width: '100%', padding: '0.625rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
                      Premises Address / Market *
                    </label>
                    <input
                      type="text"
                      name="premises"
                      required
                      value={formData.premises}
                      onChange={handleChange}
                      placeholder="e.g. Shop 14, Main Market Yard"
                      style={{ width: '100%', padding: '0.625rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
                      District *
                    </label>
                    <select
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      style={{ width: '100%', padding: '0.625rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', outline: 'none' }}
                    >
                      <option value="Mysuru">Mysuru District</option>
                      <option value="Bengaluru">Bengaluru District</option>
                      <option value="Hubballi">Hubballi District</option>
                      <option value="Mangaluru">Mangaluru District</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
                      Instrument Serial # (If Visible)
                    </label>
                    <input
                      type="text"
                      name="instrumentId"
                      value={formData.instrumentId}
                      onChange={handleChange}
                      placeholder="e.g. SN-AX99231"
                      style={{ width: '100%', padding: '0.625rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', outline: 'none' }}
                    />
                  </div>
                </div>
              </div>

              {/* Supporting Evidence Upload */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                  4. Supporting Evidence (Optional)
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <label
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.625rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px dashed var(--accent-primary)',
                      background: 'rgba(99, 91, 255, 0.05)',
                      color: 'var(--accent-primary)',
                      cursor: 'pointer',
                      fontSize: '0.8125rem',
                      fontWeight: 600
                    }}
                  >
                    <Paperclip size={16} />
                    <span>Upload Photo of Scale / Tampered Seal / Receipt</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                  </label>
                  {attachment && (
                    <span style={{ fontSize: '0.8125rem', color: 'var(--accent-success)', fontWeight: 600 }}>
                      Selected: {attachment.name} ({(attachment.size / 1024).toFixed(0)} KB)
                    </span>
                  )}
                  {attachmentError && (
                    <span style={{ fontSize: '0.8125rem', color: 'var(--accent-danger)' }}>
                      {attachmentError}
                    </span>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                  style={{ padding: '0.75rem 2rem', fontSize: '0.9375rem', gap: '0.5rem' }}
                >
                  <Send size={16} />
                  <span>{submitting ? 'Registering Complaint...' : 'Submit Complaint'}</span>
                </button>
              </div>
            </form>
          )}
        </>
      )}

      {/* TAB 2: TRACK BY REFERENCE */}
      {activeTab === 'TRACK' && (
        <div className="glass-panel animate-fade-in" style={{ padding: '2rem' }}>
          <div style={{ textAlign: 'center', maxWidth: '550px', margin: '0 auto 2rem auto' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Track Grievance Status</h2>
            <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '1.25rem' }}>
              Enter the unique Reference ID provided when the complaint was registered (e.g. <code>GRV-2026-89412</code>).
            </p>

            <form onSubmit={handleTrackQuery} style={{ display: 'flex', gap: '0.5rem' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  required
                  placeholder="Enter Reference ID (e.g. GRV-2026-89412)"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.625rem 0.75rem 0.625rem 2.5rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    fontFamily: 'monospace',
                    fontSize: '0.9375rem',
                    outline: 'none'
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={searching}
                className="btn btn-primary"
                style={{ padding: '0.625rem 1.5rem' }}
              >
                {searching ? 'Checking...' : 'Track'}
              </button>
            </form>
          </div>

          {trackError && (
            <div style={{ maxWidth: '600px', margin: '0 auto', background: 'rgba(223, 27, 65, 0.08)', border: '1px solid rgba(223, 27, 65, 0.25)', borderRadius: 'var(--radius-md)', padding: '1rem', color: 'var(--accent-danger)', textAlign: 'center', fontSize: '0.875rem' }}>
              {trackError}
            </div>
          )}

          {trackedRecord && (
            <div className="glass-card animate-fade-in" style={{ padding: '2rem', maxWidth: '750px', margin: '0 auto', background: 'var(--bg-secondary)' }}>
              
              <div className="flex-between" style={{ marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Complaint Reference:</span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'monospace', color: 'var(--accent-primary)' }}>
                    {trackedRecord.referenceId}
                  </div>
                </div>

                <span className={`badge ${
                  trackedRecord.status === 'RESOLVED' ? 'badge-success' :
                  trackedRecord.status === 'UNDER_REVIEW' ? 'badge-warning' : 'badge-info'
                }`} style={{ fontSize: '0.875rem', padding: '0.375rem 0.875rem' }}>
                  {trackedRecord.status.replace('_', ' ')}
                </span>
              </div>

              {/* Subject & Details */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.125rem', marginBottom: '0.375rem', color: 'var(--text-primary)' }}>
                  {trackedRecord.subject}
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
                  {trackedRecord.description}
                </p>
              </div>

              {/* Entity Context Badges */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem', background: 'var(--bg-primary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target Merchant:</div>
                  <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{trackedRecord.businessName}</strong>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Premises / District:</div>
                  <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{trackedRecord.premises}, {trackedRecord.district}</strong>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Assigned Officer:</div>
                  <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                    {trackedRecord.assignedTo?.name || 'Pending District Assignment'}
                  </strong>
                </div>
              </div>

              {/* Official Status Timeline */}
              <div>
                <h4 style={{ fontSize: '0.9375rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={16} color="var(--accent-primary)" />
                  Official Status & Verification Timeline
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: '2px solid var(--accent-primary)', paddingLeft: '1.25rem', marginLeft: '0.5rem' }}>
                  {trackedRecord.statusHistory?.map((step, idx) => (
                    <div key={idx} style={{ position: 'relative' }}>
                      <div 
                        style={{
                          position: 'absolute',
                          left: '-1.625rem',
                          top: '2px',
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          background: 'var(--accent-primary)',
                          border: '2px solid white'
                        }}
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <strong style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                          {step.status.replace('_', ' ')}
                        </strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {new Date(step.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>
                        {step.publicNote}
                      </p>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>
                        Updated by: {step.updatedBy}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>
      )}

      {/* TAB 3: MY COMPLAINTS */}
      {activeTab === 'MY_COMPLAINTS' && (
        <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem' }}>
          <div className="flex-between" style={{ marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>My Submitted Grievances</h2>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setActiveTab('SUBMIT')}
              style={{ fontSize: '0.8125rem' }}
            >
              + Lodge New Grievance
            </button>
          </div>

          {loadingComplaints ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              Loading your grievance records...
            </div>
          ) : myComplaints.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <CheckCircle2 size={36} style={{ margin: '0 auto 0.5rem auto', opacity: 0.5 }} />
              <p>No active grievances submitted on this account.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Category</th>
                    <th>Merchant</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {myComplaints.map(c => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 600, fontFamily: 'monospace', color: 'var(--accent-primary)' }}>
                        {c.referenceId}
                      </td>
                      <td>{c.category?.replace('_', ' ')}</td>
                      <td>{c.businessName}</td>
                      <td>
                        <span className={`badge ${
                          c.status === 'RESOLVED' ? 'badge-success' :
                          c.status === 'UNDER_REVIEW' ? 'badge-warning' : 'badge-info'
                        }`}>
                          {c.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn"
                          onClick={() => {
                            setTrackingId(c.referenceId);
                            setTrackedRecord(c);
                            setActiveTab('TRACK');
                          }}
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.625rem', border: '1px solid var(--border-color)' }}
                        >
                          View Timeline
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default GrievancePortal;
