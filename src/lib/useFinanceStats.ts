import { useMemo } from 'react';
import { Settings, Transaction, Bucket } from './types';
import { currentMonthKey, monthKey } from './format';

export interface BucketStats {
  budget: number;
  spent: number;
  remaining: number;
  pctOfBudget: number;
  pctOfIncome: number;
  over: boolean;
}

export interface FinanceSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  monthIncome: number;
  monthExpense: number;
  monthBalance: number;
  savingsRate: number;
  needs: BucketStats;
  wants: BucketStats;
  savings: BucketStats;
  byCategory: { category: string; amount: number; bucket: Bucket | null }[];
  last6Months: { key: string; income: number; expense: number }[];
}

export function useFinanceStats(
  transactions: Transaction[],
  settings: Settings
): FinanceSummary {
  return useMemo(() => {
    const totalIncome = sum(transactions.filter((t) => t.type === 'income'));
    const totalExpense = sum(transactions.filter((t) => t.type === 'expense'));
    const mKey = currentMonthKey();
    const monthTx = transactions.filter((t) => monthKey(t.date) === mKey);
    const monthIncome = sum(monthTx.filter((t) => t.type === 'income'));
    const monthExpense = sum(monthTx.filter((t) => t.type === 'expense'));

    const income = settings.monthly_income > 0 ? settings.monthly_income : monthIncome;
    const needsBudget = (income * settings.needs_pct) / 100;
    const wantsBudget = (income * settings.wants_pct) / 100;
    const savingsBudget = (income * settings.savings_pct) / 100;

    const needsSpent = sum(monthTx.filter((t) => t.type === 'expense' && t.bucket === 'needs'));
    const wantsSpent = sum(monthTx.filter((t) => t.type === 'expense' && t.bucket === 'wants'));
    const savingsSpent = sum(monthTx.filter((t) => t.type === 'expense' && t.bucket === 'savings'));

    const byCat = aggregateByCategory(monthTx.filter((t) => t.type === 'expense'));
    const last6 = last6Months(transactions);
    const monthBalance = monthIncome - monthExpense;

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      monthIncome,
      monthExpense,
      monthBalance,
      savingsRate: monthIncome > 0 ? (monthBalance / monthIncome) * 100 : 0,
      needs: bucketStats(needsBudget, needsSpent, income),
      wants: bucketStats(wantsBudget, wantsSpent, income),
      savings: bucketStats(savingsBudget, savingsSpent, income),
      byCategory: byCat,
      last6Months: last6,
    };
  }, [transactions, settings]);
}

function sum(tx: Transaction[]) {
  return tx.reduce((acc, t) => acc + Number(t.amount), 0);
}

function bucketStats(budget: number, spent: number, income: number): BucketStats {
  const remaining = budget - spent;
  return {
    budget,
    spent,
    remaining,
    pctOfBudget: budget > 0 ? (spent / budget) * 100 : 0,
    pctOfIncome: income > 0 ? (spent / income) * 100 : 0,
    over: spent > budget && budget > 0,
  };
}

function aggregateByCategory(tx: Transaction[]) {
  const map = new Map<string, { amount: number; bucket: Bucket | null }>();
  for (const t of tx) {
    const cur = map.get(t.category) ?? { amount: 0, bucket: t.bucket };
    cur.amount += Number(t.amount);
    cur.bucket = t.bucket ?? cur.bucket;
    map.set(t.category, cur);
  }
  return Array.from(map.entries())
    .map(([category, v]) => ({ category, amount: v.amount, bucket: v.bucket }))
    .sort((a, b) => b.amount - a.amount);
}

function last6Months(transactions: Transaction[]) {
  const now = new Date();
  const months: { key: string; income: number; expense: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    months.push({ key, income: 0, expense: 0 });
  }
  const idx = new Map(months.map((m, i) => [m.key, i]));
  for (const t of transactions) {
    const i = idx.get(monthKey(t.date));
    if (i === undefined) continue;
    if (t.type === 'income') months[i].income += Number(t.amount);
    else months[i].expense += Number(t.amount);
  }
  return months;
}
