const storageKey = 'edutrack-preferences';

export const defaultPreferences = {
  studentPageSize: 8,
  compactTables: false,
  confirmDeletes: true
};

export function readPreferences() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
    return {
      studentPageSize: [8, 12, 20].includes(Number(saved.studentPageSize)) ? Number(saved.studentPageSize) : defaultPreferences.studentPageSize,
      compactTables: Boolean(saved.compactTables),
      confirmDeletes: saved.confirmDeletes !== false
    };
  } catch {
    return defaultPreferences;
  }
}

export function savePreferences(patch) {
  const updated = { ...readPreferences(), ...patch };
  localStorage.setItem(storageKey, JSON.stringify(updated));
  return updated;
}
