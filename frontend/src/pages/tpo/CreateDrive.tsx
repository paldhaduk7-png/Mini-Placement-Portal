import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import companyService from '@/services/company.service';
import driveService from '@/services/drive.service';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Briefcase, ArrowLeft } from 'lucide-react';
import type { Company } from '@/types/company';
import type { StudentType } from '@/types/student';

export const CreateDrive: React.FC = () => {
  const navigate = useNavigate();

  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State matching reference design
  const [companyId, setCompanyId] = useState('');
  const [role, setRole] = useState('');
  const [ctc, setCtc] = useState<number | ''>(7.0);
  const [jobLocation, setJobLocation] = useState('Bangalore');
  const [description, setDescription] = useState('Work on real world projects and grow your career.');
  
  // Eligibility Criteria
  const [minTenthPercentage, setMinTenthPercentage] = useState<number | ''>(60);
  const [minTwelfthPercentage, setMinTwelfthPercentage] = useState<number | ''>(60);
  const [minCgpa, setMinCgpa] = useState<number | ''>(7.0);
  const [minD2dCgpa, setMinD2dCgpa] = useState<number | ''>(7.0);
  const [maxActiveBacklogs, setMaxActiveBacklogs] = useState<number | ''>(0);
  const [isD2dAllowed, setIsD2dAllowed] = useState<'Yes' | 'No'>('Yes');
  
  const [driveDate, setDriveDate] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  );
  const [deadline, setDeadline] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      const res: any = await companyService.getAllCompanies();
      const list = Array.isArray(res) ? res : res?.data || res?.companies || [];
      setCompanies(list);
      if (list.length > 0) {
        setCompanyId(list[0].id);
      }
    } catch (err) {
      console.error('Failed to load companies:', err);
    } finally {
      setIsLoadingCompanies(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!companyId) {
      toast.error('Please select a company.');
      return;
    }
    if (!role.trim()) {
      toast.error('Job role is required.');
      return;
    }
    if (ctc === '' || Number(ctc) <= 0) {
      toast.error('Valid CTC is required.');
      return;
    }
    if (!deadline) {
      toast.error('Application deadline is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const allowedStudentTypes: StudentType[] =
        isD2dAllowed === 'Yes' ? ['REGULAR', 'D2D'] : ['REGULAR'];

      const payload = {
        companyId,
        role: role.trim(),
        description: description.trim(),
        ctc: Number(ctc),
        jobLocation: jobLocation.trim() || undefined,
        driveDate: new Date(driveDate).toISOString(),
        deadline: new Date(deadline).toISOString(),
        status: 'UPCOMING' as const,
        minCgpa: Number(minCgpa) || 0,
        minTenthPercentage: Number(minTenthPercentage) || 0,
        minTwelfthPercentage: minTwelfthPercentage !== '' ? Number(minTwelfthPercentage) : null,
        minD2dCgpa: isD2dAllowed === 'Yes' && minD2dCgpa !== '' ? Number(minD2dCgpa) : null,
        maxActiveBacklogs: Number(maxActiveBacklogs) || 0,
        allowedStudentTypes,
        allowedDepartments: [],
        requiresVerification: true,
      };

      await driveService.createDrive(payload);
      toast.success('Recruitment drive published successfully!');
      navigate('/tpo/drives');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create recruitment drive.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/tpo/drives')}
        className="text-slate-600 hover:text-slate-900 -ml-2"
      >
        <ArrowLeft className="h-4 w-4 mr-1.5" />
        Back to Drives
      </Button>

      {/* Main Form Card matching reference design */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <Briefcase className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Add Recruitment Drive</h1>
            <p className="text-xs text-slate-500">Configure job role, compensation and academic eligibility filters.</p>
          </div>
        </div>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Top Row: Company & Role */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Company *</label>
                {isLoadingCompanies ? (
                  <div className="h-10 bg-slate-100 animate-pulse rounded-md" />
                ) : companies.length === 0 ? (
                  <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
                    No companies available. Please add a company first.
                  </div>
                ) : (
                  <select
                    value={companyId}
                    onChange={(e) => setCompanyId(e.target.value)}
                    required
                    className="w-full h-10 px-3 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Role *</label>
                <Input
                  required
                  placeholder="e.g. Software Engineer"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                />
              </div>
            </div>

            {/* Row 2: CTC & Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">CTC (₹ in LPA) *</label>
                <Input
                  type="number"
                  step="0.1"
                  required
                  placeholder="e.g. 7.0"
                  value={ctc}
                  onChange={(e) => setCtc(e.target.value === '' ? '' : Number(e.target.value))}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                <Input
                  placeholder="e.g. Bangalore / Hybrid"
                  value={jobLocation}
                  onChange={(e) => setJobLocation(e.target.value)}
                />
              </div>
            </div>

            {/* Row 3: Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
              <textarea
                rows={3}
                placeholder="Job description, requirements and growth opportunities."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-xs p-3 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Section: Eligibility Criteria matching reference design */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Eligibility Criteria</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">10th %</label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder=">= 60"
                    value={minTenthPercentage}
                    onChange={(e) => setMinTenthPercentage(e.target.value === '' ? '' : Number(e.target.value))}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">12th %</label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder=">= 60"
                    value={minTwelfthPercentage}
                    onChange={(e) => setMinTwelfthPercentage(e.target.value === '' ? '' : Number(e.target.value))}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Min CGPA</label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder=">= 7.0"
                    value={minCgpa}
                    onChange={(e) => setMinCgpa(e.target.value === '' ? '' : Number(e.target.value))}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Min CPI / D2D CGPA</label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder=">= 7.0"
                    value={minD2dCgpa}
                    onChange={(e) => setMinD2dCgpa(e.target.value === '' ? '' : Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Backlogs Allowed</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={maxActiveBacklogs}
                    onChange={(e) => setMaxActiveBacklogs(e.target.value === '' ? '' : Number(e.target.value))}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">D2D Allowed</label>
                  <select
                    value={isD2dAllowed}
                    onChange={(e) => setIsD2dAllowed(e.target.value as 'Yes' | 'No')}
                    className="w-full h-10 px-3 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Row 4: Deadlines */}
            <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Application Deadline *
                </label>
                <Input
                  type="date"
                  required
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Drive Event Date
                </label>
                <Input
                  type="date"
                  required
                  value={driveDate}
                  onChange={(e) => setDriveDate(e.target.value)}
                />
              </div>
            </div>

            {/* Submit & Cancel Buttons */}
            <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/tpo/drives')}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-6"
              >
                Add Drive
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
