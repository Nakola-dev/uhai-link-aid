/** Kenyan emergency lines shown wherever a user or responder may need to call for help. */
export interface EmergencyNumber {
  label: string;
  number: string;
  description: string;
}

export const EMERGENCY_NUMBERS: EmergencyNumber[] = [
  { label: 'Emergency', number: '999', description: 'Police, fire and ambulance' },
  { label: 'Emergency', number: '112', description: 'Works from any mobile network' },
  { label: 'Kenya Red Cross', number: '1199', description: 'Ambulance and emergency response' },
];

export const PRIMARY_EMERGENCY_NUMBER = EMERGENCY_NUMBERS[0];

export const telHref = (number: string) => `tel:${number.replace(/[^\d+]/g, '')}`;
