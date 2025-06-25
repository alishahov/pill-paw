
import { useState, useEffect } from 'react';
import { Medication, MedicationTake } from '@/types/medication';

export const useMedications = () => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [takes, setTakes] = useState<MedicationTake[]>([]);

  useEffect(() => {
    // Зареждане на данни от localStorage
    const savedMedications = localStorage.getItem('medications');
    const savedTakes = localStorage.getItem('medication-takes');
    
    if (savedMedications) {
      setMedications(JSON.parse(savedMedications));
    }
    
    if (savedTakes) {
      setTakes(JSON.parse(savedTakes));
    }
  }, []);

  const saveMedications = (newMedications: Medication[]) => {
    setMedications(newMedications);
    localStorage.setItem('medications', JSON.stringify(newMedications));
  };

  const saveTakes = (newTakes: MedicationTake[]) => {
    setTakes(newTakes);
    localStorage.setItem('medication-takes', JSON.stringify(newTakes));
  };

  const addMedication = (medication: Omit<Medication, 'id' | 'createdAt'>) => {
    const newMedication: Medication = {
      ...medication,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    saveMedications([...medications, newMedication]);
  };

  const deleteMedication = (id: string) => {
    const updated = medications.filter(med => med.id !== id);
    saveMedications(updated);
  };

  const takeMedication = (medicationId: string, notes?: string) => {
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

  return {
    medications,
    takes,
    addMedication,
    deleteMedication,
    takeMedication,
    getTodaysTakes,
  };
};
