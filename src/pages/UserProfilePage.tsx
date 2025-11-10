import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ArrowLeft, Plus, Trash2, User, Heart, Phone as PhoneIcon, QrCode as QrCodeIcon, Download } from 'lucide-react';
import { toast } from 'sonner';
import Layout from '@/components/Layout';
import { QRCodeSVG } from 'qrcode.react';
import { Badge } from '@/components/ui/badge';

interface EmergencyContact {
  id?: string;
  name: string;
  phone: string;
  relationship: string;
  priority: number;
}

const UserProfilePage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState('');
  const [qrToken, setQrToken] = useState('');
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    phone: '',
    gender: '',
    date_of_birth: '',
    city: '',
    county: '',
    profile_photo_url: '',
    blood_type: '',
    allergies: [] as string[],
    medications: [] as string[],
    chronic_conditions: [] as string[],
    primary_hospital: '',
  });
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/auth');
        return;
      }

      setUserId(session.user.id);

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileError) throw profileError;

      if (profileData) {
        setProfile({
          full_name: profileData.full_name || '',
          email: session.user.email || '',
          phone: profileData.phone || '',
          gender: profileData.gender || '',
          date_of_birth: profileData.date_of_birth || '',
          city: profileData.city || '',
          county: profileData.county || '',
          profile_photo_url: profileData.profile_photo_url || '',
          blood_type: profileData.blood_type || '',
          allergies: profileData.allergies || [],
          medications: profileData.medications || [],
          chronic_conditions: profileData.chronic_conditions || [],
          primary_hospital: profileData.primary_hospital || '',
        });
      }

      // Fetch emergency contacts
      const { data: contactsData, error: contactsError } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('user_id', session.user.id)
        .order('priority', { ascending: true });

      if (contactsError) throw contactsError;
      setEmergencyContacts(contactsData || []);

      // Fetch or create QR token
      const { data: tokenData } = await supabase
        .from('qr_access_tokens')
        .select('access_token')
        .eq('user_id', session.user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (tokenData) {
        setQrToken(tokenData.access_token);
      } else {
        await generateQRToken(session.user.id);
      }
    } catch (error: any) {
      toast.error('Failed to load profile');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const generateQRToken = async (uid: string) => {
    try {
      const token = `${uid}-${Date.now()}`;
      const { error } = await supabase
        .from('qr_access_tokens')
        .insert({ user_id: uid, access_token: token, is_active: true });

      if (error) throw error;
      setQrToken(token);
      toast.success('QR code generated!');
    } catch (error: any) {
      toast.error('Failed to generate QR code');
    }
  };

  const regenerateQRCode = async () => {
    try {
      // Deactivate old tokens
      await supabase
        .from('qr_access_tokens')
        .update({ is_active: false })
        .eq('user_id', userId);

      // Generate new token
      await generateQRToken(userId);
    } catch (error) {
      toast.error('Failed to regenerate QR code');
    }
  };

  const downloadQRCode = () => {
    const svg = document.querySelector('svg');
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      canvas.width = 200;
      canvas.height = 200;
      
      img.onload = () => {
        ctx?.drawImage(img, 0, 0);
        const url = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = 'uhai-emergency-qr.png';
        link.href = url;
        link.click();
      };
      
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/auth');
        return;
      }

      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          phone: profile.phone,
          gender: profile.gender,
          date_of_birth: profile.date_of_birth,
          city: profile.city,
          county: profile.county,
          profile_photo_url: profile.profile_photo_url,
          blood_type: profile.blood_type,
          allergies: profile.allergies,
          medications: profile.medications,
          chronic_conditions: profile.chronic_conditions,
          primary_hospital: profile.primary_hospital,
        })
        .eq('id', session.user.id);

      if (profileError) throw profileError;

      // Delete removed contacts and update/insert existing
      const { data: existingContacts } = await supabase
        .from('emergency_contacts')
        .select('id')
        .eq('user_id', session.user.id);

      const existingIds = existingContacts?.map(c => c.id) || [];
      const currentIds = emergencyContacts.filter(c => c.id).map(c => c.id);
      const toDelete = existingIds.filter(id => !currentIds.includes(id));

      if (toDelete.length > 0) {
        await supabase
          .from('emergency_contacts')
          .delete()
          .in('id', toDelete);
      }

      // Upsert contacts
      for (const contact of emergencyContacts) {
        if (contact.id) {
          await supabase
            .from('emergency_contacts')
            .update({
              name: contact.name,
              phone: contact.phone,
              relationship: contact.relationship,
              priority: contact.priority,
            })
            .eq('id', contact.id);
        } else {
          await supabase
            .from('emergency_contacts')
            .insert({
              user_id: session.user.id,
              name: contact.name,
              phone: contact.phone,
              relationship: contact.relationship,
              priority: contact.priority,
            });
        }
      }

      toast.success('Profile updated successfully!');
      navigate('/dashboard/user');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleArrayInput = (field: 'allergies' | 'medications' | 'chronic_conditions', value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item);
    setProfile(prev => ({ ...prev, [field]: items }));
  };

  const addEmergencyContact = () => {
    setEmergencyContacts([...emergencyContacts, {
      name: '',
      phone: '',
      relationship: '',
      priority: emergencyContacts.length + 1,
    }]);
  };

  const removeEmergencyContact = (index: number) => {
    setEmergencyContacts(emergencyContacts.filter((_, i) => i !== index));
  };

  const updateEmergencyContact = (index: number, field: keyof EmergencyContact, value: string | number) => {
    const updated = [...emergencyContacts];
    updated[index] = { ...updated[index], [field]: value };
    setEmergencyContacts(updated);
  };

  const getPriorityBadge = (priority: number) => {
    if (priority === 1) return <Badge className="bg-red-500">Primary</Badge>;
    if (priority === 2) return <Badge className="bg-orange-500">Secondary</Badge>;
    return <Badge className="bg-blue-500">Backup</Badge>;
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          <Button variant="ghost" onClick={() => navigate('/dashboard/user')} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>

          <form onSubmit={handleSave} className="space-y-6">
            {/* General Information */}
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-primary" />
                  <CardTitle>General Information</CardTitle>
                </div>
                <CardDescription>Your basic profile details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name *</Label>
                    <Input
                      id="full_name"
                      value={profile.full_name}
                      onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email (Read-only)</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      disabled
                      className="bg-muted"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      placeholder="+254..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={profile.gender} onValueChange={(value) => setProfile({ ...profile, gender: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                        <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date_of_birth">Date of Birth</Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      value={profile.date_of_birth}
                      onChange={(e) => setProfile({ ...profile, date_of_birth: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={profile.city}
                      onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                      placeholder="Nairobi"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="county">County</Label>
                    <Input
                      id="county"
                      value={profile.county}
                      onChange={(e) => setProfile({ ...profile, county: e.target.value })}
                      placeholder="Nairobi County"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="profile_photo_url">Profile Photo URL</Label>
                    <Input
                      id="profile_photo_url"
                      type="url"
                      value={profile.profile_photo_url}
                      onChange={(e) => setProfile({ ...profile, profile_photo_url: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Medical Information */}
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Heart className="h-5 w-5 text-primary" />
                  <CardTitle>Medical Information</CardTitle>
                </div>
                <CardDescription>Health details for emergency responders</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="blood_type">Blood Type</Label>
                    <Select value={profile.blood_type} onValueChange={(value) => setProfile({ ...profile, blood_type: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select blood type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="A-">A-</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="B-">B-</SelectItem>
                        <SelectItem value="AB+">AB+</SelectItem>
                        <SelectItem value="AB-">AB-</SelectItem>
                        <SelectItem value="O+">O+</SelectItem>
                        <SelectItem value="O-">O-</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="primary_hospital">Primary Hospital/Clinic</Label>
                    <Input
                      id="primary_hospital"
                      value={profile.primary_hospital}
                      onChange={(e) => setProfile({ ...profile, primary_hospital: e.target.value })}
                      placeholder="Kenyatta National Hospital"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="allergies">Allergies</Label>
                  <Input
                    id="allergies"
                    value={profile.allergies.join(', ')}
                    onChange={(e) => handleArrayInput('allergies', e.target.value)}
                    placeholder="Comma-separated (e.g., penicillin, peanuts)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="medications">Current Medications</Label>
                  <Input
                    id="medications"
                    value={profile.medications.join(', ')}
                    onChange={(e) => handleArrayInput('medications', e.target.value)}
                    placeholder="Comma-separated (e.g., Aspirin 81mg, Metformin)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="chronic_conditions">Chronic Conditions</Label>
                  <Input
                    id="chronic_conditions"
                    value={profile.chronic_conditions.join(', ')}
                    onChange={(e) => handleArrayInput('chronic_conditions', e.target.value)}
                    placeholder="Comma-separated (e.g., Diabetes, Hypertension)"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contacts */}
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <PhoneIcon className="h-5 w-5 text-primary" />
                    <CardTitle>Emergency Contacts</CardTitle>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={addEmergencyContact}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Contact
                  </Button>
                </div>
                <CardDescription>Add up to 3 emergency contacts with priority levels</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {emergencyContacts.map((contact, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      {getPriorityBadge(contact.priority)}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeEmergencyContact(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Name</Label>
                        <Input
                          value={contact.name}
                          onChange={(e) => updateEmergencyContact(index, 'name', e.target.value)}
                          placeholder="John Doe"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input
                          value={contact.phone}
                          onChange={(e) => updateEmergencyContact(index, 'phone', e.target.value)}
                          placeholder="+254..."
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Relationship</Label>
                        <Input
                          value={contact.relationship}
                          onChange={(e) => updateEmergencyContact(index, 'relationship', e.target.value)}
                          placeholder="Spouse, Parent, etc."
                        />
                      </div>
                    </div>
                  </Card>
                ))}
                {emergencyContacts.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No emergency contacts added yet. Click "Add Contact" to get started.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* QR Code Management */}
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <QrCodeIcon className="h-5 w-5 text-primary" />
                  <CardTitle>QR Code Management</CardTitle>
                </div>
                <CardDescription>Your emergency profile QR code</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {qrToken && (
                  <div className="flex flex-col items-center space-y-4">
                    <div className="bg-white p-4 rounded-lg">
                      <QRCodeSVG value={`${window.location.origin}/profile/${qrToken}`} size={200} />
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" onClick={regenerateQRCode}>
                        <QrCodeIcon className="h-4 w-4 mr-2" />
                        Regenerate QR Code
                      </Button>
                      <Button type="button" variant="outline" onClick={downloadQRCode}>
                        <Download className="h-4 w-4 mr-2" />
                        Download QR Code
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground text-center max-w-md">
                      Share this QR code for emergency access to your medical profile. 
                      Regenerate if you need to revoke access to the current code.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button type="submit" disabled={saving} className="flex-1">
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/dashboard/user')}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default UserProfilePage;