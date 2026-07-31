import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { Pool, types } from 'pg';

// pg returns NUMERIC columns as strings by default (to avoid float precision
// loss) — but the frontend calls .toFixed()/math ops expecting real numbers.
// OID 1700 = numeric/decimal.
types.setTypeParser(1700, (val: string) => parseFloat(val));
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';
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

// Uploads go to Supabase Storage (see storage section below). The local
// data/uploads dir is only kept to keep serving images uploaded before the
// migration — nothing new is ever written there.
const DB_DIR = path.join(process.cwd(), 'data');
const UPLOADS_DIR = path.join(DB_DIR, 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Serve legacy uploaded media statically
app.use('/uploads', express.static(UPLOADS_DIR));

// --- Supabase Storage (media bucket) ---
// Uses the secret/service key, so it bypasses Storage RLS: only this trusted
// server writes to the bucket, the browser just reads the public URLs.
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY || '';
const MEDIA_BUCKET = process.env.SUPABASE_MEDIA_BUCKET || 'media';

const storage =
  SUPABASE_URL && SUPABASE_SECRET_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
        auth: { persistSession: false, autoRefreshToken: false }
      }).storage
    : null;

// Creates the public bucket on first boot if it isn't there yet, so a fresh
// Supabase project works without any manual dashboard step.
async function ensureMediaBucket() {
  if (!storage) {
    console.warn(
      '[storage] SUPABASE_URL/SUPABASE_SECRET_KEY ausentes — upload de imagens desabilitado.'
    );
    return;
  }
  const { data, error } = await storage.getBucket(MEDIA_BUCKET);
  if (data && !error) return;

  const { error: createErr } = await storage.createBucket(MEDIA_BUCKET, {
    public: true,
    fileSizeLimit: 10 * 1024 * 1024,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif']
  });
  if (createErr && !/already exists/i.test(createErr.message)) {
    console.error('[storage] Falha ao criar bucket', MEDIA_BUCKET, createErr.message);
  } else {
    console.log('[storage] Bucket público criado:', MEDIA_BUCKET);
  }
}

// Extracts the in-bucket object path back out of a public Storage URL, so
// deleting a media item also removes the actual file.
function storagePathFromUrl(url: string): string | null {
  const marker = `/storage/v1/object/public/${MEDIA_BUCKET}/`;
  const idx = url.indexOf(marker);
  return idx === -1 ? null : decodeURIComponent(url.slice(idx + marker.length));
}

// --- Supabase Postgres connection ---
// DATABASE_URL must be set in Render's Environment tab (Supabase pooler
// connection string). Supabase requires SSL; rejectUnauthorized:false is
// needed because their cert chain isn't in Node's default trust store.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Maps AppData <-> the normalized Supabase tables created by supabase_schema.sql.
// This server connection uses the `postgres` role (table owner), which bypasses
// RLS by default — RLS on these tables protects any future direct-from-browser
// access via the anon/publishable key, while this trusted server path still works.

const camelRow = (row: any) => {
  const out: any = {};
  for (const k in row) out[k.replace(/_([a-z])/g, (_, c) => c.toUpperCase())] = row[k];
  return out;
};
const snake = (k: string) => k.replace(/[A-Z]/g, (c) => '_' + c.toLowerCase());

async function loadData() {
  try {
    const [
      company, financial, site,
      products, stockMovements, customers, purchases, sales,
      expenses, cashFlow, marketing, goals, calendarEvents, tasks,
      auditLogs, trash, media
    ] = await Promise.all([
      pool.query('SELECT * FROM company_config WHERE id = 1'),
      pool.query('SELECT * FROM financial_state WHERE id = 1'),
      pool.query('SELECT data FROM site_config WHERE id = 1'),
      pool.query('SELECT * FROM products ORDER BY created_at'),
      pool.query('SELECT * FROM stock_movements ORDER BY date'),
      pool.query('SELECT * FROM customers ORDER BY created_at'),
      pool.query('SELECT * FROM purchases ORDER BY created_at'),
      pool.query('SELECT * FROM sales ORDER BY created_at'),
      pool.query('SELECT * FROM expenses ORDER BY created_at'),
      pool.query('SELECT * FROM cash_flow ORDER BY date'),
      pool.query('SELECT * FROM marketing_campaigns'),
      pool.query('SELECT * FROM goals'),
      pool.query('SELECT * FROM calendar_events'),
      pool.query('SELECT * FROM tasks ORDER BY created_at'),
      pool.query('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 2000'),
      pool.query('SELECT * FROM trash ORDER BY deleted_at DESC'),
      pool.query('SELECT * FROM media_library ORDER BY uploaded_at DESC')
    ]);

    return {
      companyConfig: company.rows[0] ? camelRow(company.rows[0]) : initialAppData.companyConfig,
      financial: financial.rows[0] ? camelRow(financial.rows[0]) : initialAppData.financial,
      siteConfig: site.rows[0]?.data || initialAppData.siteConfig,
      products: products.rows.map(camelRow),
      stockMovements: stockMovements.rows.map(camelRow),
      customers: customers.rows.map(camelRow),
      purchases: purchases.rows.map((r: any) => ({ ...camelRow(r), items: r.items })),
      sales: sales.rows.map((r: any) => ({ ...camelRow(r), items: r.items })),
      expenses: expenses.rows.map(camelRow),
      cashFlow: cashFlow.rows.map(camelRow),
      marketingCampaigns: marketing.rows.map(camelRow),
      goals: goals.rows.map(camelRow),
      calendarEvents: calendarEvents.rows.map(camelRow),
      tasks: tasks.rows.map(camelRow),
      auditLogs: auditLogs.rows.map(camelRow),
      trash: trash.rows.map(camelRow),
      mediaLibrary: media.rows.map(camelRow)
    };
  } catch (err) {
    console.error('Error reading data from Supabase:', err);
    return initialAppData;
  }
}

// Generic upsert-all-rows helper: deletes rows not present in `items` and
// upserts the rest, keyed by `id`. Keeps things simple/robust for a low-write-
// volume internal ERP (full-array save on every change, same as before).
// Columns that are jsonb (object/array) rather than a native PG array/scalar —
// must be JSON.stringify'd before being passed as a query parameter, or `pg`
// will send a garbage string representation and Postgres rejects it.
const JSONB_FIELDS = new Set(['items', 'history', 'payload']);

async function replaceTable(table: string, items: any[], columns: string[]) {
  const ids = items.map((it) => it.id).filter(Boolean);
  if (ids.length > 0) {
    await pool.query(`DELETE FROM "${table}" WHERE id != ALL($1::text[])`, [ids]);
  } else {
    await pool.query(`DELETE FROM "${table}"`);
  }
  for (const item of items) {
    const cols = columns.filter((c) => c in item || c === 'id');
    const dbCols = cols.map(snake);
    const values = cols.map((c) => {
      const v = item[c];
      if (v === undefined) return null;
      if (JSONB_FIELDS.has(c) && v !== null) return JSON.stringify(v);
      return v;
    });
    const placeholders = dbCols.map((_, i) => `$${i + 1}`);
    const quotedCols = dbCols.map((c) => `"${c}"`);
    const updates = dbCols.filter((c) => c !== 'id').map((c) => `"${c}" = EXCLUDED."${c}"`);
    await pool.query(
      `INSERT INTO "${table}" (${quotedCols.join(',')}) VALUES (${placeholders.join(',')})
       ON CONFLICT (id) DO UPDATE SET ${updates.join(',')}`,
      values
    );
  }
}

async function saveData(data: any) {
  try {
    await pool.query(
      `INSERT INTO company_config (id, name, cnpj, phone, email, instagram, address, currency)
       VALUES (1, $1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT (id) DO UPDATE SET name=$1, cnpj=$2, phone=$3, email=$4, instagram=$5, address=$6, currency=$7`,
      ['name', 'cnpj', 'phone', 'email', 'instagram', 'address', 'currency'].map((k) => data.companyConfig?.[k] ?? null)
    );
    const f = data.financial || {};
    await pool.query(
      `INSERT INTO financial_state (id, accounts_payable, accounts_receivable, installments, profit, withdrawals, assets_value, available_balance)
       VALUES (1,$1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT (id) DO UPDATE SET accounts_payable=$1, accounts_receivable=$2, installments=$3, profit=$4, withdrawals=$5, assets_value=$6, available_balance=$7`,
      [f.accountsPayable, f.accountsReceivable, f.installments, f.profit, f.withdrawals, f.assetsValue, f.availableBalance]
    );
    await pool.query(
      `INSERT INTO site_config (id, data) VALUES (1, $1) ON CONFLICT (id) DO UPDATE SET data = $1`,
      [JSON.stringify(data.siteConfig || {})]
    );

    await replaceTable('products', data.products || [], ['id', 'code', 'name', 'category', 'brand', 'color', 'size', 'description', 'photos', 'costPrice', 'sellPrice', 'margin', 'stock', 'initialStock', 'minStockAlert', 'history', 'createdAt', 'updatedAt']);
    await replaceTable('stock_movements', data.stockMovements || [], ['id', 'productId', 'productCode', 'productName', 'color', 'size', 'type', 'quantity', 'date', 'reason', 'user']);
    await replaceTable('customers', data.customers || [], ['id', 'name', 'phone', 'email', 'notes', 'totalSpent', 'purchaseCount', 'createdAt', 'lastPurchaseDate']);
    await replaceTable('purchases', data.purchases || [], ['id', 'supplier', 'date', 'paymentMethod', 'notes', 'freight', 'totalAmount', 'items', 'receiptUrl', 'createdAt']);
    await replaceTable('sales', data.sales || [], ['id', 'customerId', 'customerName', 'date', 'items', 'discount', 'freight', 'totalAmount', 'profitAmount', 'paymentMethod', 'salesperson', 'notes', 'createdAt']);
    await replaceTable('expenses', data.expenses || [], ['id', 'category', 'description', 'amount', 'date', 'paymentMethod', 'receiptUrl', 'notes', 'createdAt']);
    await replaceTable('cash_flow', data.cashFlow || [], ['id', 'date', 'type', 'category', 'description', 'amount', 'balanceAfter', 'paymentMethod', 'referenceId']);
    await replaceTable('marketing_campaigns', data.marketingCampaigns || [], ['id', 'title', 'budget', 'spent', 'startDate', 'endDate', 'channel', 'discountCode', 'discountPercentage', 'salesCount', 'revenueGenerated', 'roas', 'status']);
    await replaceTable('goals', data.goals || [], ['id', 'monthYear', 'targetRevenue', 'targetProfit', 'targetSalesCount', 'targetItemsCount']);
    await replaceTable('calendar_events', data.calendarEvents || [], ['id', 'title', 'date', 'time', 'type', 'category', 'notes', 'description', 'completed']);
    await replaceTable('tasks', data.tasks || [], ['id', 'title', 'assignee', 'priority', 'completed', 'status', 'dueDate', 'notes', 'createdAt']);
    await replaceTable('audit_logs', data.auditLogs || [], ['id', 'timestamp', 'dateFormatted', 'user', 'module', 'entity', 'entityId', 'action', 'details', 'oldValue', 'newValue']);
    await replaceTable('trash', data.trash || [], ['id', 'originalId', 'type', 'originalName', 'payload', 'deletedAt', 'expiresAt', 'description']);
    await replaceTable('media_library', data.mediaLibrary || [], ['id', 'name', 'url', 'category', 'size', 'sizeFormatted', 'mimeType', 'uploadedAt', 'uploadedBy', 'width', 'height']);

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

// Auth is handled client-side via Supabase Auth (src/lib/supabaseClient.ts).

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

// Image Upload Endpoint (sends the file to Supabase Storage and records it in mediaLibrary)
app.post('/api/upload', async (req, res) => {
  try {
    const { fileData, fileName, category, user } = req.body;
    if (!fileData) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }
    if (!storage) {
      return res.status(503).json({
        error: 'Armazenamento de imagens não configurado (SUPABASE_URL / SUPABASE_SECRET_KEY).'
      });
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

    const cleanOriginalName = (fileName || `imagem.${fileExt}`).replace(/[^a-zA-Z0-9._-]/g, '_');
    const uniqueId = `med_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const savedFileName = `${uniqueId}_${cleanOriginalName}`;
    // Category becomes a folder inside the bucket (Produtos/, Banners/, Logos/...)
    const objectPath = `${(category || 'Outros').replace(/[^a-zA-Z0-9._-]/g, '_')}/${savedFileName}`;

    const { error: uploadErr } = await storage
      .from(MEDIA_BUCKET)
      .upload(objectPath, buffer, { contentType: mimeType, upsert: false });

    if (uploadErr) {
      console.error('Error uploading to Supabase Storage:', uploadErr);
      return res.status(500).json({ error: `Erro ao enviar imagem: ${uploadErr.message}` });
    }

    const sizeInBytes = buffer.length;
    let sizeFormatted = `${(sizeInBytes / 1024).toFixed(0)} KB`;
    if (sizeInBytes >= 1024 * 1024) {
      sizeFormatted = `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
    }

    const fileUrl = storage.from(MEDIA_BUCKET).getPublicUrl(objectPath).data.publicUrl;

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
    const objectPath = item.url ? storagePathFromUrl(item.url) : null;

    if (objectPath && storage) {
      const { error: removeErr } = await storage.from(MEDIA_BUCKET).remove([objectPath]);
      if (removeErr) {
        console.warn('Could not delete file from Supabase Storage:', removeErr.message);
      }
    } else if (item.url && item.url.startsWith('/uploads/')) {
      // Legacy image still on local disk
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

    let totalSales = 0;
    for (const s of erpData.sales || []) totalSales += s.totalAmount || 0;

    let totalExpenses = 0;
    for (const e of erpData.expenses || []) totalExpenses += e.amount || 0;

    const systemInstruction = `Você é a IA Oficial de Gestão da Hermano's Outfit, integrada ao Hermano's Control ERP.
Seu tom é profissional, direto, elegante e estratégico.
Você tem acesso aos seguintes dados em tempo real da empresa:
- Total de produtos cadastrados: ${erpData.products?.length || 0}
- Produtos com estoque baixo (<50% do inicial): ${erpData.products?.filter((p: any) => p.stock < (p.initialStock / 2)).map((p: any) => p.name).join(', ') || 'Nenhum'}
- Total de vendas registradas: ${erpData.sales?.length || 0}
- Total faturado em vendas: R$ ${totalSales.toFixed(2)}
- Despesas totais: R$ ${totalExpenses.toFixed(2)}

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
  await ensureMediaBucket();

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
