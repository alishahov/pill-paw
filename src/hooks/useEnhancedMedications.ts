
import { useEffect } from 'react';
import { Medication, MedicationTake } from '@/types/medication';
import { useMedications } from './useMedications';
import { useMedicationTakes } from './useMedicationTakes';
import { useMedicationBackup } from './useMedicationBackup';
import { useMedicationData } from './useMedicationData';
import { useMedicationSync } from './useMedicationSync';
import { useToast } from '@/hooks/use-toast';

export const useEnhancedMedications = () => {
  const medicationsHook = useMedications();
  const takesHook = useMedicationTakes();
  const backupHook = useMedicationBackup();
  const dataHook = useMedicationData();
  const { syncMedicationsToCloud, autoSync } = useMedicationSync();
  const { toast } = useToast();

  useEffect(() => {
    dataHook.loadData(medicationsHook.setMedications, takesHook.setTakes);
  }, []);

  // Auto-sync every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      autoSync(medicationsHook.medications);
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [medicationsHook.medications]);

  const takeMedication = (medicationId: string, notes?: string) => {
    try {
      const medication = medicationsHook.medications.find(m => m.id === medicationId);
      if (medication) {
        const updatedMedication = { ...medication, lastTaken: new Date() };
        const updatedMedications = medicationsHook.medications.map(med => 
          med.id === medicationId ? updatedMedication : med
        );
        medicationsHook.saveMedications(updatedMedications);
      }

      takesHook.takeMedication(medicationId, notes);
    } catch (error) {
      console.error('Error taking medication:', error);
      throw error;
    }
  };

  const restoreFromBackup = async (backupMedications: Medication[], backupTakes: MedicationTake[]) => {
    await backupHook.restoreFromBackup(
      backupMedications, 
      backupTakes, 
      medicationsHook.medications,
      medicationsHook.saveMedications,
      takesHook.saveTakes
    );
  };

  const syncToCloud = async () => {
    try {
      const success = await syncMedicationsToCloud(medicationsHook.medications);
      if (success) {
        toast({
          title: "Синхронизация успешна",
          description: "Данните са запазени в облака.",
        });
        medicationsHook.setError(null);
      } else {
        medicationsHook.setError('Грешка при синхронизация с облака.');
        toast({
          title: "Грешка при синхронизация",
          description: "Данните не могат да бъдат запазени в облака.",
          variant: "destructive",
        });
      }
      return success;
    } catch (error) {
      console.error('Error syncing to cloud:', error);
      medicationsHook.setError('Грешка при синхронизация с облака.');
      throw error;
    }
  };

  // Combine errors from all hooks
  const error = medicationsHook.error || takesHook.error || dataHook.error;

  return {
    medications: medicationsHook.medications,
    takes: takesHook.takes,
    loading: dataHook.loading,
    error,
    addMedication: medicationsHook.addMedication,
    updateMedication: medicationsHook.updateMedication,
    deleteMedication: medicationsHook.deleteMedication,
    takeMedication,
    getTodaysTakes: takesHook.getTodaysTakes,
    restoreFromBackup,
    syncToCloud,
    loadData: () => dataHook.loadData(medicationsHook.setMedications, takesHook.setTakes)
  };
};
