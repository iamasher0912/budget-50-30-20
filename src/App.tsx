import { useState } from 'react';
import { LayoutDashboard, Plus, History, PieChart, Settings as SettingsIcon, Wallet, AlertCircle } from 'lucide-react';
import { useFinanceStore } from './lib/useFinanceStore';
import { useFinanceStats } from './lib/useFinanceStats';
import { Transaction } from './lib/types';
import { SummaryCards } from './components/SummaryCards';
import { Budget503020 } from './components/Budget503020';
import { TrendChart } from './components/TrendChart';
import { CategoryDonut } from './components/CategoryDonut';
import { TransactionList } from './components/TransactionList';
import { TransactionForm } from './components/TransactionForm';
import { SettingsPanel } from './components/SettingsPanel';
import { monthLabel, currentMonthKey } from './lib/format';

type View = 'dashboard' | 'budget' | 'history' | 'settings';

export default function App() {
  return <h1 style={{color:'black'}}>Finly funciona</h1>;

  const store = useFinanceStore();
  const summary = useFinanceStats(store.transactions, store.settings);
  const [view, setView] = useState<View>('dashboard');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);

  const openNew = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (t: Transaction) => {
    setEditing(t);
    setFormOpen(true);
  };

  const handleSubmit = async (input: Omit<Transaction, 'id' | 'created_at'>) => {
    if (editing) await store.updateTransaction(editing.id, input);
    else await store.addTransaction(input);
  };
  const handleDelete = async (id: string) => {
    await store.deleteTransaction(id);
  };

  const navItems: { id: View; label: string; icon: typeof LayoutDashboard }[] = [
    { id: 'dashboard', label: 'Resumen', icon: LayoutDashboard },
    { id: 'budget', label: '50/30/20', icon: PieChart },
    { id: 'history', label: 'Historial', icon: History },
    { id: 'settings', label: 'Ajustes', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-ink-50">
      <header className="sticky top-0 z-30 border-b border-ink-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink-900 text-white shadow-sm">
              <Wallet size={18} />
            </span>
            <div className="leading-tight">
              <p className="font-display text-base font-bold text-ink-900">Finly</p>
              <p className="text-[11px] text-ink-400 -mt-0.5">Finanzas 50/30/20</p>
            </div>
          </div>
          <button onClick={openNew} className="btn-brand">
            <Plus size={16} /> <span className="hidden sm:inline">Nuevo</span>
          </button>
        </div>
      </header>

      <nav className="sticky top-[57px] z-20 border-b border-ink-100 bg-white/70 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex gap-1 overflow-x-auto no-scrollbar">
            {navItems.map((n) => {
              const Icon = n.icon;
              const active = view === n.id;
              return (
                <button
                  key={n.id}
                  onClick={() => setView(n.id)}
                  className={`relative flex items-center gap-2 px-3 py-3 text-sm font-semibold transition-colors ${
                    active ? 'text-ink-900' : 'text-ink-400 hover:text-ink-700'
                  }`}
                >
                  <Icon size={16} />
                  <span className="whitespace-nowrap">{n.label}</span>
                  {active && (
                    <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-ink-900" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-4 py-6 pb-28 sm:px-6 sm:pb-10">
        {store.error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl2 border border-danger/30 bg-danger-soft/50 px-4 py-3 text-sm text-danger">
            <AlertCircle size={16} /> {store.error}
          </div>
        )}

        {store.loading ? (
          <LoadingState />
        ) : (
          <>
            {view === 'dashboard' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="font-display text-xl font-bold text-ink-900">
                      {monthLabel(currentMonthKey())}
                    </h1>
                    <p className="text-sm text-ink-500">Resumen de tu actividad financiera</p>
                  </div>
                </div>
                <SummaryCards summary={summary} settings={store.settings} />
                <div className="grid gap-6 lg:grid-cols-2">
                  <TrendChart summary={summary} settings={store.settings} />
                  <CategoryDonut summary={summary} settings={store.settings} />
                </div>
                <TransactionList
                  transactions={store.transactions}
                  settings={store.settings}
                  onEdit={openEdit}
                  limit={6}
                  compact
                />
              </div>
            )}

            {view === 'budget' && (
              <div className="space-y-6">
                <div>
                  <h1 className="font-display text-xl font-bold text-ink-900">Presupuesto 50/30/20</h1>
                  <p className="text-sm text-ink-500">
                    La regla clásica para repartir tus ingresos de forma equilibrada.
                  </p>
                </div>
                <Budget503020 summary={summary} settings={store.settings} />
                <CategoryDonut summary={summary} settings={store.settings} />
              </div>
            )}

            {view === 'history' && (
              <div className="space-y-6">
                <div>
                  <h1 className="font-display text-xl font-bold text-ink-900">Historial</h1>
                  <p className="text-sm text-ink-500">Todos tus movimientos registrados.</p>
                </div>
                <TransactionList
                  transactions={store.transactions}
                  settings={store.settings}
                  onEdit={openEdit}
                />
              </div>
            )}

            {view === 'settings' && (
              <div className="space-y-6">
                <div>
                  <h1 className="font-display text-xl font-bold text-ink-900">Configuración</h1>
                  <p className="text-sm text-ink-500">Personaliza tu perfil financiero.</p>
                </div>
                <SettingsPanel settings={store.settings} onSave={store.saveSettings} />
              </div>
            )}
          </>
        )}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-ink-100 bg-white/90 backdrop-blur-md sm:hidden">
        <div className="grid grid-cols-4">
          {navItems.map((n) => {
            const Icon = n.icon;
            const active = view === n.id;
            return (
              <button
                key={n.id}
                onClick={() => setView(n.id)}
                className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold transition-colors ${
                  active ? 'text-ink-900' : 'text-ink-400'
                }`}
              >
                <Icon size={18} />
                {n.label}
              </button>
            );
          })}
        </div>
      </nav>

      <button
        onClick={openNew}
        className="fixed bottom-20 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-ink-900 text-white shadow-card-lg active:scale-95 transition-transform sm:hidden"
        aria-label="Nuevo movimiento"
      >
        <Plus size={24} />
      </button>

      <TransactionForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        editing={editing}
        settings={store.settings}
      />
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card p-5">
            <div className="skeleton h-3 w-20" />
            <div className="skeleton mt-4 h-7 w-28" />
            <div className="skeleton mt-2 h-3 w-16" />
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6 h-64"><div className="skeleton h-full w-full" /></div>
        <div className="card p-6 h-64"><div className="skeleton h-full w-full" /></div>
      </div>
    </div>
  );
}
