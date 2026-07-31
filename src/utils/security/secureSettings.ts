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
  // Security audit log table not available - log event type only.
  // Details are intentionally NOT printed (they may contain user PII).
  console.log('Security event:', _eventType);
};

// NOTE: the base64 `secureStorage` that used to live here was unused,
// duplicated dataEncryption.ts, and implied encryption it did not provide.
// Use `appStorage` from '@/utils/security/storage' for client prefs.
