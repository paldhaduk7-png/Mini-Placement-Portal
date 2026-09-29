import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import companyService from '@/services/company.service';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Building2, ArrowLeft } from 'lucide-react';

export const CreateCompany: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [website, setWebsite] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Company name is required.');
      return;
    }
    if (!imageFile) {
      toast.error('Company image is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      if (website.trim()) formData.append('website', website.trim());
      formData.append('image', imageFile);

      await companyService.createCompany(formData);
      toast.success(`Company "${name}" created successfully!`);
      navigate('/tpo/companies');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create company.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Add New Company</h1>
            <p className="text-xs text-slate-500">Create a recruiting partner for placement drives.</p>
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
                placeholder="e.g. Tata Consultancy Services"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Website</label>
              <Input
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://company.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company Logo / Image *</label>
              <input
                type="file"
                accept="image/*"
                required
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              />
            </div>

            <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
              <Button type="button" variant="outline" size="sm" onClick={() => navigate('/tpo/companies')}>
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
                Add Company
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
