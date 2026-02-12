import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type AdminActionType = Database['public']['Enums']['admin_action_type'];

interface LogAdminActionParams {
  actionType: AdminActionType;
  entityType: string;
  entityId?: string;
  description?: string;
  changes?: Record<string, unknown>;
}

/**
 * Logs an admin action to the admin_logs table.
 * Silently fails so it never blocks the main operation.
 */
export async function logAdminAction({
  actionType,
  entityType,
  entityId,
  description,
  changes,
}: LogAdminActionParams): Promise<void> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    await supabase.from('admin_logs').insert({
      admin_user_id: session.user.id,
      action_type: actionType,
      entity_type: entityType,
      entity_id: entityId ?? null,
      description: description ?? null,
      changes: changes ? (changes as Database['public']['Tables']['admin_logs']['Insert']['changes']) : null,
      user_agent: navigator.userAgent,
    });
  } catch (err) {
    console.error('[admin-logger] Failed to log action:', err);
  }
}

/**
 * Export data as CSV and trigger a download.
 */
export function exportToCSV(data: Record<string, unknown>[], filename: string): void {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row =>
      headers.map(h => {
        const val = row[h];
        const str = val === null || val === undefined ? '' : String(val);
        // Escape quotes and wrap in quotes if needed
        return str.includes(',') || str.includes('"') || str.includes('\n')
          ? `"${str.replace(/"/g, '""')}"`
          : str;
      }).join(',')
    ),
  ];

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
