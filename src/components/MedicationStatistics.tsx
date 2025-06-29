
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Medication, MedicationTake } from '@/types/medication';
import { Calendar, Clock, TrendingUp, Pill } from 'lucide-react';
import { format, differenceInDays, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { bg } from 'date-fns/locale';

interface MedicationStatisticsProps {
  medications: Medication[];
  takes: MedicationTake[];
}

export const MedicationStatistics = ({ medications, takes }: MedicationStatisticsProps) => {
  const calculateMedicationStats = (medication: Medication) => {
    const medicationTakes = takes.filter(take => take.medicationId === medication.id);
    
    if (medicationTakes.length === 0) {
      return {
        daysActive: 0,
        totalTakes: 0,
        averagePerDay: 0,
        adherenceRate: 0,
        firstTake: null,
        lastTake: null,
      };
    }

    const sortedTakes = medicationTakes
      .map(take => new Date(take.takenAt))
      .sort((a, b) => a.getTime() - b.getTime());

    const firstTake = sortedTakes[0];
    const lastTake = sortedTakes[sortedTakes.length - 1];
    const daysActive = differenceInDays(lastTake, firstTake) + 1;
    
    // Calculate adherence rate based on expected vs actual takes
    const expectedTakesPerDay = medication.times.length;
    const expectedTotalTakes = daysActive * expectedTakesPerDay;
    const adherenceRate = expectedTotalTakes > 0 ? (medicationTakes.length / expectedTotalTakes) * 100 : 0;

    return {
      daysActive,
      totalTakes: medicationTakes.length,
      averagePerDay: daysActive > 0 ? medicationTakes.length / daysActive : 0,
      adherenceRate: Math.min(adherenceRate, 100),
      firstTake,
      lastTake,
    };
  };

  const getOverallStats = () => {
    const totalMedications = medications.length;
    const activeMedications = medications.filter(med => 
      takes.some(take => take.medicationId === med.id)
    ).length;
    
    const today = new Date();
    const todayTakes = takes.filter(take => 
      isWithinInterval(new Date(take.takenAt), {
        start: startOfDay(today),
        end: endOfDay(today)
      })
    ).length;

    const thisWeekTakes = takes.filter(take => {
      const takeDate = new Date(take.takenAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return takeDate >= weekAgo;
    }).length;

    return {
      totalMedications,
      activeMedications,
      todayTakes,
      thisWeekTakes,
    };
  };

  const overallStats = getOverallStats();

  return (
    <div className="space-y-6">
      {/* Overall Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Обща статистика
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{overallStats.totalMedications}</div>
              <div className="text-sm text-gray-600">Общо лекарства</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{overallStats.activeMedications}</div>
              <div className="text-sm text-gray-600">Активни лекарства</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{overallStats.todayTakes}</div>
              <div className="text-sm text-gray-600">Приеми днес</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{overallStats.thisWeekTakes}</div>
              <div className="text-sm text-gray-600">Приеми тази седмица</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Medication Statistics */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Статистика по лекарства</h3>
        {medications.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Pill className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Няма добавени лекарства</p>
            </CardContent>
          </Card>
        ) : (
          medications.map((medication) => {
            const stats = calculateMedicationStats(medication);
            
            return (
              <Card key={medication.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{medication.name}</CardTitle>
                    <Badge variant="secondary">{medication.dosage}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {stats.totalTakes === 0 ? (
                    <p className="text-gray-600 text-sm">Все още няма отбелязани приеми</p>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="flex items-center gap-1 text-gray-600 mb-1">
                            <Calendar className="h-3 w-3" />
                            Дни активност
                          </div>
                          <div className="font-semibold">{stats.daysActive} дни</div>
                        </div>
                        <div>
                          <div className="flex items-center gap-1 text-gray-600 mb-1">
                            <Pill className="h-3 w-3" />
                            Общо приеми
                          </div>
                          <div className="font-semibold">{stats.totalTakes}</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Спазване на схемата</span>
                          <span className="font-semibold">{stats.adherenceRate.toFixed(1)}%</span>
                        </div>
                        <Progress value={stats.adherenceRate} className="h-2" />
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                        <div>
                          <div>Първи прием:</div>
                          <div className="font-medium">
                            {stats.firstTake ? format(stats.firstTake, 'dd.MM.yyyy') : '-'}
                          </div>
                        </div>
                        <div>
                          <div>Последен прием:</div>
                          <div className="font-medium">
                            {stats.lastTake ? format(stats.lastTake, 'dd.MM.yyyy') : '-'}
                          </div>
                        </div>
                      </div>

                      <div className="text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Средно {stats.averagePerDay.toFixed(1)} приема на ден
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
