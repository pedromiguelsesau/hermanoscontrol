import React, { useState } from 'react';
import {
  Sparkles,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Instagram,
  Package,
  DollarSign,
  Send,
  Bot,
  User,
  ArrowUpRight,
  ShieldCheck,
  BarChart3
} from 'lucide-react';
import { AppData, AIAnalysisResult } from '../../types';
import { apiService } from '../../services/api';

interface IAViewProps {
  data: AppData;
}

export const IAView: React.FC<IAViewProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<'diagnosis' | 'assistant'>('diagnosis');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);

  // Chat Assistant State
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    {
      sender: 'ai',
      text: 'Olá, sócios da Hermano’s Outfit! Sou a IA estrategista do seu ERP. Como posso ajudar na análise de estoque, precificação ou estratégias de marketing hoje?'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const runAnalysis = async () => {
    setLoading(true);
    const result = await apiService.requestAIAnalysis();
    setLoading(false);
    if (result) {
      setAnalysis(result);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || chatLoading) return;

    const userText = inputMessage.trim();
    setInputMessage('');
    setChatMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setChatLoading(true);

    const reply = await apiService.sendAIChatMessage(userText);
    setChatLoading(false);
    setChatMessages((prev) => [...prev, { sender: 'ai', text: reply }]);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-zinc-900 via-[#18181b] to-zinc-900 p-6 shadow-2xl">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-lg shadow-amber-500/10">
              <Sparkles className="h-7 w-7 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Módulo de Inteligência Artificial — Hermano’s AI</h2>
              <p className="text-xs text-zinc-400">
                Análise em tempo real alimentada pelo Gemini 3.6 Flash para otimização de faturamento e estoque.
              </p>
            </div>
          </div>

          <div className="flex rounded-xl bg-zinc-900 p-1 border border-zinc-800 text-xs">
            <button
              onClick={() => setActiveTab('diagnosis')}
              className={`rounded-lg px-4 py-2 font-bold transition-all ${
                activeTab === 'diagnosis' ? 'bg-amber-500 text-black shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Diagnóstico Automático
            </button>
            <button
              onClick={() => setActiveTab('assistant')}
              className={`rounded-lg px-4 py-2 font-bold transition-all ${
                activeTab === 'assistant' ? 'bg-amber-500 text-black shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Assistente Estratégico Chat
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'diagnosis' ? (
        <div className="space-y-6">
          {/* Action trigger */}
          <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-[#121215] p-4">
            <div>
              <p className="text-sm font-bold text-white">Executar Leitura Profunda de Dados</p>
              <p className="text-xs text-zinc-400">
                A IA analisa todas as vendas, margens, estoque e despesas para gerar recomendações imediatas.
              </p>
            </div>
            <button
              onClick={runAnalysis}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-black shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-400 active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Analisando Empresa...' : 'Gerar Novo Diagnóstico'}</span>
            </button>
          </div>

          {/* Results Display */}
          {analysis ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Summary */}
              <div className="rounded-2xl border border-zinc-800 bg-[#121215] p-6 md:col-span-2 shadow-xl">
                <div className="mb-3 flex items-center gap-2 text-amber-400">
                  <ShieldCheck className="h-5 w-5" />
                  <h3 className="text-base font-bold text-white">Resumo Executivo da IA</h3>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">{analysis.summary}</p>
              </div>

              {/* Profit Margin Analysis */}
              <div className="rounded-2xl border border-zinc-800 bg-[#121215] p-6 shadow-xl">
                <div className="mb-3 flex items-center gap-2 text-emerald-400">
                  <DollarSign className="h-5 w-5" />
                  <h3 className="text-sm font-bold text-white">Análise de Margem e Precificação</h3>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">{analysis.profitMarginAnalysis}</p>
              </div>

              {/* Restock Forecast */}
              <div className="rounded-2xl border border-zinc-800 bg-[#121215] p-6 shadow-xl">
                <div className="mb-3 flex items-center gap-2 text-amber-400">
                  <Package className="h-5 w-5" />
                  <h3 className="text-sm font-bold text-white">Previsão de Reposição URGENTE</h3>
                </div>
                <ul className="space-y-1.5 text-xs text-zinc-300">
                  {analysis.replenishmentForecast?.map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Instagram Suggestions */}
              <div className="rounded-2xl border border-zinc-800 bg-[#121215] p-6 shadow-xl">
                <div className="mb-3 flex items-center gap-2 text-pink-400">
                  <Instagram className="h-5 w-5" />
                  <h3 className="text-sm font-bold text-white">Ideias de Campanhas Instagram</h3>
                </div>
                <ul className="space-y-2 text-xs text-zinc-300">
                  {analysis.instagramCampaigns?.map((camp, i) => (
                    <li key={i} className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-2.5">
                      {camp}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Strategic Insights */}
              <div className="rounded-2xl border border-zinc-800 bg-[#121215] p-6 shadow-xl">
                <div className="mb-3 flex items-center gap-2 text-blue-400">
                  <Lightbulb className="h-5 w-5" />
                  <h3 className="text-sm font-bold text-white">Insights Estratégicos de Crescimento</h3>
                </div>
                <ul className="space-y-2 text-xs text-zinc-300">
                  {analysis.strategicInsights?.map((ins, i) => (
                    <li key={i} className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-2.5">
                      {ins}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-zinc-800 bg-[#121215] p-12 text-center">
              <Sparkles className="mx-auto h-12 w-12 text-amber-500/40" />
              <h3 className="mt-4 text-base font-bold text-white">Nenhum diagnóstico recente gerado</h3>
              <p className="mt-1 text-xs text-zinc-400">
                Clique no botão acima para iniciar a leitura de dados do ERP pela IA.
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Chat Assistant View */
        <div className="flex h-[550px] flex-col rounded-2xl border border-zinc-800 bg-[#121215] shadow-2xl overflow-hidden">
          {/* Chat Messages */}
          <div className="flex-1 space-y-4 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-zinc-800">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                    msg.sender === 'user' ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {msg.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                <div
                  className={`max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-amber-500 text-black font-medium'
                      : 'border border-zinc-800 bg-zinc-900 text-zinc-200'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex items-center gap-2 text-xs text-amber-400 animate-pulse">
                <Bot className="h-4 w-4" />
                <span>Hermano’s AI está digitando...</span>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendMessage} className="border-t border-zinc-800 bg-zinc-900/80 p-4">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Pergunte à IA sobre estoque, margens, lançamentos..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 py-3 px-4 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <button
                type="submit"
                disabled={chatLoading || !inputMessage.trim()}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-black font-bold transition-all hover:bg-amber-400 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
