
import { Bell, Menu, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';

interface MobileHeaderProps {
  onMenuClick: () => void;
  onNotificationsClick: () => void;
  onProfileClick: () => void;
  onSettingsClick: () => void;
  onReportClick: () => void;
}

export const MobileHeader = ({ 
  onMenuClick, 
  onNotificationsClick, 
  onProfileClick,
  onSettingsClick,
  onReportClick 
}: MobileHeaderProps) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card dark:bg-card border-b border-border px-4 py-3 pt-safe-top">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="p-2 text-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/ca7d045c-9bfb-4d0c-9762-14cedfec618c.png" 
              alt="Pill Paw" 
              className="h-8 w-8"
            />
            <h1 className="text-lg font-semibold text-foreground">
              Pill Paw
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            onClick={onNotificationsClick}
            className="p-2 text-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <Bell className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onProfileClick}
            className="p-2 text-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};
