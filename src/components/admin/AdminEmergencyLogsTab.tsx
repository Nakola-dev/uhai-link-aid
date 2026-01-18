import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, MapPin, Clock, Activity, AlertTriangle } from 'lucide-react';

interface AdminEmergencyLogsTabProps {
  onUpdate: () => void;
}

// Mock data for demonstration - will be replaced when emergency_logs table is created
const mockLogs = [
  {
    id: '1',
    incident_type: 'Medical Emergency',
    severity: 'critical',
    status: 'resolved',
    description: 'Cardiac arrest reported at shopping mall',
    location_address: 'Nairobi CBD',
    created_at: new Date().toISOString(),
    user_name: 'John Doe',
  },
  {
    id: '2',
    incident_type: 'Accident',
    severity: 'high',
    status: 'in_progress',
    description: 'Traffic accident with injuries on Mombasa Road',
    location_address: 'Mombasa Road',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    user_name: 'Jane Smith',
  },
  {
    id: '3',
    incident_type: 'Fire',
    severity: 'critical',
    status: 'active',
    description: 'Building fire reported in residential area',
    location_address: 'Westlands',
    created_at: new Date(Date.now() - 7200000).toISOString(),
    user_name: 'Mike Johnson',
  },
];

export const AdminEmergencyLogsTab = ({ onUpdate }: AdminEmergencyLogsTabProps) => {
  const [logs] = useState(mockLogs);

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">3</p>
                <p className="text-sm text-muted-foreground">Active Emergencies</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">127</p>
                <p className="text-sm text-muted-foreground">Total This Month</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Clock className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">4.2m</p>
                <p className="text-sm text-muted-foreground">Avg Response Time</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary/50 rounded-lg">
                <MapPin className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">98%</p>
                <p className="text-sm text-muted-foreground">Resolution Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Emergency Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Emergency Logs
          </CardTitle>
          <CardDescription>Monitor and manage emergency incidents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {logs.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No emergency logs recorded</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <AlertCircle
                        className={`h-5 w-5 mt-1 ${
                          log.severity === 'critical'
                            ? 'text-red-600'
                            : log.severity === 'high'
                            ? 'text-orange-600'
                            : 'text-yellow-600'
                        }`}
                      />
                      <div>
                        <h4 className="font-semibold">
                          {log.incident_type} - {log.user_name}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {log.description}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        log.status === 'resolved'
                          ? 'default'
                          : log.status === 'in_progress'
                          ? 'secondary'
                          : 'destructive'
                      }
                    >
                      {log.status}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {new Date(log.created_at).toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {log.location_address}
                    </div>
                    <Badge variant="outline">{log.severity}</Badge>
                  </div>
                </div>
              ))
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-4 text-center">
            Emergency logs will be fully functional once the database migration is complete.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
