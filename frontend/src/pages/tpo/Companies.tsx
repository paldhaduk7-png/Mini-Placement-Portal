import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import companyService from '@/services/company.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { toast } from 'sonner';
import {
  Building2,
  Plus,
  Search,
  Trash2,
  Pencil,
  History,
} from 'lucide-react';
import type { Company } from '@/types/company';

export const Companies: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Add Company Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete State
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    setIsLoading(true);
    try {
      const res: any = await companyService.getAllCompanies();
      const list = Array.isArray(res) ? res : res?.data || res?.companies || [];
      setCompanies(list);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load companies.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter the company name.');
      return;
    }
    if (!imageFile) {
      toast.error('Please select a company logo image.');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('image', imageFile);

      await companyService.createCompany(formData);
      toast.success(`Company "${name}" added successfully!`);
      setName('');
      setImageFile(null);
      setImagePreview(null);
      setIsModalOpen(false);
      await loadCompanies();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create company.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCompany = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await companyService.deleteCompany(deleteId);
      toast.success('Company deleted successfully.');
      setDeleteId(null);
      await loadCompanies();
    } catch (err: any) {
      toast.error(err.message || 'Cannot delete company with active recruitment drives.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredCompanies = companies.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading && companies.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" text="Loading company directory..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header matching reference design */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Companies</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage recruiting partners, corporate profiles and campus hiring drives.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-48 sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-xs h-9"
            />
          </div>

          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold h-9 gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Add Company
          </Button>
        </div>
      </div>

      {/* Companies Table matching reference design */}
      {filteredCompanies.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No Companies Found"
          description="Get started by registering a new company partner for campus recruitment."
          action={
            <Button onClick={() => setIsModalOpen(true)} size="sm" className="bg-blue-600 text-white text-xs">
              <Plus className="h-4 w-4 mr-1" /> Add First Company
            </Button>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead className="w-12 text-center text-xs font-semibold uppercase text-slate-500">#</TableHead>
                <TableHead className="text-xs font-semibold uppercase text-slate-500">Company Name</TableHead>
                <TableHead className="text-xs font-semibold uppercase text-slate-500">Image</TableHead>
                <TableHead className="text-right text-xs font-semibold uppercase text-slate-500">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompanies.map((comp, index) => (
                <TableRow key={comp.id} className="hover:bg-slate-50/70 transition-colors">
                  <TableCell className="text-center font-medium text-slate-400 text-xs">
                    {index + 1}
                  </TableCell>
                  <TableCell>
                    <Link
                      to={`/tpo/companies/${comp.id}`}
                      className="font-semibold text-slate-900 text-sm hover:text-blue-600 hover:underline transition-colors"
                    >
                      {comp.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link to={`/tpo/companies/${comp.id}`} className="inline-block">
                      {comp.imageUrl ? (
                        <img
                          src={comp.imageUrl}
                          alt={comp.name}
                          className="h-10 w-24 object-contain rounded border border-slate-100 p-1 bg-white hover:border-blue-200 transition-colors"
                        />
                      ) : (
                        <div className="flex h-10 w-12 items-center justify-center rounded bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors">
                          <Building2 className="h-5 w-5" />
                        </div>
                      )}
                    </Link>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="h-8 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 border-blue-200"
                      >
                        <Link to={`/tpo/companies/${comp.id}`}>Company Details</Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="h-8 text-xs font-semibold text-slate-700 hover:text-blue-700 hover:bg-slate-50 border-slate-200"
                      >
                        <Link to={`/tpo/companies/${comp.id}?tab=history`}>
                          <History className="h-3.5 w-3.5 mr-1 text-slate-500" />
                          History
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="h-8 w-8 p-0 text-slate-400 hover:text-blue-600 bg-transparent hover:bg-blue-50"
                      >
                        <Link to={`/tpo/companies/${comp.id}/edit`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteId(comp.id)}
                        className="h-8 w-8 p-0 text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add Company Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200 border border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">
                  Add New Company
                </h3>
                <p className="text-xs text-slate-500 mt-1 font-medium">Register a new recruitment partner</p>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setName('');
                  setImageFile(null);
                  setImagePreview(null);
                }}
                className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCompany} className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">
                  Company Name <span className="text-blue-500">*</span>
                </label>
                <Input
                  required
                  placeholder="e.g. Tata Consultancy Services"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11 rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">
                  Company Logo <span className="text-blue-500">*</span>
                </label>
                <div className="relative group">
                  <input
                    type="file"
                    accept="image/*"
                    required
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setImageFile(file);
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
                    {imagePreview ? (
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-20 w-20 rounded-2xl overflow-hidden border-2 border-white shadow-md bg-white p-1">
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-contain rounded-xl" />
                        </div>
                        <p className="text-xs font-semibold text-blue-600 group-hover:text-blue-700 transition-colors">Click or drag to change image</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-slate-500">
                        <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-100 mb-1 group-hover:scale-105 transition-transform">
                          <Building2 className="h-5 w-5 text-blue-500" />
                        </div>
                        <p className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">Upload company logo</p>
                        <p className="text-xs text-slate-400 font-medium">PNG, JPG, WEBP up to 5MB</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl font-semibold border-slate-200 hover:bg-slate-50 text-slate-600"
                  onClick={() => {
                    setIsModalOpen(false);
                    setName('');
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  className="rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md transition-all"
                >
                  Add Company
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Company"
        description="Are you sure you want to delete this company? This action cannot be undone if no recruitment drives are linked to it."
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={handleDeleteCompany}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};
