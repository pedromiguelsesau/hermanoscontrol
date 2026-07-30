import { AppData, AuditLogItem, User, TrashItem, MediaItem, MediaCategory } from '../types';
import { supabase } from '../lib/supabaseClient';

export const apiService = {
  // Auth — real Supabase Auth. No local fallback, no hardcoded credentials.
  async login(email: string, password: string): Promise<{ success: boolean; user?: User; message?: string }> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      return { success: false, message: error?.message || 'Credenciais inválidas' };
    }
    const user: User = {
      username: data.user.email || '',
      name: (data.user.user_metadata?.name as string) || data.user.email || '',
      role: (data.user.user_metadata?.role as string) || 'Usuário',
      avatar: (data.user.user_metadata?.avatar as string) || ''
    };
    return { success: true, user };
  },

  async getCurrentUser(): Promise<User | null> {
    const { data } = await supabase.auth.getSession();
    const su = data.session?.user;
    if (!su) return null;
    return {
      username: su.email || '',
      name: (su.user_metadata?.name as string) || su.email || '',
      role: (su.user_metadata?.role as string) || 'Usuário',
      avatar: (su.user_metadata?.avatar as string) || ''
    };
  },

  async logout(): Promise<void> {
    await supabase.auth.signOut();
  },

  // Load Data — always from the server (which reads Supabase tables directly, RLS-protected).
  async loadAppData(): Promise<AppData> {
    const res = await fetch('/api/data');
    if (!res.ok) throw new Error('Falha ao carregar dados do servidor');
    return res.json();
  },

  async getInitialData(): Promise<AppData> {
    return this.loadAppData();
  },

  // Save Data
  async saveAppData(data: AppData): Promise<boolean> {
    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.ok;
    } catch (e) {
      console.error('Error saving data:', e);
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
