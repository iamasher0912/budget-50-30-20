import { CURRENCY_SYMBOLS } from './types';

export function formatMoney(amount: number, currency = 'USD', opts?: { compact?: boolean }) {
  const symbol = CURRENCY_SYMBOLS[currency] ?? '$';
  const n = Number.isFinite(amount) ? amount : 0;
  if (opts?.compact && Math.abs(n) >= 1000) {
    const abs = Math.abs(n);
    let s: string;
    if (abs >= 1_000_000) s = (n / 1_000_000).toFixed(1) + 'M';
    else if (abs >= 1_000) s = (n / 1_000).toFixed(1) + 'k';
    else s = n.toFixed(0);
    return `${symbol}${s}`;
  }
  return `${symbol}${n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDate(iso: string) {
  const d = new Date(iso + (iso.length === 10 ? 'T00:00:00' : ''));
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function monthKey(iso: string) {
  return iso.slice(0, 7);
}

export function currentMonthKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function monthLabel(key: string) {
  const [y, m] = key.split('-').map(Number);
  const d = new Date(y, m - 1, 1);
  return d.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
}

export function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max);
}
