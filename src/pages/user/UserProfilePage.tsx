import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Heart, Loader2, Phone as PhoneIcon, Plus, QrCode, Trash2, User } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import {
  EmergencyContact,
  emergencyContactsQueryKey,
  saveEmergencyContacts,
  useEmergencyContacts,
} from '@/hooks/use-emergency-contacts';
import { blankToNull, formatMedicalList, parseMedicalList } from '@/lib/medical-lists';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DashboardLayout from '@/components/DashboardLayout';
import DashboardSkeleton from '@/components/DashboardSkeleton';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'];

const emptyForm = {
  full_name: '',
  phone: '',
  gender: '',
  date_of_birth: '',
  city: '',
  county: '',
  profile_photo_url: '',
  blood_type: '',
  allergies: '',
  medications: '',
  chronic_conditions: '',
  primary_hospital: '',
};

const priorityLabel = (index: number) => (index === 0 ? 'Called first' : `Contact ${index + 1}`);

const UserProfilePage = () => {
  const { user, profile, isAdmin, loading: authLoading, refreshProfile } = useAuth();
  const queryClient = useQueryClient();
  const contactsQuery = useEmergencyContacts(user?.id);
  const [form, setForm] = useState(emptyForm);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setForm({
      full_name: profile.full_name || '',
      phone: profile.phone || '',
      gender: profile.gender || '',
      date_of_birth: profile.date_of_birth || '',
      city: profile.city || '',
      county: profile.county || '',
      profile_photo_url: profile.profile_photo_url || '',
      blood_type: profile.blood_type || '',
      allergies: formatMedicalList(profile.allergies),
      medications: formatMedicalList(profile.medications),
      chronic_conditions: formatMedicalList(profile.chronic_conditions),
      primary_hospital: profile.primary_hospital || '',
    });
  }, [profile]);

  useEffect(() => {
    if (contactsQuery.data) setContacts(contactsQuery.data);
  }, [contactsQuery.data]);

  const setField = (field: keyof typeof emptyForm) => (value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const updateContact = (index: number, field: 'name' | 'phone' | 'relationship', value: string) =>
    setContacts((prev) => prev.map((c, i) => (i === index ? { ...c, [field]: value } : c)));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    setSaving(true);

    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name: form.full_name.trim(),
        phone: blankToNull(form.phone),
        gender: blankToNull(form.gender),
        date_of_birth: blankToNull(form.date_of_birth),
        city: blankToNull(form.city),
        county: blankToNull(form.county),
        profile_photo_url: blankToNull(form.profile_photo_url),
        blood_type: blankToNull(form.blood_type),
        allergies: parseMedicalList(form.allergies),
        medications: parseMedicalList(form.medications),
        chronic_conditions: parseMedicalList(form.chronic_conditions),
        primary_hospital: blankToNull(form.primary_hospital),
      })
      .eq('id', user.id);

    if (profileError) {
      toast.error(`Your profile was not saved: ${profileError.message}`);
      setSaving(false);
      return;
    }

    try {
      await saveEmergencyContacts(user.id, contacts);
      toast.success('Profile and emergency contacts saved');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown error';
      toast.error(`Medical details were saved, but emergency contacts were not: ${message}`);
    } finally {
      await Promise.all([
        refreshProfile(),
        queryClient.invalidateQueries({ queryKey: emergencyContactsQueryKey(user.id) }),
      ]);
      setSaving(false);
    }
  };

  if (authLoading || contactsQuery.isLoading) {
    return (
      <DashboardLayout user={profile} isAdmin={isAdmin}>
        <DashboardSkeleton cards={0} rows={6} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={profile} isAdmin={isAdmin}>
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Medical profile</h1>
          <p className="text-muted-foreground">
            First responders see this information when they scan your QR code.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" aria-hidden="true" />
                <CardTitle>About you</CardTitle>
              </div>
              <CardDescription>Helps responders identify you.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full name *</Label>
                <Input id="full_name" autoComplete="name" required value={form.full_name}
                  onChange={(e) => setField('full_name')(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={user?.email ?? ''} disabled readOnly aria-describedby="email-hint" />
                <p id="email-hint" className="text-xs text-muted-foreground">Your sign-in email can't be changed here.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone number</Label>
                <Input id="phone" type="tel" autoComplete="tel" value={form.phone} placeholder="+254 7XX XXX XXX"
                  onChange={(e) => setField('phone')(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={form.gender} onValueChange={setField('gender')}>
                  <SelectTrigger id="gender"><SelectValue placeholder="Select gender" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date_of_birth">Date of birth</Label>
                <Input id="date_of_birth" type="date" autoComplete="bday" value={form.date_of_birth}
                  onChange={(e) => setField('date_of_birth')(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City or town</Label>
                <Input id="city" autoComplete="address-level2" value={form.city} placeholder="Nairobi"
                  onChange={(e) => setField('city')(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="county">County</Label>
                <Input id="county" value={form.county} placeholder="Nairobi County"
                  onChange={(e) => setField('county')(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile_photo_url">Profile photo URL</Label>
                <Input id="profile_photo_url" type="url" value={form.profile_photo_url} placeholder="https://…"
                  onChange={(e) => setField('profile_photo_url')(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" aria-hidden="true" />
                <CardTitle>Medical information</CardTitle>
              </div>
              <CardDescription>Separate multiple items with commas.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="blood_type">Blood type</Label>
                  <Select value={form.blood_type} onValueChange={setField('blood_type')}>
                    <SelectTrigger id="blood_type"><SelectValue placeholder="Select blood type" /></SelectTrigger>
                    <SelectContent>
                      {BLOOD_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="primary_hospital">Primary hospital or clinic</Label>
                  <Input id="primary_hospital" value={form.primary_hospital} placeholder="Kenyatta National Hospital"
                    onChange={(e) => setField('primary_hospital')(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="allergies">Allergies</Label>
                <Input id="allergies" value={form.allergies} placeholder="e.g. Penicillin, Peanuts"
                  onChange={(e) => setField('allergies')(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="medications">Current medications</Label>
                <Input id="medications" value={form.medications} placeholder="e.g. Metformin 500mg, Salbutamol inhaler"
                  onChange={(e) => setField('medications')(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="chronic_conditions">Chronic conditions</Label>
                <Input id="chronic_conditions" value={form.chronic_conditions} placeholder="e.g. Diabetes, Asthma"
                  onChange={(e) => setField('chronic_conditions')(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <PhoneIcon className="h-5 w-5 text-primary" aria-hidden="true" />
                  <CardTitle>Emergency contacts</CardTitle>
                </div>
                <Button type="button" variant="outline" size="sm"
                  onClick={() => setContacts((prev) => [...prev, { name: '', phone: '', relationship: '', priority: prev.length + 1 }])}>
                  <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
                  Add contact
                </Button>
              </div>
              <CardDescription>
                Shown to responders and alerted by SMS when you send an SOS, in this order.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {contactsQuery.isError && (
                <p className="text-sm text-destructive" role="alert">
                  Your saved contacts couldn't be loaded. Reload the page before editing them.
                </p>
              )}
              {contacts.map((contact, index) => (
                <fieldset key={contact.id ?? `new-${index}`} className="rounded-lg border p-4 space-y-3">
                  <legend className="sr-only">Emergency contact {index + 1}</legend>
                  <div className="flex items-center justify-between">
                    <Badge variant={index === 0 ? 'default' : 'secondary'}>{priorityLabel(index)}</Badge>
                    <Button type="button" variant="ghost" size="icon"
                      aria-label={`Remove ${contact.name || `contact ${index + 1}`}`}
                      onClick={() => setContacts((prev) => prev.filter((_, i) => i !== index))}>
                      <Trash2 className="h-4 w-4 text-destructive" aria-hidden="true" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`contact-name-${index}`}>Name *</Label>
                      <Input id={`contact-name-${index}`} required value={contact.name}
                        onChange={(e) => updateContact(index, 'name', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`contact-phone-${index}`}>Phone *</Label>
                      <Input id={`contact-phone-${index}`} type="tel" required value={contact.phone} placeholder="+254 7XX XXX XXX"
                        onChange={(e) => updateContact(index, 'phone', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`contact-relationship-${index}`}>Relationship</Label>
                      <Input id={`contact-relationship-${index}`} value={contact.relationship ?? ''} placeholder="Spouse, parent…"
                        onChange={(e) => updateContact(index, 'relationship', e.target.value)} />
                    </div>
                  </div>
                </fieldset>
              ))}
              {contacts.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No emergency contacts yet. Without one, an SOS can't alert anyone by SMS.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6">
              <div className="flex items-center gap-3">
                <QrCode className="h-5 w-5 text-primary" aria-hidden="true" />
                <p className="text-sm">Your QR code, downloads and printing are on the Medical ID page.</p>
              </div>
              <Button asChild variant="outline">
                <Link to="/dashboard/qr">Open my Medical ID</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Sticky save bar; on mobile it sits above the fixed bottom navigation instead of behind it. */}
          <div
            data-sticky-overlay
            className="sticky bottom-[calc(4rem+env(safe-area-inset-bottom)+0.5rem)] z-30 -mx-4 flex gap-3 border-t bg-background/95 px-4 py-3 backdrop-blur lg:bottom-0 lg:mx-0 lg:rounded-xl lg:border lg:px-4"
          >
            <Button type="submit" disabled={saving || contactsQuery.isError} className="flex-1 sm:flex-none sm:min-w-48">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default UserProfilePage;
