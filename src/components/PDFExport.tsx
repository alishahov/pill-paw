
import { Button } from '@/components/ui/button';
import { FileDown, Calendar, Pill } from 'lucide-react';
import { Medication, MedicationTake } from '@/types/medication';
import { format } from 'date-fns';
import { bg } from 'date-fns/locale';

interface PDFExportProps {
  medications: Medication[];
  takes: MedicationTake[];
  onExport?: () => void;
}

export const PDFExport = ({ medications, takes, onExport }: PDFExportProps) => {
  const generatePDFContent = () => {
    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const recentTakes = takes.filter(take => 
      new Date(take.takenAt) >= lastWeek
    );

    const content = `
      МЕДИЦИНСКИ ОТЧЕТ - PILL PAW
      ================================
      
      Дата на генериране: ${format(today, 'dd.MM.yyyy HH:mm', { locale: bg })}
      
      АКТИВНИ ЛЕКАРСТВА (${medications.length})
      ================================
      ${medications.map((med, index) => `
      ${index + 1}. ${med.name}
         Дозировка: ${med.dosage}
         Часове: ${med.times.join(', ')}
         ${med.notes ? `Бележки: ${med.notes}` : ''}
      `).join('\n')}
      
      ПРИЕМИ ЗА ПОСЛЕДНАТА СЕДМИЦА (${recentTakes.length})
      ================================
      ${recentTakes.map(take => {
        const medication = medications.find(m => m.id === take.medicationId);
        return `
      • ${format(new Date(take.takenAt), 'dd.MM.yyyy HH:mm', { locale: bg })}
        Лекарство: ${medication?.name || 'Неизвестно'}
        ${take.notes ? `Бележки: ${take.notes}` : ''}`;
      }).join('\n')}
      
      СТАТИСТИКА
      ================================
      Общо приеми: ${takes.length}
      Приеми тази седмица: ${recentTakes.length}
      Средно приеми на ден: ${(recentTakes.length / 7).toFixed(1)}
      
      ================================
      Генерирано от Pill Paw
      Приложение за напомняне на лекарства
    `;

    return content;
  };

  const exportToPDF = () => {
    const content = generatePDFContent();
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pill-paw-report-${format(new Date(), 'yyyy-MM-dd')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    onExport?.();
  };

  const exportCalendarData = () => {
    const calendarEvents = medications.flatMap(med => 
      med.times.map(time => ({
        title: `💊 ${med.name}`,
        time: time,
        dosage: med.dosage,
        notes: med.notes
      }))
    );

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Pill Paw//Medication Reminders//EN
${calendarEvents.map(event => `
BEGIN:VEVENT
SUMMARY:${event.title}
DESCRIPTION:Дозировка: ${event.dosage}${event.notes ? `\\nБележки: ${event.notes}` : ''}
RRULE:FREQ=DAILY
END:VEVENT`).join('')}
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pill-paw-calendar-${format(new Date(), 'yyyy-MM-dd')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3">
        <Button
          onClick={exportToPDF}
          variant="outline"
          className="w-full justify-start"
        >
          <FileDown className="h-4 w-4 mr-2" />
          Експорт медицински отчет
        </Button>
        
        <Button
          onClick={exportCalendarData}
          variant="outline"
          className="w-full justify-start"
        >
          <Calendar className="h-4 w-4 mr-2" />
          Експорт календарни събития
        </Button>
      </div>
      
      <p className="text-xs text-gray-600 text-center">
        Отчетите могат да бъдат споделени с лекаря ви
      </p>
    </div>
  );
};
