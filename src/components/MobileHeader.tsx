
import { Button } from '@/components/ui/button';
import { Pill, Settings, FileText, Menu } from 'lucide-react';

interface MobileHeaderProps {
  onSettingsClick: () => void;
  onReportClick: () => void;
  onMenuClick: () => void;
}

export const MobileHeader = ({ onSettingsClick, onReportClick, onMenuClick }: MobileHeaderProps) => {
  const today = new Date().toLocaleDateString('bg-BG', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

  return (
    <div className="bg-white shadow-sm border-b sticky top-0 z-10">
      <div className="flex items-center justify-between p-4">
        <Button variant="ghost" size="sm" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
        </Button>
        
        <div className="flex items-center gap-2">
          <Pill className="h-6 w-6 text-blue-600" />
          <h1 className="text-lg font-semibold text-gray-900">Моите лекарства</h1>
        </div>
        
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={onReportClick}>
            <FileText className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onSettingsClick}>
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="px-4 pb-3">
        <p className="text-sm text-gray-600 capitalize">{today}</p>
      </div>
    </div>
  );
};
