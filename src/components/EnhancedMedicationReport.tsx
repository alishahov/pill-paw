
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Medication, MedicationTake } from '@/types/medication';
import { AdvancedStatistics } from './AdvancedStatistics';
import { PDFExport } from './PDFExport';
import { BackupRestore } from './BackupRestore';
import { FileText, BarChart3, Download, Shield } from 'lucide-react';

interface EnhancedMedicationReportProps {
  medications: Medication[];
  takes: MedicationTake[];
  onRestore: (medications: Medication[], takes: MedicationTake[]) => void;
}

export const EnhancedMedicationReport = ({ 
  medications, 
  takes, 
  onRestore 
}: EnhancedMedicationReportProps) => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="statistics" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="statistics" className="text-xs">
            <BarChart3 className="h-4 w-4 mr-1" />
            Статистики
          </TabsTrigger>
          <TabsTrigger value="export" className="text-xs">
            <Download className="h-4 w-4 mr-1" />
            Експорт
          </TabsTrigger>
          <TabsTrigger value="backup" className="text-xs">
            <Shield className="h-4 w-4 mr-1" />
            Backup
          </TabsTrigger>
          <TabsTrigger value="report" className="text-xs">
            <FileText className="h-4 w-4 mr-1" />
            Отчет
          </TabsTrigger>
        </TabsList>

        <TabsContent value="statistics" className="space-y-4">
          <AdvancedStatistics medications={medications} takes={takes} />
        </TabsContent>

        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Експорт на данни</CardTitle>
            </CardHeader>
            <CardContent>
              <PDFExport medications={medications} takes={takes} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="space-y-4">
          <BackupRestore 
            medications={medications} 
            takes={takes} 
            onRestore={onRestore}
          />
        </TabsContent>

        <TabsContent value="report" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Медицински отчет</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{medications.length}</div>
                    <p className="text-sm text-gray-600">Активни лекарства</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{takes.length}</div>
                    <p className="text-sm text-gray-600">Общо приема</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium">Активни лекарства:</h4>
                  {medications.map((med, index) => (
                    <div key={med.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{med.name}</p>
                          <p className="text-sm text-gray-600">
                            Дозировка: {med.dosage}
                          </p>
                          <p className="text-sm text-gray-600">
                            Часове: {med.times.join(', ')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            Приема: {takes.filter(t => t.medicationId === med.id).length}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
