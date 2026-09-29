import React from 'react';
import { Search, Filter, Plus, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const InstrumentFilters = () => {
  return (
    <div className="glass-card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
        
        {/* Search */}
        <div className="search-bar" style={{ flexGrow: 1, minWidth: '250px' }}>
          <Search size={16} className="text-muted" />
          <input 
            type="text" 
            placeholder="Search ID, Serial, Owner..." 
            style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', width: '100%' }} 
          />
        </div>

        {/* Filters */}
        <select className="filter-select">
          <option>All Types</option>
          <option>Platform Scale</option>
          <option>Counter Scale</option>
          <option>Fuel Dispenser</option>
        </select>
        
        <select className="filter-select">
          <option>All Statuses</option>
          <option>Valid</option>
          <option>Due Soon</option>
          <option>Expired</option>
          <option>Pending</option>
        </select>

        <button className="btn" style={{ background: 'rgba(202, 134, 67, 0.1)', color: 'var(--text-secondary)' }}>
          <Filter size={16} /> More Filters
        </button>
      </div>
    </div>
  );
};

export default InstrumentFilters;
