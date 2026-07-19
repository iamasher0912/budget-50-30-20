import { formatMoney } from '../lib/format';
import { Settings } from '../lib/types';
import { BUCKETS } from '../lib/types';
import { FinanceSummary } from '../lib/useFinanceStats';

interface Props {
  summary: FinanceSummary;
  settings: Settings;
}

export function Budget503020({ summary, settings }: Props) {
  const income = settings.monthly_income > 0 ? settings.monthly_income : summary.monthIncome;
  const buckets = [
    { ...BUCKETS[0], stats: summary.needs, pct: settings.needs_pct },
    { ...BUCKETS[1], stats: summary.wants, pct: settings.wants_pct },
    { ...BUCKETS[2], stats: summary.savings, pct: settings.savings_pct },
  ];

  return (
    <div className="card p-6 animate-slide-up">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-display text-lg font-bold text-ink-900">Regla 50/30/20</h2>
          <p className="text-sm text-ink-500 mt-0.5">
            Distribución recomendada de tus ingresos mensuales
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
            Ingreso base
          </p>
          <p className="font-display text-xl font-bold text-ink-900">
            {formatMoney(income, settings.currency)}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex h-3 w-full overflow-hidden rounded-full bg-ink-100">
          {buckets.map((b) => (
            <div
              key={b.id}
              className="h-full transition-all duration-700 ease-out"
              style={{
                width: `${b.pct}%`,
                backgroundColor:
                  b.id === 'needs' ? '#3b82f6' : b.id === 'wants' ? '#f59e0b' : '#10b981',
              }}
            />
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[11px] font-medium text-ink-400">
          {buckets.map((b) => (
            <span key={b.id}>{b.pct}% {b.label}</span>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {buckets.map((b) => (
          <div
            key={b.id}
            className={`rounded-xl2 border p-4 transition-all duration-300 hover:shadow-card ${
              b.stats.over
                ? 'border-danger/40 bg-danger-soft/40'
                : 'border-ink-100 bg-ink-50/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`pill ${b.soft} ${b.color}`}>
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{
                    backgroundColor:
                      b.id === 'needs' ? '#3b82f6' : b.id === 'wants' ? '#f59e0b' : '#10b981',
                  }}
                />
                {b.label}
              </span>
              <span className="text-xs font-semibold text-ink-400">{b.pct}%</span>
            </div>

            <p className="mt-3 text-xs text-ink-500">{b.description}</p>

            <div className="mt-3">
              <p className="text-xs font-medium text-ink-400">Presupuesto</p>
              <p className="font-display text-lg font-bold text-ink-900">
                {formatMoney(b.stats.budget, settings.currency)}
              </p>
            </div>

            <div className="mt-2">
              <p className="text-xs font-medium text-ink-400">Gastado</p>
              <p
                className={`font-display text-lg font-bold ${
                  b.stats.over ? 'text-danger' : 'text-ink-900'
                }`}
              >
                {formatMoney(b.stats.spent, settings.currency)}
              </p>
            </div>

            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-ink-100">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${
                  b.stats.over ? 'bg-danger' : b.id === 'needs' ? 'bg-needs' : b.id === 'wants' ? 'bg-wants' : 'bg-savings'
                }`}
                style={{ width: `${Math.min(b.stats.pctOfBudget, 100)}%` }}
              />
            </div>

            <div className="mt-2 flex items-center justify-between text-xs">
              <span className={b.stats.over ? 'text-danger font-semibold' : 'text-ink-500'}>
                {b.stats.over
                  ? `Excedido por ${formatMoney(b.stats.spent - b.stats.budget, settings.currency)}`
                  : `Quedan ${formatMoney(b.stats.remaining, settings.currency)}`}
              </span>
              <span className="font-medium text-ink-400">
                {b.stats.pctOfBudget.toFixed(0)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
