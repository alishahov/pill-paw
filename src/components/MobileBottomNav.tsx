
import { Button } from '@/components/ui/button';
import { Plus, Home, Calendar, User } from 'lucide-react';

interface MobileBottomNavProps {
  onAddClick: () => void;
  activeTab: 'home' | 'calendar' | 'profile';
  onTabChange: (tab: 'home' | 'calendar' | 'profile') => void;
}

export const MobileBottomNav = ({ onAddClick, activeTab, onTabChange }: MobileBottomNavProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
      <div className="flex items-center justify-around py-2 px-4">
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
        
        <Button
          onClick={onAddClick}
          size="sm"
          className="rounded-full w-12 h-12 bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-6 w-6" />
        </Button>
        
        <Button
          variant={activeTab === 'profile' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onTabChange('profile')}
          className="flex flex-col items-center gap-1 h-auto py-2"
        >
          <User className="h-5 w-5" />
          <span className="text-xs">Профил</span>
        </Button>
      </div>
    </div>
  );
};
