
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, LogOut, Edit } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const ProfileSection = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();

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

  return (
    <div className="space-y-6 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Профил
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-6">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-10 w-10 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium">{user?.email}</h3>
            <p className="text-gray-600">Потребител</p>
          </div>
          
          <div className="space-y-2">
            <Button variant="outline" className="w-full">
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
