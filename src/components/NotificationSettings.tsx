
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Bell, BellOff } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { useToast } from '@/hooks/use-toast';

export const NotificationSettings = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const { requestPermissions, cancelAllNotifications, scheduleTestNotification } = useNotifications();
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem('notifications-enabled');
    if (saved !== null) {
      setNotificationsEnabled(JSON.parse(saved));
    }
  }, []);

  const handleToggleNotifications = async (enabled: boolean) => {
    setNotificationsEnabled(enabled);
    localStorage.setItem('notifications-enabled', JSON.stringify(enabled));

    if (enabled) {
      const hasPermission = await requestPermissions();
      if (hasPermission) {
        toast({
          title: "Нотификациите са включени",
          description: "Ще получавате напомняния за лекарствата си.",
        });
      } else {
        toast({
          title: "Грешка",
          description: "Не може да се включат нотификациите. Моля, разрешете ги от настройките на браузъра/устройството.",
          variant: "destructive",
        });
        setNotificationsEnabled(false);
        localStorage.setItem('notifications-enabled', JSON.stringify(false));
      }
    } else {
      await cancelAllNotifications();
      toast({
        title: "Нотификациите са изключени",
        description: "Няма да получавате напомняния.",
        variant: "destructive",
      });
    }
  };

  const handleTestNotification = async () => {
    try {
      const success = await scheduleTestNotification();
      
      if (success) {
        toast({
          title: "Тестова нотификация",
          description: "Ще получите тестово напомняне след 3 секунди.",
        });
      } else {
        toast({
          title: "Грешка",
          description: "Не може да се изпрати тестова нотификация. Моля, разрешете нотификациите.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Грешка",
        description: "Възникна проблем при изпращането на тестовата нотификация.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Настройки за напомняния
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">Пуш нотификации</p>
            <p className="text-xs text-gray-600">
              Получавайте напомняния в зададените времена
            </p>
          </div>
          <Switch
            checked={notificationsEnabled}
            onCheckedChange={handleToggleNotifications}
          />
        </div>

        {notificationsEnabled && (
          <Button
            variant="outline"
            onClick={handleTestNotification}
            className="w-full"
          >
            <Bell className="h-4 w-4 mr-2" />
            Тествай нотификация
          </Button>
        )}

        {!notificationsEnabled && (
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            <BellOff className="h-4 w-4" />
            Нотификациите са изключени
          </div>
        )}
      </CardContent>
    </Card>
  );
};
