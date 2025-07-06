
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Medication, MedicationTake } from '@/types/medication';
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { bg } from 'date-fns/locale';
import { TrendingUp, TrendingDown, Target, Award, AlertTriangle } from 'lucide-react';

interface AdvancedStatisticsProps {
  medications: Medication[];
  takes: MedicationTake[];
}

export const AdvancedStatistics = ({ medications, takes }: AdvancedStatisticsProps) => {
  const today = new Date();
  const lastWeek = subDays(today, 7);
  const thisWeekStart = startOfWeek(today, { weekStartsOn: 1 });
  const thisWeekEnd = endOfWeek(today, { weekStartsOn: 1 });
  
  // Weekly compliance
  const thisWeekTakes = takes.filter(take => {
    const takeDate = new Date(take.takenAt);
    return takeDate >= thisWeekStart && takeDate <= thisWeekEnd;
  });
  
  const expectedTakesThisWeek = medications.reduce((total, med) => {
    const daysInWeek = eachDayOfInterval({ start: thisWeekStart, end: today }).length;
    return total + (med.times.length * daysInWeek);
  }, 0);
  
  const complianceRate = expectedTakesThisWeek > 0 
    ? Math.round((thisWeekTakes.length / expectedTakesThisWeek) * 100)
    : 0;

  // Streaks calculation
  const calculateStreak = () => {
    let currentStreak = 0;
    let checkDate = new Date(today);
    
    while (checkDate >= subDays(today, 30)) {
      const dayTakes = takes.filter(take => {
        const takeDate = new Date(take.takenAt);
        return takeDate.toDateString() === checkDate.toDateString();
      });
      
      const expectedTakesForDay = medications.reduce((total, med) => total + med.times.length, 0);
      
      if (dayTakes.length >= expectedTakesForDay && expectedTakesForDay > 0) {
        currentStreak++;
      } else if (checkDate.toDateString() !== today.toDateString()) {
        break;
      }
      
      checkDate = subDays(checkDate, 1);
    }
    
    return currentStreak;
  };

  const streak = calculateStreak();

  // Most/least compliant medication
  const medicationStats = medications.map(med => {
    const medTakes = takes.filter(take => take.medicationId === med.id);
    const expectedTakes = med.times.length * 7; // Last 7 days
    const actualTakes = medTakes.filter(take => 
      new Date(take.takenAt) >= lastWeek
    ).length;
    
    return {
      medication: med,
      compliance: expectedTakes > 0 ? (actualTakes / expectedTakes) * 100 : 0,
      actualTakes,
      expectedTakes
    };
  });

  const bestCompliance = medicationStats.reduce((best, current) => 
    current.compliance > best.compliance ? current : best
  , medicationStats[0]);

  const worstCompliance = medicationStats.reduce((worst, current) => 
    current.compliance < worst.compliance ? current : worst
  , medicationStats[0]);

  // Time pattern analysis
  const timePatterns = takes.map(take => {
    const hour = new Date(take.takenAt).getHours();
    if (hour >= 6 && hour < 12) return 'Сутрин';
    if (hour >= 12 && hour < 18) return 'Обяд';
    if (hour >= 18 && hour < 22) return 'Вечер';
    return 'Нощ';
  });

  const timeStats = {
    'Сутрин': timePatterns.filter(p => p === 'Сутрин').length,
    'Обяд': timePatterns.filter(p => p === 'Обяд').length,
    'Вечер': timePatterns.filter(p => p === 'Вечер').length,
    'Нощ': timePatterns.filter(p => p === 'Нощ').length,
  };

  const mostActiveTime = Object.entries(timeStats).reduce((max, [time, count]) => 
    count > max.count ? { time, count } : max
  , { time: 'Сутрин', count: 0 });

  const getComplianceColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600';
    if (rate >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getComplianceBadge = (rate: number) => {
    if (rate >= 95) return <Badge variant="default" className="bg-green-100 text-green-800">Отличен</Badge>;
    if (rate >= 85) return <Badge variant="default" className="bg-blue-100 text-blue-800">Много добър</Badge>;
    if (rate >= 70) return <Badge variant="default" className="bg-yellow-100 text-yellow-800">Добър</Badge>;
    return <Badge variant="destructive">Нуждае се от подобрение</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Compliance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Спазване тази седмица
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">{complianceRate}%</span>
            {getComplianceBadge(complianceRate)}
          </div>
          <Progress value={complianceRate} className="h-3" />
          <p className="text-sm text-gray-600">
            {thisWeekTakes.length} от {expectedTakesThisWeek} планирани приема
          </p>
        </CardContent>
      </Card>

      {/* Streak */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Последователност
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {streak} {streak === 1 ? 'ден' : 'дни'}
            </div>
            <p className="text-sm text-gray-600">
              {streak > 0 
                ? 'Страхотна работа! Продължавайте така!' 
                : 'Започнете нова серия днес!'
              }
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Best/Worst Performance */}
      {medications.length > 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <TrendingUp className="h-4 w-4" />
                Най-добро спазване
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium">{bestCompliance?.medication.name}</p>
                <div className="flex items-center gap-2">
                  <Progress value={bestCompliance?.compliance || 0} className="flex-1 h-2" />
                  <span className="text-sm font-medium">
                    {Math.round(bestCompliance?.compliance || 0)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-4 w-4" />
                Нуждае се от внимание
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium">{worstCompliance?.medication.name}</p>
                <div className="flex items-center gap-2">
                  <Progress value={worstCompliance?.compliance || 0} className="flex-1 h-2" />
                  <span className="text-sm font-medium">
                    {Math.round(worstCompliance?.compliance || 0)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Time Patterns */}
      <Card>
        <CardHeader>
          <CardTitle>Модели на прием</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(timeStats).map(([time, count]) => (
              <div key={time} className="flex items-center justify-between">
                <span className="text-sm">{time}</span>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={takes.length > 0 ? (count / takes.length) * 100 : 0} 
                    className="w-20 h-2" 
                  />
                  <span className="text-sm font-medium w-8">{count}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-4">
            Най-активно време: <span className="font-medium">{mostActiveTime.time}</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
