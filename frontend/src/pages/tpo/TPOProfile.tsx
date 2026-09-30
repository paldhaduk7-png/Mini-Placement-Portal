import React, { useEffect, useState } from 'react';
import tpoUserService, { TpoUser } from '@/services/tpo-user.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { toast } from 'sonner';
import { UserCircle, Save } from 'lucide-react';

export const TPOProfile: React.FC = () => {
  const [profile, setProfile] = useState<TpoUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const res = await tpoUserService.getMyProfile();
      setProfile(res);
      setName(res.name || '');
      setPhone(res.phone || '');
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to load profile.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await tpoUserService.updateMyProfile({
        name: name.trim() || undefined,
        phone: phone.trim() || undefined,
      });
      setProfile(res);
      toast.success('Profile updated successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to update profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" text="Loading profile..." />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-slate-500 font-medium">Profile not found.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          My Profile
        </h1>
        <p className="text-xs text-slate-500 mt-1 font-medium">
          View and update your account information.
        </p>
      </div>

      <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
            <div className="h-20 w-20 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-inner">
              <UserCircle className="h-10 w-10 opacity-70" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{profile.name || 'TPO Admin'}</h2>
              <p className="text-sm text-slate-500 font-medium">{profile.email}</p>
              <span className="inline-flex items-center mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                {profile.role}
              </span>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Full Name
                </label>
                <Input
                  type="text"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Email Address <span className="text-slate-400 font-normal text-xs">(Read-only)</span>
                </label>
                <Input
                  type="email"
                  value={profile.email}
                  disabled
                  className="h-11 rounded-xl bg-slate-100 border-slate-200 text-slate-500 opacity-80 cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Phone Number
                </label>
                <Input
                  type="tel"
                  placeholder="Your phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button
                type="submit"
                disabled={isSubmitting || (name === (profile.name || '') && phone === (profile.phone || ''))}
                className="rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200 px-6 h-11"
              >
                {isSubmitting ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default TPOProfile;
