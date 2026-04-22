// 存储管理工具
const STORAGE_KEY = 'dota2_auction_state';

export const saveState = (state) => {
  try {
    const stateToSave = {
      ...state,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    return true;
  } catch (error) {
    console.error('Failed to save state:', error);
    return false;
  }
};

export const loadState = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    return JSON.parse(saved);
  } catch (error) {
    console.error('Failed to load state:', error);
    return null;
  }
};

export const clearState = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear state:', error);
    return false;
  }
};

export const exportState = (state) => {
  const stateToExport = {
    ...state,
    timestamp: new Date().toISOString(),
    version: '1.0'
  };
  const dataStr = JSON.stringify(stateToExport, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `dota2_auction_${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
};

export const importState = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const state = JSON.parse(e.target.result);
        resolve(state);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
};
