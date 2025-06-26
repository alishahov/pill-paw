
import { useMedications } from '@/hooks/useMedications';
import { MedicationCard } from '@/components/MedicationCard';
import { AddMedicationForm } from '@/components/AddMedicationForm';
import { NotificationSettings } from '@/components/NotificationSettings';
import { MedicationReport } from '@/components/MedicationReport';
import { useToast } from '@/hooks/use-toast';
import { Pill, Calendar, Settings, FileText } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const { medications, takes, addMedication, deleteMedication, takeMedication, getTodaysTakes } = useMedications();
  const { toast } = useToast();
  const [showSettings, setShowSettings] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const handleAddMedication = (medicationData: Parameters<typeof addMedication>[0]) => {
    addMedication(medicationData);
    toast({
      title: "Успешно добавено!",
      description: `${medicationData.name} беше добавено в списъка.`,
    });
  };

  const handleTakeMedication = (medicationId: string, medicationName: string) => {
    takeMedication(medicationId);
    toast({
      title: "Отбелязано!",
      description: `Приемът на ${medicationName} беше отбелязан.`,
    });
  };

  const handleDeleteMedication = (medicationId: string, medicationName: string) => {
    deleteMedication(medicationId);
    toast({
      title: "Изтрито!",
      description: `${medicationName} беше премахнато от списъка.`,
      variant: "destructive",
    });
  };

  const today = new Date().toLocaleDateString('bg-BG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3">
            <Pill className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Моите лекарства</h1>
            <div className="flex gap-2 ml-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowReport(!showReport)}
              >
                <FileText className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 text-gray-600">
            <Calendar className="h-4 w-4" />
            <p className="text-sm capitalize">{today}</p>
          </div>
        </div>

        {/* Settings panel */}
        {showSettings && (
          <div className="max-w-2xl mx-auto">
            <NotificationSettings />
          </div>
        )}

        {/* Report panel */}
        {showReport && (
          <div className="max-w-2xl mx-auto">
            <MedicationReport medications={medications} takes={takes} />
          </div>
        )}

        {/* Add medication form */}
        <div className="max-w-2xl mx-auto">
          <AddMedicationForm onAdd={handleAddMedication} />
        </div>

        {/* Medications list */}
        <div className="space-y-4">
          {medications.length === 0 ? (
            <div className="text-center py-12">
              <Pill className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Няма добавени лекарства
              </h3>
              <p className="text-gray-600">
                Започнете като добавите първото си лекарство или хранителна добавка.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {medications.map((medication) => (
                <MedicationCard
                  key={medication.id}
                  medication={medication}
                  todaysTakes={getTodaysTakes(medication.id).length}
                  onTake={() => handleTakeMedication(medication.id, medication.name)}
                  onDelete={() => handleDeleteMedication(medication.id, medication.name)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Quick stats */}
        {medications.length > 0 && (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Статистика за днес</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{medications.length}</div>
                <div className="text-sm text-gray-600">Общо лекарства</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {medications.filter(med => getTodaysTakes(med.id).length >= med.times.length).length}
                </div>
                <div className="text-sm text-gray-600">Завършени</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {medications.filter(med => getTodaysTakes(med.id).length > 0 && getTodaysTakes(med.id).length < med.times.length).length}
                </div>
                <div className="text-sm text-gray-600">Частично</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {medications.filter(med => getTodaysTakes(med.id).length === 0).length}
                </div>
                <div className="text-sm text-gray-600">Невзети</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
