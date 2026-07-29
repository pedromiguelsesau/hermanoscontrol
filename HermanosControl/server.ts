import express from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Pool } from 'pg';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { initialAppData } from './src/data/initialData.js';

// NOTE: __dirname and __filename are available natively here because esbuild
// bundles this file to CommonJS (--format=cjs). Do NOT reintroduce
// fileURLToPath(import.meta.url) — import.meta.url does not exist in CJS
// and will throw "The path argument must be of type string... Received undefined".

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Uploads still go to local disk (ephemeral on Render — survives only until the
// next deploy/restart). Consider moving this to Supabase Storage later.
const DB_DIR = path.join(process.cwd(), 'data');
const UPLOADS_DIR = path.join(DB_DIR, 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Serve uploaded media statically
app.use('/uploads', express.static(UPLOADS_DIR));

// --- Supabase Postgres connection ---
// DATABASE_URL must be set in Render's Environment tab (Supabase pooler
// connection string). Supabase requires SSL; rejectUnauthorized:false is
// needed because their cert chain isn't in Node's default trust store.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

let dbReady: Promise<void> | null = null;

async function ensureTable() {
  if (!dbReady) {
    dbReady = pool.query(`
      CREATE TABLE IF NOT EXISTS erp_data (
        id INT PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT now()
      );
    `).then(() => undefined);
  }
  return dbReady;
}

async function loadData() {
  try {
    await ensureTable();
    const result = await pool.query('SELECT data FROM erp_data WHERE id = 1');
    if (result.rows.length > 0) {
      return result.rows[0].data;
    }
    // No row yet — seed with initial data
    await pool.query(
      'INSERT INTO erp_data (id, data) VALUES (1, $1) ON CONFLICT (id) DO NOTHING',
      [JSON.stringify(initialAppData)]
    );
    return initialAppData;
  } catch (err) {
    console.error('Error reading data from Supabase:', err);
    return initialAppData;
  }
}

async function saveData(data: any) {
  try {
    await ensureTable();
    await pool.query(
      `INSERT INTO erp_data (id, data, updated_at) VALUES (1, $1, now())
       ON CONFLICT (id) DO UPDATE SET data = $1, updated_at = now()`,
      [JSON.stringify(data)]
    );
    return true;
  } catch (err) {
    console.error('Error saving data to Supabase:', err);
    return false;
  }
}

// Lazy Gemini AI Client initialization
function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not configured.');
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
}

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Auth
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(401).json({ success: false, message: 'Usuário ou senha incorretos' });
  }

  const uInput = String(username).trim().toLowerCase();
  const pInput = String(password);

  const uHash = crypto.createHash('sha256').update(uInput).digest('hex');
  const pHash = crypto.createHash('sha256').update(pInput).digest('hex');

  const TARGET_USER_HASH = crypto.createHash('sha256').update('hermanosconceito').digest('hex');
  const TARGET_EMAIL_HASH = crypto.createHash('sha256').update('hermanosconceito@hermanos.com').digest('hex');
  const TARGET_PASS_HASH = crypto.createHash('sha256').update('hermanosbabdol').digest('hex');

  if ((uHash === TARGET_USER_HASH || uHash === TARGET_EMAIL_HASH) && pHash === TARGET_PASS_HASH) {
    return res.json({
      success: true,
      user: {
        username: 'hermanosconceito',
        name: 'Hermano’s Outfit Admin',
        role: 'Administrador Principal',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      }
    });
  }
  return res.status(401).json({ success: false, message: 'Usuário ou senha incorretos' });
});

// Get ERP Data
app.get('/api/data', async (req, res) => {
  const data = await loadData();
  res.json(data);
});

// Save ERP Data
app.post('/api/data', async (req, res) => {
  const data = req.body;
  if (!data) {
    return res.status(400).json({ error: 'Dados não informados' });
  }
  const success = await saveData(data);
  if (success) {
    return res.json({ success: true, timestamp: new Date().toISOString() });
  }
  return res.status(500).json({ error: 'Erro ao salvar dados' });
});

// Image Upload Endpoint (Saves to disk in data/uploads and updates mediaLibrary in DB)
app.post('/api/upload', async (req, res) => {
  try {
    const { fileData, fileName, category, user } = req.body;
    if (!fileData) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    let buffer: Buffer;
    let mimeType = 'image/jpeg';
    let fileExt = 'jpg';

    if (fileData.startsWith('data:')) {
      const matches = fileData.match(/^data:([a-zA-Z0-9-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return res.status(400).json({ error: 'Formato base64 inválido' });
      }
      mimeType = matches[1];
      const base64Data = matches[2];
      buffer = Buffer.from(base64Data, 'base64');

      if (mimeType.includes('png')) fileExt = 'png';
      else if (mimeType.includes('webp')) fileExt = 'webp';
      else if (mimeType.includes('svg')) fileExt = 'svg';
      else if (mimeType.includes('jpeg') || mimeType.includes('jpg')) fileExt = 'jpg';
    } else {
      buffer = Buffer.from(fileData, 'base64');
    }

    // Size limit check (10MB)
    if (buffer.length > 10 * 1024 * 1024) {
      return res.status(400).json({ error: 'Tamanho máximo permitido é 10MB' });
    }

    const cleanOriginalName = (fileName || 'imagem').replace(/[^a-zA-Z0-9._-]/g, '_');
    const uniqueId = `med_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const savedFileName = `${uniqueId}_${cleanOriginalName}`;
    const filePath = path.join(UPLOADS_DIR, savedFileName);

    fs.writeFileSync(filePath, buffer);

    const sizeInBytes = buffer.length;
    let sizeFormatted = `${(sizeInBytes / 1024).toFixed(0)} KB`;
    if (sizeInBytes >= 1024 * 1024) {
      sizeFormatted = `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
    }

    const fileUrl = `/uploads/${savedFileName}`;

    const mediaItem = {
      id: uniqueId,
      name: fileName || savedFileName,
      url: fileUrl,
      category: category || 'Outros',
      size: sizeInBytes,
      sizeFormatted,
      mimeType,
      uploadedAt: new Date().toISOString(),
      uploadedBy: user || 'hermanosconceito'
    };

    // Update database
    const erpData = await loadData();
    if (!erpData.mediaLibrary) {
      erpData.mediaLibrary = [];
    }
    erpData.mediaLibrary.unshift(mediaItem);
    await saveData(erpData);

    return res.json({
      success: true,
      media: mediaItem,
      url: fileUrl,
      fileName: mediaItem.name
    });
  } catch (err: any) {
    console.error('Error in /api/upload:', err);
    return res.status(500).json({ error: 'Erro ao processar e salvar imagem' });
  }
});

// Media Library GET Endpoint
app.get('/api/media', async (req, res) => {
  const erpData = await loadData();
  res.json(erpData.mediaLibrary || []);
});

// Delete Media Endpoint
app.delete('/api/media/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const erpData = await loadData();
    if (!erpData.mediaLibrary) {
      return res.status(404).json({ error: 'Mídia não encontrada' });
    }

    const itemIndex = erpData.mediaLibrary.findIndex((m: any) => m.id === id);
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Mídia não encontrada' });
    }

    const item = erpData.mediaLibrary[itemIndex];
    if (item.url && item.url.startsWith('/uploads/')) {
      const fileName = item.url.replace('/uploads/', '');
      const diskPath = path.join(UPLOADS_DIR, fileName);
      if (fs.existsSync(diskPath)) {
        try {
          fs.unlinkSync(diskPath);
        } catch (e) {
          console.warn('Could not delete file from disk:', e);
        }
      }
    }

    erpData.mediaLibrary.splice(itemIndex, 1);
    await saveData(erpData);

    return res.json({ success: true, message: 'Imagem excluída com sucesso' });
  } catch (err: any) {
    console.error('Error deleting media:', err);
    return res.status(500).json({ error: 'Erro ao excluir imagem' });
  }
});

// Update Media Endpoint (rename, change category)
app.put('/api/media/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category } = req.body;
    const erpData = await loadData();
    if (!erpData.mediaLibrary) {
      return res.status(404).json({ error: 'Mídia não encontrada' });
    }

    const item = erpData.mediaLibrary.find((m: any) => m.id === id);
    if (!item) {
      return res.status(404).json({ error: 'Mídia não encontrada' });
    }

    if (name) item.name = name;
    if (category) item.category = category;

    await saveData(erpData);

    return res.json({ success: true, media: item });
  } catch (err: any) {
    console.error('Error updating media:', err);
    return res.status(500).json({ error: 'Erro ao atualizar mídia' });
  }
});

// Gemini AI Analysis Endpoint
app.post('/api/ai/analyze', async (req, res) => {
  try {
    const ai = getGenAI();
    const erpData = await loadData();

    if (!ai) {
      // Fallback response if no key
      return res.json({
        summary: 'Análise básica executada localmente (Sem chave Gemini vinculada).',
        stagnantProducts: erpData.products.filter((p: any) => p.stock > 30).map((p: any) => p.name),
        topSellers: erpData.products.slice(0, 3).map((p: any) => p.name),
        bottomSellers: erpData.products.slice(-2).map((p: any) => p.name),
        profitMarginAnalysis: 'Sua margem média de lucro nos produtos está acima de 65%, o que é excelente para o segmento streetwear luxury.',
        promoSuggestions: ['Combo Camiseta + Boné Dad Hat com 10% de desconto'],
        replenishmentForecast: erpData.products.filter((p: any) => p.stock < (p.initialStock / 2)).map((p: any) => `Repor ${p.name}`),
        growthAnalysis: 'Aumento consistente das vendas no canal direto. Recomenda-se expandir tráfego pago no Instagram.',
        instagramCampaigns: ['Reels demonstrando o caimento do tecido 260g e o selo dourado'],
        managementTips: ['Mantenha o controle rigoroso de estoque para evitar ruptura de tamanhos G e GG.'],
        importantAlerts: ['Produtos com menos de 50% de estoque precisam de reposição nos próximos 7 dias.'],
        strategicInsights: ['O mercado valoriza a exclusividade. Considere fazer drops limitados numerados.']
      });
    }

    const prompt = `Você é a Inteligência Artificial estrategista de negócios oficial do ERP "Hermano's Control" para a marca de roupa streetwear premium "Hermano's Outfit".
Analise minuciosamente os seguintes dados atuais da empresa em formato JSON:
${JSON.stringify({
  products: erpData.products.map((p: any) => ({ code: p.code, name: p.name, category: p.category, stock: p.stock, initialStock: p.initialStock, cost: p.costPrice, sell: p.sellPrice, margin: p.margin })),
  sales: erpData.sales,
  expenses: erpData.expenses,
  goals: erpData.goals
})}

Gere uma resposta estritamente em formato JSON estruturado com os seguintes campos:
{
  "summary": "Resumo geral da saúde do negócio",
  "stagnantProducts": ["Lista de produtos com baixo giro ou estoque muito alto parado"],
  "topSellers": ["Principais produtos campeões de vendas"],
  "bottomSellers": ["Produtos com menor saída"],
  "profitMarginAnalysis": "Análise detalhada das margens de lucro e precificação",
  "promoSuggestions": ["Sugestões estratégicas de promoções sem desvalorizar a marca"],
  "replenishmentForecast": ["Previsão detalhada de reposição de peças urgentes"],
  "growthAnalysis": "Comparação e tendências de crescimento",
  "instagramCampaigns": ["3 ideias altamente visuais e engajantes para o Instagram da marca"],
  "managementTips": ["Conselhos de gestão financeira e operacional"],
  "importantAlerts": ["Alertas críticos de falta de estoque ou gastos excessivos"],
  "strategicInsights": ["Insights de alto impacto para escalar a empresa"]
}
Responda exclusivamente com JSON válido sem marcações extras de markdown ou textos antes/depois.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text || '{}';
    let result;
    try {
      result = JSON.parse(text);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      result = {
        summary: text,
        stagnantProducts: [],
        topSellers: [],
        bottomSellers: [],
        profitMarginAnalysis: 'Margens excelentes',
        promoSuggestions: [],
        replenishmentForecast: [],
        growthAnalysis: 'Crescimento saudável',
        instagramCampaigns: [],
        managementTips: [],
        importantAlerts: [],
        strategicInsights: []
      };
    }

    return res.json(result);
  } catch (error: any) {
    console.error('AI Analysis error:', error);
    return res.status(500).json({ error: error?.message || 'Erro ao gerar análise por IA' });
  }
});

// Gemini AI Chat Assistant Endpoint
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    const ai = getGenAI();
    const erpData = await loadData();

    if (!ai) {
      return res.json({
        reply: 'Assistente offline temporariamente. Verifique as configurações da chave de API Gemini.'
      });
    }

    const systemInstruction = `Você é a IA Oficial de Gestão da Hermano's Outfit, integrada ao Hermano's Control ERP.
Seu tom é profissional, direto, elegante e estratégico.
Você tem acesso aos seguintes dados em tempo real da empresa:
- Total de produtos cadastrados: ${erpData.products?.length || 0}
- Produtos com estoque baixo (<50% do inicial): ${erpData.products?.filter((p: any) => p.stock < (p.initialStock / 2)).map((p: any) => p.name).join(', ') || 'Nenhum'}
- Total de vendas registradas: ${erpData.sales?.length || 0}
- Total faturado em vendas: R$ ${erpData.sales?.reduce((acc: number, s: any) => acc + (s.totalAmount || 0), 0).toFixed(2)}
- Despesas totais: R$ ${erpData.expenses?.reduce((acc: number, e: any) => acc + (e.amount || 0), 0).toFixed(2)}

Responda às perguntas dos sócios/gestores com precisão, oferecendo números, conselhos de marketing no Instagram, precificação, giro de estoque e sugestões para acelerar as vendas.`;

    const chat = ai.chats.create({
      model: 'gemini-3.6-flash',
      config: {
        systemInstruction
      }
    });

    const response = await chat.sendMessage({ message });
    return res.json({ reply: response.text });
  } catch (error: any) {
    console.error('AI Chat Error:', error);
    return res.status(500).json({ error: 'Erro no chat de IA' });
  }
});

// Vite Middleware for Development / Static server for Production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Hermano's Control ERP running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
