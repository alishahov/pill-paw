
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Settings, FileText, Info, HelpCircle } from 'lucide-react';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsClick: () => void;
  onReportClick: () => void;
}

export const MobileDrawer = ({ isOpen, onClose, onSettingsClick, onReportClick }: MobileDrawerProps) => {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-80">
        <SheetHeader>
          <SheetTitle>Меню</SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => {
              onSettingsClick();
              onClose();
            }}
          >
            <Settings className="h-4 w-4 mr-3" />
            Настройки
          </Button>
          
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => {
              onReportClick();
              onClose();
            }}
          >
            <FileText className="h-4 w-4 mr-3" />
            Медицински отчет
          </Button>
          
          <Button variant="ghost" className="w-full justify-start">
            <Info className="h-4 w-4 mr-3" />
            За приложението
          </Button>
          
          <Button variant="ghost" className="w-full justify-start">
            <HelpCircle className="h-4 w-4 mr-3" />
            Помощ
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
