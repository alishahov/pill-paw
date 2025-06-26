
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileText } from 'lucide-react';
import { Medication, MedicationTake } from '@/types/medication';
import { useToast } from '@/hooks/use-toast';

interface MedicationReportProps {
  medications: Medication[];
  takes: MedicationTake[];
}

export const MedicationReport = ({ medications, takes }: MedicationReportProps) => {
  const { toast } = useToast();

  const generateReport = () => {
    const reportData = {
      generatedAt: new Date().toLocaleString('bg-BG'),
      medications: medications.map(med => ({
        name: med.name,
        dosage: med.dosage,
        frequency: getFrequencyText(med.frequency),
        times: med.times,
        duration: med.duration,
        mealTiming: getMealTimingText(med.mealTiming),
        notes: med.notes,
        createdAt: new Date(med.createdAt).toLocaleDateString('bg-BG'),
        recentTakes: takes
          .filter(take => take.medicationId === med.id)
          .slice(-10)
          .map(take => ({
            takenAt: new Date(take.takenAt).toLocaleString('bg-BG'),
            notes: take.notes
          }))
      }))
    };

    const reportText = generateTextReport(reportData);
    downloadReport(reportText);
  };

  const getFrequencyText = (frequency: string) => {
    const map = {
      daily: 'Веднъж дневно',
      twice: 'Два пъти дневно',
      three: 'Три пъти дневно',
      four: 'Четири пъти дневно'
    };
    return map[frequency as keyof typeof map] || frequency;
  };

  const getMealTimingText = (mealTiming?: string) => {
    if (!mealTiming) return 'Не е указано';
    const map = {
      before: 'Преди хранене',
      during: 'По време на хранене',
      after: 'След хранене'
    };
    return map[mealTiming as keyof typeof map] || mealTiming;
  };

  const generateTextReport = (data: any) => {
    let report = `ОТЧЕТ ЗА ПРИЕМАНЕ НА ЛЕКАРСТВА\n`;
    report += `Генериран на: ${data.generatedAt}\n\n`;
    report += `===========================================\n\n`;

    data.medications.forEach((med: any, index: number) => {
      report += `${index + 1}. ${med.name}\n`;
      report += `   Доза: ${med.dosage}\n`;
      report += `   Честота: ${med.frequency}\n`;
      report += `   Времена: ${med.times.join(', ')}\n`;
      if (med.duration) report += `   Продължителност: ${med.duration}\n`;
      report += `   Спрямо хранене: ${med.mealTiming}\n`;
      if (med.notes) report += `   Бележки: ${med.notes}\n`;
      report += `   Добавено на: ${med.createdAt}\n\n`;

      if (med.recentTakes.length > 0) {
        report += `   Последни приеми:\n`;
        med.recentTakes.forEach((take: any) => {
          report += `   - ${take.takenAt}`;
          if (take.notes) report += ` (${take.notes})`;
          report += `\n`;
        });
      } else {
        report += `   Няма записани приеми\n`;
      }
      report += `\n-------------------------------------------\n\n`;
    });

    report += `Общо лекарства: ${data.medications.length}\n`;
    report += `Общо записани приеми: ${data.medications.reduce((sum: number, med: any) => sum + med.recentTakes.length, 0)}\n`;

    return report;
  };

  const downloadReport = (content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `medication-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Отчетът е изтеглен!",
      description: "Можете да споделите файла с вашия лекар.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Медицински отчет
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          Генерирайте подробен отчет за вашите лекарства и техните приеми, който можете да споделите с лекар.
        </p>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Отчетът ще включва:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Списък на всички лекарства с детайли</li>
            <li>• Дози и времена на прием</li>
            <li>• Продължителност и указания за хранене</li>
            <li>• История на последните приеми</li>
            <li>• Общи статистики</li>
          </ul>
        </div>

        <Button 
          onClick={generateReport}
          className="w-full"
          disabled={medications.length === 0}
        >
          <Download className="h-4 w-4 mr-2" />
          Изтегли отчет (.txt)
        </Button>

        {medications.length === 0 && (
          <p className="text-sm text-gray-500 text-center">
            Добавете лекарства, за да генерирате отчет
          </p>
        )}
      </CardContent>
    </Card>
  );
};
