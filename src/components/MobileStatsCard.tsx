
import { Card, CardContent } from '@/components/ui/card';

interface MobileStatsCardProps {
  completed: number;
  partial: number;
  missed: number;
  total: number;
}

export const MobileStatsCard = ({ completed, partial, missed, total }: MobileStatsCardProps) => {
  return (
    <Card className="mx-4 mb-4">
      <CardContent className="p-4">
        <h3 className="font-medium text-gray-900 mb-3 text-center">Статистика за днес</h3>
        <div className="grid grid-cols-4 gap-2">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">{total}</div>
            <div className="text-xs text-gray-600">Общо</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">{completed}</div>
            <div className="text-xs text-gray-600">Взети</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-orange-600">{partial}</div>
            <div className="text-xs text-gray-600">Частично</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-red-600">{missed}</div>
            <div className="text-xs text-gray-600">Пропуснати</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
