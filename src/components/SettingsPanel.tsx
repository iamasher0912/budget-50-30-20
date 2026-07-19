import { useEffect, useState } from 'react';
import { Save, Check } from 'lucide-react';
import { Settings } from '../lib/types';
import { clamp } from '../lib/format';

interface Props {
  settings: Settings;
  onSave: (patch: Partial<Settings>) => Promise<void>;
}

const CURRENCIES = ['USD', 'EUR', 'MXN', 'COP', 'ARS', 'GBP', 'PEN', 'CLP'];

export function SettingsPanel({ settings, onSave }: Props) {
  const [income, setIncome] = useState(String(settings.monthly_income || ''));
  const [needs, setNeeds] = useState(String(settings.needs_pct));
  const [wants, setWants] = useState(String(settings.wants_pct));
  const [savings, setSavings] = useState(String(settings.savings_pct));
  const [currency, setCurrency] = useState(settings.currency);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    setIncome(String(settings.monthly_income || ''));
    setNeeds(String(settings.needs_pct));
    setWants(String(settings.wants_pct));
    setSavings(String(settings.savings_pct));
    setCurrency(settings.currency);
  }, [settings]);

  const total = (Number(needs) || 0) + (Number(wants) || 0) + (Number(savings) || 0);
  const valid = Math.abs(total - 100) < 0.01;

  const handleSave = async () => {
    setSaving(true);
    setErr(null);
    try {
      await onSave({
        monthly_income: Math.max(0, parseFloat(income.replace(',', '.')) || 0),
        needs_pct: clamp(parseFloat(needs) || 0, 0, 100),
        wants_pct: clamp(parseFloat(wants) || 0, 0, 100),
        savings_pct: clamp(parseFloat(savings) || 0, 0, 100),
        currency,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  };

  const pctField = (
    label: string,
    value: string,
    set: (v: string) => void,
    color: string
  ) => (
    <div>
      <label className="label">{label}</label>
      <div className="relative">
        <input
          type="number"
          min="0"
          max="100"
          step="1"
          value={value}
          onChange={(e) => set(e.target.value)}
          className="input pr-8 font-semibold"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-ink-400">
          %
        </span>
        <span className={`absolute -bottom-1 left-0 h-0.5 rounded-full ${color}`} style={{ width: `${Math.min(Number(value) || 0, 100)}%` }} />
      </div>
    </div>
  );

  return (
    <div className="card p-6 animate-slide-up max-w-2xl">
      <h2 className="font-display text-lg font-bold text-ink-900">Configuración</h2>
      <p className="text-sm text-ink-500 mt-0.5">
        Define tu ingreso mensual de referencia y la distribución 50/30/20.
      </p>

      <div className="mt-6 grid gap-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Ingreso mensual base</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              placeholder="0.00"
              className="input font-semibold"
            />
          </div>
          <div>
            <label className="label">Moneda</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="input font-semibold"
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {pctField('Necesidades', needs, setNeeds, 'bg-needs')}
          {pctField('Deseos', wants, setWants, 'bg-wants')}
          {pctField('Ahorro', savings, setSavings, 'bg-savings')}
        </div>

        <div>
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-ink-500">Suma de porcentajes</span>
            <span className={valid ? 'text-brand-600' : 'text-danger'}>
              {total.toFixed(0)}% {valid ? '✓' : '(debe sumar 100%)'}
            </span>
          </div>
          <div className="mt-2 flex h-2 w-full overflow-hidden rounded-full bg-ink-100">
            <div className="bg-needs transition-all duration-500" style={{ width: `${Number(needs) || 0}%` }} />
            <div className="bg-wants transition-all duration-500" style={{ width: `${Number(wants) || 0}%` }} />
            <div className="bg-savings transition-all duration-500" style={{ width: `${Number(savings) || 0}%` }} />
          </div>
        </div>

        {err && (
          <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm font-medium text-danger">{err}</p>
        )}

        <div className="flex justify-end">
          <button onClick={handleSave} disabled={saving || !valid} className="btn-primary">
            {saved ? (
              <>
                <Check size={16} /> Guardado
              </>
            ) : (
              <>
                <Save size={16} /> {saving ? 'Guardando…' : 'Guardar'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
