import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, MapPin, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface AdminEmergencyLogsTabProps {
  onUpdate: () => void;
}

export const AdminEmergencyLogsTab = ({ onUpdate }: AdminEmergencyLogsTabProps) => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('emergency_logs')
        .select('*, profiles(full_name)')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching emergency logs:', error);
      toast.error('Failed to load emergency logs');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Emergency Logs</CardTitle>
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
                        {log.incident_type || 'Unknown Incident'} -{' '}
                        {log.profiles?.full_name || 'Anonymous'}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {log.description || 'No description provided'}
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
                  {log.location_address && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {log.location_address}
                    </div>
                  )}
                  <Badge variant="outline">{log.severity}</Badge>
                </div>

                {log.ai_recommendations && (
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-sm font-medium mb-1">AI Recommendations:</p>
                    <p className="text-sm text-muted-foreground">{log.ai_recommendations}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};