// AI Service Provider Templates

export interface ProviderTemplate {
  id: string;
  name: string;
  icon: string;
  description: string;
  keyFormat: string;
  website: string;
  fields: ProviderField[];
  examples: string[];
}

export interface ProviderField {
  name: string;
  label: string;
  type: 'text' | 'url' | 'select';
  required?: boolean;
  options?: string[];
  placeholder?: string;
}

export const AI_PROVIDERS: ProviderTemplate[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    icon: '🤖',
    description: 'GPT models and API access',
    keyFormat: 'sk-proj-...',
    website: 'https://platform.openai.com',
    fields: [
      { name: 'organization', label: 'Organization ID', type: 'text', placeholder: 'org-...' },
      { name: 'project', label: 'Project ID', type: 'text', placeholder: 'proj_...' },
    ],
    examples: ['sk-proj-abcd1234...', 'sk-abcd1234...']
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    icon: '🧠',
    description: 'Claude AI models',
    keyFormat: 'sk-ant-...',
    website: 'https://console.anthropic.com',
    fields: [
      { name: 'version', label: 'API Version', type: 'select', options: ['2023-06-01', '2023-01-01'] },
    ],
    examples: ['sk-ant-api03-...']
  },
  {
    id: 'google',
    name: 'Google AI',
    icon: '🌟',
    description: 'Gemini and PaLM models',
    keyFormat: 'AIza...',
    website: 'https://console.cloud.google.com',
    fields: [
      { name: 'project', label: 'Project ID', type: 'text', placeholder: 'my-project-123' },
    ],
    examples: ['AIzaSyC1234567890abcdef...']
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    icon: '🌪️',
    description: 'Mistral large language models',
    keyFormat: 'Random string',
    website: 'https://console.mistral.ai',
    fields: [],
    examples: ['abcd1234efgh5678...']
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    icon: '🔍',
    description: 'DeepSeek AI models',
    keyFormat: 'sk-...',
    website: 'https://platform.deepseek.com',
    fields: [],
    examples: ['sk-1234567890abcdef...']
  },
  {
    id: 'groq',
    name: 'Groq',
    icon: '⚡',
    description: 'High-speed inference',
    keyFormat: 'gsk_...',
    website: 'https://console.groq.com',
    fields: [],
    examples: ['gsk_1234567890abcdef...']
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    icon: '🛤️',
    description: 'Multiple model access',
    keyFormat: 'sk-or-...',
    website: 'https://openrouter.ai',
    fields: [
      { name: 'app_name', label: 'App Name', type: 'text', placeholder: 'My App' },
      { name: 'app_url', label: 'App URL', type: 'url', placeholder: 'https://myapp.com' },
    ],
    examples: ['sk-or-v1-1234567890...']
  },
  {
    id: 'moonshot',
    name: 'Moonshot AI',
    icon: '🌙',
    description: 'Moonshot Kimi models',
    keyFormat: 'sk-...',
    website: 'https://platform.moonshot.cn',
    fields: [],
    examples: ['sk-1234567890abcdef...']
  },
  {
    id: 'cohere',
    name: 'Cohere',
    icon: '🧩',
    description: 'Cohere language models',
    keyFormat: 'Random string',
    website: 'https://dashboard.cohere.ai',
    fields: [],
    examples: ['abcd1234-efgh-5678-ijkl-...']
  },
  {
    id: 'huggingface',
    name: 'Hugging Face',
    icon: '🤗',
    description: 'Open source models hub',
    keyFormat: 'hf_...',
    website: 'https://huggingface.co',
    fields: [
      { name: 'username', label: 'Username', type: 'text', placeholder: 'your-username' },
    ],
    examples: ['hf_1234567890abcdef...']
  },
  {
    id: 'custom',
    name: 'Custom Provider',
    icon: '🔧',
    description: 'Custom API service',
    keyFormat: 'Various formats',
    website: '',
    fields: [
      { name: 'endpoint', label: 'API Endpoint', type: 'url', required: true, placeholder: 'https://api.example.com' },
      { name: 'auth_type', label: 'Auth Type', type: 'select', options: ['Bearer', 'API Key', 'Basic Auth'] },
    ],
    examples: ['Custom format depends on provider']
  }
];

export function getProviderById(id: string): ProviderTemplate | undefined {
  return AI_PROVIDERS.find(provider => provider.id === id);
}

export function getProviderIcon(providerId: string): string {
  const provider = getProviderById(providerId);
  return provider?.icon || '🔑';
}