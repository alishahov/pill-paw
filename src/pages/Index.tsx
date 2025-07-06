
import { useEnhancedMedications } from '@/hooks/useEnhancedMedications';
import { MedicationCard } from '@/components/MedicationCard';
import { NotificationSettings } from '@/components/NotificationSettings';
import { EnhancedMedicationReport } from '@/components/EnhancedMedicationReport';
import { MobileHeader } from '@/components/MobileHeader';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { MobileDrawer } from '@/components/MobileDrawer';
import { MobileAddMedicationSheet } from '@/components/MobileAddMedicationSheet';
import { MobileStatsCard } from '@/components/MobileStatsCard';
import { EditMedicationForm } from '@/components/EditMedicationForm';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useBackgroundNotifications } from '@/hooks/useBackgroundNotifications';
import { Pill, Loader2, Sync } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { MedicationCalendar } from '@/components/MedicationCalendar';
import { ProfileSection } from '@/components/ProfileSection';
import { Medication } from '@/types/medication';
import { Button } from '@/components/ui/button';

const Index = () => {
  const { 
    medications, 
    takes, 
    addMedication, 
    updateMedication, 
    deleteMedication, 
    takeMedication, 
    getTodaysTakes,
    restoreFromBackup,
    syncToCloud,
    loading
  } = useEnhancedMedications();
  
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
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
  const [syncing, setSyncing] = useState(false);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Show loading while checking auth or loading data
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Зареждане...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!user) {
    return null;
  }

  const handleAddMedication = async (medicationData: Parameters<typeof addMedication>[0]) => {
    const newMedication = await addMedication(medicationData);
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

  const handleSync = async () => {
    setSyncing(true);
    await syncToCloud();
    setSyncing(false);
  };

  const handleRestore = (backupMedications: Medication[], backupTakes: any[]) => {
    restoreFromBackup(backupMedications, backupTakes);
  };

  // Calculate stats
  const completed = medications.filter(med => getTodaysTakes(med.id).length >= med.times.length).length;
  const partial = medications.filter(med => getTodaysTakes(med.id).length > 0 && getTodaysTakes(med.id).length < med.times.length).length;
  const missed = medications.filter(med => getTodaysTakes(med.id).length === 0).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Mobile Header */}
      <MobileHeader
        onSettingsClick={() => setShowSettings(true)}
        onReportClick={() => setShowReport(true)}
        onMenuClick={() => setShowDrawer(true)}
        onNotificationsClick={() => setShowSettings(true)}
        onProfileClick={() => setShowProfile(true)}
      />

      {/* Main Content */}
      <div className="flex-1 pb-40 pt-20 overflow-y-auto">
        {activeTab === 'home' && (
          <div className="space-y-6">
            {/* Sync Button */}
            {user && (
              <div className="px-4">
                <Button
                  onClick={handleSync}
                  disabled={syncing}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  {syncing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Sync className="h-4 w-4 mr-2" />
                  )}
                  {syncing ? 'Синхронизиране...' : 'Синхронизирай с облака'}
                </Button>
              </div>
            )}

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
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                    Няма добавени лекарства
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm px-8 leading-relaxed">
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

      {/* Enhanced Statistics Sheet */}
      <Sheet open={showStatistics} onOpenChange={setShowStatistics}>
        <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle>Подробна статистика</SheetTitle>
          </SheetHeader>
          <EnhancedMedicationReport 
            medications={medications} 
            takes={takes}
            onRestore={handleRestore}
          />
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

      {/* Enhanced Report Sheet */}
      <Sheet open={showReport} onOpenChange={setShowReport}>
        <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle>Отчети и анализи</SheetTitle>
          </SheetHeader>
          <EnhancedMedicationReport 
            medications={medications} 
            takes={takes}
            onRestore={handleRestore}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Index;
