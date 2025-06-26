
export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: 'daily' | 'twice' | 'three' | 'four';
  times: string[];
  notes?: string;
  createdAt: Date;
  lastTaken?: Date;
  duration?: string; // Продължителност на приема
  mealTiming?: 'before' | 'during' | 'after'; // Спрямо хранене
}

export interface MedicationTake {
  medicationId: string;
  takenAt: Date;
  notes?: string;
}

export interface NotificationSnooze {
  medicationId: string;
  originalTime: Date;
  snoozeUntil: Date;
  snoozedAt: Date;
}
