
import { LocalNotifications, ScheduleEvery } from '@capacitor/local-notifications';
import { useEffect } from 'react';
import { Medication } from '@/types/medication';

export const useNotifications = () => {
  useEffect(() => {
    // Заявка за разрешение за нотификации при първо зареждане
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    try {
      const permission = await LocalNotifications.requestPermissions();
      if (permission.display !== 'granted') {
        console.warn('Разрешението за нотификации не е дадено');
      }
    } catch (error) {
      console.error('Грешка при заявката за разрешение:', error);
    }
  };

  const scheduleNotification = async (medication: Medication) => {
    try {
      // Изчистване на съществуващи нотификации за това лекарство
      await cancelMedicationNotifications(medication.id);

      const notifications = medication.times.map((time, index) => {
        const [hours, minutes] = time.split(':').map(Number);
        const scheduleTime = new Date();
        scheduleTime.setHours(hours, minutes, 0, 0);

        // Ако времето е вече минало днес, насрочи за утре
        if (scheduleTime <= new Date()) {
          scheduleTime.setDate(scheduleTime.getDate() + 1);
        }

        return {
          title: 'Време за лекарство',
          body: `Време е да вземете ${medication.name} (${medication.dosage})`,
          id: parseInt(`${medication.id.slice(-6)}${index}`), // Уникален ID
          schedule: {
            at: scheduleTime,
            repeats: true,
            every: 'day' as ScheduleEvery
          },
          sound: 'default',
          attachments: [],
          actionTypeId: '',
          extra: {
            medicationId: medication.id,
            medicationName: medication.name
          }
        };
      });

      await LocalNotifications.schedule({
        notifications
      });

      console.log(`Насрочени ${notifications.length} нотификации за ${medication.name}`);
    } catch (error) {
      console.error('Грешка при насрочване на нотификация:', error);
    }
  };

  const cancelMedicationNotifications = async (medicationId: string) => {
    try {
      const pending = await LocalNotifications.getPending();
      const medicationNotificationIds = pending.notifications
        .filter(notification => notification.extra?.medicationId === medicationId)
        .map(notification => ({ id: notification.id }));

      if (medicationNotificationIds.length > 0) {
        await LocalNotifications.cancel({
          notifications: medicationNotificationIds
        });
      }
    } catch (error) {
      console.error('Грешка при отменяне на нотификации:', error);
    }
  };

  const cancelAllNotifications = async () => {
    try {
      const pending = await LocalNotifications.getPending();
      const allIds = pending.notifications.map(notification => ({ id: notification.id }));
      
      if (allIds.length > 0) {
        await LocalNotifications.cancel({
          notifications: allIds
        });
      }
      console.log('Всички нотификации са отменени');
    } catch (error) {
      console.error('Грешка при отменяне на всички нотификации:', error);
    }
  };

  return {
    scheduleNotification,
    cancelMedicationNotifications,
    cancelAllNotifications,
    requestPermissions
  };
};
