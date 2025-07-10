
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Camera, Save, User, Upload, X, Loader2 } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useRef } from 'react';
import { ImageCropper } from './ImageCropper';
import { useToast } from '@/hooks/use-toast';

interface ProfileEditFormProps {
  onSave?: () => void;
}

export const ProfileEditForm = ({ onSave }: ProfileEditFormProps) => {
  const { profile, updateProfile, uploadAvatar, loading } = useProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    bio: profile?.bio || '',
    date_of_birth: profile?.date_of_birth || '',
  });

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (formData.full_name && formData.full_name.length < 2) {
      errors.full_name = 'Името трябва да е поне 2 символа';
    }
    
    if (formData.phone && !/^\+?[\d\s\-\(\)]{8,}$/.test(formData.phone)) {
      errors.phone = 'Моля въведете валиден телефонен номер';
    }
    
    if (formData.bio && formData.bio.length > 500) {
      errors.bio = 'Биографията не може да е повече от 500 символа';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Невалиден файл",
        description: "Моля изберете изображение.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Файлът е твърде голям",
        description: "Максималният размер е 5MB.",
        variant: "destructive",
      });
      return;
    }

    // Create image URL for cropper
    const imageUrl = URL.createObjectURL(file);
    setSelectedImage(imageUrl);
    setShowCropper(true);
  };

  const handleCropComplete = async (croppedFile: File) => {
    setShowCropper(false);
    if (selectedImage) {
      URL.revokeObjectURL(selectedImage);
      setSelectedImage(null);
    }
    
    setUploading(true);
    try {
      await uploadAvatar(croppedFile);
      toast({
        title: "Успешно!",
        description: "Снимката беше обновена.",
      });
    } catch (error) {
      toast({
        title: "Грешка",
        description: "Неуспешно качване на снимката.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    if (selectedImage) {
      URL.revokeObjectURL(selectedImage);
      setSelectedImage(null);
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast({
        title: "Невалидни данни",
        description: "Моля поправете грешките във формата.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    const success = await updateProfile(formData);
    setSaving(false);
    
    if (success && onSave) {
      onSave();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
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
                disabled={uploading}
              >
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <p className="text-sm text-muted-foreground text-center">
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
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground mt-1">
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
                className={formErrors.full_name ? 'border-destructive' : ''}
              />
              {formErrors.full_name && (
                <p className="text-xs text-destructive mt-1">{formErrors.full_name}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">Телефон</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Въведете телефонен номер"
                type="tel"
                className={formErrors.phone ? 'border-destructive' : ''}
              />
              {formErrors.phone && (
                <p className="text-xs text-destructive mt-1">{formErrors.phone}</p>
              )}
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
                className={formErrors.bio ? 'border-destructive' : ''}
              />
              <div className="flex justify-between items-center mt-1">
                {formErrors.bio && (
                  <p className="text-xs text-destructive">{formErrors.bio}</p>
                )}
                <p className="text-xs text-muted-foreground ml-auto">
                  {formData.bio.length}/500
                </p>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleSave} 
            className="w-full"
            disabled={saving || uploading}
          >
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {saving ? 'Записване...' : 'Запази промените'}
          </Button>
        </CardContent>
      </Card>

      {/* Image Cropper Modal */}
      {selectedImage && (
        <ImageCropper
          imageSrc={selectedImage}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          isOpen={showCropper}
        />
      )}
    </div>
  );
};
