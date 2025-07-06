
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Medication, MedicationTake } from '@/types/medication';
import { useToast } from '@/hooks/use-toast';

export const useMedicationSync = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const syncMedicationsToCloud = async (medications: Medication[]) => {
    if (!user) return false;

    try {
      setSyncing(true);
      
      // Delete existing medications for this user
      await supabase
        .from('medications')
        .delete()
        .eq('user_id', user.id);

      // Insert new medications
      const medicationsToInsert = medications.map(med => ({
        id: med.id,
        user_id: user.id,
        name: med.name,
        dosage: med.dosage,
        times: med.times,
        notes: med.notes,
        created_at: med.createdAt.toISOString(),
      }));

      if (medicationsToInsert.length > 0) {
        const { error } = await supabase
          .from('medications')
          .insert(medicationsToInsert);

        if (error) throw error;
      }

      setLastSync(new Date());
      return true;
    } catch (error) {
      console.error('Sync error:', error);
      return false;
    } finally {
      setSyncing(false);
    }
  };

  const syncMedicationsFromCloud = async (): Promise<Medication[]> => {
    if (!user) return [];

    try {
      setSyncing(true);
      
      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const medications: Medication[] = data?.map(med => ({
        id: med.id,
        name: med.name,
        dosage: med.dosage || '',
        frequency: 'daily' as const,
        times: med.times || [],
        notes: med.notes || '',
        createdAt: new Date(med.created_at),
      })) || [];

      setLastSync(new Date());
      return medications;
    } catch (error) {
      console.error('Sync from cloud error:', error);
      return [];
    } finally {
      setSyncing(false);
    }
  };

  const autoSync = async (medications: Medication[]) => {
    if (!user || syncing) return;

    const lastSyncTime = localStorage.getItem('last-auto-sync');
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;

    if (!lastSyncTime || now - parseInt(lastSyncTime) > fiveMinutes) {
      const success = await syncMedicationsToCloud(medications);
      if (success) {
        localStorage.setItem('last-auto-sync', now.toString());
      }
    }
  };

  return {
    syncMedicationsToCloud,
    syncMedicationsFromCloud,
    autoSync,
    syncing,
    lastSync,
  };
};
