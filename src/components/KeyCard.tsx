import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Copy, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  ExternalLink,
  Calendar,
  Tag
} from 'lucide-react';
import { ApiKey } from '@/lib/storage';
import { getProviderIcon, getProviderById } from '@/lib/providers';
import { copyToClipboard } from '@/lib/crypto';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface KeyCardProps {
  apiKey: ApiKey;
  onEdit: (apiKey: ApiKey) => void;
  onDelete: (apiKey: ApiKey) => void;
  clipboardClearTime: number;
  showKeyPreview: boolean;
}

export function KeyCard({ 
  apiKey, 
  onEdit, 
  onDelete, 
  clipboardClearTime,
  showKeyPreview 
}: KeyCardProps) {
  const [showKey, setShowKey] = useState(false);
  const [copying, setCopying] = useState(false);
  const { toast } = useToast();

  const provider = getProviderById(apiKey.provider);
  const isExpired = apiKey.expirationDate && new Date(apiKey.expirationDate) < new Date();
  const isExpiringSoon = apiKey.expirationDate && 
    new Date(apiKey.expirationDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const handleCopyKey = async () => {
    try {
      setCopying(true);
      await copyToClipboard(apiKey.apiKey, clipboardClearTime * 1000);
      toast({
        title: "API Key Copied",
        description: `Copied to clipboard. Will auto-clear in ${clipboardClearTime}s`,
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy API key to clipboard",
        variant: "destructive",
      });
    } finally {
      setCopying(false);
    }
  };

  const handleCopyName = async () => {
    try {
      await copyToClipboard(apiKey.name, 10000);
      toast({
        title: "Name Copied",
        description: "API key name copied to clipboard",
        duration: 1500,
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy name to clipboard",
        variant: "destructive",
      });
    }
  };

  const maskKey = (key: string) => {
    if (key.length <= 8) return '*'.repeat(key.length);
    return key.slice(0, 4) + '*'.repeat(Math.max(key.length - 8, 4)) + key.slice(-4);
  };

  return (
    <Card className={`group hover:shadow-surface transition-all duration-200 ${
      isExpired ? 'border-destructive/30 bg-destructive/5' : 
      isExpiringSoon ? 'border-warning-amber/30 bg-warning-amber/5' : ''
    }`}>
      <CardHeader className="pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start space-x-2 sm:space-x-3 min-w-0 flex-1">
            <div className="text-xl sm:text-2xl flex-shrink-0">{getProviderIcon(apiKey.provider)}</div>
            <div className="min-w-0 flex-1">
              <CardTitle 
                className="text-sm sm:text-base cursor-pointer hover:text-vault-primary truncate"
                onClick={handleCopyName}
                title="Click to copy name"
              >
                {apiKey.name}
              </CardTitle>
              <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1">
                <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                  {provider?.name || apiKey.provider}
                </Badge>
                {isExpired && (
                  <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                    Expired
                  </Badge>
                )}
                {isExpiringSoon && !isExpired && (
                  <Badge variant="outline" className="text-xs border-warning-amber text-warning-amber px-1.5 py-0.5">
                    Expires Soon
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowKey(!showKey)}
              className="h-8 w-8 sm:h-8 sm:w-8 p-0 min-h-[44px] sm:min-h-[32px]"
            >
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(apiKey)}
              className="h-8 w-8 sm:h-8 sm:w-8 p-0 min-h-[44px] sm:min-h-[32px]"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(apiKey)}
              className="h-8 w-8 sm:h-8 sm:w-8 p-0 text-destructive hover:text-destructive min-h-[44px] sm:min-h-[32px]"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 px-3 sm:px-6 pb-3 sm:pb-6">
        {/* API Key Display */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium">API Key</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyKey}
              disabled={copying}
              className="h-8 px-3 text-xs min-h-[44px] sm:min-h-[32px] sm:h-7 sm:px-2"
            >
              <Copy className="h-3 w-3 mr-1" />
              {copying ? 'Copying...' : 'Copy'}
            </Button>
          </div>
          <div className="font-mono text-xs sm:text-sm bg-muted p-2 sm:p-3 rounded border break-all">
            {(showKey || showKeyPreview) ? apiKey.apiKey : maskKey(apiKey.apiKey)}
          </div>
        </div>

        {/* Description */}
        {apiKey.description && (
          <div className="space-y-1">
            <span className="text-sm font-medium">Description</span>
            <p className="text-sm text-muted-foreground break-words">{apiKey.description}</p>
          </div>
        )}

        {/* Tags */}
        {apiKey.tags.length > 0 && (
          <div className="space-y-2">
            <span className="text-sm font-medium flex items-center">
              <Tag className="h-3 w-3 mr-1" />
              Tags
            </span>
            <div className="flex flex-wrap gap-1">
              {apiKey.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs px-1.5 py-0.5">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Metadata */}
        {Object.keys(apiKey.metadata).length > 0 && (
          <div className="space-y-2">
            <span className="text-sm font-medium">Additional Info</span>
            <div className="space-y-1">
              {Object.entries(apiKey.metadata).map(([key, value]) => (
                <div key={key} className="flex flex-col sm:flex-row sm:justify-between text-sm gap-1">
                  <span className="text-muted-foreground capitalize font-medium">{key}:</span>
                  <span className="font-mono text-xs break-all">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Info */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2 border-t text-xs text-muted-foreground">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
            <span className="whitespace-nowrap">Created {format(new Date(apiKey.createdAt), 'MMM d, yyyy')}</span>
            {apiKey.expirationDate && (
              <span className="flex items-center whitespace-nowrap">
                <Calendar className="h-3 w-3 mr-1" />
                Expires {format(new Date(apiKey.expirationDate), 'MMM d, yyyy')}
              </span>
            )}
          </div>
          {provider?.website && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(provider.website, '_blank')}
              className="h-8 px-2 text-xs min-h-[44px] sm:min-h-[32px] sm:h-6 self-start sm:self-auto"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Docs
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}