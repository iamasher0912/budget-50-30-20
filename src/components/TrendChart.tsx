import { useMemo } from 'react';
import { formatMoney, monthLabel } from '../lib/format';
import { Settings } from '../lib/types';
import { FinanceSummary } from '../lib/useFinanceStats';

interface Props {
  summary: FinanceSummary;
  settings: Settings;
}

export function TrendChart({ summary, settings }: Props) {
  const data = summary.last6Months;
  const max = useMemo(
    () => Math.max(1, ...data.map((d) => Math.max(d.income, d.expense))),
    [data]
  );

  return (
    <div className="card p-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-bold text-ink-900">Tendencia</h2>
          <p className="text-sm text-ink-500 mt-0.5">Ingresos vs. gastos · últimos 6 meses</p>
        </div>
        <div className="flex items-center gap-3 text-xs font-medium">
          <span className="flex items-center gap-1.5 text-ink-600">
            <span className="h-2 w-2 rounded-full bg-brand-500" /> Ingresos
          </span>
          <span className="flex items-center gap-1.5 text-ink-600">
            <span className="h-2 w-2 rounded-full bg-ink-300" /> Gastos
          </span>
        </div>
      </div>

      <div className="mt-6 flex items-end justify-between gap-3 sm:gap-6 h-44">
        {data.map((d) => {
          const incH = (d.income / max) * 100;
          const expH = (d.expense / max) * 100;
          return (
            <div key={d.key} className="group flex flex-1 flex-col items-center gap-2">
              <div className="flex w-full items-end justify-center gap-1.5 h-32">
                <div
                  className="relative w-1/2 max-w-[18px] rounded-t-md bg-brand-400/80 transition-all duration-500 ease-out group-hover:bg-brand-500"
                  style={{ height: `${incH}%` }}
                  title={`Ingresos: ${formatMoney(d.income, settings.currency)}`}
                >
                  <span className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-ink-900 px-1.5 py-0.5 text-[10px] font-semibold text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    {formatMoney(d.income, settings.currency, { compact: true })}
                  </span>
                </div>
                <div
                  className="w-1/2 max-w-[18px] rounded-t-md bg-ink-300 transition-all duration-500 ease-out group-hover:bg-ink-400"
                  style={{ height: `${expH}%` }}
                  title={`Gastos: ${formatMoney(d.expense, settings.currency)}`}
                />
              </div>
              <span className="text-[11px] font-medium capitalize text-ink-400">
                {monthLabel(d.key).split(' ')[0]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
