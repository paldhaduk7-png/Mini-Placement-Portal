import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import companyService from '@/services/company.service';
import { Card, CardContent } from '@/components/ui/card';
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
  Globe,
} from 'lucide-react';
import type { Company } from '@/types/company';

export const Companies: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Add Company Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [website, setWebsite] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
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
      if (website.trim()) formData.append('website', website.trim());
      formData.append('image', imageFile);

      await companyService.createCompany(formData);
      toast.success(`Company "${name}" added successfully!`);
      setName('');
      setWebsite('');
      setImageFile(null);
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
                <TableHead className="text-xs font-semibold uppercase text-slate-500">Website</TableHead>
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
                    <span className="font-semibold text-slate-900 text-sm">{comp.name}</span>
                  </TableCell>
                  <TableCell>
                    {comp.imageUrl ? (
                      <img
                        src={comp.imageUrl}
                        alt={comp.name}
                        className="h-10 w-24 object-contain rounded border border-slate-100 p-1 bg-white"
                      />
                    ) : (
                      <div className="flex h-10 w-12 items-center justify-center rounded bg-slate-100 text-slate-500">
                        <Building2 className="h-5 w-5" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {comp.website ? (
                      <a
                        href={comp.website.startsWith('http') ? comp.website : `https://${comp.website}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <Globe className="h-3.5 w-3.5" />
                        {comp.website}
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="h-8 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 border-blue-200"
                      >
                        <Link to="/tpo/drives">View Drives</Link>
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Add New Company</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCompany} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Company Name *
                </label>
                <Input
                  required
                  placeholder="e.g. Tata Consultancy Services"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Website URL
                </label>
                <Input
                  placeholder="https://tcs.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Company Logo / Image *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  required
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
                <p className="text-[11px] text-slate-400 mt-1">PNG, JPG, or WEBP up to 5MB.</p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
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
