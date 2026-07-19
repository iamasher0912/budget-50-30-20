import { useMemo, useState } from 'react';
import { Pencil, Search, ArrowDownLeft, ArrowUpRight, Inbox } from 'lucide-react';
import { Settings, Transaction } from '../lib/types';
import { BUCKETS } from '../lib/types';
import { formatDate, formatMoney } from '../lib/format';

interface Props {
  transactions: Transaction[];
  settings: Settings;
  onEdit: (t: Transaction) => void;
  limit?: number;
  compact?: boolean;
}

export function TransactionList({ transactions, settings, onEdit, limit, compact }: Props) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');

  const filtered = useMemo(() => {
    let list = transactions;
    if (filter !== 'all') list = list.filter((t) => t.type === filter);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (t) =>
          t.category.toLowerCase().includes(q) ||
          (t.description ?? '').toLowerCase().includes(q)
      );
    }
    return limit ? list.slice(0, limit) : list;
  }, [transactions, filter, query, limit]);

  const bucketMeta = (id: string | null) => BUCKETS.find((b) => b.id === id);

  return (
    <div className="card p-6 animate-slide-up">
      {!compact && (
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="font-display text-lg font-bold text-ink-900">Movimientos</h2>
            <p className="text-sm text-ink-500 mt-0.5">{transactions.length} en total</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar…"
                className="input pl-9 py-2 w-40 sm:w-56"
              />
            </div>
            <div className="grid grid-cols-3 gap-1 rounded-xl bg-ink-100 p-1">
              {(['all', 'income', 'expense'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    filter === f ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500'
                  }`}
                >
                  {f === 'all' ? 'Todos' : f === 'income' ? 'Ingresos' : 'Gastos'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className={`mt-4 ${compact ? '' : 'max-h-[460px] overflow-y-auto no-scrollbar'}`}>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ink-100 text-ink-400">
              <Inbox size={22} />
            </div>
            <p className="mt-3 text-sm font-medium text-ink-600">Sin movimientos</p>
            <p className="text-xs text-ink-400">
              {query || filter !== 'all' ? 'Prueba con otros filtros.' : 'Añade tu primer movimiento.'}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-ink-100">
            {filtered.map((t) => {
              const isIncome = t.type === 'income';
              const bm = bucketMeta(t.bucket);
              return (
                <li key={t.id}>
                  <button
                    onClick={() => onEdit(t)}
                    className="group flex w-full items-center gap-3 py-3 text-left transition-colors hover:bg-ink-50/70 -mx-2 px-2 rounded-lg"
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                        isIncome ? 'bg-brand-100 text-brand-600' : 'bg-ink-100 text-ink-500'
                      }`}
                    >
                      {isIncome ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-semibold text-ink-900">
                          {t.category}
                        </span>
                        {bm && (
                          <span className={`pill ${bm.soft} ${bm.color} !px-2 !py-0.5 text-[10px]`}>
                            {bm.label}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-ink-400">
                        <span>{formatDate(t.date)}</span>
                        {t.description && (
                          <>
                            <span>·</span>
                            <span className="truncate">{t.description}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <span
                      className={`shrink-0 font-display text-sm font-bold ${
                        isIncome ? 'text-brand-600' : 'text-ink-900'
                      }`}
                    >
                      {isIncome ? '+' : '−'}
                      {formatMoney(t.amount, settings.currency)}
                    </span>
                    <Pencil
                      size={14}
                      className="shrink-0 text-ink-300 opacity-0 transition-opacity group-hover:opacity-100"
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
