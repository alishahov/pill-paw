
import { LocalNotifications, ScheduleEvery } from '@capacitor/local-notifications';
import { useEffect } from 'react';
import { Medication, NotificationSnooze } from '@/types/medication';

export const useNotifications = () => {
  useEffect(() => {
    // Заявка за разрешение за нотификации при първо зареждане
    requestPermissions();
    
    // Слушане за нотификационни действия
    LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
      console.log('Notification action performed:', notification);
      if (notification.actionId === 'snooze') {
        handleSnoozeNotification(notification);
      }
    });
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

  const handleSnoozeNotification = async (notification: any) => {
    try {
      // Отложи за 10 минути
      const snoozeTime = new Date();
      snoozeTime.setMinutes(snoozeTime.getMinutes() + 10);

      const snoozeNotification = {
        title: 'Отложено напомняне',
        body: notification.notification.body,
        id: notification.notification.id + 1000, // Уникален ID за snooze
        schedule: {
          at: snoozeTime,
          repeats: false,
        },
        sound: 'default',
        attachments: [],
        actionTypeId: '',
        extra: notification.notification.extra
      };

      await LocalNotifications.schedule({
        notifications: [snoozeNotification]
      });

      // Запази информацията за snooze в localStorage
      const snoozeData: NotificationSnooze = {
        medicationId: notification.notification.extra.medicationId,
        originalTime: new Date(),
        snoozeUntil: snoozeTime,
        snoozedAt: new Date()
      };

      const existingSnoozes = JSON.parse(localStorage.getItem('notification-snoozes') || '[]');
      existingSnoozes.push(snoozeData);
      localStorage.setItem('notification-snoozes', JSON.stringify(existingSnoozes));

      console.log('Нотификацията е отложена за 10 минути');
    } catch (error) {
      console.error('Грешка при отлагане на нотификация:', error);
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

        let bodyText = `Време е да вземете ${medication.name} (${medication.dosage})`;
        if (medication.mealTiming) {
          const mealText = {
            before: 'преди хранене',
            during: 'по време на хранене', 
            after: 'след хранене'
          }[medication.mealTiming];
          bodyText += ` - ${mealText}`;
        }

        return {
          title: 'Време за лекарство',
          body: bodyText,
          id: parseInt(`${medication.id.slice(-6)}${index}`), // Уникален ID
          schedule: {
            at: scheduleTime,
            repeats: true,
            every: 'day' as ScheduleEvery
          },
          sound: 'default',
          attachments: [],
          actionTypeId: 'medication-reminder',
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
