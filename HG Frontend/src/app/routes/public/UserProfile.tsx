import { useEffect, useState } from 'react';
import { useNavigate } from '@/lib/router';
import { User, Loader2, ArrowLeft, Save, Phone, CalendarDays, Bell } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/authStore';
import { useUpdateAuthProfile } from '@/hooks/useAuthProfile';

const UserProfilePage = () => {
  const { user, setUser, hasHydrated } = useAuthStore();
  const navigate = useNavigate();
  const updateProfileMutation = useUpdateAuthProfile();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (!user || isDirty) {
      return;
    }

    setName(user.full_name ?? '');
    setPhone(user.phone ?? '');
    setDateOfBirth(user.date_of_birth ?? '');
    setEmailNotifications(user.email_notifications ?? true);
  }, [user, isDirty]);

  if (!hasHydrated) {
    return (
      <main className="flex-1 md:pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-lg">
          <div className="rounded-lg border border-border bg-card p-5 text-sm text-muted-foreground">
            Loading profile...
          </div>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex-1 md:pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-lg">
          <div className="rounded-lg border border-border bg-card p-5 text-sm text-muted-foreground">
            Please sign in to manage your profile.
          </div>
        </div>
      </main>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Name cannot be empty.');
      return;
    }

    if (!dateOfBirth.trim()) {
      toast.error('Date of birth is required.');
      return;
    }

    try {
      const updatedProfile = await updateProfileMutation.mutateAsync({
        date_of_birth: dateOfBirth,
        email_notifications: emailNotifications,
        full_name: name.trim(),
        phone: phone.trim(),
      });

      setUser({
        ...user,
        full_name: updatedProfile.full_name,
        phone: updatedProfile.phone,
        date_of_birth: updatedProfile.date_of_birth,
        email_notifications: updatedProfile.email_notifications,
      });
      setIsDirty(false);
      toast.success('Profile updated!');
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : 'Unable to update profile right now. Please try again.';
      console.log('Update profile error message:', message);
      toast.error(message);
    }
  };

  return (
    <main className="flex-1 md:pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-lg">
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground text-sm font-body mb-6 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Dashboard
        </button>

        <h1 className="font-display font-bold text-foreground text-2xl mb-6">Edit Profile</h1>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground font-display">Full Name</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setIsDirty(true);
                  setName(e.target.value);
                }}
                placeholder="John Doe"
                required
                className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-secondary border border-border text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground font-display">Phone Number</label>
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  setIsDirty(true);
                  setPhone(e.target.value);
                }}
                placeholder="08012345678"
                className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-secondary border border-border text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground font-display">Date of Birth</label>
            <div className="relative">
              <CalendarDays size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => {
                  setIsDirty(true);
                  setDateOfBirth(e.target.value);
                }}
                required
                className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-secondary border border-border text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          <label className="flex items-center justify-between rounded-lg border border-border bg-secondary/60 px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Bell size={16} className="text-muted-foreground" />
              Email notifications
            </div>
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => {
                setIsDirty(true);
                setEmailNotifications(e.target.checked);
              }}
              className="h-4 w-4 accent-primary"
            />
          </label>

          <button
            type="submit"
            disabled={updateProfileMutation.isPending}
            className="w-full py-3 rounded-lg bg-gradient-fire text-primary-foreground font-display font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {updateProfileMutation.isPending ? (
              <><Loader2 size={16} className="animate-spin" /> Saving...</>
            ) : (
              <><Save size={16} /> Save Changes</>
            )}
          </button>
        </form>
      </div>
    </main>
  );
};

export default UserProfilePage;
