import React from 'react';
import { cn } from '@/lib/utils';

interface Question {
  id: string;
  text: string;
  type: 'choice' | 'numeric' | 'ordering' | 'concept' | 'design';
  choices?: string[];
  category?: string;
  difficulty?: number;
  unit?: string;
  tolerance?: number;
  items?: string[];
}

interface QuestionCardProps {
  question: Question;
  answer?: unknown;
  onAnswer: (questionId: string, answer: unknown) => void;
  showSolution?: boolean;
  correctAnswer?: unknown;
  className?: string;
}

export function QuestionCard({
  question,
  answer,
  onAnswer,
  showSolution = false,
  correctAnswer,
  className,
}: QuestionCardProps) {
  const difficulty = question.difficulty || 0;

  return (
    <div className={cn('card p-6 animate-fade-in', className)}>
      <div className="flex items-center gap-2 mb-4">
        <span className="badge badge-calc">
          {question.type === 'choice' ? 'QCM' : question.type === 'numeric' ? 'Calcul' : question.type === 'concept' ? 'Concept' : question.type === 'design' ? 'Design' : 'Ordre'}
        </span>
        <span className="text-caption text-text-muted">{question.category || 'Général'}</span>
        {difficulty > 0 && (
          <span className="ml-auto badge badge-calc">
            {Array.from({ length: difficulty }, () => '★').join('')}
          </span>
        )}
      </div>

      <div className="prose prose-invert max-w-none mb-6">
        <p className="text-text">{question.text || 'Question en chargement...'}</p>
      </div>

      <div className="space-y-4">
        {question.type === 'numeric' && (
          <div>
            <label className="label">Votre réponse</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={(answer as string) ?? ''}
                onChange={(e) => onAnswer(question.id, e.target.value)}
                className="input w-64 font-mono"
                placeholder={question.unit || 'Réponse numérique'}
              />
              <span className="text-text-muted">{question.unit || ''}</span>
            </div>
            {question.tolerance && (
              <p className="text-caption text-text-muted mt-1">
                Tolérance: ±{question.tolerance} {question.unit || ''}
              </p>
            )}
          </div>
        )}

        {question.type === 'choice' && question.choices && (
          <div className="space-y-2">
            {question.choices.map((choice: string, ci: number) => (
              <label
                key={ci}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors border',
                  answer === ci
                    ? 'bg-accent/10 border-accent/30'
                    : 'bg-card-secondary border-border hover:bg-card'
                )}
              >
                <input
                  type="radio"
                  name={question.id}
                  value={ci}
                  checked={answer === ci}
                  onChange={() => onAnswer(question.id, ci)}
                  className="w-4 h-4 text-audio border-border focus:ring-audio"
                />
                <span className="text-text">{choice}</span>
              </label>
            ))}
          </div>
        )}

        {question.type === 'ordering' && question.items && (
          <div className="space-y-2">
            <p className="text-text-muted text-sm mb-2">Glissez pour ordonner (ou cliquez sur les flèches)</p>
            {((answer as number[]) || question.items.map((_: any, i: number) => i)).map((itemIndex: number, displayIndex: number) => (
              <div key={displayIndex} className="flex items-center gap-3 p-3 bg-card-secondary rounded-xl">
                <span className="flex-1 font-medium text-text">{question.items?.[itemIndex]}</span>
                <span className="w-8 text-center font-mono text-accent">{displayIndex + 1}</span>
              </div>
            ))}
          </div>
        )}

        {question.type === 'concept' && (
          <div>
            <label className="label">Votre réponse (texte libre)</label>
            <textarea
              value={(answer as string) ?? ''}
              onChange={(e) => onAnswer(question.id, e.target.value)}
              className="input min-h-[120px] font-mono text-sm"
              placeholder="Expliquez votre raisonnement..."
              rows={6}
            />
          </div>
        )}

        {question.type === 'design' && (
          <div className="space-y-4">
            <p className="text-text-muted">Répondez structuré : 1) Codecs 2) Protocoles 3) Transport 4) Buffer 5) QoS 6) Chiffrement 7) Bande passante 8) Architecture</p>
            <textarea
              value={(answer as string) ?? ''}
              onChange={(e) => onAnswer(question.id, e.target.value)}
              className="input min-h-[200px] font-mono text-sm"
              placeholder="Votre proposition d'architecture..."
              rows={12}
            />
          </div>
        )}
      </div>

      {showSolution && correctAnswer !== undefined && (
        <div className="mt-4 p-3 bg-ok/5 border border-ok/20 rounded-xl">
          <p className="text-sm text-text-muted">
            Réponse correcte: <code className="font-mono text-ok">{String(correctAnswer)}</code>
          </p>
        </div>
      )}
    </div>
  );
}
