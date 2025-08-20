import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Search, 
  Plus, 
  Settings, 
  Lock, 
  Download, 
  Upload,
  Moon,
  Sun 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface VaultHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddKey: () => void;
  onExportVault: () => void;
  onImportVault: () => void;
  onSettings: () => void;
  onLock: () => void;
  onLogoClick: () => void;
  keyCount: number;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export function VaultHeader({
  searchQuery,
  onSearchChange,
  onAddKey,
  onExportVault,
  onImportVault,
  onSettings,
  onLock,
  onLogoClick,
  keyCount,
  darkMode,
  onToggleDarkMode,
}: VaultHeaderProps) {
  const [isLocking, setIsLocking] = useState(false);

  const handleLock = async () => {
    setIsLocking(true);
    // Small delay for visual feedback
    await new Promise(resolve => setTimeout(resolve, 300));
    onLock();
  };

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-2 sm:px-4 py-3">
        {/* Mobile Layout */}
        <div className="flex md:hidden items-center justify-between gap-2">
          {/* Logo and Title */}
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <div 
              className="w-8 h-8 bg-gradient-vault rounded-lg flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0" 
              onClick={onLogoClick}
              title="Return to main menu"
            >
              <Shield className="w-4 h-4 text-vault-primary-foreground" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-bold truncate">Secure Vault</h1>
              <div className="flex items-center space-x-1">
                <Badge variant="secondary" className="text-xs px-1 py-0.5">
                  {keyCount} {keyCount === 1 ? 'key' : 'keys'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Mobile Action Buttons */}
          <div className="flex items-center space-x-1 flex-shrink-0">
            {/* Add Key Button */}
            <Button onClick={onAddKey} size="sm" className="bg-gradient-vault hover:opacity-90 px-2">
              <Plus className="w-4 h-4" />
            </Button>

            {/* Menu Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="px-2">
                  <Settings className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 z-50">
                <DropdownMenuItem onClick={onToggleDarkMode}>
                  {darkMode ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
                  {darkMode ? 'Light Mode' : 'Dark Mode'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onSettings}>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onExportVault}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Vault
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onImportVault}>
                  <Upload className="w-4 h-4 mr-2" />
                  Import Vault
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLock} 
                  disabled={isLocking}
                  className="text-destructive focus:text-destructive"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  {isLocking ? 'Locking...' : 'Lock Vault'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden mt-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search API keys..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 bg-background h-10"
            />
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex items-center justify-between gap-4">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div 
              className="w-8 h-8 bg-gradient-vault rounded-lg flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity" 
              onClick={onLogoClick}
              title="Return to main menu"
            >
              <Shield className="w-5 h-5 text-vault-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Secure Vault</h1>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="text-xs">
                  {keyCount} {keyCount === 1 ? 'key' : 'keys'}
                </Badge>
                <Badge 
                  variant="outline" 
                  className="text-xs border-secure-green text-secure-green"
                >
                  🔒 Encrypted
                </Badge>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search API keys..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 bg-background"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {/* Add Key Button */}
            <Button onClick={onAddKey} size="sm" className="bg-gradient-vault hover:opacity-90">
              <Plus className="w-4 h-4 mr-2" />
              Add Key
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleDarkMode}
              className="px-3"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>

            {/* Menu Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={onSettings}>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onExportVault}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Vault
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onImportVault}>
                  <Upload className="w-4 h-4 mr-2" />
                  Import Vault
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLock} 
                  disabled={isLocking}
                  className="text-destructive focus:text-destructive"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  {isLocking ? 'Locking...' : 'Lock Vault'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}