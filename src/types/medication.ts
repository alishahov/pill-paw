
export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: 'daily' | 'twice' | 'three' | 'four';
  times: string[];
  notes?: string;
  createdAt: Date;
  lastTaken?: Date;
}

export interface MedicationTake {
  medicationId: string;
  takenAt: Date;
  notes?: string;
}
