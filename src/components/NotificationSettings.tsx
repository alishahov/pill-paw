
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Bell, BellOff, TestTube, AlertCircle, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useEnhancedNotifications } from '@/hooks/useEnhancedNotifications';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

export const NotificationSettings = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const { 
    notificationStatus, 
    isSupported, 
    requestPermissions, 
    cancelAllNotifications, 
    scheduleTestNotification,
    getPendingNotifications
  } = useEnhancedNotifications();
  const { toast } = useToast();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('notifications-enabled');
    if (saved !== null) {
      setNotificationsEnabled(JSON.parse(saved));
    }
    
    // Get pending notifications count
    getPendingNotifications().then(result => {
      setPendingCount(result.notifications.length);
    });
  }, []);

  const handleToggleNotifications = async (enabled: boolean) => {
    setNotificationsEnabled(enabled);
    localStorage.setItem('notifications-enabled', JSON.stringify(enabled));

    if (enabled) {
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        setNotificationsEnabled(false);
        localStorage.setItem('notifications-enabled', JSON.stringify(false));
      }
    } else {
      await cancelAllNotifications();
      toast({
        title: "Уведомления изключени",
        description: "Всички насрочени уведомления са отменени.",
        variant: "destructive",
      });
    }
  };

  const handleTestNotification = async () => {
    const success = await scheduleTestNotification();
    if (!success) {
      toast({
        title: "Грешка при тест",
        description: "Моля, проверете разрешенията за уведомления.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = () => {
    if (!isSupported) {
      return <Badge variant="destructive">Не се поддържа</Badge>;
    }
    
    switch (notificationStatus) {
      case 'granted':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Разрешени</Badge>;
      case 'denied':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Отказани</Badge>;
      default:
        return <Badge variant="secondary">Неизвестно</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Настройки за уведомления
            </div>
            {getStatusBadge()}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isSupported && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
              <AlertCircle className="h-4 w-4" />
              Уведомленията не се поддържат на това устройство/браузър
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Push уведомления</p>
              <p className="text-xs text-muted-foreground">
                Получавайте напомняния в зададените времена
              </p>
            </div>
            <Switch
              checked={notificationsEnabled && isSupported}
              onCheckedChange={handleToggleNotifications}
              disabled={!isSupported}
            />
          </div>

          {pendingCount > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
              <Bell className="h-4 w-4" />
              {pendingCount} насрочени уведомления
            </div>
          )}

          {notificationsEnabled && isSupported && notificationStatus === 'granted' && (
            <Button
              variant="outline"
              onClick={handleTestNotification}
              className="w-full"
            >
              <TestTube className="h-4 w-4 mr-2" />
              Тествай уведомление
            </Button>
          )}

          {notificationStatus === 'denied' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                <BellOff className="h-4 w-4" />
                Уведомленията са блокирани
              </div>
              <p className="text-xs text-muted-foreground">
                За да включите уведомленията, моля отидете в настройките на браузъра и разрешете уведомления за този сайт.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
