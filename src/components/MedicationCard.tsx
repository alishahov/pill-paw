
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pill, Bell, Trash2, Edit } from 'lucide-react';
import { Medication } from '@/types/medication';

interface MedicationCardProps {
  medication: Medication;
  todaysTakes: number;
  onTake: () => void;
  onDelete: () => void;
  onEdit: () => void;
}

const frequencyLabels = {
  daily: 'Веднъж дневно',
  twice: 'Два пъти дневно',
  three: 'Три пъти дневно',
  four: 'Четири пъти дневно',
};

export const MedicationCard = ({ 
  medication, 
  todaysTakes, 
  onTake, 
  onDelete,
  onEdit
}: MedicationCardProps) => {
  const isCompleted = todaysTakes >= medication.times.length;
  
  return (
    <Card className={`transition-all ${isCompleted ? 'bg-green-50 border-green-200' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Pill className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">{medication.name}</CardTitle>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Доза:</span>
          <Badge variant="secondary">{medication.dosage}</Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Честота:</span>
          <span className="text-sm">{frequencyLabels[medication.frequency]}</span>
        </div>
        
        <div className="space-y-1">
          <span className="text-sm text-gray-600">Времена:</span>
          <div className="flex flex-wrap gap-1">
            {medication.times.map((time, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {time}
              </Badge>
            ))}
          </div>
        </div>
        
        {medication.notes && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">Бележки:</span> {medication.notes}
          </div>
        )}
        
        <div className="flex items-center justify-between pt-2">
          <div className="text-sm">
            Взето днес: <span className="font-medium">{todaysTakes}/{medication.times.length}</span>
          </div>
          
          {!isCompleted && (
            <Button 
              onClick={onTake}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Bell className="h-4 w-4 mr-1" />
              Взех
            </Button>
          )}
          
          {isCompleted && (
            <Badge className="bg-green-600">Завършено за днес</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
