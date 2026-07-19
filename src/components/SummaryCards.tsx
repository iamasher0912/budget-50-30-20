import { TrendingUp, TrendingDown, Wallet, PiggyBank, AlertTriangle } from 'lucide-react';
import { formatMoney } from '../lib/format';
import { Settings } from '../lib/types';
import { FinanceSummary } from '../lib/useFinanceStats';

interface Props {
  summary: FinanceSummary;
  settings: Settings;
}

export function SummaryCards({ summary, settings }: Props) {
  const overBudget = summary.needs.over || summary.wants.over || summary.savings.over;
  const cards = [
    {
      label: 'Ingreso del mes',
      value: formatMoney(summary.monthIncome, settings.currency),
      icon: TrendingUp,
      tone: 'brand',
      sub: `${formatMoney(summary.totalIncome, settings.currency, { compact: true })} total`,
    },
    {
      label: 'Gasto del mes',
      value: formatMoney(summary.monthExpense, settings.currency),
      icon: TrendingDown,
      tone: 'ink',
      sub: `${formatMoney(summary.totalExpense, settings.currency, { compact: true })} total`,
    },
    {
      label: 'Balance del mes',
      value: formatMoney(summary.monthBalance, settings.currency),
      icon: Wallet,
      tone: summary.monthBalance >= 0 ? 'brand' : 'danger',
      sub: `Tasa de ahorro ${summary.savingsRate.toFixed(0)}%`,
    },
    {
      label: 'Balance global',
      value: formatMoney(summary.balance, settings.currency),
      icon: PiggyBank,
      tone: summary.balance >= 0 ? 'brand' : 'danger',
      sub: 'Acumulado histórico',
    },
  ] as const;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div
              key={c.label}
              className="card card-hover p-5 animate-slide-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                  {c.label}
                </span>
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    c.tone === 'brand'
                      ? 'bg-brand-100 text-brand-600'
                      : c.tone === 'danger'
                      ? 'bg-danger-soft text-danger'
                      : 'bg-ink-100 text-ink-500'
                  }`}
                >
                  <Icon size={16} />
                </span>
              </div>
              <p className="mt-3 font-display text-2xl font-bold text-ink-900 tracking-tight">
                {c.value}
              </p>
              <p className="mt-1 text-xs text-ink-400">{c.sub}</p>
            </div>
          );
        })}
      </div>

      {overBudget && (
        <div className="flex items-start gap-3 rounded-xl2 border border-danger/30 bg-danger-soft/50 px-4 py-3 animate-fade-in">
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-danger text-white">
            <AlertTriangle size={15} />
          </span>
          <div className="text-sm">
            <p className="font-semibold text-danger">Has superado un presupuesto</p>
            <p className="text-ink-600">
              Revisa las categorías marcadas en rojo en la sección 50/30/20 para ajustar tus gastos.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
