import { useMemo } from 'react';
import { formatMoney } from '../lib/format';
import { Settings } from '../lib/types';
import { FinanceSummary } from '../lib/useFinanceStats';

interface Props {
  summary: FinanceSummary;
  settings: Settings;
}

const BUCKET_COLOR: Record<string, string> = {
  needs: '#3b82f6',
  wants: '#f59e0b',
  savings: '#10b981',
  null: '#94a3b8',
};

export function CategoryDonut({ summary, settings }: Props) {
  const total = useMemo(
    () => summary.byCategory.reduce((a, b) => a + b.amount, 0),
    [summary.byCategory]
  );

  const segments = useMemo(() => {
    if (total <= 0) return [];
    let acc = 0;
    return summary.byCategory.slice(0, 8).map((c) => {
      const frac = c.amount / total;
      const seg = {
        ...c,
        start: acc,
        end: acc + frac,
        color: BUCKET_COLOR[c.bucket ?? 'null'],
      };
      acc += frac;
      return seg;
    });
  }, [summary.byCategory, total]);

  const r = 56;
  const c = 2 * Math.PI * r;
  const top = summary.byCategory.slice(0, 6);

  return (
    <div className="card p-6 animate-slide-up">
      <h2 className="font-display text-lg font-bold text-ink-900">Gastos por categoría</h2>
      <p className="text-sm text-ink-500 mt-0.5">Distribución del gasto en el mes actual</p>

      <div className="mt-5 flex flex-col items-center gap-6 sm:flex-row sm:items-center">
        <div className="relative shrink-0">
          <svg width="160" height="160" viewBox="0 0 160 160" className="-rotate-90">
            <circle cx="80" cy="80" r={r} fill="none" stroke="#eceef2" strokeWidth="18" />
            {segments.map((s, i) => (
              <circle
                key={i}
                cx="80"
                cy="80"
                r={r}
                fill="none"
                stroke={s.color}
                strokeWidth="18"
                strokeDasharray={`${(s.end - s.start) * c} ${c}`}
                strokeDashoffset={-s.start * c}
                className="transition-all duration-700 ease-out"
              />
            ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center rotate-0">
            <span className="text-xs font-medium text-ink-400">Total</span>
            <span className="font-display text-lg font-bold text-ink-900">
              {formatMoney(total, settings.currency, { compact: true })}
            </span>
          </div>
        </div>

        <div className="flex-1 w-full space-y-2">
          {top.length === 0 && (
            <p className="text-sm text-ink-400">Sin gastos este mes todavía.</p>
          )}
          {top.map((c) => (
            <div key={c.category} className="flex items-center gap-3">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: BUCKET_COLOR[c.bucket ?? 'null'] }}
              />
              <span className="flex-1 truncate text-sm font-medium text-ink-700">
                {c.category}
              </span>
              <span className="text-sm font-semibold text-ink-900">
                {formatMoney(c.amount, settings.currency)}
              </span>
              <span className="w-10 text-right text-xs text-ink-400">
                {total > 0 ? ((c.amount / total) * 100).toFixed(0) : 0}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
