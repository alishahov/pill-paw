
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Settings, FileText, BarChart3, User, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsClick: () => void;
  onReportClick: () => void;
  onStatisticsClick?: () => void;
}

export const MobileDrawer = ({ 
  isOpen, 
  onClose, 
  onSettingsClick, 
  onReportClick,
  onStatisticsClick 
}: MobileDrawerProps) => {
  const { signOut } = useAuth();

  const handleMenuItemClick = (action: () => void) => {
    action();
    onClose();
  };

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-80">
        <SheetHeader className="mb-6">
          <SheetTitle>Меню</SheetTitle>
        </SheetHeader>
        
        <div className="space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start h-12"
            onClick={() => handleMenuItemClick(onSettingsClick)}
          >
            <Settings className="h-5 w-5 mr-3" />
            Настройки
          </Button>
          
          <Button
            variant="ghost"
            className="w-full justify-start h-12"
            onClick={() => handleMenuItemClick(onReportClick)}
          >
            <FileText className="h-5 w-5 mr-3" />
            Медицински отчет
          </Button>

          {onStatisticsClick && (
            <Button
              variant="ghost"
              className="w-full justify-start h-12"
              onClick={() => handleMenuItemClick(onStatisticsClick)}
            >
              <BarChart3 className="h-5 w-5 mr-3" />
              Статистика
            </Button>
          )}
          
          <div className="border-t pt-2 mt-4">
            <Button
              variant="ghost"
              className="w-full justify-start h-12 text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5 mr-3" />
              Изход
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
