import { useState, useEffect } from 'react';
import { Medication, MedicationTake } from '@/types/medication';
import { useMedicationSync } from './useMedicationSync';
import { useToast } from '@/hooks/use-toast';

export const useMedicationData = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { syncMedicationsFromCloud } = useMedicationSync();
  const { toast } = useToast();

  const loadData = async (
    setMedications: (medications: Medication[]) => void,
    setTakes: (takes: MedicationTake[]) => void
  ) => {
    try {
      setLoading(true);
      setError(null);
      
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
      setError('Грешка при зареждане на данните. Моля, опитайте отново.');
      toast({
        title: "Грешка при зареждане",
        description: "Някои данни може да не са заредени правилно.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    setError,
    loadData,
  };
};