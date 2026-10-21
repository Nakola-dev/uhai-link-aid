import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface EmergencyContact {
  id?: string;
  name: string;
  phone: string;
  relationship: string | null;
  priority: number | null;
}

export const emergencyContactsQueryKey = (userId: string | undefined) => ['emergency-contacts', userId] as const;

export async function fetchEmergencyContacts(userId: string): Promise<EmergencyContact[]> {
  const { data, error } = await supabase
    .from('emergency_contacts')
    .select('id, name, phone, relationship, priority')
    .eq('user_id', userId)
    .order('priority', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export function useEmergencyContacts(userId: string | undefined) {
  return useQuery({
    queryKey: emergencyContactsQueryKey(userId),
    queryFn: () => fetchEmergencyContacts(userId as string),
    enabled: !!userId,
  });
}

/**
 * Persist the edited contact list: delete removed rows, update existing rows,
 * insert new ones. Priority follows list order. Every write is checked, and the
 * first failure is thrown so callers never report a save that did not happen.
 */
export async function saveEmergencyContacts(userId: string, contacts: EmergencyContact[]): Promise<void> {
  const { data: existing, error: listError } = await supabase
    .from('emergency_contacts')
    .select('id')
    .eq('user_id', userId);
  if (listError) throw listError;

  const keptIds = new Set(contacts.filter((c) => c.id).map((c) => c.id));
  const toDelete = (existing ?? []).map((c) => c.id).filter((id) => !keptIds.has(id));

  if (toDelete.length > 0) {
    const { error } = await supabase.from('emergency_contacts').delete().in('id', toDelete);
    if (error) throw error;
  }

  for (const [index, contact] of contacts.entries()) {
    const fields = {
      name: contact.name.trim(),
      phone: contact.phone.trim(),
      relationship: contact.relationship?.trim() || null,
      priority: index + 1,
    };
    const { error } = contact.id
      ? await supabase.from('emergency_contacts').update(fields).eq('id', contact.id)
      : await supabase.from('emergency_contacts').insert({ ...fields, user_id: userId });
    if (error) throw error;
  }
}
