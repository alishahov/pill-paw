
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User, LogOut, Edit, Phone, Calendar, FileText } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { ProfileEditForm } from '@/components/ProfileEditForm';

export const ProfileSection = () => {
  const { user, signOut } = useAuth();
  const { profile, loading } = useProfile();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Успешен изход",
        description: "До скоро!",
      });
    } catch (error) {
      toast({
        title: "Грешка",
        description: "Възникна проблем при излизането",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Зареждане...</div>;
  }

  if (isEditing) {
    return (
      <div className="space-y-4">
        <Button 
          variant="outline" 
          onClick={() => setIsEditing(false)}
          className="mb-4"
        >
          ← Назад към профила
        </Button>
        <ProfileEditForm onSave={() => setIsEditing(false)} />
      </div>
    );
  }

  return (
    <div className="space-y-6 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Профил
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Info */}
          <div className="text-center py-6">
            <Avatar className="w-20 h-20 mx-auto mb-4">
              <AvatarImage 
                src={profile?.avatar_url || undefined} 
                alt="Profile picture" 
              />
              <AvatarFallback className="text-2xl">
                <User className="h-10 w-10" />
              </AvatarFallback>
            </Avatar>
            <h3 className="text-lg font-medium">
              {profile?.full_name || user?.email}
            </h3>
            <p className="text-gray-600">{user?.email}</p>
          </div>

          {/* Profile Details */}
          {(profile?.phone || profile?.bio || profile?.date_of_birth) && (
            <div className="space-y-3 pt-4 border-t">
              {profile?.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{profile.phone}</span>
                </div>
              )}
              
              {profile?.date_of_birth && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">
                    {new Date(profile.date_of_birth).toLocaleDateString('bg-BG')}
                  </span>
                </div>
              )}
              
              {profile?.bio && (
                <div className="flex items-start gap-3">
                  <FileText className="h-4 w-4 text-gray-500 mt-0.5" />
                  <span className="text-sm text-gray-700">{profile.bio}</span>
                </div>
              )}
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="space-y-2 pt-4">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Редактирай профил
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Изход
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
