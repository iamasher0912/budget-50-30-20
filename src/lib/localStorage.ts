import { Preferences } from '@capacitor/preferences';
import { Transaction, Settings } from './types';

const SETTINGS_ID = '00000000-0000-0000-0000-000000000001';

const DEFAULT_SETTINGS: Settings = {
  id: SETTINGS_ID,
  monthly_income: 0,
  needs_pct: 50,
  wants_pct: 30,
  savings_pct: 20,
  currency: 'USD',
  updated_at: new Date().toISOString(),
};

const TX_KEY = 'finly:transactions';
const SETTINGS_KEY = 'finly:settings';

let txCache: Transaction[] | null = null;
let settingsCache: Settings | null = null;

export const defaultSettings = DEFAULT_SETTINGS;
export const SETTINGS_ID_CONST = SETTINGS_ID;

export async function loadTransactionsLocal(): Promise<Transaction[]> {
  if (txCache) return txCache;
  try {
    const { value } = await Preferences.get({ key: TX_KEY });
    const parsed = value ? (JSON.parse(value) as Transaction[]) : [];
    txCache = parsed;
    return parsed;
  } catch {
    return [];
  }
}

export async function saveTransactionsLocal(transactions: Transaction[]): Promise<void> {
  txCache = transactions;
  try {
    await Preferences.set({ key: TX_KEY, value: JSON.stringify(transactions) });
  } catch (e) {
    console.warn('Failed to persist transactions locally', e);
  }
}

export async function loadSettingsLocal(): Promise<Settings> {
  if (settingsCache) return settingsCache;
  try {
    const { value } = await Preferences.get({ key: SETTINGS_KEY });
    const parsed = value ? ({ ...DEFAULT_SETTINGS, ...(JSON.parse(value) as Partial<Settings>) }) : DEFAULT_SETTINGS;
    settingsCache = parsed;
    return parsed;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettingsLocal(settings: Settings): Promise<void> {
  settingsCache = settings;
  try {
    await Preferences.set({ key: SETTINGS_KEY, value: JSON.stringify(settings) });
  } catch (e) {
    console.warn('Failed to persist settings locally', e);
  }
}

export function isOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

export function genId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
