
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';

interface AddMedicationFormProps {
  onAdd: (medication: {
    name: string;
    dosage: string;
    frequency: 'daily' | 'twice' | 'three' | 'four';
    times: string[];
    notes?: string;
  }) => void;
}

const frequencyOptions = [
  { value: 'daily', label: 'Веднъж дневно', count: 1 },
  { value: 'twice', label: 'Два пъти дневно', count: 2 },
  { value: 'three', label: 'Три пъти дневно', count: 3 },
  { value: 'four', label: 'Четири пъти дневно', count: 4 },
];

export const AddMedicationForm = ({ onAdd }: AddMedicationFormProps) => {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'twice' | 'three' | 'four'>('daily');
  const [times, setTimes] = useState<string[]>(['08:00']);
  const [notes, setNotes] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const updateTimesForFrequency = (newFrequency: 'daily' | 'twice' | 'three' | 'four') => {
    const option = frequencyOptions.find(opt => opt.value === newFrequency);
    if (option) {
      const defaultTimes = [];
      for (let i = 0; i < option.count; i++) {
        defaultTimes.push(i === 0 ? '08:00' : '');
      }
      setTimes(defaultTimes);
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

    onAdd({
      name: name.trim(),
      dosage: dosage.trim(),
      frequency,
      times: times.filter(time => time.trim()),
      notes: notes.trim() || undefined,
    });

    // Изчистване на формата
    setName('');
    setDosage('');
    setFrequency('daily');
    setTimes(['08:00']);
    setNotes('');
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <Button 
        onClick={() => setIsOpen(true)}
        className="w-full bg-blue-600 hover:bg-blue-700"
      >
        <Plus className="h-4 w-4 mr-2" />
        Добави ново лекарство
      </Button>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Добави ново лекарство</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
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
              Добави лекарство
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
            >
              Отказ
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
