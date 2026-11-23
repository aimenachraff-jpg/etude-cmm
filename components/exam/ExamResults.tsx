import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { formatDuration } from '@/lib/utils';
import { CircularProgress } from '@/components/layout/ProgressBar';

interface ExamResultsProps {
  preset: any;
  score: number;
  maxScore: number;
  percentage: number;
  breakdown: Record<string, number>;
  examConfig: any;
  answers: Record<string, unknown>;
  startTime: number | null;
  endTime: number | null;
  onRestart: () => void;
  onNewExam: () => void;
  className?: string;
}

export function ExamResults({
  preset,
  score,
  maxScore,
  percentage,
  breakdown,
  examConfig,
  answers,
  startTime,
  endTime,
  onRestart,
  onNewExam,
  className,
}: ExamResultsProps) {
  const duration = endTime && startTime ? formatDuration((endTime - startTime) / 1000) : '—';
  const passed = percentage >= 60;

  return (
    <div className={cn('min-h-screen bg-bg', className)}>
      <main className="container py-6 sm:py-10">
        <div className="mb-8 text-center">
          <div
            className={cn(
              'inline-flex items-center gap-3 px-6 py-3 rounded-2xl font-bold text-lg',
              passed ? 'bg-ok/20 text-ok border border-ok/30' : 'bg-err/20 text-err border border-err/30'
            )}
          >
            {passed ? '✅ RÉUSSI' : '❌ ÉCHOUÉ'}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-text mt-4">{preset?.label || 'Examen'}</h1>
          <p className="text-text-muted mt-1">{preset?.description || ''}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="card p-6 text-center">
            <CircularProgress value={percentage} size={100} strokeWidth={8} className={percentage >= 60 ? 'text-ok' : 'text-err'}>
              <span className="text-2xl font-bold font-mono tabular-nums">{percentage}%</span>
            </CircularProgress>
            <p className="text-caption text-text-muted mt-2">Score global</p>
          </div>
          <div className="card p-6 text-center">
            <p className="text-3xl font-bold font-mono tabular-nums text-text">{score.toFixed(1)} / {maxScore}</p>
            <p className="text-caption text-text-muted mt-1">Points bruts</p>
          </div>
          <div className="card p-6 text-center">
            <p className="text-3xl font-bold font-mono tabular-nums text-text">{duration}</p>
            <p className="text-caption text-text-muted mt-1">Durée</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="card p-6">
            <h3 className="font-semibold text-text mb-4">Détail par compétence</h3>
            <div className="space-y-3">
              {Object.entries(breakdown).map(([skill, points]) => (
                <div key={skill} className="flex items-center justify-between p-3 bg-card-secondary rounded-xl">
                  <span className="font-medium text-text capitalize">{skill.replace(/-/g, ' ')}</span>
                  <span className="font-mono font-bold tabular-nums text-accent">
                    {points > 0 ? '+' : ''}
                    {points.toFixed(1)} pts
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="card p-6">
            <h3 className="font-semibold text-text mb-4">Analyse des erreurs</h3>
            <div className="space-y-2">
              {Object.entries(answers)
                .filter(([qId, ans]) => {
                  const q = examConfig?.questions?.find((qq: any) => qq.id === qId);
                  if (!q || ans === undefined) return false;
                  const isCorrect =
                    q.type === 'choice'
                      ? ans === q.correctIndex
                      : q.type === 'numeric'
                      ? Math.abs(Number(ans) - Number(q.correctAnswer)) < (q.tolerance || 0.01)
                      : false;
                  return !isCorrect;
                })
                .slice(0, 10)
                .map(([qId, ans]) => {
                  const q = examConfig?.questions?.find((qq: any) => qq.id === qId);
                  return (
                    <div key={qId} className="p-3 bg-err/5 border border-err/20 rounded-xl">
                      <p className="font-medium text-text">{q?.text?.slice(0, 80)}…</p>
                      <p className="text-sm text-text-muted">
                        Votre réponse: <code className="font-mono">{String(ans)}</code> | Correct:{' '}
                        <code className="font-mono">{q?.correctAnswer ?? q?.correctIndex}</code>
                      </p>
                    </div>
                  );
                })}
              {Object.entries(answers).filter(([qId, ans]) => {
                const q = examConfig?.questions?.find((qq: any) => qq.id === qId);
                if (!q || ans === undefined) return false;
                const isCorrect =
                  q.type === 'choice'
                    ? ans === q.correctIndex
                    : q.type === 'numeric'
                    ? Math.abs(Number(ans) - Number(q.correctAnswer)) < (q.tolerance || 0.01)
                    : false;
                return !isCorrect;
              }).length === 0 && <p className="text-text-muted text-center py-8">Aucune erreur ! 🎉</p>}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 justify-center mt-8">
          <button onClick={onRestart} className="btn btn-primary text-lg px-8 py-3">
            🔁 Refaire cet examen
          </button>
          <button onClick={onNewExam} className="btn btn-secondary text-lg px-8 py-3">
            🎲 Nouvel examen
          </button>
          <button onClick={() => window.print()} className="btn btn-ghost text-lg px-8 py-3">
            🖨️ Imprimer / PDF
          </button>
          <Link href="/dashboard" className="btn btn-ghost text-lg px-8 py-3">
            🏠 Tableau de bord
          </Link>
        </div>
      </main>
    </div>
  );
}
