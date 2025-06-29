
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Medication } from '@/types/medication';

interface EditMedicationFormProps {
  medication: Medication;
  onSave: (medication: Medication) => void;
  onCancel: () => void;
}

const frequencyOptions = [
  { value: 'daily', label: 'Веднъж дневно', count: 1 },
  { value: 'twice', label: 'Два пъти дневно', count: 2 },
  { value: 'three', label: 'Три пъти дневно', count: 3 },
  { value: 'four', label: 'Четири пъти дневно', count: 4 },
];

const mealTimingOptions = [
  { value: 'before', label: 'Преди хранене' },
  { value: 'during', label: 'По време на хранене' },
  { value: 'after', label: 'След хранене' },
];

export const EditMedicationForm = ({ medication, onSave, onCancel }: EditMedicationFormProps) => {
  const [name, setName] = useState(medication.name);
  const [dosage, setDosage] = useState(medication.dosage);
  const [frequency, setFrequency] = useState<'daily' | 'twice' | 'three' | 'four'>(medication.frequency);
  const [times, setTimes] = useState<string[]>(medication.times);
  const [notes, setNotes] = useState(medication.notes || '');
  const [duration, setDuration] = useState(medication.duration || '');
  const [mealTiming, setMealTiming] = useState<'before' | 'during' | 'after' | ''>(medication.mealTiming || '');

  const updateTimesForFrequency = (newFrequency: 'daily' | 'twice' | 'three' | 'four') => {
    const option = frequencyOptions.find(opt => opt.value === newFrequency);
    if (option) {
      const currentTimes = [...times];
      const newTimes = [];
      
      for (let i = 0; i < option.count; i++) {
        newTimes.push(currentTimes[i] || '08:00');
      }
      setTimes(newTimes);
    }
  };

  const handleFrequencyChange = (value: string) => {
    const newFrequency = value as 'daily' | 'twice' | 'three' | 'four';
    setFrequency(newFrequency);
    updateTimesForFrequency(newFrequency);
  };

  const updateTime = (index: number, value: string) => {
    const newTimes = [...times];
    newTimes[index] = value;
    setTimes(newTimes);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !dosage.trim() || times.some(time => !time.trim())) {
      return;
    }

    const updatedMedication: Medication = {
      ...medication,
      name: name.trim(),
      dosage: dosage.trim(),
      frequency,
      times: times.filter(time => time.trim()),
      notes: notes.trim() || undefined,
      duration: duration.trim() || undefined,
      mealTiming: mealTiming || undefined,
    };

    onSave(updatedMedication);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Име на лекарството</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Напр. Аспирин"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dosage">Доза</Label>
          <Input
            id="dosage"
            value={dosage}
            onChange={(e) => setDosage(e.target.value)}
            placeholder="Напр. 500mg"
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Честота на прием</Label>
          <Select value={frequency} onValueChange={handleFrequencyChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {frequencyOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Времена за прием</Label>
          <div className="space-y-2">
            {times.map((time, index) => (
              <Input
                key={index}
                type="time"
                value={time}
                onChange={(e) => updateTime(index, e.target.value)}
                required
              />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="duration">Продължителност на приема (по избор)</Label>
          <Input
            id="duration"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="Напр. 7 дни, 2 седмици, 1 месец"
          />
        </div>

        <div className="space-y-2">
          <Label>Спрямо хранене (по избор)</Label>
          <Select value={mealTiming} onValueChange={(value) => setMealTiming(value as 'before' | 'during' | 'after')}>
            <SelectTrigger>
              <SelectValue placeholder="Изберете опция" />
            </SelectTrigger>
            <SelectContent>
              {mealTimingOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Бележки (по избор)</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Допълнителна информация..."
            rows={3}
          />
        </div>

        <div className="flex gap-2">
          <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
            Запази промените
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Отказ
          </Button>
        </div>
      </form>
    </div>
  );
};
