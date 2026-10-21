export interface ResponderContact {
  name: string;
  phone: string;
  relationship?: string | null;
}

/** Shape returned by check_and_log_qr_scan (legacy single-contact fields kept for older deployments). */
export interface ResponderProfileData {
  full_name: string | null;
  phone: string | null;
  gender?: string | null;
  blood_type: string | null;
  allergies: string[] | null;
  medications: string[] | null;
  chronic_conditions: string[] | null;
  primary_hospital: string | null;
  updated_at: string | null;
  emergency_contacts?: ResponderContact[] | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  emergency_contact_relationship?: string | null;
}

export function responderContacts(profile: ResponderProfileData): ResponderContact[] {
  if (profile.emergency_contacts && profile.emergency_contacts.length > 0) return profile.emergency_contacts;
  if (profile.emergency_contact_name && profile.emergency_contact_phone) {
    return [{
      name: profile.emergency_contact_name,
      phone: profile.emergency_contact_phone,
      relationship: profile.emergency_contact_relationship,
    }];
  }
  return [];
}
