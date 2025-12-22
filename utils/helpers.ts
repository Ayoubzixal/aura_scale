
export const generateHash = async (text: string): Promise<string> => {
  const msgUint8 = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export const getHistory = (): any[] => {
  const data = localStorage.getItem('aurascale_history');
  return data ? JSON.parse(data) : [];
};

export const saveToHistory = (item: any) => {
  const history = getHistory();
  const updated = [item, ...history].slice(0, 50); // Keep last 50
  localStorage.setItem('aurascale_history', JSON.stringify(updated));
};

export const getCachedResult = (hash: string): any | null => {
  const history = getHistory();
  return history.find(item => item.id === hash) || null;
};

export const deleteFromHistory = (id: string): void => {
  const history = getHistory();
  const updated = history.filter(item => item.id !== id);
  localStorage.setItem('aurascale_history', JSON.stringify(updated));
};

export const clearAllHistory = (): void => {
  localStorage.removeItem('aurascale_history');
};
