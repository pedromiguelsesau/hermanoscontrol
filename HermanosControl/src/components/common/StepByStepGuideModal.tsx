import React, { useState } from 'react';
import { BookOpen, CheckCircle2, ChevronRight, ChevronLeft, Package, DollarSign, ShoppingCart, Users, Globe, Settings, ArrowRight, X, Sparkles, Lightbulb, Tag, Store } from 'lucide-react';
import { NavigationTab } from '../../types';

interface StepByStepGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: NavigationTab) => void;
  onOpenResetModal: () => void;
}

export const StepByStepGuideModal: React.FC<StepByStepGuideModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onOpenResetModal
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      id: 'step-0',
      title: 'Passo 0: Zerar os Dados de Teste',
      icon: Sparkles,
      tag: 'PRIMEIRO PASSO',
      desc: 'Como o site possui dados e camisetas fictícias de demonstração, o primeiro passo é zerar o sistema para poder inserir suas peças e estoque reais.',
      example: {
        title: '💡 Exemplo Prático',
        content: 'Clique no botão "Zerar Sistema" para apagar camisetas de teste e zerar o caixa para R$ 0,00. Sua logo e dados da loja continuarão salvos!'
      },
      actionText: 'Zerar Sistema Agora',
      actionType: 'RESET'
    },
    {
      id: 'step-1',
      title: 'Passo 1: Cadastrar Suas Camisetas e Roupas',
      icon: Package,
      tag: 'CATÁLOGO & PRODUTOS',
      desc: 'Cadastre suas camisetas, moletons, calças e acessórios informando preço de custo, preço de venda e tamanho.',
      example: {
        title: '👕 Exemplo Real de Cadastro de Camiseta',
        content: '• Nome: Camiseta Oversized Streetwear Preta\n• Categoria: Camisetas\n• Cor: Preta | Tamanho: M\n• Preço de Custo (fornecedor): R$ 35,00\n• Preço de Venda (cliente): R$ 89,90\n• Estoque Inicial: 10 unidades'
      },
      actionText: 'Ir para Módulo de Produtos',
      actionTab: 'products' as NavigationTab
    },
    {
      id: 'step-2',
      title: 'Passo 2: Controlar Entrada de Estoque & Compras',
      icon: ShoppingCart,
      tag: 'ESTOQUE & LOUTES',
      desc: 'Sempre que comprar roupas do seu fornecedor ou receber uma nova coleção, dê entrada no estoque para atualizar a quantidade disponível.',
      example: {
        title: '📦 Exemplo de Entrada de Lote',
        content: '• Compra: Lote Coleção Inverno\n• Fornecedor: Malharia Hermano\n• Quantidade: 50 camisetas Oversized\n• Custo Total do Lote: R$ 1.750,00\n• O sistema ajusta o estoque e calcula o custo médio automaticamente!'
      },
      actionText: 'Ir para Gerenciar Estoque',
      actionTab: 'stock' as NavigationTab
    },
    {
      id: 'step-3',
      title: 'Passo 3: Registrar Suas Vendas (Balcão / WhatsApp)',
      icon: DollarSign,
      tag: 'VENDAS & PDV',
      desc: 'Ao vender uma peça no balcão da loja, pelo Instagram ou WhatsApp, registre a venda para dar baixa automática no estoque e somar no caixa.',
      example: {
        title: '🛒 Exemplo de Registro de Venda',
        content: '• Cliente: Pedro Silva (ou Cliente Balcão)\n• Item: 1x Camiseta Oversized Preta M (R$ 89,90)\n• Pagamento: Pix / Cartão / Dinheiro\n• Desconto: R$ 5,00 (Opcional)\n• O sistema gera o comprovante com a logo Hermano’s!'
      },
      actionText: 'Ir para Registrar Vendas',
      actionTab: 'sales' as NavigationTab
    },
    {
      id: 'step-4',
      title: 'Passo 4: Cadastrar Clientes & Fidelidade',
      icon: Users,
      tag: 'CLIENTES',
      desc: 'Mantenha os contatos de seus clientes salvos com WhatsApp, endereço e histórico de compras para campanhas de marketing.',
      example: {
        title: '👤 Exemplo de Cliente Salvo',
        content: '• Nome: Lucas Almeida\n• Telefone: (11) 98888-7777\n• Cidade: São Paulo / SP\n• Observação: Prefere camisetas tamanho G Oversized e compra todo mês.'
      },
      actionText: 'Ir para Base de Clientes',
      actionTab: 'customers' as NavigationTab
    },
    {
      id: 'step-5',
      title: 'Passo 5: Lançar Despesas e Custos da Loja',
      icon: Store,
      tag: 'FINANCEIRO & DESPESAS',
      desc: 'Registre as despesas operacionais da loja (embalagens, frete, aluguel, luz, sacolas personalizadas) para saber seu Lucro Real exato.',
      example: {
        title: '💸 Exemplo de Lançamento de Despesa',
        content: '• Descrição: 100 Sacolas Personalizadas Hermano’s\n• Categoria: Embalagens & Sacolas\n• Valor: R$ 180,00\n• Forma de Pagamento: Pix\n• O caixa abate o valor automaticamente!'
      },
      actionText: 'Ir para Despesas',
      actionTab: 'expenses' as NavigationTab
    },
    {
      id: 'step-6',
      title: 'Passo 6: Personalizar o Site da Loja (Catálogo Online)',
      icon: Globe,
      tag: 'SITE ADMIN',
      desc: 'Configure o nome do site, número do WhatsApp para receber pedidos, links das redes sociais e banners da capa da loja online.',
      example: {
        title: '🌐 Exemplo de Configuração do Site',
        content: '• Título da Loja: Hermano’s Outfit — Do Básico ao Brabo\n• WhatsApp de Atendimento: (11) 99999-0000\n• Instagram: @hermanosconceito\n• Banner Principal: "Nova Coleção Oversized — Frete Grátis acima de R$ 200"'
      },
      actionText: 'Ir para Admin do Site',
      actionTab: 'site_admin' as NavigationTab
    },
    {
      id: 'step-7',
      title: 'Passo 7: Definir Metas & Acompanhar Relatórios',
      icon: Settings,
      tag: 'METAS & DESEMPENHO',
      desc: 'Defina a meta de faturamento mensal e acompanhe os gráficos de desempenho em tempo real no Dashboard.',
      example: {
        title: '🎯 Exemplo de Meta Mensal',
        content: '• Meta de Julho: R$ 15.000,00\n• Acompanhamento: O sistema calcula a % atingida conforme as vendas são lançadas no dia a dia!'
      },
      actionText: 'Ver Dashboard Geral',
      actionTab: 'dashboard' as NavigationTab
    }
  ];

  const current = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl border border-zinc-800 bg-[#121215] p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Guia Prático da Loja — Hermano’s
                <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] text-amber-400 font-extrabold border border-amber-500/30">
                  {currentStep + 1} de {steps.length}
                </span>
              </h3>
              <p className="text-xs text-zinc-400">Aprenda a configurar e mexer em cada passo da sua loja do zero.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {steps.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrentStep(idx)}
              className={`h-2 flex-1 rounded-full transition-all ${
                idx === currentStep
                  ? 'bg-amber-500 shadow-sm shadow-amber-500/50'
                  : idx < currentStep
                  ? 'bg-emerald-500'
                  : 'bg-zinc-800'
              }`}
              title={s.title}
            />
          ))}
        </div>

        {/* Current Step Content */}
        <div className="space-y-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5">
          <div className="flex items-center justify-between">
            <span className="rounded-lg bg-amber-500/10 px-2.5 py-1 text-[11px] font-extrabold text-amber-400 border border-amber-500/20 uppercase tracking-wider">
              {current.tag}
            </span>
            <span className="text-xs text-zinc-400 font-semibold">Passo {currentStep + 1}</span>
          </div>

          <h4 className="text-lg font-black text-white flex items-center gap-2">
            <current.icon className="h-6 w-6 text-amber-400" />
            {current.title}
          </h4>

          <p className="text-xs text-zinc-300 leading-relaxed">{current.desc}</p>

          {/* Example Card */}
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-300">
              <Lightbulb className="h-4 w-4 text-amber-400 shrink-0" />
              <span>{current.example.title}</span>
            </div>
            <p className="text-zinc-300 font-mono text-[11px] whitespace-pre-line leading-relaxed bg-black/40 p-3 rounded-lg border border-zinc-800/80">
              {current.example.content}
            </p>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          {/* Action Button for Step */}
          {current.actionType === 'RESET' ? (
            <button
              onClick={() => {
                onClose();
                onOpenResetModal();
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-red-500 shadow-lg shadow-red-600/20"
            >
              <Sparkles className="h-4 w-4" />
              Zerar Todos os Dados Fictícios
            </button>
          ) : (
            <button
              onClick={() => {
                if (current.actionTab) {
                  onNavigate(current.actionTab);
                  onClose();
                }
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-black hover:bg-amber-400 shadow-lg shadow-amber-500/20"
            >
              <span>{current.actionText}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          )}

          {/* Nav Controls */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              disabled={currentStep === 0}
              onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
              className="flex items-center gap-1 rounded-xl border border-zinc-800 px-3.5 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" /> Anterior
            </button>

            {currentStep < steps.length - 1 ? (
              <button
                onClick={() => setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1))}
                className="flex items-center gap-1 rounded-xl bg-zinc-800 px-4 py-2 text-xs font-bold text-white hover:bg-zinc-700"
              >
                Próximo <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="flex items-center gap-1 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500"
              >
                Entendi, Começar! <CheckCircle2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
