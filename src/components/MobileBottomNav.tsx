
import { Button } from '@/components/ui/button';
import { Plus, Home, Calendar } from 'lucide-react';

interface MobileBottomNavProps {
  onAddClick: () => void;
  activeTab: 'home' | 'calendar';
  onTabChange: (tab: 'home' | 'calendar') => void;
}

export const MobileBottomNav = ({ onAddClick, activeTab, onTabChange }: MobileBottomNavProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
      <div className="flex items-center justify-center py-4 px-4 relative">
        <div className="flex items-center justify-between w-full max-w-xs">
          <Button
            variant={activeTab === 'home' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onTabChange('home')}
            className="flex flex-col items-center gap-1 h-auto py-2"
          >
            <Home className="h-5 w-5" />
            <span className="text-xs">Начало</span>
          </Button>
          
          <Button
            variant={activeTab === 'calendar' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onTabChange('calendar')}
            className="flex flex-col items-center gap-1 h-auto py-2"
          >
            <Calendar className="h-5 w-5" />
            <span className="text-xs">Календар</span>
          </Button>
        </div>
        
        {/* Centered Add Button */}
        <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-2">
          <Button
            onClick={onAddClick}
            size="sm"
            className="rounded-full w-14 h-14 bg-blue-600 hover:bg-blue-700 shadow-lg"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
};
