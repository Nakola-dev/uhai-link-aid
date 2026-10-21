import type { ResponderProfileData } from '@/lib/responder';

/** A fictional person. Never replace with real user data. */
export const DEMO_PROFILE: ResponderProfileData = {
  full_name: 'Amani Wanjiru',
  phone: '+254 700 000 001',
  gender: 'female',
  blood_type: 'O+',
  allergies: ['Penicillin', 'Peanuts'],
  medications: ['Salbutamol inhaler, as needed'],
  chronic_conditions: ['Asthma'],
  primary_hospital: 'Kenyatta National Hospital',
  updated_at: '2026-10-01T08:00:00Z',
  emergency_contacts: [
    { name: 'Wanjiru Kamau', phone: '+254 700 000 002', relationship: 'Mother' },
    { name: 'Otieno Ochieng', phone: '+254 700 000 003', relationship: 'Brother' },
  ],
};
