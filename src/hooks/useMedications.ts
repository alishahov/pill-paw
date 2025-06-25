import { useState, useEffect } from 'react';
import { Medication, MedicationTake } from '@/types/medication';
import { useNotifications } from './useNotifications';

export const useMedications = () => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [takes, setTakes] = useState<MedicationTake[]>([]);
  const { scheduleNotification, cancelMedicationNotifications } = useNotifications();

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

  const addMedication = async (medication: Omit<Medication, 'id' | 'createdAt'>) => {
    const newMedication: Medication = {
      ...medication,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    
    const updatedMedications = [...medications, newMedication];
    saveMedications(updatedMedications);
    
    // Насрочване на нотификации за новото лекарство
    await scheduleNotification(newMedication);
  };

  const deleteMedication = async (id: string) => {
    const updated = medications.filter(med => med.id !== id);
    saveMedications(updated);
    
    // Отменяне на нотификациите за изтритото лекарство
    await cancelMedicationNotifications(id);
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

  // Насрочване на нотификации за всички съществуващи лекарства при зареждане
  useEffect(() => {
    if (medications.length > 0) {
      medications.forEach(medication => {
        scheduleNotification(medication);
      });
    }
  }, [medications.length]); // Само при промяна на броя лекарства

  return {
    medications,
    takes,
    addMedication,
    deleteMedication,
    takeMedication,
    getTodaysTakes,
  };
};
