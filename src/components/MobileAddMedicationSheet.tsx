
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { AddMedicationForm } from '@/components/AddMedicationForm';
import { Medication } from '@/types/medication';

interface MobileAddMedicationSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (medication: Omit<Medication, 'id' | 'createdAt'>) => void;
}

export const MobileAddMedicationSheet = ({ isOpen, onClose, onAdd }: MobileAddMedicationSheetProps) => {
  const handleAdd = (medicationData: Omit<Medication, 'id' | 'createdAt'>) => {
    onAdd(medicationData);
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle>Добави лекарство</SheetTitle>
        </SheetHeader>
        <AddMedicationForm onAdd={handleAdd} />
      </SheetContent>
    </Sheet>
  );
};
