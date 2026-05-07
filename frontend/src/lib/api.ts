interface ApiMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatRequest {
  message: string;
  history: ApiMessage[];
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isTyping?: boolean;
  sources?: Array<{
    ref: string;
    heading: string;
    source: string;
    content?: string;
  }>;
}

interface ChatResponse {
  answer: string;
  sources: Array<{
    ref: string;
    heading: string;
    source: string;
    content?: string;
  }>;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

// API Key management - Auto-configured
const API_KEY_STORAGE_KEY = 'legal_ai_api_key';
const DEFAULT_API_KEY = 'MeXfB6dlZEqytJFDeNg3TlYuqzU9ybV3ys1KjEe5B8A'; // Default API key for deployment

export function getApiKey(): string | null {
  // First check localStorage
  const storedKey = localStorage.getItem(API_KEY_STORAGE_KEY);
  if (storedKey) {
    return storedKey;
  }
  
  // If no stored key, automatically set and return the default key
  localStorage.setItem(API_KEY_STORAGE_KEY, DEFAULT_API_KEY);
  return DEFAULT_API_KEY;
}

export function setApiKey(key: string): void {
  localStorage.setItem(API_KEY_STORAGE_KEY, key);
}

export function clearApiKey(): void {
  localStorage.removeItem(API_KEY_STORAGE_KEY);
}

// Headers with API key
function getAuthHeaders() {
  const apiKey = getApiKey();
  return {
    'Content-Type': 'application/json',
    'Authorization': apiKey ? `Bearer ${apiKey}` : ''
  };
}

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const url = `${this.baseUrl}/chat`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          message: request.message,
          history: request.history
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Return response directly from enhanced service
      return {
        answer: data.answer,
        sources: data.sources.map((source: any) => ({
          ref: source.ref || source.file || 'Unknown',
          heading: source.heading || source.file?.split('.')[0] || 'Legal Provision',
          source: source.source || source.file || 'Legal Document',
          content: source.content || source.text || ''
        }))
      };
    } catch (error) {
      console.error('Error calling chat API:', error);
      throw error;
    }
  }

  async getHistory(): Promise<any> {
    const url = `${this.baseUrl}/history`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting history:', error);
      throw error;
    }
  }

  async clearHistory(): Promise<any> {
    const url = `${this.baseUrl}/history`;
    
    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error clearing history:', error);
      throw error;
    }
  }

  async uploadDocument(file: File): Promise<any> {
    const url = `${this.baseUrl}/upload`;
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getApiKey()}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  }

  async explainDocument(file: File): Promise<string> {
    const url = `${this.baseUrl}/explain-doc`;
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getApiKey()}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return result.explanation;
    } catch (error) {
      console.error('Error explaining document:', error);
      throw error;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/`);
      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  // API Key management methods
  getApiKey(): string | null {
    return getApiKey();
  }
  
  setApiKey(key: string): void {
    setApiKey(key);
  }
  
  clearApiKey(): void {
    clearApiKey();
  }
}

export const apiService = new ApiService();
export type { ChatRequest, ChatResponse, ApiMessage, Message };