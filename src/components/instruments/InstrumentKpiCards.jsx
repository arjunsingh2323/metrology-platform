import React from 'react';
import { Scale, CheckCircle, AlertTriangle, XCircle, Clock } from 'lucide-react';

const InstrumentKpiCards = ({ stats }) => {
  const kpis = [
    { label: 'Total Instruments', value: stats.total, icon: Scale, color: 'blue' },
    { label: 'Valid', value: stats.valid, icon: CheckCircle, color: 'green' },
    { label: 'Due Soon (30d)', value: stats.dueSoon, icon: AlertTriangle, color: 'orange' },
    { label: 'Expired', value: stats.expired, icon: XCircle, color: 'red' },
    { label: 'Pending', value: stats.pending, icon: Clock, color: 'blue' },
  ];

  return (
    <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
      {kpis.map((kpi, i) => {
        const Icon = kpi.icon;
        return (
          <div key={i} className={`glass-card delay-${(i+1)*100}`} style={{ padding: '1rem' }}>
            <div className="flex-between">
              <div>
                <div className="metric-label">{kpi.label}</div>
                <div className="metric-value" style={{ fontSize: '1.5rem' }}>{kpi.value}</div>
              </div>
              <div className={`metric-icon ${kpi.color}`} style={{ width: '48px', height: '48px' }}>
                <Icon size={24} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default InstrumentKpiCards;
