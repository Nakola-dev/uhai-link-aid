import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Heart, User, AlertCircle, CheckCircle2, Loader2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import Layout from '@/components/shared/Layout';

interface EmergencyContact {
  id?: string;
  name: string;
  phone: string;
  relationship: string;
}

type OnboardingStep = 'email' | 'basics' | 'medical' | 'contacts' | 'qr' | 'complete';

const Onboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('email');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');

  const [basics, setBasics] = useState({
    full_name: '',
    phone: '',
    city: '',
    county: ''
  });

  const [medical, setMedical] = useState({
    blood_type: '',
    allergies: '',
    medications: '',
    chronic_conditions: '',
    primary_hospital: ''
  });

  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([
    { name: '', phone: '', relationship: '' }
  ]);

  const steps: { id: OnboardingStep; label: string }[] = [
    { id: 'email', label: 'Email' },
    { id: 'basics', label: 'Basics' },
    { id: 'medical', label: 'Medical' },
    { id: 'contacts', label: 'Contacts' },
    { id: 'qr', label: 'QR ID' },
    { id: 'complete', label: 'Complete' }
  ];

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        navigate('/auth');
        return;
      }

      setUserId(session.user.id);
      setEmail(session.user.email || '');

      // Check if already onboarded
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profile?.onboarding_completed) {
        navigate('/dashboard');
        return;
      }

      // Pre-fill existing data
      if (profile) {
        setBasics({
          full_name: profile.full_name || '',
          phone: profile.phone || '',
          city: profile.city || '',
          county: profile.county || ''
        });

        setMedical({
          blood_type: profile.blood_type || '',
          allergies: profile.allergies?.join(', ') || '',
          medications: profile.medications?.join(', ') || '',
          chronic_conditions: profile.chronic_conditions?.join(', ') || '',
          primary_hospital: profile.primary_hospital || ''
        });
      }

      // Fetch emergency contacts
      const { data: contacts } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('user_id', session.user.id);

      if (contacts && contacts.length > 0) {
        setEmergencyContacts(
          contacts.map((c) => ({
            id: c.id,
            name: c.name,
            phone: c.phone,
            relationship: c.relationship || ''
          }))
        );
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      toast.error('Failed to load onboarding');
    } finally {
      setLoading(false);
    }
  };

  const saveAndNext = async () => {
    try {
      setSubmitting(true);

      // Validate current step
      if (currentStep === 'basics') {
        if (!basics.full_name || !basics.phone) {
          toast.error('Please fill in all required fields');
          return;
        }
      }

      if (currentStep === 'medical' && !medical.blood_type) {
        toast.error('Blood type is required');
        return;
      }

      if (currentStep === 'contacts') {
        const validContacts = emergencyContacts.filter((c) => c.name && c.phone);
        if (validContacts.length === 0) {
          toast.error('Please add at least one emergency contact');
          return;
        }

        // Save emergency contacts
        const { error: deleteError } = await supabase
          .from('emergency_contacts')
          .delete()
          .eq('user_id', userId);

        if (deleteError) throw deleteError;

        const { error: insertError } = await supabase
          .from('emergency_contacts')
          .insert(
            validContacts.map((c) => ({
              user_id: userId,
              name: c.name,
              phone: c.phone,
              relationship: c.relationship,
              priority: validContacts.indexOf(c) + 1
            }))
          );

        if (insertError) throw insertError;
      }

      // Save profile data
      const updateData: Record<string, unknown> = {
        full_name: basics.full_name || null,
        phone: basics.phone || null,
        city: basics.city || null,
        county: basics.county || null,
        blood_type: medical.blood_type || null,
        allergies: medical.allergies ? medical.allergies.split(',').map((a) => a.trim()) : [],
        medications: medical.medications ? medical.medications.split(',').map((m) => m.trim()) : [],
        chronic_conditions: medical.chronic_conditions
          ? medical.chronic_conditions.split(',').map((c) => c.trim())
          : [],
        primary_hospital: medical.primary_hospital || null
      };

      const { error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId);

      if (updateError) throw updateError;

      // Move to next step or complete
      const currentIndex = steps.findIndex((s) => s.id === currentStep);
      if (currentIndex < steps.length - 1) {
        setCurrentStep(steps[currentIndex + 1].id);
      } else {
        // Mark onboarding as complete
        const { error: completeError } = await supabase
          .from('profiles')
          .update({
            onboarding_completed: true,
            onboarding_completed_at: new Date().toISOString()
          })
          .eq('id', userId);

        if (completeError) throw completeError;

        toast.success('Onboarding complete! Welcome to UhaiLink');
        navigate('/dashboard');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error saving onboarding:', error);
      toast.error(`Failed to save: ${message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const goBack = () => {
    const currentIndex = steps.findIndex((s) => s.id === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].id);
    }
  };

  const addEmergencyContact = () => {
    setEmergencyContacts([...emergencyContacts, { name: '', phone: '', relationship: '' }]);
  };

  const removeEmergencyContact = (index: number) => {
    setEmergencyContacts(emergencyContacts.filter((_, i) => i !== index));
  };

  const updateContact = (index: number, field: keyof EmergencyContact, value: string) => {
    const updated = [...emergencyContacts];
    updated[index] = { ...updated[index], [field]: value };
    setEmergencyContacts(updated);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  const stepIndex = steps.findIndex((s) => s.id === currentStep);
  const progress = ((stepIndex + 1) / steps.length) * 100;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Heart className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Welcome to UhaiLink</h1>
            <p className="text-muted-foreground">
              Let's set up your emergency health profile
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold">
                Step {stepIndex + 1} of {steps.length}
              </span>
              <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Steps Indicator */}
          <div className="flex justify-between mb-8">
            {steps.map((step, idx) => (
              <div key={step.id} className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold mb-1 ${
                    idx <= stepIndex
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {idx < stepIndex ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                </div>
                <span className="text-xs text-muted-foreground hidden sm:block">{step.label}</span>
              </div>
            ))}
          </div>

          {/* Content Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                {currentStep === 'email' && 'Email Verification'}
                {currentStep === 'basics' && 'Basic Information'}
                {currentStep === 'medical' && 'Medical Information'}
                {currentStep === 'contacts' && 'Emergency Contacts'}
                {currentStep === 'qr' && 'Your QR ID'}
                {currentStep === 'complete' && 'All Set!'}
              </CardTitle>
              <CardDescription>
                {currentStep === 'email' && "We've sent a verification email to your address"}
                {currentStep === 'basics' && 'Help us know who you are'}
                {currentStep === 'medical' && 'Critical information for responders'}
                {currentStep === 'contacts' && 'People to notify in an emergency'}
                {currentStep === 'qr' && 'Your personal QR code for responders'}
                {currentStep === 'complete' && 'Your profile is ready to use'}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Email Step */}
              {currentStep === 'email' && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-900">
                      A verification email has been sent to <strong>{email}</strong>
                    </p>
                    <p className="text-sm text-blue-700 mt-2">
                      Check your email and click the verification link. You can skip this for now and verify later.
                    </p>
                  </div>
                </div>
              )}

              {/* Basics Step */}
              {currentStep === 'basics' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="full_name">Full Name *</Label>
                    <Input
                      id="full_name"
                      value={basics.full_name}
                      onChange={(e) => setBasics({ ...basics, full_name: e.target.value })}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={basics.phone}
                      onChange={(e) => setBasics({ ...basics, phone: e.target.value })}
                      placeholder="+254701234567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={basics.city}
                      onChange={(e) => setBasics({ ...basics, city: e.target.value })}
                      placeholder="Nairobi"
                    />
                  </div>
                  <div>
                    <Label htmlFor="county">County</Label>
                    <Input
                      id="county"
                      value={basics.county}
                      onChange={(e) => setBasics({ ...basics, county: e.target.value })}
                      placeholder="Nairobi County"
                    />
                  </div>
                </div>
              )}

              {/* Medical Step */}
              {currentStep === 'medical' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="blood_type">Blood Type *</Label>
                    <Select value={medical.blood_type} onValueChange={(value) => setMedical({ ...medical, blood_type: value })}>
                      <SelectTrigger id="blood_type">
                        <SelectValue placeholder="Select blood type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="O+">O+</SelectItem>
                        <SelectItem value="O-">O-</SelectItem>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="A-">A-</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="B-">B-</SelectItem>
                        <SelectItem value="AB+">AB+</SelectItem>
                        <SelectItem value="AB-">AB-</SelectItem>
                        <SelectItem value="Unknown">Unknown</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="allergies">Allergies (comma-separated)</Label>
                    <Input
                      id="allergies"
                      value={medical.allergies}
                      onChange={(e) => setMedical({ ...medical, allergies: e.target.value })}
                      placeholder="Penicillin, Shellfish"
                    />
                  </div>
                  <div>
                    <Label htmlFor="medications">Current Medications (comma-separated)</Label>
                    <Input
                      id="medications"
                      value={medical.medications}
                      onChange={(e) => setMedical({ ...medical, medications: e.target.value })}
                      placeholder="Aspirin, Metformin"
                    />
                  </div>
                  <div>
                    <Label htmlFor="conditions">Chronic Conditions (comma-separated)</Label>
                    <Input
                      id="conditions"
                      value={medical.chronic_conditions}
                      onChange={(e) => setMedical({ ...medical, chronic_conditions: e.target.value })}
                      placeholder="Diabetes, Hypertension"
                    />
                  </div>
                  <div>
                    <Label htmlFor="hospital">Primary Hospital</Label>
                    <Input
                      id="hospital"
                      value={medical.primary_hospital}
                      onChange={(e) => setMedical({ ...medical, primary_hospital: e.target.value })}
                      placeholder="Nairobi Hospital"
                    />
                  </div>
                </div>
              )}

              {/* Contacts Step */}
              {currentStep === 'contacts' && (
                <div className="space-y-4">
                  {emergencyContacts.map((contact, idx) => (
                    <div key={idx} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm">Contact {idx + 1}</h4>
                        {emergencyContacts.length > 1 && (
                          <button
                            onClick={() => removeEmergencyContact(idx)}
                            className="text-destructive hover:text-destructive/80"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <div>
                        <Label htmlFor={`name-${idx}`} className="text-xs">Name *</Label>
                        <Input
                          id={`name-${idx}`}
                          value={contact.name}
                          onChange={(e) => updateContact(idx, 'name', e.target.value)}
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`phone-${idx}`} className="text-xs">Phone *</Label>
                        <Input
                          id={`phone-${idx}`}
                          value={contact.phone}
                          onChange={(e) => updateContact(idx, 'phone', e.target.value)}
                          placeholder="+254701234567"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`relationship-${idx}`} className="text-xs">Relationship</Label>
                        <Input
                          id={`relationship-${idx}`}
                          value={contact.relationship}
                          onChange={(e) => updateContact(idx, 'relationship', e.target.value)}
                          placeholder="Mother, Father, Spouse"
                        />
                      </div>
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addEmergencyContact}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Another Contact
                  </Button>
                </div>
              )}

              {/* QR Step */}
              {currentStep === 'qr' && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-900">
                      Your personal QR code will be generated and available in your dashboard.
                    </p>
                    <p className="text-sm text-blue-700 mt-2">
                      You can share this code with emergency responders so they can quickly access your medical information.
                    </p>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-900">
                      Keep your QR code private. Only share it with trusted people or in emergency situations.
                    </p>
                  </div>
                </div>
              )}

              {/* Complete Step */}
              {currentStep === 'complete' && (
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-50 mb-4">
                    <CheckCircle2 className="h-10 w-10 text-green-600" />
                  </div>
                  <p className="text-lg font-semibold">Profile Complete!</p>
                  <p className="text-muted-foreground">
                    Your UhaiLink profile is ready. You can now access all features including the Emergency SOS button.
                  </p>
                </div>
              )}
            </CardContent>

            {/* Actions */}
            <div className="bg-gray-50 px-6 py-4 flex justify-between gap-2 border-t">
              <Button
                variant="outline"
                onClick={goBack}
                disabled={stepIndex === 0 || submitting}
              >
                Back
              </Button>
              <Button
                onClick={saveAndNext}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : stepIndex === steps.length - 1 ? (
                  'Complete Onboarding'
                ) : (
                  'Next'
                )}
              </Button>
            </div>
          </Card>

          {/* Progress Summary */}
          <div className="text-center mt-6 text-sm text-muted-foreground">
            Step {stepIndex + 1} of {steps.length}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Onboarding;
