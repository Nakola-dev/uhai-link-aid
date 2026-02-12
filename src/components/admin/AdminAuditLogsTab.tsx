import { useEffect, useState, useCallback } from 'react';
import AdminTabSkeleton from '@/components/admin/AdminTabSkeleton';
import { supabase } from '@/integrations/supabase/client';
import { exportToCSV } from '@/lib/admin-logger';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, FileText, Download, RefreshCw, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type AdminActionType = Database['public']['Enums']['admin_action_type'];

interface AuditLogEntry {
  id: string;
  admin_user_id: string;
  action_type: AdminActionType;
  entity_type: string;
  entity_id: string | null;
  description: string | null;
  changes: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

interface AdminAuditLogsTabProps {
  onUpdate: () => void;
}

const PAGE_SIZE = 20;

const actionColors: Record<AdminActionType, string> = {
  create: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  update: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  delete: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  view: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  export: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
};

export const AdminAuditLogsTab = ({ onUpdate }: AdminAuditLogsTabProps) => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [entityFilter, setEntityFilter] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [entityTypes, setEntityTypes] = useState<string[]>([]);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);

      let query = supabase
        .from('admin_logs')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      if (actionFilter !== 'all') {
        query = query.eq('action_type', actionFilter);
      }
      if (entityFilter !== 'all') {
        query = query.eq('entity_type', entityFilter);
      }
      if (searchQuery.trim()) {
        query = query.ilike('description', `%${searchQuery.trim()}%`);
      }

      const { data, error, count } = await query;
      if (error) throw error;

      setLogs((data || []) as AuditLogEntry[]);
      setTotalCount(count ?? 0);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  }, [page, actionFilter, entityFilter, searchQuery]);

  // Fetch distinct entity types for filter dropdown
  const fetchEntityTypes = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('admin_logs')
        .select('entity_type')
        .limit(100);

      if (error) throw error;

      const types = [...new Set((data || []).map(d => d.entity_type))].sort();
      setEntityTypes(types);
    } catch {
      // Non-critical — filter will just be empty
    }
  }, []);

  useEffect(() => {
    fetchEntityTypes();
  }, [fetchEntityTypes]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleExport = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000);

      if (error) throw error;

      exportToCSV(
        (data || []).map(log => ({
          timestamp: log.created_at,
          action: log.action_type,
          entity_type: log.entity_type,
          entity_id: log.entity_id ?? '',
          description: log.description ?? '',
          admin_user_id: log.admin_user_id,
        })),
        'admin_audit_logs'
      );
      toast.success('Audit logs exported');
    } catch {
      toast.error('Failed to export logs');
    }
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  if (loading && logs.length === 0) {
    return <AdminTabSkeleton rows={8} />;
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalCount}</p>
                <p className="text-sm text-muted-foreground">Total Log Entries</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Shield className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{entityTypes.length}</p>
                <p className="text-sm text-muted-foreground">Entity Types Tracked</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <RefreshCw className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalPages}</p>
                <p className="text-sm text-muted-foreground">Pages</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Audit Log
              </CardTitle>
              <CardDescription>Track all administrative actions</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => fetchLogs()}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-1" />
                Export CSV
              </Button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3 mt-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by description..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
                className="pl-10"
              />
            </div>
            <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v); setPage(0); }}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="create">Create</SelectItem>
                <SelectItem value="update">Update</SelectItem>
                <SelectItem value="delete">Delete</SelectItem>
                <SelectItem value="view">View</SelectItem>
                <SelectItem value="export">Export</SelectItem>
              </SelectContent>
            </Select>
            <Select value={entityFilter} onValueChange={(v) => { setEntityFilter(v); setPage(0); }}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Entity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Entities</SelectItem>
                {entityTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Admin</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No audit log entries found
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge className={actionColors[log.action_type]} variant="outline">
                          {log.action_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs">{log.entity_type}</span>
                        {log.entity_id && (
                          <span className="block text-xs text-muted-foreground truncate max-w-[120px]">
                            {log.entity_id}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate">
                        {log.description || '—'}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground truncate max-w-[120px]">
                        {log.admin_user_id.slice(0, 8)}...
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, totalCount)} of {totalCount}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => setPage(p => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage(p => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
