import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import companyService from '@/services/company.service';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { toast } from 'sonner';
import { Building2, ArrowLeft, UploadCloud } from 'lucide-react';

export const EditCompany: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
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

  const displayImage = imagePreview || currentImage;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/tpo/companies')}
        className="text-slate-600 hover:text-slate-900 -ml-2"
      >
        <ArrowLeft className="h-4 w-4 mr-1.5" />
        Back to Companies
      </Button>

      <Card className="border-slate-100 shadow-xl shadow-slate-200/40 rounded-3xl overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex items-center gap-4 bg-gradient-to-br from-white to-slate-50">
          <div className="h-14 w-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-sm">
            <Building2 className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">Edit Company</h1>
            <p className="text-sm text-slate-500 mt-1 font-medium">Update company details or replace logo.</p>
          </div>
        </div>

        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">Company Name <span className="text-blue-500">*</span></label>
              <Input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">
                Company Logo
              </label>
              
              <div className="relative group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setNewImageFile(file);
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setImagePreview(reader.result as string);
                      reader.readAsDataURL(file);
                    } else {
                      setImagePreview(null);
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                
                <div className={`flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-2xl transition-all ${
                  imagePreview 
                    ? 'border-blue-200 bg-blue-50/50' 
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300'
                }`}>
                  {displayImage ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-24 w-24 rounded-2xl overflow-hidden border-2 border-white shadow-md bg-white p-2">
                        <img src={displayImage} alt="Preview" className="w-full h-full object-contain rounded-xl" />
                      </div>
                      <p className="text-xs font-semibold text-blue-600 group-hover:text-blue-700 transition-colors">
                        {imagePreview ? 'Click or drag to choose a different image' : 'Click or drag to replace current logo'}
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-500">
                      <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-100 mb-1 group-hover:scale-105 transition-transform">
                        <UploadCloud className="h-6 w-6 text-blue-500" />
                      </div>
                      <p className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">Upload new company logo</p>
                      <p className="text-xs text-slate-400 font-medium">PNG, JPG, WEBP up to 5MB</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-6 flex justify-end gap-3 border-t border-slate-100">
              <Button type="button" variant="outline" className="rounded-xl font-semibold border-slate-200 hover:bg-slate-50 text-slate-600" onClick={() => navigate('/tpo/companies')}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isSubmitting} className="rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md transition-all">
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
