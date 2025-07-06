
import { useEffect, useState } from 'react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Medication } from '@/types/medication';
import { useToast } from '@/hooks/use-toast';

export const useEnhancedNotifications = () => {
  const [notificationStatus, setNotificationStatus] = useState<'unknown' | 'granted' | 'denied'>('unknown');
  const [isSupported, setIsSupported] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkNotificationSupport();
    checkPermissions();
  }, []);

  const checkNotificationSupport = async () => {
    try {
      // Check if we're in a supported environment
      if (typeof window !== 'undefined' && 'Notification' in window) {
        setIsSupported(true);
      } else {
        setIsSupported(false);
        console.warn('Notifications not supported in this environment');
      }
    } catch (error) {
      console.error('Error checking notification support:', error);
      setIsSupported(false);
    }
  };

  const checkPermissions = async () => {
    try {
      const permission = await LocalNotifications.checkPermissions();
      // Map permission states to our type, treating 'prompt' as 'unknown'
      const mappedStatus = permission.display === 'prompt' ? 'unknown' : permission.display;
      setNotificationStatus(mappedStatus as 'unknown' | 'granted' | 'denied');
    } catch (error) {
      console.error('Error checking permissions:', error);
      setNotificationStatus('unknown');
    }
  };

  const requestPermissions = async (): Promise<boolean> => {
    if (!isSupported) {
      toast({
        title: "Уведомления не се поддържат",
        description: "Вашето устройство не поддържа push уведомления.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const permission = await LocalNotifications.requestPermissions();
      // Map permission states to our type, treating 'prompt' as 'unknown'
      const mappedStatus = permission.display === 'prompt' ? 'unknown' : permission.display;
      setNotificationStatus(mappedStatus as 'unknown' | 'granted' | 'denied');
      
      if (permission.display === 'granted') {
        toast({
          title: "Уведомления разрешени",
          description: "Ще получавате напомняния за лекарствата си.",
        });
        return true;
      } else {
        toast({
          title: "Уведомления отказани",
          description: "Можете да ги включите от настройките на браузъра/устройството.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
      toast({
        title: "Грешка при заявка за разрешения",
        description: "Моля, опитайте отново или проверете настройките.",
        variant: "destructive",
      });
      return false;
    }
  };

  const scheduleAdvancedNotification = async (medication: Medication) => {
    if (notificationStatus !== 'granted') {
      const granted = await requestPermissions();
      if (!granted) return false;
    }

    try {
      await cancelMedicationNotifications(medication.id);

      const notifications = medication.times.map((time, index) => {
        const [hours, minutes] = time.split(':').map(Number);
        
        const scheduleTime = new Date();
        scheduleTime.setHours(hours, minutes, 0, 0);

        // If the time has passed today, schedule for tomorrow
        if (scheduleTime <= new Date()) {
          scheduleTime.setDate(scheduleTime.getDate() + 1);
        }

        const notificationId = parseInt(`${Math.abs(medication.id.slice(-6).split('').reduce((a, b) => a + b.charCodeAt(0), 0))}${index}`);

        return {
          title: '💊 Време за лекарство',
          body: `${medication.name}${medication.dosage ? ` (${medication.dosage})` : ''}`,
          id: notificationId,
          schedule: {
            at: scheduleTime,
            repeats: true,
            every: 'day' as const
          },
          sound: 'default',
          attachments: [],
          actionTypeId: 'medication-reminder',
          extra: {
            medicationId: medication.id,
            medicationName: medication.name,
            time: time,
            dosage: medication.dosage
          }
        };
      });

      await LocalNotifications.schedule({
        notifications
      });

      console.log(`✅ Scheduled ${notifications.length} notifications for ${medication.name}`);
      return true;
    } catch (error) {
      console.error('Error scheduling notifications:', error);
      toast({
        title: "Грешка при насрочване",
        description: "Неуспешно насрочване на уведомления.",
        variant: "destructive",
      });
      return false;
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
        console.log(`🗑️ Cancelled ${medicationNotificationIds.length} notifications for medication ${medicationId}`);
      }
    } catch (error) {
      console.error('Error cancelling notifications:', error);
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
        console.log('🗑️ All notifications cancelled');
      }
    } catch (error) {
      console.error('Error cancelling all notifications:', error);
    }
  };

  const getPendingNotifications = async () => {
    try {
      return await LocalNotifications.getPending();
    } catch (error) {
      console.error('Error getting pending notifications:', error);
      return { notifications: [] };
    }
  };

  const scheduleTestNotification = async () => {
    if (notificationStatus !== 'granted') {
      const granted = await requestPermissions();
      if (!granted) return false;
    }

    try {
      const testTime = new Date();
      testTime.setSeconds(testTime.getSeconds() + 5);

      await LocalNotifications.schedule({
        notifications: [{
          title: '🧪 Тестово уведомление',
          body: 'Ако виждате това, уведомленията работят!',
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

      toast({
        title: "Тестово уведомление насрочено",
        description: "Ще получите уведомление след 5 секунди.",
      });

      return true;
    } catch (error) {
      console.error('Error scheduling test notification:', error);
      toast({
        title: "Грешка при тест",
        description: "Неуспешно изпращане на тестово уведомление.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    notificationStatus,
    isSupported,
    requestPermissions,
    scheduleAdvancedNotification,
    cancelMedicationNotifications,
    cancelAllNotifications,
    getPendingNotifications,
    scheduleTestNotification,
    checkPermissions
  };
};
