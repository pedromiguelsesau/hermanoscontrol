import { AppData, AuditLogItem, User, TrashItem, MediaItem, MediaCategory } from '../types';
import { initialAppData } from '../data/initialData';

const LOCAL_STORAGE_KEY = 'hermanos_control_data_v1';
const AUTH_KEY = 'hermanos_auth_user';

export const apiService = {
  // Auth
  async login(username: string, password: string): Promise<{ success: boolean; user?: User; message?: string }> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem(AUTH_KEY, JSON.stringify(data.user));
        return { success: true, user: data.user };
      }
      return { success: false, message: data.message || 'Credenciais inválidas' };
    } catch (e) {
      // Offline fallback check via Web Crypto API
      try {
        const encoder = new TextEncoder();
        const uBuf = await crypto.subtle.digest('SHA-256', encoder.encode(username.trim().toLowerCase()));
        const pBuf = await crypto.subtle.digest('SHA-256', encoder.encode(password));

        const uHex = Array.from(new Uint8Array(uBuf)).map((b) => b.toString(16).padStart(2, '0')).join('');
        const pHex = Array.from(new Uint8Array(pBuf)).map((b) => b.toString(16).padStart(2, '0')).join('');

        const targetUser = '91950d4ffbce9d7b4db9fbbf3ce29f425b7ca309bd4bc613beaa020164c8d57d';
        const targetEmail = '40056aa133226be0f0fb5bc4e5cdbc1fe251b54ec65bc83dc9847bd6bf474cc0';
        const targetPass = '0291df13ebcd6347c6179331d25ffb6c23631557008fb56a84f3df9371ffad21';

        if ((uHex === targetUser || uHex === targetEmail) && pHex === targetPass) {
          const user: User = {
            username: 'hermanosconceito',
            name: 'Hermano’s Outfit Admin',
            role: 'Administrador Principal',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
          };
          localStorage.setItem(AUTH_KEY, JSON.stringify(user));
          return { success: true, user };
        }
      } catch (err) {
        console.error('Offline hash check error:', err);
      }
      return { success: false, message: 'Usuário ou senha incorretos' };
    }
  },

  getCurrentUser(): User | null {
    try {
      const stored = localStorage.getItem(AUTH_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  logout(): void {
    localStorage.removeItem(AUTH_KEY);
  },

  // Load Data
  async loadAppData(): Promise<AppData> {
    try {
      const res = await fetch('/api/data');
      if (res.ok) {
        const data = await res.json();
        // Update local backup
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
        return data;
      }
    } catch (e) {
      console.warn('Network offline or server unreachable, loading local cached data:', e);
    }

    // Local fallback
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {
      console.error('Failed reading local storage:', e);
    }

    return initialAppData;
  },

  async getInitialData(): Promise<AppData> {
    return this.loadAppData();
  },

  // Save Data
  async saveAppData(data: AppData): Promise<boolean> {
    // Save to LocalStorage immediately
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Error saving to LocalStorage:', e);
    }

    // Sync to Server
    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.ok;
    } catch (e) {
      console.warn('Server sync pending (offline):', e);
      return false;
    }
  },

  async saveData(data: AppData): Promise<boolean> {
    return this.saveAppData(data);
  },

  // AI Analysis
  async requestAIAnalysis(): Promise<any> {
    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.error('Error fetching AI analysis:', e);
    }
    return null;
  },

  // AI Chat
  async sendAIChatMessage(message: string): Promise<string> {
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      if (res.ok) {
        const data = await res.json();
        return data.reply;
      }
    } catch (e) {
      console.error('Error in AI chat:', e);
    }
    return 'Desculpe, ocorreu um erro de conexão com a inteligência artificial.';
  },

  // Image upload
  async uploadFile(fileData: string, fileName?: string, category: MediaCategory = 'Outros', user?: string): Promise<string> {
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileData, fileName, category, user })
      });
      if (res.ok) {
        const data = await res.json();
        return data.url;
      }
    } catch (e) {
      console.error('Upload failed:', e);
    }
    return fileData; // return base64 string as fallback
  },

  async uploadMediaItem(fileData: string, fileName: string, category: MediaCategory = 'Outros', user?: string): Promise<{ success: boolean; media?: MediaItem; url?: string; message?: string }> {
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileData, fileName, category, user })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return { success: true, media: data.media, url: data.url };
      }
      return { success: false, message: data.error || 'Erro no envio da imagem' };
    } catch (e: any) {
      console.error('Upload media item failed:', e);
      return { success: false, message: e.message || 'Erro de conexão no envio da imagem' };
    }
  },

  async deleteMediaItem(id: string): Promise<{ success: boolean; message?: string }> {
    try {
      const res = await fetch(`/api/media/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return { success: true };
      }
      return { success: false, message: data.error || 'Erro ao excluir mídia' };
    } catch (e: any) {
      console.error('Delete media item failed:', e);
      return { success: false, message: 'Erro ao conectar ao servidor para excluir' };
    }
  },

  async updateMediaItem(id: string, updates: { name?: string; category?: MediaCategory }): Promise<{ success: boolean; media?: MediaItem; message?: string }> {
    try {
      const res = await fetch(`/api/media/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return { success: true, media: data.media };
      }
      return { success: false, message: data.error || 'Erro ao atualizar mídia' };
    } catch (e: any) {
      console.error('Update media item failed:', e);
      return { success: false, message: 'Erro ao conectar ao servidor para atualizar' };
    }
  }
};

// Helper for Logging Audit Trail
export function createAuditLog(
  user: string,
  entity: string,
  action: string,
  details: string,
  oldValue = '',
  newValue = ''
): AuditLogItem {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');

  return {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    timestamp: now.toISOString(),
    dateFormatted: `${day}/${month}/${year} ${hours}:${minutes}`,
    user,
    entity,
    action,
    details,
    oldValue,
    newValue
  };
}

// Helper for Soft Deletion to Trash
export function createTrashItem(
  type: TrashItem['type'],
  originalId: string,
  description: string,
  data: any,
  retentionDays = 30
): TrashItem {
  const deletedAt = new Date();
  const expiresAt = new Date(deletedAt.getTime() + retentionDays * 24 * 60 * 60 * 1000);

  return {
    id: `trash-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    originalId,
    type,
    deletedAt: deletedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    description,
    data
  };
}
