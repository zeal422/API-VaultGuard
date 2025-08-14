import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Plus, 
  Search, 
  Key, 
  Shield, 
  Zap,
  FileKey,
  Import
} from 'lucide-react';

interface EmptyStateProps {
  hasKeys: boolean;
  searchQuery: string;
  onAddKey: () => void;
  onClearSearch: () => void;
}

export function EmptyState({ hasKeys, searchQuery, onAddKey, onClearSearch }: EmptyStateProps) {
  if (searchQuery && hasKeys) {
    // No search results
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <Search className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No keys found</h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          No API keys match your search for "{searchQuery}". Try adjusting your search terms or clear the search to see all keys.
        </p>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={onClearSearch}>
            Clear Search
          </Button>
          <Button onClick={onAddKey} className="bg-gradient-vault hover:opacity-90">
            <Plus className="w-4 h-4 mr-2" />
            Add New Key
          </Button>
        </div>
      </div>
    );
  }

  // First time setup - no keys at all
  return (
    <div className="py-16">
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-gradient-vault rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-vault">
          <Shield className="w-10 h-10 text-vault-primary-foreground" />
        </div>
        <h2 className="text-3xl font-bold mb-4">Welcome to Your Secure Vault</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Your personal encrypted storage for AI API keys. All data is secured with AES-256 encryption and stored locally on your device.
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card className="border-0 shadow-surface hover:shadow-vault transition-shadow">
          <CardHeader className="text-center pb-2">
            <div className="w-12 h-12 bg-secure-green/10 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Shield className="w-6 h-6 text-secure-green" />
            </div>
            <CardTitle className="text-lg">Bank-Grade Security</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <CardDescription>
              AES-256 encryption with secure master password protection. Your keys never leave your device unencrypted.
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-surface hover:shadow-vault transition-shadow">
          <CardHeader className="text-center pb-2">
            <div className="w-12 h-12 bg-vault-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Zap className="w-6 h-6 text-vault-primary" />
            </div>
            <CardTitle className="text-lg">Lightning Fast</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <CardDescription>
              Instant search, quick-copy functionality, and blazing fast access to your API keys when you need them.
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-surface hover:shadow-vault transition-shadow">
          <CardHeader className="text-center pb-2">
            <div className="w-12 h-12 bg-vault-accent/10 rounded-lg flex items-center justify-center mx-auto mb-3">
              <FileKey className="w-6 h-6 text-vault-accent" />
            </div>
            <CardTitle className="text-lg">Smart Organization</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <CardDescription>
              Pre-configured templates for major AI providers, custom tags, expiration tracking, and metadata support.
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="text-center space-y-4">
        <h3 className="text-xl font-semibold">Get Started</h3>
        <p className="text-muted-foreground mb-6">
          Add your first API key to begin securing your AI service credentials
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
          <Button onClick={onAddKey} size="lg" className="bg-gradient-vault hover:opacity-90 shadow-vault">
            <Plus className="w-5 h-5 mr-2" />
            Add Your First API Key
          </Button>
          
          <div className="text-sm text-muted-foreground">
            or learn about our{' '}
            <span className="font-medium text-foreground">supported providers</span>
          </div>
        </div>

        {/* Supported Providers Preview */}
        <div className="mt-8 p-4 bg-muted/30 rounded-lg max-w-3xl mx-auto">
          <p className="text-sm font-medium mb-3">Pre-configured templates for:</p>
          <div className="flex flex-wrap justify-center gap-2">
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
  );
}