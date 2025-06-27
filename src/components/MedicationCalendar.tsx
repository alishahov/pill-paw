
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Medication, MedicationTake } from '@/types/medication';
import { format, isSameDay } from 'date-fns';
import { bg } from 'date-fns/locale';
import { useState } from 'react';

interface MedicationCalendarProps {
  medications: Medication[];
  takes: MedicationTake[];
}

export const MedicationCalendar = ({ medications, takes }: MedicationCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const getTakesForDate = (date: Date) => {
    return takes.filter(take => isSameDay(new Date(take.takenAt), date));
  };

  const getMedicationName = (medicationId: string) => {
    return medications.find(med => med.id === medicationId)?.name || 'Неизвестно лекарство';
  };

  const selectedDateTakes = getTakesForDate(selectedDate);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Календар на приемите</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            locale={bg}
            className="rounded-md border"
            modifiers={{
              hasTakes: (date) => getTakesForDate(date).length > 0
            }}
            modifiersStyles={{
              hasTakes: { backgroundColor: '#dbeafe', fontWeight: 'bold' }
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Приеми за {format(selectedDate, 'd MMMM yyyy', { locale: bg })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedDateTakes.length === 0 ? (
            <p className="text-gray-600 text-center py-4">
              Няма записани приеми за този ден
            </p>
          ) : (
            <div className="space-y-3">
              {selectedDateTakes.map((take, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{getMedicationName(take.medicationId)}</p>
                    <p className="text-sm text-gray-600">
                      {format(new Date(take.takenAt), 'HH:mm')}
                    </p>
                  </div>
                  <Badge variant="outline">Взето</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
