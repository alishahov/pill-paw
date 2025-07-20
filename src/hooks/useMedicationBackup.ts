import { Medication, MedicationTake } from '@/types/medication';
import { useEnhancedNotifications } from './useEnhancedNotifications';

export const useMedicationBackup = () => {
  const { scheduleAdvancedNotification, cancelMedicationNotifications } = useEnhancedNotifications();

  const restoreFromBackup = async (
    backupMedications: Medication[], 
    backupTakes: MedicationTake[],
    currentMedications: Medication[],
    saveMedications: (medications: Medication[]) => Promise<void>,
    saveTakes: (takes: MedicationTake[]) => void
  ) => {
    try {
      // Cancel all existing notifications
      for (const med of currentMedications) {
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
    } catch (error) {
      console.error('Error restoring from backup:', error);
      throw new Error('Грешка при възстановяване от резервно копие.');
    }
  };

  return {
    restoreFromBackup,
  };
};