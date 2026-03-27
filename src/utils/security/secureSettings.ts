/**
 * Secure settings utilities - stubbed since app_settings table doesn't exist
 */

export const getSecureSetting = async (_key: string): Promise<string | null> => {
  console.warn('getSecureSetting: app_settings table not available');
  return null;
};

export const setSecureSetting = async (
  _key: string,
  _value: string,
  _encrypted: boolean = false
): Promise<boolean> => {
  console.warn('setSecureSetting: app_settings table not available');
  return false;
};

export const logSecurityEvent = async (
  _eventType: string,
  _details: Record<string, unknown> = {}
): Promise<void> => {
  // Security audit log table not available - log to console only
  console.log('Security event:', _eventType, _details);
};

export const secureStorage = {
  setItem: (key: string, value: string) => {
    try {
      localStorage.setItem(key, btoa(value));
    } catch { /* ignore */ }
  },
  getItem: (key: string): string | null => {
    try {
      const val = localStorage.getItem(key);
      return val ? atob(val) : null;
    } catch { return null; }
  },
  removeItem: (key: string) => {
    localStorage.removeItem(key);
  }
};
