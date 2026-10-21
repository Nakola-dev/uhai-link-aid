import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { generateQrAccessToken } from '@/lib/qr-token';

export interface QrTokenRecord {
  access_token: string;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

const COLUMNS = 'access_token, is_active, created_at, updated_at';
const UNIQUE_VIOLATION = '23505';

export const qrTokenQueryKey = (userId: string | undefined) => ['qr-token', userId] as const;

/**
 * Each user has exactly one row in qr_access_tokens (UNIQUE(user_id)).
 * Rotating the token in place is atomic: the old token stops working the
 * moment the new one is stored, and the user is never left without one.
 */
async function rotateToken(userId: string): Promise<QrTokenRecord> {
  const { data, error } = await supabase
    .from('qr_access_tokens')
    .update({
      access_token: generateQrAccessToken(),
      is_active: true,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .select(COLUMNS)
    .single();
  if (error) throw error;
  return data;
}

async function fetchOrCreateToken(userId: string): Promise<QrTokenRecord> {
  const { data, error } = await supabase
    .from('qr_access_tokens')
    .select(COLUMNS)
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;

  if (data?.is_active) return data;
  // A deactivated row exists (e.g. revoked earlier) — issue a fresh token on the same row.
  if (data) return rotateToken(userId);

  const { data: created, error: insertError } = await supabase
    .from('qr_access_tokens')
    .insert({ user_id: userId, access_token: generateQrAccessToken(), is_active: true })
    .select(COLUMNS)
    .single();

  if (insertError?.code === UNIQUE_VIOLATION) {
    // Another tab created the row first — use it.
    const { data: existing, error: refetchError } = await supabase
      .from('qr_access_tokens')
      .select(COLUMNS)
      .eq('user_id', userId)
      .single();
    if (refetchError) throw refetchError;
    return existing.is_active ? existing : rotateToken(userId);
  }
  if (insertError) throw insertError;
  return created;
}

export function useQrToken(userId: string | undefined) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: qrTokenQueryKey(userId),
    queryFn: () => fetchOrCreateToken(userId as string),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const regenerate = useMutation({
    mutationFn: () => rotateToken(userId as string),
    onSuccess: (record) => queryClient.setQueryData(qrTokenQueryKey(userId), record),
  });

  return { ...query, regenerate };
}
