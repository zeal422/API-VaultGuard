// Secure local storage for API key vault

import { encryptData, decryptData, type EncryptedData } from './crypto';

export interface ApiKey {
  id: string;
  name: string;
  provider: string;
  apiKey: string;
  description?: string;
  tags: string[];
  expirationDate?: string;
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, string>;
}

export interface VaultData {
  keys: ApiKey[];
  settings: VaultSettings;
  version: number;
}

export interface VaultSettings {
  clipboardClearTime: number; // seconds
  autoLockTime: number; // minutes
  darkMode: boolean;
  showKeyPreview: boolean;
}

const STORAGE_KEY = 'secure_vault_data';
const SETTINGS_KEY = 'vault_settings';

// Default settings
const DEFAULT_SETTINGS: VaultSettings = {
  clipboardClearTime: 30,
  autoLockTime: 15,
  darkMode: false,
  showKeyPreview: false,
};

// Encrypt and store vault data
export async function saveVaultData(data: VaultData, masterPassword: string): Promise<void> {
  try {
    const jsonData = JSON.stringify(data);
    const encryptedData = await encryptData(jsonData, masterPassword);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(encryptedData));
  } catch (error) {
    throw new Error('Failed to save vault data: ' + error);
  }
}

// Load and decrypt vault data
export async function loadVaultData(masterPassword: string): Promise<VaultData> {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (!storedData) {
      return {
        keys: [],
        settings: DEFAULT_SETTINGS,
        version: 1,
      };
    }

    const encryptedData: EncryptedData = JSON.parse(storedData);
    const decryptedJson = await decryptData(encryptedData, masterPassword);
    const data: VaultData = JSON.parse(decryptedJson);
    
    // Ensure settings exist and merge with defaults
    data.settings = { ...DEFAULT_SETTINGS, ...data.settings };
    
    return data;
  } catch (error) {
    throw new Error('Failed to decrypt vault data. Check your master password.');
  }
}

// Check if vault exists
export function vaultExists(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== null;
}

// Export vault data for backup
export async function exportVault(masterPassword: string): Promise<string> {
  const data = await loadVaultData(masterPassword);
  const exportData = {
    ...data,
    exportedAt: new Date().toISOString(),
    version: 1,
  };
  
  // Re-encrypt with master password for secure backup
  const encryptedExport = await encryptData(JSON.stringify(exportData), masterPassword);
  return JSON.stringify(encryptedExport);
}

// Import vault data from backup
export async function importVault(
  backupData: string,
  masterPassword: string
): Promise<VaultData> {
  try {
    const encryptedData: EncryptedData = JSON.parse(backupData);
    const decryptedJson = await decryptData(encryptedData, masterPassword);
    const importedData = JSON.parse(decryptedJson);
    
    // Validate imported data structure
    if (!importedData.keys || !Array.isArray(importedData.keys)) {
      throw new Error('Invalid backup file format');
    }
    
    return {
      keys: importedData.keys,
      settings: { ...DEFAULT_SETTINGS, ...importedData.settings },
      version: importedData.version || 1,
    };
  } catch (error) {
    throw new Error('Failed to import vault data: ' + error);
  }
}

// Clear all vault data
export function clearVault(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(SETTINGS_KEY);
}