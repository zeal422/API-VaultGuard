// Secure encryption utilities for API key vault

export interface EncryptedData {
  data: string;
  salt: string;
  iv: string;
}

// Generate a cryptographic key from password and salt
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// Encrypt data using AES-256-GCM
export async function encryptData(data: string, password: string): Promise<EncryptedData> {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  const key = await deriveKey(password, salt);
  const encryptedData = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(data)
  );

  return {
    data: btoa(String.fromCharCode(...new Uint8Array(encryptedData))),
    salt: btoa(String.fromCharCode(...salt)),
    iv: btoa(String.fromCharCode(...iv)),
  };
}

// Decrypt data using AES-256-GCM
export async function decryptData(
  encryptedData: EncryptedData,
  password: string
): Promise<string> {
  const decoder = new TextDecoder();
  const salt = new Uint8Array(
    atob(encryptedData.salt)
      .split('')
      .map(char => char.charCodeAt(0))
  );
  const iv = new Uint8Array(
    atob(encryptedData.iv)
      .split('')
      .map(char => char.charCodeAt(0))
  );
  const data = new Uint8Array(
    atob(encryptedData.data)
      .split('')
      .map(char => char.charCodeAt(0))
  );

  const key = await deriveKey(password, salt);
  const decryptedData = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );

  return decoder.decode(decryptedData);
}

// Secure clipboard operations with auto-clear
export async function copyToClipboard(text: string, clearAfterMs: number = 30000): Promise<void> {
  await navigator.clipboard.writeText(text);
  
  // Auto-clear clipboard after specified time
  setTimeout(async () => {
    try {
      const currentClipboard = await navigator.clipboard.readText();
      if (currentClipboard === text) {
        await navigator.clipboard.writeText('');
      }
    } catch (error) {
      // Ignore clipboard access errors
      console.warn('Could not auto-clear clipboard:', error);
    }
  }, clearAfterMs);
}

// Generate secure random strings for testing
export function generateSecureString(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => chars[byte % chars.length]).join('');
}