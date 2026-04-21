import { HistoryItem, StorageDataV1 } from './types';

const STORAGE_KEY = 'gmaek_collection_v1';
const MAX_HISTORY = 10;

export const getCollection = (): StorageDataV1 => {
  if (typeof window === 'undefined') return { version: 'v1', history: [] };
  
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { version: 'v1', history: [] };
    
    const parsed = JSON.parse(raw);
    
    // 버전 검증 (2A)
    if (parsed.version !== 'v1' || !Array.isArray(parsed.history)) {
      console.warn('Invalid storage version. Resetting.');
      localStorage.removeItem(STORAGE_KEY);
      return { version: 'v1', history: [] };
    }
    
    return parsed as StorageDataV1;
  } catch (e) {
    console.error('Storage parsing error. Resetting.');
    localStorage.removeItem(STORAGE_KEY);
    return { version: 'v1', history: [] };
  }
};

export const addHistory = (item: HistoryItem) => {
  if (typeof window === 'undefined') return;
  
  const data = getCollection();
  
  // FIFO 방식: 10개 유지
  const updatedHistory = [item, ...data.history].slice(0, MAX_HISTORY);
  
  const newData: StorageDataV1 = {
    version: 'v1',
    history: updatedHistory,
  };
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
};
