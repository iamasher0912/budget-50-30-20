export type TxType = 'income' | 'expense';
export type Bucket = 'needs' | 'wants' | 'savings';

export interface Transaction {
  id: string;
  type: TxType;
  amount: number;
  category: string;
  bucket: Bucket | null;
  description: string | null;
  date: string;
  created_at: string;
}

export interface Settings {
  id: string;
  monthly_income: number;
  needs_pct: number;
  wants_pct: number;
  savings_pct: number;
  currency: string;
  updated_at: string;
}

export type TransactionInput = Omit<Transaction, 'id' | 'created_at'>;

export const BUCKETS: { id: Bucket; label: string; color: string; soft: string; description: string }[] = [
  { id: 'needs', label: 'Necesidades', color: 'text-needs', soft: 'bg-needs-soft', description: 'Vivienda, comida, transporte, servicios básicos' },
  { id: 'wants', label: 'Deseos', color: 'text-wants', soft: 'bg-wants-soft', description: 'Ocio, suscripciones, restaurantes, caprichos' },
  { id: 'savings', label: 'Ahorro', color: 'text-savings', soft: 'bg-savings-soft', description: 'Fondo de emergencia, inversión, metas' },
];

export const DEFAULT_CATEGORIES: Record<TxType, string[]> = {
  income: ['Salario', 'Freelance', 'Inversiones', 'Regalos', 'Otros ingresos'],
  expense: ['Vivienda', 'Comida', 'Transporte', 'Servicios', 'Salud', 'Ocio', 'Restaurantes', 'Suscripciones', 'Ropa', 'Educación', 'Ahorro', 'Otros'],
};

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  MXN: '$',
  COP: '$',
  ARS: '$',
  GBP: '£',
  PEN: 'S/',
  CLP: '$',
};
