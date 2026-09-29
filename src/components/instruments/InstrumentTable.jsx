import React from 'react';

const InstrumentTable = ({ instruments }) => {
  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Instrument ID</th>
            <th>Type</th>
            <th>Serial Number</th>
            <th>Owner</th>
            <th>Status</th>
            <th>Valid Until</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {instruments.map((inst) => (
            <tr key={inst.id}>
              <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{inst.id}</td>
              <td>{inst.type}</td>
              <td className="text-muted">{inst.serialNumber}</td>
              <td>{inst.owner}</td>
              <td>
                <span className={`badge ${
                  inst.status === 'VALID' ? 'badge-success' : 
                  inst.status === 'DUE_SOON' ? 'badge-warning' : 
                  inst.status === 'EXPIRED' ? 'badge-danger' : 'badge-info'
                }`}>
                  {inst.status.replace('_', ' ')}
                </span>
              </td>
              <td>{inst.validUntil || '-'}</td>
              <td>
                <button style={{ color: 'var(--accent-primary)', fontSize: '0.875rem', fontWeight: '500' }}>View</button>
              </td>
            </tr>
          ))}
          {instruments.length === 0 && (
            <tr>
              <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                No instruments found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default InstrumentTable;
