import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Save, 
  X, 
  Plus, 
  CalendarIcon, 
  Info, 
  ExternalLink,
  Eye,
  EyeOff 
} from 'lucide-react';
import { format } from 'date-fns';
import { ApiKey } from '@/lib/storage';
import { AI_PROVIDERS, getProviderById } from '@/lib/providers';
import { generateSecureString } from '@/lib/crypto';
import { cn } from '@/lib/utils';

interface AddKeyDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (apiKey: Omit<ApiKey, 'id' | 'createdAt' | 'updatedAt'>) => void;
  editingKey?: ApiKey;
}

export function AddKeyDialog({ open, onClose, onSave, editingKey }: AddKeyDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    provider: '',
    apiKey: '',
    description: '',
    tags: [] as string[],
    expirationDate: undefined as Date | undefined,
    metadata: {} as Record<string, string>,
  });
  const [newTag, setNewTag] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Initialize form with editing data
  useEffect(() => {
    if (editingKey) {
      setFormData({
        name: editingKey.name,
        provider: editingKey.provider,
        apiKey: editingKey.apiKey,
        description: editingKey.description || '',
        tags: editingKey.tags,
        expirationDate: editingKey.expirationDate ? new Date(editingKey.expirationDate) : undefined,
        metadata: editingKey.metadata,
      });
    } else {
      setFormData({
        name: '',
        provider: '',
        apiKey: '',
        description: '',
        tags: [],
        expirationDate: undefined,
        metadata: {},
      });
    }
  }, [editingKey, open]);

  const selectedProvider = getProviderById(formData.provider);

  const handleSave = () => {
    if (!formData.name || !formData.provider || !formData.apiKey) return;

    onSave({
      name: formData.name,
      provider: formData.provider,
      apiKey: formData.apiKey,
      description: formData.description,
      tags: formData.tags,
      expirationDate: formData.expirationDate?.toISOString(),
      metadata: formData.metadata,
    });

    onClose();
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const generateTestKey = () => {
    const testKey = selectedProvider?.keyFormat.includes('sk-') 
      ? `sk-test-${generateSecureString(32)}`
      : generateSecureString(32);
    setFormData(prev => ({ ...prev, apiKey: testKey }));
  };

  const updateMetadata = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [key]: value,
      }
    }));
  };

  const isValid = formData.name && formData.provider && formData.apiKey;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-2 sm:mx-auto">
        <DialogHeader className="px-1 sm:px-0">
          <DialogTitle className="flex items-center space-x-2 text-lg sm:text-xl">
            <div className="text-xl sm:text-2xl">{selectedProvider?.icon || '🔑'}</div>
            <span>{editingKey ? 'Edit API Key' : 'Add New API Key'}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6 px-1 sm:px-0">
          {/* Provider Selection */}
          <div className="space-y-2">
            <Label htmlFor="provider" className="text-sm font-medium">Provider *</Label>
            <Select value={formData.provider} onValueChange={(value) => 
              setFormData(prev => ({ ...prev, provider: value, metadata: {} }))
            }>
              <SelectTrigger className="min-h-[44px]">
                <SelectValue placeholder="Select an AI provider" />
              </SelectTrigger>
              <SelectContent className="z-50">
                {AI_PROVIDERS.map((provider) => (
                  <SelectItem key={provider.id} value={provider.id} className="py-3">
                    <div className="flex items-center space-x-2">
                      <span>{provider.icon}</span>
                      <span>{provider.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedProvider && (
              <Card className="mt-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center justify-between">
                    {selectedProvider.name}
                    {selectedProvider.website && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(selectedProvider.website, '_blank')}
                        className="h-6 px-2"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Docs
                      </Button>
                    )}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {selectedProvider.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xs text-muted-foreground">
                    <strong>Key Format:</strong> {selectedProvider.keyFormat}
                  </div>
                  {selectedProvider.examples.length > 0 && (
                    <div className="text-xs text-muted-foreground mt-1">
                      <strong>Example:</strong> {selectedProvider.examples[0]}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Production OpenAI Key"
                className="min-h-[44px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expirationDate" className="text-sm font-medium">Expiration Date</Label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal min-h-[44px]",
                      !formData.expirationDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.expirationDate ? (
                      format(formData.expirationDate, "PPP")
                    ) : (
                      <span>No expiration</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-50" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.expirationDate}
                    onSelect={(date) => {
                      setFormData(prev => ({ ...prev, expirationDate: date }));
                      setCalendarOpen(false);
                    }}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                  {formData.expirationDate && (
                    <div className="p-3 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, expirationDate: undefined }));
                          setCalendarOpen(false);
                        }}
                        className="w-full min-h-[44px]"
                      >
                        Clear Date
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* API Key */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="apiKey">API Key *</Label>
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generateTestKey}
                  className="h-7 px-2 text-xs"
                >
                  Generate Test
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="h-7 px-2"
                >
                  {showApiKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                </Button>
              </div>
            </div>
            <Input
              id="apiKey"
              type={showApiKey ? 'text' : 'password'}
              value={formData.apiKey}
              onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
              placeholder="Enter your API key"
              className="font-mono"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Optional description for this API key"
              rows={2}
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex items-center space-x-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag"
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
                className="flex-1"
              />
              <Button type="button" variant="outline" size="sm" onClick={addTag}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                    <span>{tag}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTag(tag)}
                      className="h-3 w-3 p-0 hover:bg-transparent"
                    >
                      <X className="h-2 w-2" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Provider-specific fields */}
          {selectedProvider?.fields && selectedProvider.fields.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Info className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm font-medium">Provider-specific Information</Label>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {selectedProvider.fields.map((field) => (
                  <div key={field.name} className="space-y-2">
                    <Label htmlFor={field.name}>
                      {field.label} {field.required && '*'}
                    </Label>
                    {field.type === 'select' ? (
                      <Select
                        value={formData.metadata[field.name] || ''}
                        onValueChange={(value) => updateMetadata(field.name, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options?.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        id={field.name}
                        type={field.type}
                        value={formData.metadata[field.name] || ''}
                        onChange={(e) => updateMetadata(field.name, e.target.value)}
                        placeholder={field.placeholder}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row sm:justify-between items-stretch sm:items-center gap-3 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="order-2 sm:order-1 min-h-[44px]"
            >
              ← Back to Vault
            </Button>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 order-1 sm:order-2">
              <Button 
                variant="outline" 
                onClick={onClose}
                className="min-h-[44px]"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={!isValid}
                className="bg-gradient-vault hover:opacity-90 min-h-[44px]"
              >
                <Save className="h-4 w-4 mr-2" />
                {editingKey ? 'Update Key' : 'Save Key'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}