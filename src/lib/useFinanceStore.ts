import { useCallback, useEffect, useState } from 'react';
import { supabase } from './supabase';
import { Settings, Transaction, TransactionInput } from './types';
import {
  SETTINGS_ID_CONST,
  defaultSettings,
  genId,
  isOnline,
  loadSettingsLocal,
  loadTransactionsLocal,
  saveSettingsLocal,
  saveTransactionsLocal,
} from './localStorage';

type Status = 'loading' | 'ready' | 'syncing';

export function useFinanceStore() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<Status>('loading');
  const [online, setOnline] = useState(isOnline());
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [localTx, localSettings] = await Promise.all([
      loadTransactionsLocal(),
      loadSettingsLocal(),
    ]);
    setTransactions(localTx);
    setSettings(localSettings);
    setLoading(false);
    setStatus('ready');

    if (isOnline()) {
      await syncFromRemote();
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const onOnline = () => {
      setOnline(true);
      syncFromRemote();
    };
    const onOffline = () => setOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const syncFromRemote = useCallback(async () => {
    if (!isOnline()) return;
    setStatus('syncing');
    try {
      const [txRes, setRes] = await Promise.all([
        supabase
          .from('transactions')
          .select('*')
          .order('date', { ascending: false })
          .order('created_at', { ascending: false }),
        supabase.from('settings').select('*').eq('id', SETTINGS_ID_CONST).maybeSingle(),
      ]);

      if (txRes.error) throw txRes.error;
      if (txRes.data && txRes.data.length > 0) {
        const remoteTx = txRes.data as Transaction[];
        setTransactions(remoteTx);
        await saveTransactionsLocal(remoteTx);
      }

      if (setRes.error && (setRes.error as { code?: string }).code !== 'PGRST116') {
        throw setRes.error;
      }
      if (setRes.data) {
        const remoteSettings = setRes.data as Settings;
        setSettings(remoteSettings);
        await saveSettingsLocal(remoteSettings);
      } else {
        const { data, error: insErr } = await supabase
          .from('settings')
          .insert({ ...defaultSettings, id: SETTINGS_ID_CONST })
          .select()
          .maybeSingle();
        if (insErr && (insErr as { code?: string }).code !== '23505') throw insErr;
        if (data) {
          const seeded = data as Settings;
          setSettings(seeded);
          await saveSettingsLocal(seeded);
        }
      }
    } catch (e) {
      console.warn('Remote sync failed, staying on local data', e);
    } finally {
      setStatus('ready');
    }
  }, []);

  const addTransaction = useCallback(
    async (input: TransactionInput) => {
      const newTx: Transaction = {
        ...input,
        bucket: input.type === 'income' ? null : input.bucket,
        id: genId(),
        created_at: new Date().toISOString(),
      };
      const next = [newTx, ...transactions];
      setTransactions(next);
      await saveTransactionsLocal(next);

      if (isOnline()) {
        try {
          const { data, error } = await supabase
            .from('transactions')
            .insert({
              ...input,
              bucket: input.type === 'income' ? null : input.bucket,
            })
            .select()
            .maybeSingle();
          if (error) throw error;
          if (data) {
            const persisted = data as Transaction;
            const merged = next.map((t) => (t.id === newTx.id ? persisted : t));
            setTransactions(merged);
            await saveTransactionsLocal(merged);
          }
        } catch (e) {
          console.warn('Remote insert failed, kept locally', e);
        }
      }
      return newTx;
    },
    [transactions]
  );

  const updateTransaction = useCallback(
    async (id: string, input: TransactionInput) => {
      const next = transactions.map((t) =>
        t.id === id
          ? { ...t, ...input, bucket: input.type === 'income' ? null : input.bucket }
          : t
      );
      setTransactions(next);
      await saveTransactionsLocal(next);

      if (isOnline()) {
        try {
          const { error } = await supabase
            .from('transactions')
            .update({ ...input, bucket: input.type === 'income' ? null : input.bucket })
            .eq('id', id);
          if (error) throw error;
        } catch (e) {
          console.warn('Remote update failed, kept locally', e);
        }
      }
    },
    [transactions]
  );

  const deleteTransaction = useCallback(
    async (id: string) => {
      const next = transactions.filter((t) => t.id !== id);
      setTransactions(next);
      await saveTransactionsLocal(next);

      if (isOnline()) {
        try {
          const { error } = await supabase.from('transactions').delete().eq('id', id);
          if (error) throw error;
        } catch (e) {
          console.warn('Remote delete failed, kept locally', e);
        }
      }
    },
    [transactions]
  );

  const saveSettings = useCallback(
    async (patch: Partial<Settings>) => {
      const next: Settings = {
        ...settings,
        ...patch,
        id: SETTINGS_ID_CONST,
        updated_at: new Date().toISOString(),
      };
      setSettings(next);
      await saveSettingsLocal(next);

      if (isOnline()) {
        try {
          const { error } = await supabase
            .from('settings')
            .update({
              monthly_income: next.monthly_income,
              needs_pct: next.needs_pct,
              wants_pct: next.wants_pct,
              savings_pct: next.savings_pct,
              currency: next.currency,
              updated_at: next.updated_at,
            })
            .eq('id', SETTINGS_ID_CONST);
          if (error) throw error;
        } catch (e) {
          console.warn('Remote settings update failed, kept locally', e);
        }
      }
    },
    [settings]
  );

  return {
    transactions,
    settings,
    loading,
    status,
    online,
    error,
    reload: load,
    sync: syncFromRemote,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    saveSettings,
  };
}
