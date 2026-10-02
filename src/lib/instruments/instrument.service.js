import { db } from '../firebase';
import { ref, set, get, push } from 'firebase/database';

export const mockInstruments = [
  // Mysuru District
  {
    serialNumber: 'SN-AX99231', type: 'Platform Scale', owner: 'Acme Traders Pvt Ltd',
    premises: 'Main Market Premises, Mysuru', district: 'Mysuru', status: 'PENDING_VERIFICATION',
    lastVerified: null, validUntil: null, certificate: null,
    gpsLocation: { lat: 12.3051, lng: 76.6551 }
  },
  {
    serialNumber: 'SN-BB44512', type: 'Electronic Counter Scale', owner: 'Metro Supermart',
    premises: 'Downtown Mall, Mysuru', district: 'Mysuru', status: 'DUE_SOON',
    lastVerified: '2025-10-05', validUntil: '2026-10-04', certificate: 'VM-2025-00320',
    gpsLocation: { lat: 12.2958, lng: 76.6394 }
  },
  {
    serialNumber: 'SN-CC77890', type: 'Fuel Dispensing Measure', owner: 'City Fuel Station',
    premises: 'Highway Road 1, Mysuru', district: 'Mysuru', status: 'EXPIRED',
    lastVerified: '2024-08-12', validUntil: '2025-08-11', certificate: 'VM-2024-00101',
    gpsLocation: { lat: 12.3150, lng: 76.6700 }
  },
  {
    serialNumber: 'SN-DD11223', type: 'Analytical Balance', owner: 'Global Labs',
    premises: 'Tech Park, Mysuru', district: 'Mysuru', status: 'PENDING_VERIFICATION',
    lastVerified: null, validUntil: null, certificate: null,
    gpsLocation: { lat: 12.3300, lng: 76.6100 }
  },
  {
    serialNumber: 'SN-EE99887', type: 'Weighbridge', owner: 'Heavy Logistics',
    premises: 'Industrial Area, Mysuru', district: 'Mysuru', status: 'VALID',
    lastVerified: '2026-01-10', validUntil: '2027-01-09', certificate: 'VM-2026-00050',
    gpsLocation: { lat: 12.2800, lng: 76.6200 }
  },
  // Bengaluru District
  {
    serialNumber: 'SN-BG10022', type: 'Heavy Duty Weighbridge', owner: 'BLR Logistics Hub',
    premises: 'Peenya Industrial Estate, Bengaluru', district: 'Bengaluru', status: 'PENDING_VERIFICATION',
    lastVerified: null, validUntil: null, certificate: null,
    gpsLocation: { lat: 13.0285, lng: 77.5197 }
  },
  {
    serialNumber: 'SN-BG40988', type: 'Jewelry Micro-Balance', owner: 'Karnataka Gold & Diamonds',
    premises: 'MG Road, Bengaluru', district: 'Bengaluru', status: 'DUE_SOON',
    lastVerified: '2025-10-20', validUntil: '2026-10-19', certificate: 'VM-2025-00998',
    gpsLocation: { lat: 12.9756, lng: 77.6066 }
  },
  {
    serialNumber: 'SN-BG77112', type: 'Digital Counter Scale', owner: 'Fresh Mart Supermarket',
    premises: 'Indiranagar 100ft Road, Bengaluru', district: 'Bengaluru', status: 'VALID',
    lastVerified: '2025-12-01', validUntil: '2026-11-30', certificate: 'VM-2025-01004',
    gpsLocation: { lat: 12.9784, lng: 77.6408 }
  },
  // Hubballi District
  {
    serialNumber: 'SN-HB33211', type: 'Cotton Weighing Machine', owner: 'Deccan Cotton Ginning',
    premises: 'APMC Market Yard, Hubballi', district: 'Hubballi', status: 'PENDING_VERIFICATION',
    lastVerified: null, validUntil: null, certificate: null,
    gpsLocation: { lat: 15.3647, lng: 75.1240 }
  },
  {
    serialNumber: 'SN-HB99441', type: 'Platform Scale', owner: 'Hubli Grain Traders',
    premises: 'Station Road, Hubballi', district: 'Hubballi', status: 'DUE_SOON',
    lastVerified: '2025-11-01', validUntil: '2026-10-31', certificate: 'VM-2025-00672',
    gpsLocation: { lat: 15.3500, lng: 75.1400 }
  },
  // Mangaluru District
  {
    serialNumber: 'SN-MN55890', type: 'Fisheries Bulk Scale', owner: 'Coastal Marine Exporters',
    premises: 'Old Port Jetty, Mangaluru', district: 'Mangaluru', status: 'PENDING_VERIFICATION',
    lastVerified: null, validUntil: null, certificate: null,
    gpsLocation: { lat: 12.8590, lng: 74.8340 }
  },
  {
    serialNumber: 'SN-MN11244', type: 'Fuel Dispenser Meter', owner: 'Marine Fuels Ltd',
    premises: 'Panambur Beach Road, Mangaluru', district: 'Mangaluru', status: 'EXPIRED',
    lastVerified: '2024-09-15', validUntil: '2025-09-14', certificate: 'VM-2024-00812',
    gpsLocation: { lat: 12.9500, lng: 74.8000 }
  }
];

export const seedDatabase = async () => {
  try {
    if (!db) return;
    for (const inst of mockInstruments) {
      const year = new Date().getFullYear();
      const randomNum = Math.floor(100000 + Math.random() * 900000);
      const id = `LM-${year}-${randomNum}`;
      await set(ref(db, `instruments/${id}`), { id, ...inst, createdAt: new Date().toISOString() });
    }
    console.log('Database seeded!');
  } catch (e) {
    console.error('Seed error:', e);
  }
};

export const getInstruments = async () => {
  try {
    if (db) {
      const snapshot = await Promise.race([
        get(ref(db, 'instruments')).catch(() => null),
        new Promise(resolve => setTimeout(() => resolve(null), 800))
      ]);
      if (snapshot && snapshot.exists()) {
        const data = Object.values(snapshot.val());
        if (data && data.length > 0) return data;
      }
    }
  } catch (error) {
    console.warn("DB fetch fallback to mock instruments dataset:", error.message);
  }
  return mockInstruments.map((inst, i) => ({ id: `LM-MOCK-${i + 101}`, ...inst }));
};

export const addInstrument = async (instrumentData) => {
  try {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const generatedId = `LM-${year}-${randomNum}`;
    
    const newInstrument = {
      id: generatedId,
      ...instrumentData,
      status: 'PENDING_VERIFICATION',
      lastVerified: null,
      validUntil: null,
      certificate: null,
      createdAt: new Date().toISOString()
    };

    await set(ref(db, `instruments/${generatedId}`), newInstrument);
    return { success: true, id: generatedId };
  } catch (error) {
    console.error("Error creating instrument:", error);
    return { success: false, error: error.message };
  }
};

export const getInstrumentStats = (instruments) => {
  return {
    total: instruments.length,
    valid: instruments.filter(i => i.status === 'VALID').length,
    dueSoon: instruments.filter(i => i.status === 'DUE_SOON').length,
    expired: instruments.filter(i => i.status === 'EXPIRED').length,
    pending: instruments.filter(i => i.status === 'PENDING_VERIFICATION').length,
  };
};
