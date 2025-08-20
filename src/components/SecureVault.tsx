import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { VaultHeader } from './VaultHeader';
import { KeyCard } from './KeyCard';
import { AddKeyDialog } from './AddKeyDialog';
import { SettingsDialog } from './SettingsDialog';
import { EmptyState } from './EmptyState';
import { ApiKey, VaultData, saveVaultData, loadVaultData, exportVault, importVault } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, Download, Upload, Plus, Shield, Zap, FileKey } from 'lucide-react';

interface SecureVaultProps {
  masterPassword: string;
  onLock: () => void;
}

export function SecureVault({ masterPassword, onLock }: SecureVaultProps) {
  const [vaultData, setVaultData] = useState<VaultData>({
    keys: [],
    settings: {
      clipboardClearTime: 30,
      autoLockTime: 15,
      darkMode: false,
      showKeyPreview: false,
    },
    version: 1,
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [editingKey, setEditingKey] = useState<ApiKey | undefined>();
  const [deletingKey, setDeletingKey] = useState<ApiKey | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showMainMenu, setShowMainMenu] = useState(true);
  const { toast } = useToast();

  // Load vault data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await loadVaultData(masterPassword);
        setVaultData(data);
        
        // Apply dark mode setting
        if (data.settings.darkMode) {
          document.documentElement.classList.add('dark');
        }
        
        setError('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load vault');
        console.error('Error loading vault:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [masterPassword]);

  // Auto-save vault data when it changes
  useEffect(() => {
    if (!loading && vaultData.keys.length >= 0) {
      const saveData = async () => {
        try {
          await saveVaultData(vaultData, masterPassword);
        } catch (err) {
          console.error('Error saving vault:', err);
          toast({
            title: "Save Error",
            description: "Failed to save vault data",
            variant: "destructive",
          });
        }
      };

      // Debounce saves
      const timeoutId = setTimeout(saveData, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [vaultData, masterPassword, loading, toast]);

  // Auto-lock timer
  useEffect(() => {
    if (vaultData.settings.autoLockTime > 0) {
      const timeoutId = setTimeout(() => {
        toast({
          title: "Auto-lock",
          description: "Vault locked due to inactivity",
        });
        onLock();
      }, vaultData.settings.autoLockTime * 60 * 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [vaultData.settings.autoLockTime, onLock, toast]);

  // Filter keys based on search query
  const filteredKeys = useMemo(() => {
    if (!searchQuery.trim()) return vaultData.keys;
    
    const query = searchQuery.toLowerCase();
    return vaultData.keys.filter(key => 
      key.name.toLowerCase().includes(query) ||
      key.provider.toLowerCase().includes(query) ||
      key.description?.toLowerCase().includes(query) ||
      key.tags.some(tag => tag.toLowerCase().includes(query)) ||
      Object.values(key.metadata).some(value => 
        value.toLowerCase().includes(query)
      )
    );
  }, [vaultData.keys, searchQuery]);

  const handleAddKey = (keyData: Omit<ApiKey, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newKey: ApiKey = {
      ...keyData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setVaultData(prev => ({
      ...prev,
      keys: [...prev.keys, newKey],
    }));

    toast({
      title: "API Key Added",
      description: `Successfully added ${keyData.name}`,
    });
  };

  const handleUpdateKey = (keyData: Omit<ApiKey, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingKey) return;

    const updatedKey: ApiKey = {
      ...keyData,
      id: editingKey.id,
      createdAt: editingKey.createdAt,
      updatedAt: new Date().toISOString(),
    };

    setVaultData(prev => ({
      ...prev,
      keys: prev.keys.map(key => key.id === editingKey.id ? updatedKey : key),
    }));

    setEditingKey(undefined);
    toast({
      title: "API Key Updated",
      description: `Successfully updated ${keyData.name}`,
    });
  };

  const handleDeleteKey = () => {
    if (!deletingKey) return;

    setVaultData(prev => ({
      ...prev,
      keys: prev.keys.filter(key => key.id !== deletingKey.id),
    }));

    toast({
      title: "API Key Deleted",
      description: `Successfully deleted ${deletingKey.name}`,
    });
    
    setDeletingKey(undefined);
  };

  const handleUpdateSettings = (newSettings: typeof vaultData.settings) => {
    setVaultData(prev => ({
      ...prev,
      settings: newSettings,
    }));

    // Apply dark mode immediately
    if (newSettings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    toast({
      title: "Settings Updated",
      description: "Your preferences have been saved",
    });
  };

  const handleExportVault = async () => {
    try {
      const exportData = await exportVault(masterPassword);
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vault-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Vault Exported",
        description: "Encrypted backup downloaded successfully",
      });
    } catch (err) {
      toast({
        title: "Export Failed",
        description: err instanceof Error ? err.message : "Failed to export vault",
        variant: "destructive",
      });
    }
  };

  const handleImportVault = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const importedData = await importVault(text, masterPassword);
        
        // Merge with existing data (avoiding duplicates by name)
        const existingNames = new Set(vaultData.keys.map(k => k.name));
        const newKeys = importedData.keys.filter(k => !existingNames.has(k.name));
        
        setVaultData(prev => ({
          ...prev,
          keys: [...prev.keys, ...newKeys],
          settings: { ...prev.settings, ...importedData.settings },
        }));

        toast({
          title: "Vault Imported",
          description: `Successfully imported ${newKeys.length} new API keys`,
        });
      } catch (err) {
        toast({
          title: "Import Failed",
          description: err instanceof Error ? err.message : "Failed to import vault",
          variant: "destructive",
        });
      }
    };

    input.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-vault-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Decrypting vault...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <VaultHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddKey={() => setShowAddDialog(true)}
        onExportVault={handleExportVault}
        onImportVault={handleImportVault}
        onSettings={() => setShowSettingsDialog(true)}
        onLock={onLock}
        onLogoClick={() => {
          setShowMainMenu(true);
          setShowAddDialog(false);
          setShowSettingsDialog(false);
          setDeletingKey(undefined);
          setSearchQuery('');
        }}
        keyCount={vaultData.keys.length}
        darkMode={vaultData.settings.darkMode}
        onToggleDarkMode={() => handleUpdateSettings({
          ...vaultData.settings,
          darkMode: !vaultData.settings.darkMode,
        })}
      />

      <div className="container mx-auto px-4 py-4 sm:py-6">
        {showMainMenu ? (
          <div className="py-8 sm:py-16">
            <div className="text-center mb-8 sm:mb-12">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-vault rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-vault">
                <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-vault-primary-foreground" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 px-4">Welcome to Your Secure Vault</h2>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
                Your personal encrypted storage for AI API keys. All data is secured with AES-256 encryption and stored locally on your device.
              </p>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
              <Card className="border-0 shadow-surface hover:shadow-vault transition-shadow">
                <CardHeader className="text-center pb-2 px-4 pt-4">
                  <div className="w-12 h-12 bg-secure-green/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Shield className="w-6 h-6 text-secure-green" />
                  </div>
                  <CardTitle className="text-base sm:text-lg">Bank-Grade Security</CardTitle>
                </CardHeader>
                <CardContent className="text-center px-4 pb-4">
                  <CardDescription className="text-sm">
                    AES-256 encryption with secure master password protection. Your keys never leave your device unencrypted.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-surface hover:shadow-vault transition-shadow">
                <CardHeader className="text-center pb-2 px-4 pt-4">
                  <div className="w-12 h-12 bg-vault-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Zap className="w-6 h-6 text-vault-primary" />
                  </div>
                  <CardTitle className="text-base sm:text-lg">Lightning Fast</CardTitle>
                </CardHeader>
                <CardContent className="text-center px-4 pb-4">
                  <CardDescription className="text-sm">
                    Instant search, quick-copy functionality, and blazing fast access to your API keys when you need them.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-surface hover:shadow-vault transition-shadow sm:col-span-2 lg:col-span-1">
                <CardHeader className="text-center pb-2 px-4 pt-4">
                  <div className="w-12 h-12 bg-vault-accent/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <FileKey className="w-6 h-6 text-vault-accent" />
                  </div>
                  <CardTitle className="text-base sm:text-lg">Smart Organization</CardTitle>
                </CardHeader>
                <CardContent className="text-center px-4 pb-4">
                  <CardDescription className="text-sm">
                    Pre-configured templates for major AI providers, custom tags, expiration tracking, and metadata support.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="text-center space-y-4 px-4">
              <h3 className="text-lg sm:text-xl font-semibold">Get Started</h3>
              <p className="text-muted-foreground mb-6 text-sm sm:text-base">
                Add your first API key to begin securing your AI service credentials
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                <Button 
                  onClick={() => setShowAddDialog(true)} 
                  size="lg" 
                  className="bg-gradient-vault hover:opacity-90 shadow-vault w-full sm:w-auto min-h-[44px]"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Your First API Key
                </Button>
                
                <div className="text-xs sm:text-sm text-muted-foreground">
                  or learn about our{' '}
                  <span className="font-medium text-foreground">supported providers</span>
                </div>
              </div>

              {vaultData.keys.length > 0 && (
                <div className="mt-6">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowMainMenu(false)} 
                    size="lg"
                    className="w-full sm:w-auto min-h-[44px]"
                  >
                    <FileKey className="w-5 h-5 mr-2" />
                    View All Keys ({vaultData.keys.length})
                  </Button>
                </div>
              )}

              {/* Supported Providers Preview */}
              <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-muted/30 rounded-lg max-w-3xl mx-auto">
                <p className="text-xs sm:text-sm font-medium mb-3">Pre-configured templates for:</p>
                <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
                  {[
                    { name: 'OpenAI', icon: '🤖' },
                    { name: 'Anthropic', icon: '🧠' },
                    { name: 'Google AI', icon: '🌟' },
                    { name: 'Mistral', icon: '🌪️' },
                    { name: 'Groq', icon: '⚡' },
                    { name: 'DeepSeek', icon: '🔍' },
                    { name: '+ More', icon: '🔧' },
                  ].map((provider) => (
                    <div
                      key={provider.name}
                      className="flex items-center space-x-1 px-2 py-1 bg-background rounded text-xs"
                    >
                      <span>{provider.icon}</span>
                      <span>{provider.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Back to Main Menu Button */}
            <div className="mb-4 sm:mb-6">
              <Button 
                onClick={() => setShowMainMenu(true)} 
                variant="outline" 
                size="sm"
                className="min-h-[44px] px-4"
              >
                ← Back to Main Menu
              </Button>
            </div>

            {/* Search Results Info */}
            {searchQuery && (
              <div className="mb-4 sm:mb-6">
                <Badge variant="outline" className="text-sm px-3 py-1">
                  {filteredKeys.length} of {vaultData.keys.length} keys match "{searchQuery}"
                </Badge>
              </div>
            )}

            {/* Keys Grid */}
            {filteredKeys.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {filteredKeys.map((apiKey) => (
                  <KeyCard
                    key={apiKey.id}
                    apiKey={apiKey}
                    onEdit={(key) => {
                      setEditingKey(key);
                      setShowAddDialog(true);
                    }}
                    onDelete={setDeletingKey}
                    clipboardClearTime={vaultData.settings.clipboardClearTime}
                    showKeyPreview={vaultData.settings.showKeyPreview}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                hasKeys={vaultData.keys.length > 0}
                searchQuery={searchQuery}
                onAddKey={() => setShowAddDialog(true)}
                onClearSearch={() => setSearchQuery('')}
              />
            )}
          </>
        )}
      </div>

      {/* Dialogs */}
      <AddKeyDialog
        open={showAddDialog}
        onClose={() => {
          setShowAddDialog(false);
          setEditingKey(undefined);
        }}
        onSave={editingKey ? handleUpdateKey : handleAddKey}
        editingKey={editingKey}
      />

      <SettingsDialog
        open={showSettingsDialog}
        onClose={() => setShowSettingsDialog(false)}
        settings={vaultData.settings}
        onUpdateSettings={handleUpdateSettings}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingKey} onOpenChange={() => setDeletingKey(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete API Key</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingKey?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteKey}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}