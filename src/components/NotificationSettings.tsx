
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Bell, BellOff } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { useToast } from '@/hooks/use-toast';

export const NotificationSettings = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const { requestPermissions, cancelAllNotifications } = useNotifications();
  const { toast } = useToast();

  useEffect(() => {
    // Зареждане на настройката от localStorage
    const saved = localStorage.getItem('notifications-enabled');
    if (saved !== null) {
      setNotificationsEnabled(JSON.parse(saved));
    }
  }, []);

  const handleToggleNotifications = async (enabled: boolean) => {
    setNotificationsEnabled(enabled);
    localStorage.setItem('notifications-enabled', JSON.stringify(enabled));

    if (enabled) {
      await requestPermissions();
      toast({
        title: "Нотификациите са включени",
        description: "Ще получавате напомняния за лекарствата си.",
      });
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
      await requestPermissions();
      
      // Създаване на тестова нотификация за след 5 секунди
      const testTime = new Date();
      testTime.setSeconds(testTime.getSeconds() + 5);

      toast({
        title: "Тестова нотификация",
        description: "Ще получите тестово напомняне след 5 секунди.",
      });
    } catch (error) {
      toast({
        title: "Грешка",
        description: "Не може да се изпрати тестова нотификация.",
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
