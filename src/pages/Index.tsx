
import { useMedications } from '@/hooks/useMedications';
import { MedicationCard } from '@/components/MedicationCard';
import { NotificationSettings } from '@/components/NotificationSettings';
import { MedicationReport } from '@/components/MedicationReport';
import { MedicationStatistics } from '@/components/MedicationStatistics';
import { MobileHeader } from '@/components/MobileHeader';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { MobileDrawer } from '@/components/MobileDrawer';
import { MobileAddMedicationSheet } from '@/components/MobileAddMedicationSheet';
import { MobileStatsCard } from '@/components/MobileStatsCard';
import { EditMedicationForm } from '@/components/EditMedicationForm';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useBackgroundNotifications } from '@/hooks/useBackgroundNotifications';
import { Pill } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { MedicationCalendar } from '@/components/MedicationCalendar';
import { ProfileSection } from '@/components/ProfileSection';
import { Medication } from '@/types/medication';

const Index = () => {
  const { medications, takes, addMedication, updateMedication, deleteMedication, takeMedication, getTodaysTakes } = useMedications();
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  // Initialize background notifications
  useBackgroundNotifications();
  
  const [activeTab, setActiveTab] = useState<'home' | 'calendar'>('home');
  const [showDrawer, setShowDrawer] = useState(false);
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);
  const [showEditSheet, setShowEditSheet] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Pill className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  // Don't render if not authenticated
  if (!user) {
    return null;
  }

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

  const handleEditMedication = (medication: Medication) => {
    setEditingMedication(medication);
    setShowEditSheet(true);
  };

  const handleSaveEditedMedication = (updatedMedication: Medication) => {
    updateMedication(updatedMedication);
    setShowEditSheet(false);
    setEditingMedication(null);
    toast({
      title: "Обновено!",
      description: `${updatedMedication.name} беше успешно обновено.`,
    });
  };

  // Calculate stats
  const completed = medications.filter(med => getTodaysTakes(med.id).length >= med.times.length).length;
  const partial = medications.filter(med => getTodaysTakes(med.id).length > 0 && getTodaysTakes(med.id).length < med.times.length).length;
  const missed = medications.filter(med => getTodaysTakes(med.id).length === 0).length;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Mobile Header */}
      <MobileHeader
        onSettingsClick={() => setShowSettings(true)}
        onReportClick={() => setShowReport(true)}
        onMenuClick={() => setShowDrawer(true)}
        onProfileClick={() => setShowProfile(true)}
      />

      {/* Main Content */}
      <div className="flex-1 pb-40 pt-6 overflow-y-auto">
        {activeTab === 'home' && (
          <div className="space-y-8">
            {/* Stats Card */}
            {medications.length > 0 && (
              <div className="px-4">
                <MobileStatsCard
                  completed={completed}
                  partial={partial}
                  missed={missed}
                  total={medications.length}
                />
              </div>
            )}

            {/* Medications List */}
            <div className="px-4">
              {medications.length === 0 ? (
                <div className="text-center py-20">
                  <Pill className="h-16 w-16 text-gray-300 mx-auto mb-6" />
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    Няма добавени лекарства
                  </h3>
                  <p className="text-gray-600 text-sm px-8 leading-relaxed">
                    Започнете като добавите първото си лекарство чрез бутона "+" отдолу.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {medications.map((medication) => (
                    <MedicationCard
                      key={medication.id}
                      medication={medication}
                      todaysTakes={getTodaysTakes(medication.id).length}
                      onTake={() => handleTakeMedication(medication.id, medication.name)}
                      onDelete={() => handleDeleteMedication(medication.id, medication.name)}
                      onEdit={() => handleEditMedication(medication)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="px-4 py-4">
            <MedicationCalendar medications={medications} takes={takes} />
          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        onAddClick={() => setShowAddSheet(true)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={showDrawer}
        onClose={() => setShowDrawer(false)}
        onSettingsClick={() => setShowSettings(true)}
        onReportClick={() => setShowReport(true)}
        onStatisticsClick={() => setShowStatistics(true)}
      />

      {/* Add Medication Sheet */}
      <MobileAddMedicationSheet
        isOpen={showAddSheet}
        onClose={() => setShowAddSheet(false)}
        onAdd={handleAddMedication}
      />

      {/* Edit Medication Sheet */}
      <Sheet open={showEditSheet} onOpenChange={setShowEditSheet}>
        <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle>Редактирай лекарство</SheetTitle>
          </SheetHeader>
          {editingMedication && (
            <EditMedicationForm
              medication={editingMedication}
              onSave={handleSaveEditedMedication}
              onCancel={() => {
                setShowEditSheet(false);
                setEditingMedication(null);
              }}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Profile Sheet */}
      <Sheet open={showProfile} onOpenChange={setShowProfile}>
        <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle>Профил</SheetTitle>
          </SheetHeader>
          <ProfileSection />
        </SheetContent>
      </Sheet>

      {/* Statistics Sheet */}
      <Sheet open={showStatistics} onOpenChange={setShowStatistics}>
        <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle>Статистика</SheetTitle>
          </SheetHeader>
          <MedicationStatistics medications={medications} takes={takes} />
        </SheetContent>
      </Sheet>

      {/* Settings Sheet */}
      <Sheet open={showSettings} onOpenChange={setShowSettings}>
        <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle>Настройки</SheetTitle>
          </SheetHeader>
          <NotificationSettings />
        </SheetContent>
      </Sheet>

      {/* Report Sheet */}
      <Sheet open={showReport} onOpenChange={setShowReport}>
        <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle>Медицински отчет</SheetTitle>
          </SheetHeader>
          <MedicationReport medications={medications} takes={takes} />
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Index;
