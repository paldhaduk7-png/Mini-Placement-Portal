import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import companyService from '@/services/company.service';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { toast } from 'sonner';
import { Building2, ArrowLeft } from 'lucide-react';

export const EditCompany: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [website, setWebsite] = useState('');
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      loadCompany(id);
    }
  }, [id]);

  const loadCompany = async (companyId: string) => {
    setIsLoading(true);
    try {
      const res = await companyService.getCompanyById(companyId);
      const data = (res as any)?.data || (res as any)?.company || res;
      if (data) {
        setName(data.name || '');
        setWebsite(data.website || '');
        setCurrentImage(data.imageUrl || null);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load company.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    if (!name.trim()) {
      toast.error('Company name is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      if (website.trim()) formData.append('website', website.trim());
      if (newImageFile) formData.append('image', newImageFile);

      await companyService.updateCompany(id, formData);
      toast.success('Company updated successfully!');
      navigate('/tpo/companies');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update company.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" text="Loading company details..." />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/tpo/companies')}
        className="text-slate-600 hover:text-slate-900 -ml-2"
      >
        <ArrowLeft className="h-4 w-4 mr-1.5" />
        Back to Companies
      </Button>

      <Card className="border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Edit Company</h1>
            <p className="text-xs text-slate-500">Update company details or replace logo.</p>
          </div>
        </div>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name *</label>
              <Input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Website</label>
              <Input
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>

            {currentImage && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Current Logo</label>
                <img
                  src={currentImage}
                  alt={name}
                  className="h-12 w-28 object-contain rounded border border-slate-200 p-1 bg-white"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Replace Logo (Optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setNewImageFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              />
            </div>

            <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
              <Button type="button" variant="outline" size="sm" onClick={() => navigate('/tpo/companies')}>
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
