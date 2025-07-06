
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, Upload, Shield, AlertCircle } from 'lucide-react';
import { Medication, MedicationTake } from '@/types/medication';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface BackupRestoreProps {
  medications: Medication[];
  takes: MedicationTake[];
  onRestore: (medications: Medication[], takes: MedicationTake[]) => void;
}

export const BackupRestore = ({ medications, takes, onRestore }: BackupRestoreProps) => {
  const [importing, setImporting] = useState(false);
  const { toast } = useToast();

  const createBackup = () => {
    const backupData = {
      version: "1.0",
      createdAt: new Date().toISOString(),
      medications: medications,
      takes: takes,
      metadata: {
        totalMedications: medications.length,
        totalTakes: takes.length,
        appVersion: "Pill Paw v1.0"
      }
    };

    const dataStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `pill-paw-backup-${format(new Date(), 'yyyy-MM-dd-HHmm')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Резервно копие създадено",
      description: "Данните са експортирани успешно.",
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      toast({
        title: "Неправилен файл",
        description: "Моля, изберете JSON файл.",
        variant: "destructive",
      });
      return;
    }

    setImporting(true);

    try {
      const text = await file.text();
      const backupData = JSON.parse(text);

      // Validate backup structure
      if (!backupData.version || !backupData.medications || !backupData.takes) {
        throw new Error("Неправилен формат на резервното копие");
      }

      // Convert dates back to Date objects
      const restoredMedications: Medication[] = backupData.medications.map((med: any) => ({
        ...med,
        createdAt: new Date(med.createdAt),
        lastTaken: med.lastTaken ? new Date(med.lastTaken) : undefined
      }));

      const restoredTakes: MedicationTake[] = backupData.takes.map((take: any) => ({
        ...take,
        takenAt: new Date(take.takenAt)
      }));

      onRestore(restoredMedications, restoredTakes);

      toast({
        title: "Възстановяване успешно",
        description: `Възстановени ${restoredMedications.length} лекарства и ${restoredTakes.length} приема.`,
      });

    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Грешка при възстановяване",
        description: "Файлът не може да бъде обработен. Моля, проверете формата.",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
      // Clear the input
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Резервно копие и възстановяване
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label>Създаване на резервно копие</Label>
              <Button onClick={createBackup} className="w-full" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Изтегли резервно копие
              </Button>
              <p className="text-xs text-gray-600">
                Експортира всички лекарства и данни за приемите
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="backup-file">Възстановяване от резервно копие</Label>
              <Input
                id="backup-file"
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                disabled={importing}
              />
              <p className="text-xs text-gray-600">
                Изберете JSON файл с резервно копие
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Важно:</p>
                <ul className="text-xs space-y-1">
                  <li>• Възстановяването ще замени всички настоящи данни</li>
                  <li>• Препоръчваме да създадете резервно копие преди възстановяване</li>
                  <li>• Файловете се съхраняват само локalno на вашето устройство</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Текущи данни</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{medications.length}</div>
              <p className="text-sm text-gray-600">Лекарства</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{takes.length}</div>
              <p className="text-sm text-gray-600">Приема</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
