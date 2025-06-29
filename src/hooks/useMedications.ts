
import { useState, useEffect } from 'react';
import { Medication, MedicationTake } from '@/types/medication';
import { useNotifications } from './useNotifications';

export const useMedications = () => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [takes, setTakes] = useState<MedicationTake[]>([]);
  const { scheduleNotification, cancelMedicationNotifications } = useNotifications();

  useEffect(() => {
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
    
    // Насрочване на нотификации само ако са включени
    const notificationsEnabled = JSON.parse(localStorage.getItem('notifications-enabled') || 'true');
    if (notificationsEnabled) {
      await scheduleNotification(newMedication);
    }
  };

  const updateMedication = async (updatedMedication: Medication) => {
    const updatedMedications = medications.map(med => 
      med.id === updatedMedication.id ? updatedMedication : med
    );
    saveMedications(updatedMedications);
    
    // Отменяне на старите нотификации и насрочване на нови
    await cancelMedicationNotifications(updatedMedication.id);
    
    const notificationsEnabled = JSON.parse(localStorage.getItem('notifications-enabled') || 'true');
    if (notificationsEnabled) {
      await scheduleNotification(updatedMedication);
    }
  };

  const deleteMedication = async (id: string) => {
    const updated = medications.filter(med => med.id !== id);
    saveMedications(updated);
    
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

  return {
    medications,
    takes,
    addMedication,
    updateMedication,
    deleteMedication,
    takeMedication,
    getTodaysTakes,
  };
};
