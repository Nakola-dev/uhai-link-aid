import { useCallback, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import type { Profile } from '@/hooks/use-auth';
import { fetchEmergencyContacts } from '@/hooks/use-emergency-contacts';

export interface Incident {
  id: string;
  status: string;
  triggered_at: string | null;
  resolved_at: string | null;
  location_lat: number | null;
  location_lng: number | null;
}

export type LocationState =
  | { status: 'idle' }
  | { status: 'locating' }
  | { status: 'acquired'; lat: number; lng: number; accuracy: number }
  | { status: 'denied' }
  | { status: 'unavailable'; reason: string };

/** Only states the backend can actually confirm. "Sent" means the SMS provider accepted the message. */
export type SmsOutcome =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'no-contacts' }
  | { kind: 'sent'; sent: number; total: number }
  | { kind: 'partial'; sent: number; total: number }
  | { kind: 'failed'; total: number };

export type RecordState =
  | { kind: 'idle' }
  | { kind: 'recording' }
  | { kind: 'recorded'; incident: Incident }
  | { kind: 'failed'; offline: boolean };

interface SmsFunctionResponse {
  success?: boolean;
  details?: { success?: number; failed?: number };
}

const INCIDENT_COLUMNS = 'id, status, triggered_at, resolved_at, location_lat, location_lng';
export const incidentsQueryKey = (userId: string | undefined) => ['emergency-incidents', userId] as const;

async function fetchIncidents(userId: string): Promise<Incident[]> {
  const { data, error } = await supabase
    .from('emergency_incidents')
    .select(INCIDENT_COLUMNS)
    .eq('user_id', userId)
    .order('triggered_at', { ascending: false })
    .limit(5);
  if (error) throw error;
  return data ?? [];
}

function interpretSmsResponse(data: SmsFunctionResponse | null, total: number): SmsOutcome {
  const sent = data?.details?.success ?? 0;
  if (!data?.success || sent <= 0) return { kind: 'failed', total };
  return sent >= total ? { kind: 'sent', sent, total } : { kind: 'partial', sent, total };
}

export function useSosAlert(user: { id: string } | null, profile: Profile | null) {
  const queryClient = useQueryClient();
  const userId = user?.id;
  const [location, setLocation] = useState<LocationState>({ status: 'idle' });
  const [record, setRecord] = useState<RecordState>({ kind: 'idle' });
  const [sms, setSms] = useState<SmsOutcome>({ kind: 'idle' });
  const [locationAddedLater, setLocationAddedLater] = useState(false);
  // Incident whose location should be filled in once GPS responds after the alert was sent.
  const pendingLocationIncident = useRef<string | null>(null);

  const incidents = useQuery({
    queryKey: incidentsQueryKey(userId),
    queryFn: () => fetchIncidents(userId as string),
    enabled: !!userId,
  });
  const activeIncident = incidents.data?.find((i) => i.status === 'active') ?? null;

  const attachLateLocation = useCallback(async (lat: number, lng: number) => {
    const incidentId = pendingLocationIncident.current;
    if (!incidentId) return;
    pendingLocationIncident.current = null;
    const { error } = await supabase
      .from('emergency_incidents')
      .update({ location_lat: lat, location_lng: lng })
      .eq('id', incidentId);
    if (!error) {
      setLocationAddedLater(true);
      queryClient.invalidateQueries({ queryKey: incidentsQueryKey(userId) });
    }
  }, [queryClient, userId]);

  const requestLocation = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setLocation({ status: 'unavailable', reason: 'This device does not support location.' });
      return;
    }
    setLocation({ status: 'locating' });
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng, accuracy } = position.coords;
        setLocation({ status: 'acquired', lat, lng, accuracy });
        attachLateLocation(lat, lng);
      },
      (error) => {
        pendingLocationIncident.current = null;
        setLocation(
          error.code === error.PERMISSION_DENIED
            ? { status: 'denied' }
            : { status: 'unavailable', reason: error.code === error.TIMEOUT ? 'Location timed out.' : 'Location is unavailable.' }
        );
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  }, [attachLateLocation]);

  const notifyContacts = useCallback(async (incidentId: string) => {
    if (!userId) return;
    setSms({ kind: 'sending' });
    let contacts;
    try {
      contacts = await fetchEmergencyContacts(userId);
    } catch {
      setSms({ kind: 'failed', total: 0 });
      return;
    }
    if (contacts.length === 0) {
      setSms({ kind: 'no-contacts' });
      return;
    }
    const { data, error } = await supabase.functions.invoke<SmsFunctionResponse>('send-emergency-sms', {
      body: { userId, incidentId, contacts },
    });
    setSms(error ? { kind: 'failed', total: contacts.length } : interpretSmsResponse(data, contacts.length));
  }, [userId]);

  const trigger = useCallback(async () => {
    if (!userId) return;
    setRecord({ kind: 'recording' });
    setSms({ kind: 'idle' });
    setLocationAddedLater(false);

    const coords = location.status === 'acquired' ? location : null;
    const { data, error } = await supabase
      .from('emergency_incidents')
      .insert({
        user_id: userId,
        status: 'active',
        location_lat: coords?.lat ?? null,
        location_lng: coords?.lng ?? null,
        medical_context: {
          blood_type: profile?.blood_type ?? null,
          allergies: profile?.allergies ?? [],
          medications: profile?.medications ?? [],
          chronic_conditions: profile?.chronic_conditions ?? [],
          primary_hospital: profile?.primary_hospital ?? null,
        } as Json,
        triggered_at: new Date().toISOString(),
      })
      .select(INCIDENT_COLUMNS)
      .single();

    if (error || !data) {
      setRecord({ kind: 'failed', offline: !navigator.onLine });
      return;
    }

    setRecord({ kind: 'recorded', incident: data });
    if (location.status === 'locating') pendingLocationIncident.current = data.id;
    queryClient.invalidateQueries({ queryKey: incidentsQueryKey(userId) });
    await notifyContacts(data.id);
  }, [userId, location, profile, notifyContacts, queryClient]);

  const resolve = useCallback(async (incidentId: string) => {
    const { error } = await supabase
      .from('emergency_incidents')
      .update({ status: 'resolved', resolved_at: new Date().toISOString() })
      .eq('id', incidentId);
    if (error) throw error;
    setRecord({ kind: 'idle' });
    setSms({ kind: 'idle' });
    await queryClient.invalidateQueries({ queryKey: incidentsQueryKey(userId) });
  }, [queryClient, userId]);

  return {
    incidents,
    activeIncident,
    location,
    requestLocation,
    record,
    sms,
    locationAddedLater,
    trigger,
    resendSms: notifyContacts,
    resolve,
  };
}
