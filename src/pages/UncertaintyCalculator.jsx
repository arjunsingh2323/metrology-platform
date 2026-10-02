import React, { useState, useMemo, useCallback } from 'react';
import {
  Calculator,
  Plus,
  Trash2,
  RotateCcw,
  Info,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Bookmark,
  Copy,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import {
  calculateUncertainty,
  PROBABILITY_DISTRIBUTIONS,
  METROLOGY_UNITS,
  UNCERTAINTY_PRESETS
} from '../lib/metrology/uncertaintyCalculator';

/* ------------------------------------------------------------------ */
/*  Small helper — inline colour chip per component index              */
/* ------------------------------------------------------------------ */
const BAR_COLORS = ['#635bff', '#00d924', '#ffb800', '#00d4ff', '#df1b41', '#9b8aff'];
const barColor = (idx) => BAR_COLORS[idx % BAR_COLORS.length];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
const UncertaintyCalculator = () => {

  /* ---- preset ---- */
  const [selectedPreset, setSelectedPreset] = useState(0);

  /* ---- form ---- */
  const [measurementName, setMeasurementName] = useState(UNCERTAINTY_PRESETS[0].name);
  const [measuredValue, setMeasuredValue]     = useState(String(UNCERTAINTY_PRESETS[0].measuredValue));
  const [unit, setUnit]                       = useState(UNCERTAINTY_PRESETS[0].unit);
  const [coverageFactor, setCoverageFactor]   = useState(String(UNCERTAINTY_PRESETS[0].coverageFactor));

  /* ---- components ---- */
  const [components, setComponents] = useState(
    UNCERTAINTY_PRESETS[0].components.map((c, i) => ({ ...c, id: c.id || `comp-init-${i}` }))
  );

  /* ---- ui state ---- */
  const [copied, setCopied]           = useState(false);
  const [showAssumptions, setShowAssumptions] = useState(false);

  /* ---- compute ---- */
  const result = useMemo(() => {
    return calculateUncertainty({ measuredValue, unit, coverageFactor, components });
  }, [measuredValue, unit, coverageFactor, components]);

  /* ================================================================ */
  /*  Handlers                                                         */
  /* ================================================================ */

  const handleApplyPreset = useCallback((index) => {
    const idx = parseInt(index, 10);
    if (isNaN(idx) || !UNCERTAINTY_PRESETS[idx]) return;
    const p = UNCERTAINTY_PRESETS[idx];
    setSelectedPreset(idx);
    setMeasurementName(p.name);
    setMeasuredValue(String(p.measuredValue));
    setUnit(p.unit);
    setCoverageFactor(String(p.coverageFactor));
    setComponents(p.components.map((c, i) => ({ ...c, id: `comp-${Date.now()}-${i}` })));
  }, []);

  const handleAddComponent = useCallback(() => {
    setComponents(prev => [
      ...prev,
      {
        id: `comp-${Date.now()}`,
        name: `Uncertainty Component ${prev.length + 1}`,
        value: '0.001',
        distribution: 'STANDARD',
        notes: ''
      }
    ]);
  }, []);

  const handleRemoveComponent = useCallback((id) => {
    setComponents(prev => {
      if (prev.length <= 1) return prev;
      return prev.filter(c => c.id !== id);
    });
  }, []);

  const handleUpdateComponent = useCallback((id, field, value) => {
    setComponents(prev =>
      prev.map(c => c.id === id ? { ...c, [field]: value } : c)
    );
  }, []);

  const handleReset = useCallback(() => {
    handleApplyPreset(0);
  }, [handleApplyPreset]);

  const handleCopySummary = useCallback(() => {
    if (!result.isValid) return;
    const text =
      `Measurement: ${measurementName}\n` +
      `Measured Value: ${result.measuredValue} ${result.unit}\n` +
      `Combined Standard Uncertainty (uc): ±${result.combinedStandardUncertainty.toFixed(6)} ${result.unit}\n` +
      `Expanded Uncertainty (U, k=${result.coverageFactor}): ±${result.expandedUncertainty.toFixed(6)} ${result.unit}\n` +
      `Relative Uncertainty: ±${result.relativeExpandedPercent?.toFixed(4)}%\n` +
      `Standard: ISO/IEC Guide 98-3 (GUM) — Uncorrelated Components`;
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }, [result, measurementName]);

  /* ================================================================ */
  /*  Render helpers                                                   */
  /* ================================================================ */

  const inputStyle = {
    width: '100%',
    padding: '0.625rem 0.75rem',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    background: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    fontSize: '0.875rem',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'border-color 0.15s ease'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'var(--text-muted)',
    marginBottom: '0.375rem',
    textTransform: 'uppercase',
    letterSpacing: '0.04em'
  };

  /* ================================================================ */
  /*  JSX                                                              */
  /* ================================================================ */
  return (
    <div style={{ width: '100%' }}>

      {/* ── PAGE HEADER ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.375rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'rgba(99,91,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calculator size={22} color="var(--accent-primary)" />
            </div>
            <div>
              <h1 style={{ fontSize: '1.5rem', margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>
                Measurement Uncertainty Calculator
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.125rem' }}>
                <span className="badge badge-info">GUM / ISO 98-3</span>
                <span className="badge badge-success">Live Calculation</span>
              </div>
            </div>
          </div>
          <p className="text-muted" style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Evaluate combined standard uncertainty (u<sub>c</sub>) and expanded uncertainty (U = k·u<sub>c</sub>) for legal metrology instruments — ISO/IEC Guide 98-3:2008 compliant.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.625rem', flexShrink: 0 }}>
          <button type="button" className="btn" onClick={handleReset}
            style={{ border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', gap: '0.375rem' }}>
            <RotateCcw size={14} /> Reset
          </button>
          {result.isValid && (
            <button type="button" className="btn btn-primary" onClick={handleCopySummary} style={{ gap: '0.375rem' }}>
              <Copy size={14} /> {copied ? 'Copied!' : 'Copy Summary'}
            </button>
          )}
        </div>
      </div>

      {/* ── PRESET TOOLBAR ──────────────────────────────────────── */}
      <div className="glass-panel" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', flexShrink: 0 }}>
            <Bookmark size={14} color="var(--accent-primary)" />
            Load Preset:
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {UNCERTAINTY_PRESETS.map((preset, index) => {
              const active = selectedPreset === index;
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleApplyPreset(index)}
                  style={{
                    padding: '0.375rem 0.875rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.8125rem',
                    fontWeight: active ? 600 : 500,
                    fontFamily: 'inherit',
                    cursor: 'pointer',
                    border: active ? '1.5px solid var(--accent-primary)' : '1px solid var(--border-color)',
                    background: active ? 'rgba(99,91,255,0.08)' : 'var(--bg-primary)',
                    color: active ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {preset.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── MAIN TWO-COLUMN GRID ─────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 380px)', gap: '1.5rem', alignItems: 'start' }}>

        {/* ══════════════════════════════════════════
            LEFT COLUMN
           ══════════════════════════════════════════ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0 }}>

          {/* 1 — MEASURAND DEFINITION */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={16} color="var(--accent-primary)" />
              1. Measurement Definition
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.875rem', marginBottom: '1.125rem' }}>
              <div>
                <label style={labelStyle}>Description / Parameter</label>
                <input
                  type="text"
                  value={measurementName}
                  onChange={e => setMeasurementName(e.target.value)}
                  placeholder="e.g. Class III Scale Verification"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Measured Value (y)</label>
                <input
                  type="number"
                  step="any"
                  value={measuredValue}
                  onChange={e => setMeasuredValue(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Unit</label>
                <select
                  value={unit}
                  onChange={e => setUnit(e.target.value)}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                >
                  {METROLOGY_UNITS.map(u => (
                    <option key={u.value} value={u.value}>{u.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Coverage Factor (k) for Expanded Uncertainty</label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                {[
                  { label: 'k = 1 (68.27%)', val: '1' },
                  { label: 'k = 2 (95.45%)', val: '2' },
                  { label: 'k = 3 (99.73%)', val: '3' }
                ].map(opt => {
                  const active = coverageFactor === opt.val;
                  return (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => setCoverageFactor(opt.val)}
                      style={{
                        padding: '0.375rem 0.75rem',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        fontFamily: 'inherit',
                        cursor: 'pointer',
                        border: active ? '1.5px solid var(--accent-primary)' : '1px solid var(--border-color)',
                        background: active ? 'rgba(99,91,255,0.08)' : 'var(--bg-primary)',
                        color: active ? 'var(--accent-primary)' : 'var(--text-secondary)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
                <input
                  type="number"
                  step="0.01"
                  min="0.1"
                  value={coverageFactor}
                  onChange={e => setCoverageFactor(e.target.value)}
                  placeholder="Custom k"
                  style={{ ...inputStyle, width: '88px' }}
                />
              </div>
            </div>
          </div>

          {/* 2 — UNCERTAINTY BUDGET COMPONENTS */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>
                  2. Uncertainty Budget Components (u<sub>i</sub>)
                </h2>
                <p className="text-muted" style={{ fontSize: '0.8125rem', margin: 0, marginTop: '0.25rem' }}>
                  Enter standard uncertainties or distribution half-widths for each independent component.
                </p>
              </div>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleAddComponent}
                style={{ gap: '0.375rem', fontSize: '0.8125rem', padding: '0.4rem 0.875rem', flexShrink: 0 }}
              >
                <Plus size={14} /> Add Component
              </button>
            </div>

            {/* Validation Errors */}
            {!result.isValid && result.errors.length > 0 && (
              <div style={{
                background: 'rgba(223,27,65,0.06)',
                border: '1px solid rgba(223,27,65,0.22)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem 1rem',
                marginBottom: '1rem',
                color: 'var(--accent-danger)',
                fontSize: '0.8125rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                  <AlertTriangle size={15} /> Input Validation Notice:
                </div>
                <ul style={{ paddingLeft: '1.25rem', margin: 0, lineHeight: 1.7 }}>
                  {result.errors.map((err, i) => <li key={i}>{err}</li>)}
                </ul>
              </div>
            )}

            {/* Component Rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {components.map((comp, idx) => {
                const stdU = parseFloat(comp.value || 0) / (PROBABILITY_DISTRIBUTIONS[comp.distribution]?.divisor || 1);
                return (
                  <div
                    key={comp.id}
                    style={{
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1rem',
                      transition: 'box-shadow 0.15s ease'
                    }}
                  >
                    {/* Row 1: fields */}
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr auto', gap: '0.75rem', alignItems: 'end' }}>
                      <div>
                        <label style={labelStyle}>Source / Description #{idx + 1}</label>
                        <input
                          type="text"
                          value={comp.name}
                          onChange={e => handleUpdateComponent(comp.id, 'name', e.target.value)}
                          placeholder="e.g. Repeatability"
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>Magnitude {unit ? `(${unit})` : ''}</label>
                        <input
                          type="number"
                          step="any"
                          min="0"
                          value={comp.value}
                          onChange={e => handleUpdateComponent(comp.id, 'value', e.target.value)}
                          placeholder="0.000"
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>Distribution / Divisor</label>
                        <select
                          value={comp.distribution || 'STANDARD'}
                          onChange={e => handleUpdateComponent(comp.id, 'distribution', e.target.value)}
                          style={{ ...inputStyle, cursor: 'pointer' }}
                        >
                          {Object.values(PROBABILITY_DISTRIBUTIONS).map(d => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={() => handleRemoveComponent(comp.id)}
                          disabled={components.length <= 1}
                          title="Remove component"
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid rgba(223,27,65,0.25)',
                            background: 'rgba(223,27,65,0.05)',
                            color: 'var(--accent-danger)',
                            cursor: components.length <= 1 ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: components.length <= 1 ? 0.4 : 1,
                            flexShrink: 0
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    {/* Row 2: std value preview + notes */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: '0.625rem',
                      paddingTop: '0.625rem',
                      borderTop: '1px dashed var(--border-color)',
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)'
                    }}>
                      <span>
                        Converted standard uncertainty (u<sub>{idx + 1}</sub>):&nbsp;
                        <strong style={{ color: 'var(--accent-primary)' }}>
                          {isNaN(stdU) ? '—' : `±${stdU.toPrecision(4)} ${unit}`}
                        </strong>
                      </span>
                      <input
                        type="text"
                        value={comp.notes || ''}
                        onChange={e => handleUpdateComponent(comp.id, 'notes', e.target.value)}
                        placeholder="Optional note / reference..."
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-muted)',
                          fontSize: '0.75rem',
                          fontFamily: 'inherit',
                          width: '220px',
                          textAlign: 'right',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3 — ASSUMPTIONS ACCORDION */}
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <button
              type="button"
              onClick={() => setShowAssumptions(v => !v)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                fontFamily: 'inherit'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                <Info size={15} color="var(--accent-primary)" />
                Scientific Assumptions &amp; Methodology (ISO/IEC Guide 98-3:2008)
              </div>
              {showAssumptions ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {showAssumptions && (
              <div style={{ marginTop: '0.875rem' }}>
                <p className="text-muted" style={{ fontSize: '0.8125rem', marginBottom: '0.625rem' }}>
                  This calculator implements the Root-Sum-of-Squares (RSS) method for combining independent, uncorrelated standard uncertainties per GUM.
                </p>
                <ul style={{ paddingLeft: '1.25rem', fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.65, display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                  <li><strong>Zero Correlation:</strong> All input quantities are assumed mutually independent (r(x<sub>i</sub>, x<sub>j</sub>) = 0). Correlated components require covariance terms.</li>
                  <li><strong>Linear Taylor Expansion:</strong> First-order approximation of the measurement model Y = f(X₁,…,Xₙ) with sensitivity coefficients c<sub>i</sub> = ∂f/∂x<sub>i</sub> = 1.</li>
                  <li><strong>Normal Output Distribution:</strong> Coverage factor k assumes an approximately normal distribution via the Central Limit Theorem. For small degrees of freedom, use the Welch–Satterthwaite relation.</li>
                  <li><strong>OIML R 76-1 / Legal Metrology:</strong> The expanded uncertainty U must not exceed 1/3 of the Maximum Permissible Error (MPE) of the instrument under verification.</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* ══════════════════════════════════════════
            RIGHT COLUMN — RESULTS
           ══════════════════════════════════════════ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'sticky', top: '76px', minWidth: 0 }}>

          {/* ── MAIN RESULT CARD ── */}
          <div style={{
            background: 'var(--bg-secondary)',
            border: '2px solid var(--accent-primary)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 4px 24px rgba(99,91,255,0.12)',
            padding: '1.5rem',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Decorative glow */}
            <div style={{
              position: 'absolute', top: -20, right: -20,
              width: 100, height: 100,
              background: 'radial-gradient(circle, rgba(99,91,255,0.18) 0%, transparent 70%)',
              pointerEvents: 'none'
            }} />

            <div style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--accent-primary)', fontWeight: 700, marginBottom: '0.625rem' }}>
              Final Measurement Result
            </div>

            {result.isValid ? (
              <>
                <div style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: '0.25rem' }}>
                  {result.measuredValue} ± {result.expandedUncertainty?.toPrecision(4)}
                  <span style={{ fontSize: '1rem', fontWeight: 500, marginLeft: '0.375rem', color: 'var(--text-muted)' }}>
                    {result.unit}
                  </span>
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                  Expanded Uncertainty <strong>U</strong> with coverage factor <strong>k = {result.coverageFactor}</strong> (~95.45% confidence)
                </div>

                {/* Key Metric Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.125rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                  <div style={{ background: 'var(--bg-primary)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                      Combined Std (u<sub>c</sub>)
                    </div>
                    <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      ±{result.combinedStandardUncertainty?.toPrecision(4)}&nbsp;{result.unit}
                    </div>
                  </div>
                  <div style={{ background: 'var(--bg-primary)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                      Relative (U<sub>rel</sub>)
                    </div>
                    <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {result.relativeExpandedPercent !== null && result.relativeExpandedPercent !== undefined
                        ? `±${result.relativeExpandedPercent.toFixed(3)}%`
                        : 'N/A'}
                    </div>
                  </div>
                </div>

                {/* Derivation steps */}
                <div style={{
                  background: 'rgba(99,91,255,0.04)',
                  border: '1px solid rgba(99,91,255,0.15)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.875rem',
                  fontFamily: 'monospace',
                  fontSize: '0.8125rem'
                }}>
                  <div style={{ fontWeight: 700, color: 'var(--accent-primary)', marginBottom: '0.375rem', fontSize: '0.75rem' }}>
                    Calculation Derivation:
                  </div>
                  <div style={{ color: 'var(--text-primary)', lineHeight: 1.7 }}>
                    {result.steps?.stepSumValue}
                  </div>
                  <div style={{ color: 'var(--text-primary)', lineHeight: 1.7 }}>
                    {result.steps?.stepExpandedValue}
                  </div>
                </div>
              </>
            ) : (
              <div style={{ padding: '2rem 0.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <HelpCircle size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.4, display: 'block' }} />
                <p style={{ margin: 0, fontSize: '0.875rem' }}>
                  Enter valid measurement values and component uncertainties to view results.
                </p>
              </div>
            )}
          </div>

          {/* ── VARIANCE BUDGET CHART ── */}
          {result.isValid && result.components?.length > 0 && (
            <div className="glass-panel" style={{ padding: '1.25rem' }}>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                Uncertainty Budget Contributions
              </h3>
              <p className="text-muted" style={{ fontSize: '0.75rem', marginBottom: '1rem' }}>
                Percentage contribution of each component's variance (u<sub>i</sub>²) to total variance (u<sub>c</sub>²).
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {result.components.map((comp, idx) => (
                  <div key={comp.id || idx}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                        {comp.name}
                      </span>
                      <span style={{ fontWeight: 700, color: barColor(idx), flexShrink: 0, marginLeft: '0.5rem' }}>
                        {comp.contributionPercent}%
                      </span>
                    </div>
                    <div style={{ height: '8px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${Math.min(100, Math.max(0, comp.contributionPercent))}%`,
                        background: barColor(idx),
                        borderRadius: 'var(--radius-full)',
                        transition: 'width 0.4s cubic-bezier(0.25, 1, 0.5, 1)'
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── MPE REFERENCE BADGE ── */}
          <div className="glass-panel" style={{ padding: '1.125rem', background: 'rgba(0,217,36,0.03)', border: '1px solid rgba(0,217,36,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem' }}>
              <CheckCircle2 size={16} color="var(--accent-success)" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                  MPE Ratio — OIML R 76-1
                </div>
                <p className="text-muted" style={{ fontSize: '0.75rem', margin: 0, lineHeight: 1.6 }}>
                  Under OIML R 76-1 / Legal Metrology Rules, the expanded uncertainty <strong>U</strong> of reference standard weights must not exceed <strong>1/3 of the Maximum Permissible Error (MPE)</strong> of the instrument under verification.
                </p>
              </div>
            </div>
          </div>

          {/* ── QUICK COMPONENT SUMMARY TABLE ── */}
          {result.isValid && result.components?.length > 0 && (
            <div className="glass-panel" style={{ padding: '1.125rem', overflowX: 'auto' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.75rem' }}>Component Summary</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '0.375rem 0.5rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid var(--border-color)' }}>#</th>
                    <th style={{ textAlign: 'left', padding: '0.375rem 0.5rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid var(--border-color)' }}>Source</th>
                    <th style={{ textAlign: 'right', padding: '0.375rem 0.5rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid var(--border-color)' }}>u<sub>i</sub></th>
                    <th style={{ textAlign: 'right', padding: '0.375rem 0.5rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid var(--border-color)' }}>%</th>
                  </tr>
                </thead>
                <tbody>
                  {result.components.map((comp, idx) => (
                    <tr key={comp.id || idx}>
                      <td style={{ padding: '0.375rem 0.5rem', borderBottom: '1px solid var(--border-color)', color: barColor(idx), fontWeight: 700 }}>{idx + 1}</td>
                      <td style={{ padding: '0.375rem 0.5rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-primary)', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{comp.name}</td>
                      <td style={{ padding: '0.375rem 0.5rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-primary)', textAlign: 'right', fontFamily: 'monospace' }}>
                        ±{comp.stdUncertainty?.toPrecision(3)}
                      </td>
                      <td style={{ padding: '0.375rem 0.5rem', borderBottom: '1px solid var(--border-color)', color: barColor(idx), textAlign: 'right', fontWeight: 700 }}>
                        {comp.contributionPercent}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
        {/* END RIGHT COLUMN */}

      </div>
      {/* END GRID */}

    </div>
  );
};

export default UncertaintyCalculator;
