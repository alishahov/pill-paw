import { useState } from 'react';
import { Medication, MedicationTake } from '@/types/medication';

export const useMedicationTakes = () => {
  const [takes, setTakes] = useState<MedicationTake[]>([]);
  const [error, setError] = useState<string | null>(null);

  const saveTakes = (newTakes: MedicationTake[]) => {
    try {
      setTakes(newTakes);
      localStorage.setItem('medication-takes', JSON.stringify(newTakes));
      setError(null);
    } catch (error) {
      console.error('Error saving takes:', error);
      setError('Грешка при запазване на приемите.');
    }
  };

  const takeMedication = (medicationId: string, notes?: string) => {
    try {
      const newTake: MedicationTake = {
        medicationId,
        takenAt: new Date(),
        notes,
      };
      saveTakes([...takes, newTake]);
      setError(null);
    } catch (error) {
      console.error('Error taking medication:', error);
      setError('Грешка при отбелязване на приема.');
      throw error;
    }
  };

  const getTodaysTakes = (medicationId: string) => {
    const today = new Date().toDateString();
    return takes.filter(take => 
      take.medicationId === medicationId && 
      new Date(take.takenAt).toDateString() === today
    );
  };

  return {
    takes,
    setTakes,
    error: error,
    setError,
    takeMedication,
    getTodaysTakes,
    saveTakes,
  };
};