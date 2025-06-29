
import { Bell, Menu, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';

interface MobileHeaderProps {
  onMenuClick: () => void;
  onNotificationsClick: () => void;
  onProfileClick: () => void;
}

export const MobileHeader = ({ 
  onMenuClick, 
  onNotificationsClick, 
  onProfileClick 
}: MobileHeaderProps) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="p-2"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            Pill Paw
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            onClick={onNotificationsClick}
            className="p-2"
          >
            <Bell className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onProfileClick}
            className="p-2"
          >
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};
