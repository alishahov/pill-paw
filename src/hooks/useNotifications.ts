
import { LocalNotifications, ScheduleEvery } from '@capacitor/local-notifications';
import { useEffect } from 'react';
import { Medication, NotificationSnooze } from '@/types/medication';

export const useNotifications = () => {
  useEffect(() => {
    // Почистване на слушателите при unmount
    return () => {
      LocalNotifications.removeAllListeners();
    };
  }, []);

  const requestPermissions = async () => {
    try {
      const permission = await LocalNotifications.requestPermissions();
      console.log('Notification permission:', permission);
      
      if (permission.display === 'granted') {
        console.log('Разрешението за нотификации е дадено');
        return true;
      } else {
        console.warn('Разрешението за нотификации не е дадено');
        return false;
      }
    } catch (error) {
      console.error('Грешка при заявката за разрешение:', error);
      return false;
    }
  };

  const scheduleTestNotification = async () => {
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        throw new Error('Няма разрешение за нотификации');
      }

      const testTime = new Date();
      testTime.setSeconds(testTime.getSeconds() + 3);

      await LocalNotifications.schedule({
        notifications: [{
          title: 'Тестово напомняне',
          body: 'Това е тестова нотификация от приложението за лекарства.',
          id: 999999,
          schedule: {
            at: testTime,
            repeats: false,
          },
          sound: 'default',
          attachments: [],
          actionTypeId: 'test-notification',
          extra: {
            type: 'test'
          }
        }]
      });

      console.log('Тестова нотификация е насрочена за', testTime);
      return true;
    } catch (error) {
      console.error('Грешка при насрочване на тестова нотификация:', error);
      return false;
    }
  };

  const handleSnoozeNotification = async (notification: any) => {
    try {
      const snoozeTime = new Date();
      snoozeTime.setMinutes(snoozeTime.getMinutes() + 10);

      const snoozeNotification = {
        title: 'Отложено напомняне',
        body: notification.notification.body,
        id: notification.notification.id + 1000,
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
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        console.log('Не може да се насрочат нотификации - няма разрешение');
        return;
      }

      await cancelMedicationNotifications(medication.id);

      const notifications = medication.times.map((time, index) => {
        const [hours, minutes] = time.split(':').map(Number);
        
        const now = new Date();
        const scheduleTime = new Date();
        scheduleTime.setHours(hours, minutes, 0, 0);

        if (scheduleTime <= now) {
          scheduleTime.setDate(scheduleTime.getDate() + 1);
        }

        let bodyText = `Време е да вземете ${medication.name}`;
        if (medication.dosage) {
          bodyText += ` (${medication.dosage})`;
        }
        if (medication.mealTiming) {
          const mealText = {
            before: 'преди хранене',
            during: 'по време на хранене', 
            after: 'след хранене'
          }[medication.mealTiming];
          bodyText += ` - ${mealText}`;
        }

        const notificationId = parseInt(`${Math.abs(medication.id.slice(-6).split('').reduce((a, b) => a + b.charCodeAt(0), 0))}${index}`);

        return {
          title: 'Време за лекарство',
          body: bodyText,
          id: notificationId,
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
            medicationName: medication.name,
            time: time
          }
        };
      });

      await LocalNotifications.schedule({
        notifications
      });

      console.log(`Насрочени ${notifications.length} нотификации за ${medication.name}`, notifications);
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
        console.log(`Отменени ${medicationNotificationIds.length} нотификации за лекарство ${medicationId}`);
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
    requestPermissions,
    scheduleTestNotification
  };
};
