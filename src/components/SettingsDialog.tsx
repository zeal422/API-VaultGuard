import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Save, 
  Settings, 
  Clock, 
  Clipboard, 
  Eye, 
  Moon,
  Shield,
  Info
} from 'lucide-react';
import { VaultSettings } from '@/lib/storage';

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
  settings: VaultSettings;
  onUpdateSettings: (settings: VaultSettings) => void;
}

export function SettingsDialog({ 
  open, 
  onClose, 
  settings, 
  onUpdateSettings 
}: SettingsDialogProps) {
  const [formData, setFormData] = useState<VaultSettings>(settings);

  const handleSave = () => {
    onUpdateSettings(formData);
    onClose();
  };

  const handleReset = () => {
    setFormData(settings);
  };

  const clipboardOptions = [
    { value: 5, label: '5 seconds' },
    { value: 10, label: '10 seconds' },
    { value: 30, label: '30 seconds' },
    { value: 60, label: '1 minute' },
    { value: 300, label: '5 minutes' },
  ];

  const autoLockOptions = [
    { value: 0, label: 'Never' },
    { value: 5, label: '5 minutes' },
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 60, label: '1 hour' },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Vault Settings</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Security Settings */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-secure-green" />
              <h3 className="font-medium">Security</h3>
            </div>

            {/* Auto-lock */}
            <div className="space-y-2">
              <Label className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Auto-lock Timeout</span>
              </Label>
              <Select
                value={formData.autoLockTime.toString()}
                onValueChange={(value) =>
                  setFormData(prev => ({ ...prev, autoLockTime: parseInt(value) }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {autoLockOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Automatically lock the vault after inactivity
              </p>
            </div>

            {/* Clipboard auto-clear */}
            <div className="space-y-2">
              <Label className="flex items-center space-x-2">
                <Clipboard className="w-4 h-4" />
                <span>Clipboard Auto-clear</span>
              </Label>
              <Select
                value={formData.clipboardClearTime.toString()}
                onValueChange={(value) =>
                  setFormData(prev => ({ ...prev, clipboardClearTime: parseInt(value) }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {clipboardOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Clear clipboard after copying API keys
              </p>
            </div>
          </div>

          <Separator />

          {/* Display Settings */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Eye className="w-4 h-4 text-vault-primary" />
              <h3 className="font-medium">Display</h3>
            </div>

            {/* Dark Mode */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center space-x-2">
                  <Moon className="w-4 h-4" />
                  <span>Dark Mode</span>
                </Label>
                <p className="text-xs text-muted-foreground">
                  Use dark theme for the interface
                </p>
              </div>
              <Switch
                checked={formData.darkMode}
                onCheckedChange={(checked) =>
                  setFormData(prev => ({ ...prev, darkMode: checked }))
                }
              />
            </div>

            {/* Show Key Preview */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center space-x-2">
                  <Eye className="w-4 h-4" />
                  <span>Show Key Preview</span>
                </Label>
                <p className="text-xs text-muted-foreground">
                  Display unmasked API keys by default
                </p>
              </div>
              <Switch
                checked={formData.showKeyPreview}
                onCheckedChange={(checked) =>
                  setFormData(prev => ({ ...prev, showKeyPreview: checked }))
                }
              />
            </div>
          </div>

          <Separator />

          {/* Security Notice */}
          <div className="p-3 rounded-lg bg-secure-green/10 border border-secure-green/20">
            <div className="flex items-start space-x-2">
              <Info className="w-4 h-4 text-secure-green mt-0.5 flex-shrink-0" />
              <div className="text-xs text-secure-green">
                <p className="font-medium">Privacy Notice</p>
                <p>All settings are stored locally and encrypted with your master password. No data is transmitted to external servers.</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
            <Button onClick={handleSave} className="bg-gradient-vault hover:opacity-90">
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}