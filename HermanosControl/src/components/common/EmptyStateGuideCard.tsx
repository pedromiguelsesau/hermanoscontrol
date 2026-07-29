import React from 'react';
import { Lightbulb, Plus, Sparkles, BookOpen } from 'lucide-react';

interface EmptyStateGuideCardProps {
  title: string;
  description: string;
  exampleTitle: string;
  exampleContent: string;
  actionText: string;
  onAction: () => void;
  onFillExample?: () => void;
  onOpenGuide?: () => void;
}

export const EmptyStateGuideCard: React.FC<EmptyStateGuideCardProps> = ({
  title,
  description,
  exampleTitle,
  exampleContent,
  actionText,
  onAction,
  onFillExample,
  onOpenGuide,
}) => {
  return (
    <div className="rounded-2xl border border-dashed border-amber-500/40 bg-[#121215] p-8 text-center space-y-5 animate-in fade-in duration-300">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-lg shadow-amber-500/10">
        <Sparkles className="h-7 w-7" />
      </div>

      <div className="max-w-md mx-auto space-y-1">
        <h3 className="text-base font-bold text-white">{title}</h3>
        <p className="text-xs text-zinc-400 leading-relaxed">{description}</p>
      </div>

      {/* Example Box */}
      <div className="max-w-lg mx-auto rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 text-left space-y-2 text-xs">
        <div className="flex items-center gap-2 font-bold text-amber-300">
          <Lightbulb className="h-4 w-4 text-amber-400 shrink-0" />
          <span>{exampleTitle}</span>
        </div>
        <p className="text-zinc-300 font-mono text-[11px] whitespace-pre-line leading-relaxed bg-black/50 p-3 rounded-lg border border-zinc-800/60">
          {exampleContent}
        </p>
      </div>

      {/* Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        {onFillExample && (
          <button
            onClick={onFillExample}
            className="flex items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2.5 text-xs font-bold text-amber-400 hover:bg-amber-500/20 transition-all"
          >
            <Sparkles className="h-4 w-4" />
            Preencher com este Exemplo Prático
          </button>
        )}

        <button
          onClick={onAction}
          className="flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-black hover:bg-amber-400 shadow-lg shadow-amber-500/20 transition-all"
        >
          <Plus className="h-4 w-4" />
          {actionText}
        </button>

        {onOpenGuide && (
          <button
            onClick={onOpenGuide}
            className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 transition-all"
          >
            <BookOpen className="h-4 w-4 text-amber-400" />
            Ver Guia Completo Passo a Passo
          </button>
        )}
      </div>
    </div>
  );
};
