import { db } from '../firebase';
import { ref, set, get, push } from 'firebase/database';

export const mockInstruments = [
  {
    serialNumber: 'SN-AX99231', type: 'Platform Scale', owner: 'Acme Traders Pvt Ltd',
    premises: 'Main Market Premises, Mysuru', status: 'VALID',
    lastVerified: '2025-11-19', validUntil: '2026-11-18', certificate: 'VM-2025-00451'
  },
  {
    serialNumber: 'SN-BB44512', type: 'Electronic Counter Scale', owner: 'Metro Supermart',
    premises: 'Downtown Mall', status: 'DUE_SOON',
    lastVerified: '2025-10-05', validUntil: '2026-10-04', certificate: 'VM-2025-00320'
  },
  {
    serialNumber: 'SN-CC77890', type: 'Fuel Dispensing Measure', owner: 'City Fuel Station',
    premises: 'Highway Road 1', status: 'EXPIRED',
    lastVerified: '2024-08-12', validUntil: '2025-08-11', certificate: 'VM-2024-00101'
  },
  {
    serialNumber: 'SN-DD11223', type: 'Analytical Balance', owner: 'Global Labs',
    premises: 'Tech Park', status: 'PENDING_VERIFICATION',
    lastVerified: null, validUntil: null, certificate: null
  },
  {
    serialNumber: 'SN-EE99887', type: 'Weighbridge', owner: 'Heavy Logistics',
    premises: 'Industrial Area', status: 'VALID',
    lastVerified: '2026-01-10', validUntil: '2027-01-09', certificate: 'VM-2026-00050'
  }
];

export const seedDatabase = async () => {
  try {
    for (const inst of mockInstruments) {
      const year = new Date().getFullYear();
      const randomNum = Math.floor(100000 + Math.random() * 900000);
      const id = `LM-${year}-${randomNum}`;
      await set(ref(db, `instruments/${id}`), { id, ...inst, createdAt: new Date().toISOString() });
    }
    console.log('Database seeded!');
  } catch (e) {
    console.error('Seed error:', e);
    throw e;
  }
};

export const getInstruments = async () => {
  try {
    const snapshot = await get(ref(db, 'instruments'));
    if (!snapshot.exists()) {
      console.warn("No instruments in DB, returning mock data.");
      return mockInstruments.map((inst, i) => ({ id: `LM-MOCK-${i}`, ...inst }));
    }
    const data = snapshot.val();
    return Object.values(data);
  } catch (error) {
    console.error("Error fetching instruments:", error);
    return mockInstruments.map((inst, i) => ({ id: `LM-MOCK-${i}`, ...inst }));
  }
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
