
import { useState, useEffect } from 'react';
import { Medication, MedicationTake } from '@/types/medication';
import { useEnhancedNotifications } from './useEnhancedNotifications';
import { useMedicationSync } from './useMedicationSync';
import { useToast } from '@/hooks/use-toast';

export const useEnhancedMedications = () => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [takes, setTakes] = useState<MedicationTake[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { scheduleAdvancedNotification, cancelMedicationNotifications } = useEnhancedNotifications();
  const { syncMedicationsToCloud, syncMedicationsFromCloud, autoSync } = useMedicationSync();
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  // Auto-sync every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      autoSync(medications);
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [medications]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Try to load from cloud first
      const cloudMedications = await syncMedicationsFromCloud();
      
      if (cloudMedications.length > 0) {
        setMedications(cloudMedications);
        localStorage.setItem('medications', JSON.stringify(cloudMedications));
      } else {
        // Fallback to local storage
        const savedMedications = localStorage.getItem('medications');
        if (savedMedications) {
          const parsed = JSON.parse(savedMedications).map((med: any) => ({
            ...med,
            createdAt: new Date(med.createdAt),
            lastTaken: med.lastTaken ? new Date(med.lastTaken) : undefined
          }));
          setMedications(parsed);
        }
      }

      const savedTakes = localStorage.getItem('medication-takes');
      if (savedTakes) {
        const parsed = JSON.parse(savedTakes).map((take: any) => ({
          ...take,
          takenAt: new Date(take.takenAt)
        }));
        setTakes(parsed);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Грешка при зареждане",
        description: "Някои данни може да не са заредени правилно.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveMedications = async (newMedications: Medication[]) => {
    setMedications(newMedications);
    localStorage.setItem('medications', JSON.stringify(newMedications));
    
    // Auto-sync to cloud
    await autoSync(newMedications);
  };

  const saveTakes = (newTakes: MedicationTake[]) => {
    setTakes(newTakes);
    localStorage.setItem('medication-takes', JSON.stringify(newTakes));
  };

  const addMedication = async (medication: Omit<Medication, 'id' | 'createdAt'>) => {
    const newMedication: Medication = {
      ...medication,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    
    const updatedMedications = [...medications, newMedication];
    await saveMedications(updatedMedications);
    
    // Schedule notifications
    const notificationsEnabled = JSON.parse(localStorage.getItem('notifications-enabled') || 'true');
    if (notificationsEnabled) {
      await scheduleAdvancedNotification(newMedication);
    }

    return newMedication;
  };

  const updateMedication = async (updatedMedication: Medication) => {
    const updatedMedications = medications.map(med => 
      med.id === updatedMedication.id ? updatedMedication : med
    );
    await saveMedications(updatedMedications);
    
    // Update notifications
    await cancelMedicationNotifications(updatedMedication.id);
    const notificationsEnabled = JSON.parse(localStorage.getItem('notifications-enabled') || 'true');
    if (notificationsEnabled) {
      await scheduleAdvancedNotification(updatedMedication);
    }
  };

  const deleteMedication = async (id: string) => {
    const updated = medications.filter(med => med.id !== id);
    await saveMedications(updated);
    await cancelMedicationNotifications(id);
  };

  const takeMedication = (medicationId: string, notes?: string) => {
    const medication = medications.find(m => m.id === medicationId);
    if (medication) {
      const updatedMedication = { ...medication, lastTaken: new Date() };
      const updatedMedications = medications.map(med => 
        med.id === medicationId ? updatedMedication : med
      );
      saveMedications(updatedMedications);
    }

    const newTake: MedicationTake = {
      medicationId,
      takenAt: new Date(),
      notes,
    };
    saveTakes([...takes, newTake]);
  };

  const getTodaysTakes = (medicationId: string) => {
    const today = new Date().toDateString();
    return takes.filter(take => 
      take.medicationId === medicationId && 
      new Date(take.takenAt).toDateString() === today
    );
  };

  const restoreFromBackup = async (backupMedications: Medication[], backupTakes: MedicationTake[]) => {
    // Cancel all existing notifications
    for (const med of medications) {
      await cancelMedicationNotifications(med.id);
    }

    // Set new data
    await saveMedications(backupMedications);
    saveTakes(backupTakes);

    // Schedule notifications for restored medications
    const notificationsEnabled = JSON.parse(localStorage.getItem('notifications-enabled') || 'true');
    if (notificationsEnabled) {
      for (const medication of backupMedications) {
        await scheduleAdvancedNotification(medication);
      }
    }
  };

  const syncToCloud = async () => {
    const success = await syncMedicationsToCloud(medications);
    if (success) {
      toast({
        title: "Синхронизация успешна",
        description: "Данните са запазени в облака.",
      });
    } else {
      toast({
        title: "Грешка при синхронизация",
        description: "Данните не могат да бъдат запазени в облака.",
        variant: "destructive",
      });
    }
    return success;
  };

  return {
    medications,
    takes,
    loading,
    addMedication,
    updateMedication,
    deleteMedication,
    takeMedication,
    getTodaysTakes,
    restoreFromBackup,
    syncToCloud,
    loadData
  };
};
