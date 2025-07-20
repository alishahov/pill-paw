import { useState } from 'react';
import { Medication } from '@/types/medication';
import { useEnhancedNotifications } from './useEnhancedNotifications';
import { useMedicationSync } from './useMedicationSync';

export const useMedications = () => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const { scheduleAdvancedNotification, cancelMedicationNotifications } = useEnhancedNotifications();
  const { autoSync } = useMedicationSync();

  const saveMedications = async (newMedications: Medication[]) => {
    try {
      setMedications(newMedications);
      localStorage.setItem('medications', JSON.stringify(newMedications));
      
      // Auto-sync to cloud
      await autoSync(newMedications);
      setError(null);
    } catch (error) {
      console.error('Error saving medications:', error);
      setError('Грешка при запазване на данните.');
    }
  };

  const addMedication = async (medication: Omit<Medication, 'id' | 'createdAt'>) => {
    try {
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
    } catch (error) {
      console.error('Error adding medication:', error);
      setError('Грешка при добавяне на лекарството.');
      throw error;
    }
  };

  const updateMedication = async (updatedMedication: Medication) => {
    try {
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
      setError(null);
    } catch (error) {
      console.error('Error updating medication:', error);
      setError('Грешка при обновяване на лекарството.');
      throw error;
    }
  };

  const deleteMedication = async (id: string) => {
    try {
      const updated = medications.filter(med => med.id !== id);
      await saveMedications(updated);
      await cancelMedicationNotifications(id);
      setError(null);
    } catch (error) {
      console.error('Error deleting medication:', error);
      setError('Грешка при изтриване на лекарството.');
      throw error;
    }
  };

  return {
    medications,
    setMedications,
    error,
    setError,
    addMedication,
    updateMedication,
    deleteMedication,
    saveMedications,
  };
};