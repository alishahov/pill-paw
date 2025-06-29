
import { useEffect } from 'react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { useMedications } from '@/hooks/useMedications';

export const useBackgroundNotifications = () => {
  const { medications } = useMedications();

  const scheduleAllNotifications = async () => {
    try {
      // Request permission
      const permission = await LocalNotifications.requestPermissions();
      
      if (permission.display !== 'granted') {
        console.log('Notification permission denied');
        return;
      }

      // Clear existing notifications
      await LocalNotifications.cancel({ notifications: [] });

      // Schedule notifications for each medication
      const notifications = [];
      let notificationId = 1;

      for (const medication of medications) {
        for (const time of medication.times) {
          const [hours, minutes] = time.split(':').map(Number);
          
          // Schedule notification for today and next 30 days
          for (let day = 0; day < 30; day++) {
            const scheduleDate = new Date();
            scheduleDate.setDate(scheduleDate.getDate() + day);
            scheduleDate.setHours(hours, minutes, 0, 0);

            // Only schedule future notifications
            if (scheduleDate > new Date()) {
              notifications.push({
                id: notificationId++,
                title: 'Време за лекарство!',
                body: `Време е да приемете ${medication.name}${medication.dosage ? ` - ${medication.dosage}` : ''}`,
                schedule: {
                  at: scheduleDate,
                  allowWhileIdle: true
                },
                sound: 'default',
                actionTypeId: 'medication_reminder',
                extra: {
                  medicationId: medication.id,
                  medicationName: medication.name,
                  scheduledTime: time
                }
              });
            }
          }
        }
      }

      if (notifications.length > 0) {
        await LocalNotifications.schedule({
          notifications: notifications.slice(0, 64) // iOS limit is 64 scheduled notifications
        });
        
        console.log(`Scheduled ${notifications.length} notifications`);
      }

    } catch (error) {
      console.error('Error scheduling notifications:', error);
    }
  };

  const handleNotificationAction = async () => {
    try {
      // Listen for notification actions
      LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
        console.log('Notification action performed:', notification);
        
        const { medicationId, scheduledTime } = notification.notification.extra || {};
        
        if (medicationId && scheduledTime) {
          // You can add logic here to automatically mark medication as taken
          // or navigate to the medication screen
          console.log(`Notification for medication ${medicationId} at ${scheduledTime}`);
        }
      });

      // Listen for notification received (when app is in foreground)
      LocalNotifications.addListener('localNotificationReceived', (notification) => {
        console.log('Notification received:', notification);
      });

    } catch (error) {
      console.error('Error setting up notification listeners:', error);
    }
  };

  useEffect(() => {
    if (medications.length > 0) {
      scheduleAllNotifications();
    }
  }, [medications]);

  useEffect(() => {
    handleNotificationAction();
  }, []);

  return {
    scheduleAllNotifications
  };
};
