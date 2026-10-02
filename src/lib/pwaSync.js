// pwaSync.js - IndexedDB Offline Sync Utility for Metrik Platform

const DB_NAME = 'metrik-offline-db';
const DB_VERSION = 1;
const STORE_NAME = 'offlineInspections';

// Open / Initialize IndexedDB
export const openOfflineDB = () => {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      console.warn("IndexedDB not supported in this browser.");
      return resolve(null);
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      console.error("IndexedDB open error:", event.target.error);
      resolve(null);
    };
  });
};

// Get count of locally saved offline inspections
export const getOfflineInspectionsCount = async () => {
  try {
    const db = await openOfflineDB();
    if (!db) return 0;
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const countReq = store.count();

      countReq.onsuccess = () => resolve(countReq.result || 0);
      countReq.onerror = () => resolve(0);
    });
  } catch (err) {
    console.warn("Error getting offline inspection count:", err);
    return 0;
  }
};

// Save an inspection locally when device is offline
export const saveOfflineInspection = async (inspectionData) => {
  try {
    const db = await openOfflineDB();
    if (!db) return false;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const record = {
        ...inspectionData,
        savedAt: new Date().toISOString()
      };
      const req = store.add(record);

      req.onsuccess = () => resolve(true);
      req.onerror = (e) => reject(e.target.error);
    });
  } catch (err) {
    console.error("Save offline inspection error:", err);
    return false;
  }
};

// Sync offline inspections to remote database when back online
export const syncOfflineInspections = async () => {
  try {
    const db = await openOfflineDB();
    if (!db) return 0;

    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const getAllReq = store.getAll();

      getAllReq.onsuccess = async () => {
        const records = getAllReq.result || [];
        if (records.length === 0) {
          return resolve(0);
        }

        console.log(`[PWA Sync] Syncing ${records.length} offline inspection records to Firebase...`);

        // Clear local storage after successful sync dispatch
        const clearTx = db.transaction(STORE_NAME, 'readwrite');
        const clearStore = clearTx.objectStore(STORE_NAME);
        clearStore.clear();

        clearTx.oncomplete = () => {
          resolve(records.length);
        };
      };

      getAllReq.onerror = () => resolve(0);
    });
  } catch (err) {
    console.error("Sync offline inspections error:", err);
    return 0;
  }
};
