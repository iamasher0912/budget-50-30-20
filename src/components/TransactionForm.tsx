import { useEffect, useState } from 'react';
import { X, Trash2, Calendar, Tag, AlignLeft, DollarSign } from 'lucide-react';
import { Bucket, DEFAULT_CATEGORIES, Settings, Transaction, TxType } from '../lib/types';
import { BUCKETS } from '../lib/types';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: Omit<Transaction, 'id' | 'created_at'>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  editing?: Transaction | null;
  settings: Settings;
}

export function TransactionForm({ open, onClose, onSubmit, onDelete, editing, settings }: Props) {
  const [type, setType] = useState<TxType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [bucket, setBucket] = useState<Bucket>('needs');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setType(editing.type);
      setAmount(String(editing.amount));
      setCategory(editing.category);
      setBucket(editing.bucket ?? 'needs');
      setDescription(editing.description ?? '');
      setDate(editing.date);
    } else {
      setType('expense');
      setAmount('');
      setCategory(DEFAULT_CATEGORIES.expense[0]);
      setBucket('needs');
      setDescription('');
      setDate(new Date().toISOString().slice(0, 10));
    }
    setErr(null);
  }, [open, editing]);

  useEffect(() => {
    if (type === 'expense' && !DEFAULT_CATEGORIES.expense.includes(category)) {
      setCategory(DEFAULT_CATEGORIES.expense[0]);
    } else if (type === 'income' && !DEFAULT_CATEGORIES.income.includes(category)) {
      setCategory(DEFAULT_CATEGORIES.income[0]);
    }
  }, [type, category]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount.replace(',', '.'));
    if (!amt || amt <= 0) {
      setErr('Introduce un importe válido.');
      return;
    }
    setSaving(true);
    setErr(null);
    try {
      await onSubmit({
        type,
        amount: Math.round(amt * 100) / 100,
        category: category.trim() || 'Otros',
        bucket: type === 'expense' ? bucket : null,
        description: description.trim() || null,
        date,
      });
      onClose();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editing || !onDelete) return;
    setSaving(true);
    try {
      await onDelete(editing.id);
      onClose();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'No se pudo eliminar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="absolute inset-0 bg-ink-950/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="relative w-full sm:max-w-lg card rounded-b-none sm:rounded-2xl shadow-card-lg animate-slide-up max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-100 sticky top-0 bg-white/95 backdrop-blur rounded-t-2xl">
          <h2 className="font-display text-lg font-bold text-ink-900">
            {editing ? 'Editar movimiento' : 'Nuevo movimiento'}
          </h2>
          <button onClick={onClose} className="btn-ghost h-9 w-9 p-0 rounded-full" aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-ink-100 p-1">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`rounded-lg py-2 text-sm font-semibold transition-all ${
                type === 'expense' ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500'
              }`}
            >
              Gasto
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`rounded-lg py-2 text-sm font-semibold transition-all ${
                type === 'income' ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500'
              }`}
            >
              Ingreso
            </button>
          </div>

          <div>
            <label className="label flex items-center gap-1.5"><DollarSign size={12} /> Importe</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400 font-medium">
                {({ USD: '$', EUR: '€', GBP: '£' }[settings.currency] ?? '$')}
              </span>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                autoFocus
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="input pl-8 text-lg font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label flex items-center gap-1.5"><Tag size={12} /> Categoría</label>
              <input
                list="cat-list"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input"
                placeholder="Categoría"
              />
              <datalist id="cat-list">
                {DEFAULT_CATEGORIES[type].map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="label flex items-center gap-1.5"><Calendar size={12} /> Fecha</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input"
              />
            </div>
          </div>

          {type === 'expense' && (
            <div>
              <label className="label">Clasificación 50/30/20</label>
              <div className="grid grid-cols-3 gap-2">
                {BUCKETS.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setBucket(b.id)}
                    className={`rounded-xl border px-2 py-2.5 text-center transition-all ${
                      bucket === b.id
                        ? b.id === 'needs'
                          ? 'border-needs bg-needs-soft text-ink-900'
                          : b.id === 'wants'
                          ? 'border-wants bg-wants-soft text-ink-900'
                          : 'border-savings bg-savings-soft text-ink-900'
                        : 'border-ink-200 bg-white text-ink-500 hover:border-ink-300'
                    }`}
                  >
                    <span className="block text-xs font-semibold">{b.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="label flex items-center gap-1.5"><AlignLeft size={12} /> Descripción (opcional)</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input"
              placeholder="Ej. Compra semanal del super"
            />
          </div>

          {err && (
            <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm font-medium text-danger">
              {err}
            </p>
          )}

          <div className="flex items-center gap-3 pt-1">
            {editing && onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={saving}
                className="btn-ghost text-danger hover:bg-danger-soft"
              >
                <Trash2 size={16} /> Eliminar
              </button>
            )}
            <div className="flex-1" />
            <button type="button" onClick={onClose} className="btn-ghost">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Guardando…' : editing ? 'Guardar cambios' : 'Añadir'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
