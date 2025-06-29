
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Camera, Save, User } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useRef } from 'react';

interface ProfileEditFormProps {
  onSave?: () => void;
}

export const ProfileEditForm = ({ onSave }: ProfileEditFormProps) => {
  const { profile, updateProfile, uploadAvatar, loading } = useProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    bio: profile?.bio || '',
    date_of_birth: profile?.date_of_birth || '',
  });

  const [saving, setSaving] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('Файлът трябва да е под 5MB');
      return;
    }

    await uploadAvatar(file);
  };

  const handleSave = async () => {
    setSaving(true);
    const success = await updateProfile(formData);
    setSaving(false);
    
    if (success && onSave) {
      onSave();
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Зареждане...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Редактиране на профил</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarImage 
                  src={profile?.avatar_url || undefined} 
                  alt="Profile picture" 
                />
                <AvatarFallback className="text-2xl">
                  <User className="w-12 h-12" />
                </AvatarFallback>
              </Avatar>
              <Button
                size="sm"
                className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                onClick={handleAvatarClick}
              >
                <Camera className="w-4 h-4" />
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <p className="text-sm text-gray-600 text-center">
              Кликнете на камерата за да промените снимката
            </p>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Имейл</Label>
              <Input
                id="email"
                value={profile?.email || ''}
                disabled
                className="bg-gray-100"
              />
              <p className="text-xs text-gray-500 mt-1">
                Имейлът не може да бъде променян
              </p>
            </div>

            <div>
              <Label htmlFor="full_name">Пълно име</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                placeholder="Въведете вашето име"
              />
            </div>

            <div>
              <Label htmlFor="phone">Телефон</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Въведете телефонен номер"
                type="tel"
              />
            </div>

            <div>
              <Label htmlFor="date_of_birth">Дата на раждане</Label>
              <Input
                id="date_of_birth"
                value={formData.date_of_birth}
                onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                type="date"
              />
            </div>

            <div>
              <Label htmlFor="bio">Биография</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Разкажете малко за себе си..."
                rows={3}
              />
            </div>
          </div>

          <Button 
            onClick={handleSave} 
            className="w-full"
            disabled={saving}
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Записване...' : 'Запази промените'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
