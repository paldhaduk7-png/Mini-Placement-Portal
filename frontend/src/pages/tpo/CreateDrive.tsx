import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import companyService from '@/services/company.service';
import driveService from '@/services/drive.service';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Briefcase, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import type { Company } from '@/types/company';
import type { StudentType } from '@/types/student';
import { DEPARTMENTS } from '@/constants';

export const CreateDrive: React.FC = () => {
  const navigate = useNavigate();

  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State matching reference design
  const [companyId, setCompanyId] = useState('');
  const [eligibilityMode, setEligibilityMode] = useState<'COMMON' | 'CUSTOM'>('COMMON');
  
  const defaultRoleEligibility = {
    minTenthPercentage: 60 as number | '',
    minTwelfthPercentage: 60 as number | '',
    minCgpa: 7.0 as number | '',
    minD2dCgpa: 7.0 as number | '',
    maxActiveBacklogs: 0 as number | '',
    isD2dAllowed: 'Yes' as 'Yes' | 'No',
    allowedDepartments: [] as string[],
    branchError: false
  };

  const [roles, setRoles] = useState([
    { title: '', minCTC: 7.0, maxCTC: 7.0, openings: '' as number | '', ...defaultRoleEligibility }
  ]);
  const [jobLocation, setJobLocation] = useState('Bangalore');
  const [description, setDescription] = useState('Work on real world projects and grow your career.');
  
  // Eligibility Criteria
  const [minTenthPercentage, setMinTenthPercentage] = useState<number | ''>(60);
  const [minTwelfthPercentage, setMinTwelfthPercentage] = useState<number | ''>(60);
  const [minCgpa, setMinCgpa] = useState<number | ''>(7.0);
  const [minD2dCgpa, setMinD2dCgpa] = useState<number | ''>(7.0);
  const [maxActiveBacklogs, setMaxActiveBacklogs] = useState<number | ''>(0);
  const [isD2dAllowed, setIsD2dAllowed] = useState<'Yes' | 'No'>('Yes');
  const [allowedDepartments, setAllowedDepartments] = useState<string[]>([]);
  const [branchError, setBranchError] = useState(false);
  
  const [driveDate, setDriveDate] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  );
  
  const handleDeptToggle = (dept: string) => {
    setBranchError(false);
    setAllowedDepartments((prev) =>
      prev.includes(dept) ? prev.filter((d) => d !== dept) : [...prev, dept]
    );
  };

  const isAllBranchesSelected =
    DEPARTMENTS.length > 0 && DEPARTMENTS.every((dept) => allowedDepartments.includes(dept));

  const handleSelectAllBranches = () => {
    setBranchError(false);
    if (isAllBranchesSelected) {
      setAllowedDepartments([]);
    } else {
      setAllowedDepartments([...DEPARTMENTS]);
    }
  };

  const [deadline, setDeadline] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );

  const addRole = () => setRoles([...roles, { title: '', minCTC: 7.0, maxCTC: 7.0, openings: '', ...defaultRoleEligibility }]);
  const removeRole = (idx: number) => setRoles(roles.filter((_, i) => i !== idx));
  const updateRole = (idx: number, field: string, val: any) => {
    const newRoles = [...roles];
    newRoles[idx] = { ...newRoles[idx], [field]: val };
    setRoles(newRoles);
  };
  
  const handleRoleDeptToggle = (idx: number, dept: string) => {
    const newRoles = [...roles];
    const prev = newRoles[idx].allowedDepartments;
    newRoles[idx].allowedDepartments = prev.includes(dept) ? prev.filter(d => d !== dept) : [...prev, dept];
    newRoles[idx].branchError = false;
    setRoles(newRoles);
  };
  
  const handleRoleSelectAllBranches = (idx: number) => {
    const newRoles = [...roles];
    const isAll = DEPARTMENTS.length > 0 && DEPARTMENTS.every(d => newRoles[idx].allowedDepartments.includes(d));
    newRoles[idx].allowedDepartments = isAll ? [] : [...DEPARTMENTS];
    newRoles[idx].branchError = false;
    setRoles(newRoles);
  };

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
    if (roles.length === 0) {
      toast.error('At least one job role is required.');
      return;
    }
    
    for (const r of roles) {
      if (!r.title.trim()) {
        toast.error('Job role title is required.');
        return;
      }
      if (String(r.minCTC) === '' || Number(r.minCTC) < 0) {
        toast.error('Valid Minimum CTC is required.');
        return;
      }
      if (String(r.maxCTC) === '' || Number(r.maxCTC) < Number(r.minCTC)) {
        toast.error('Valid Maximum CTC is required (must be >= Minimum CTC).');
        return;
      }
    }
    if (!deadline) {
      toast.error('Application deadline is required.');
      return;
    }
    if (eligibilityMode === 'COMMON') {
      if (allowedDepartments.length === 0) {
        setBranchError(true);
        toast.error('Please select at least one branch for the drive.');
        return;
      }
    } else {
      let hasError = false;
      const newRoles = [...roles];
      for (let i = 0; i < newRoles.length; i++) {
        if (newRoles[i].allowedDepartments.length === 0) {
          newRoles[i].branchError = true;
          hasError = true;
        }
      }
      if (hasError) {
        setRoles(newRoles);
        toast.error('Please select at least one branch for each job role.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const allowedStudentTypes: StudentType[] =
        isD2dAllowed === 'Yes' ? ['REGULAR', 'D2D'] : ['REGULAR'];

      // Drive date ends at 23:59:59 local time; application deadline closes at 18:00:00 (6:00 PM)
      const [dY, dM, dD] = driveDate.split('-').map(Number);
      const resolvedDriveDate = new Date(dY, dM - 1, dD, 23, 59, 59, 999);

      const [deadY, deadM, deadD] = deadline.split('-').map(Number);
      const resolvedDeadline = new Date(deadY, deadM - 1, deadD, 18, 0, 0, 0);

      const payload = {
        companyId,
        roles: roles.map(r => {
          const roleStudentTypes: StudentType[] = r.isD2dAllowed === 'Yes' ? ['REGULAR', 'D2D'] : ['REGULAR'];
          return {
            title: r.title.trim(),
            minCTC: Number(r.minCTC),
            maxCTC: Number(r.maxCTC),
            openings: r.openings !== '' ? Number(r.openings) : null,
            useCommonEligibility: eligibilityMode === 'COMMON',
            minCgpa: eligibilityMode === 'CUSTOM' ? (Number(r.minCgpa) || 0) : undefined,
            minTenthPercentage: eligibilityMode === 'CUSTOM' ? (Number(r.minTenthPercentage) || 0) : undefined,
            minTwelfthPercentage: eligibilityMode === 'CUSTOM' ? (r.minTwelfthPercentage !== '' ? Number(r.minTwelfthPercentage) : null) : undefined,
            minD2dCgpa: eligibilityMode === 'CUSTOM' ? (r.isD2dAllowed === 'Yes' && r.minD2dCgpa !== '' ? Number(r.minD2dCgpa) : null) : undefined,
            maxActiveBacklogs: eligibilityMode === 'CUSTOM' ? (Number(r.maxActiveBacklogs) || 0) : undefined,
            allowedStudentTypes: eligibilityMode === 'CUSTOM' ? roleStudentTypes : undefined,
            allowedDepartments: eligibilityMode === 'CUSTOM' ? r.allowedDepartments : undefined,
          };
        }),
        description: description.trim(),
        jobLocation: jobLocation.trim() || undefined,
        driveDate: resolvedDriveDate.toISOString(),
        deadline: resolvedDeadline.toISOString(),
        status: 'UPCOMING' as const,
        minCgpa: eligibilityMode === 'COMMON' ? (Number(minCgpa) || 0) : 0,
        minTenthPercentage: eligibilityMode === 'COMMON' ? (Number(minTenthPercentage) || 0) : 0,
        minTwelfthPercentage: eligibilityMode === 'COMMON' ? (minTwelfthPercentage !== '' ? Number(minTwelfthPercentage) : null) : null,
        minD2dCgpa: eligibilityMode === 'COMMON' ? (isD2dAllowed === 'Yes' && minD2dCgpa !== '' ? Number(minD2dCgpa) : null) : null,
        maxActiveBacklogs: eligibilityMode === 'COMMON' ? (Number(maxActiveBacklogs) || 0) : 0,
        allowedStudentTypes: eligibilityMode === 'COMMON' ? allowedStudentTypes : undefined,
        allowedDepartments: eligibilityMode === 'COMMON' ? allowedDepartments : undefined,
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
            
            {/* Top Row: Company & Location */}
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                <Input
                  placeholder="e.g. Bangalore / Hybrid"
                  value={jobLocation}
                  onChange={(e) => setJobLocation(e.target.value)}
                />
              </div>
            </div>

            {/* Eligibility Mode Toggle */}
            <div className="pt-4 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700 mb-2">Eligibility Criteria Mode *</label>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="eligibilityMode"
                    checked={eligibilityMode === 'COMMON'}
                    onChange={() => setEligibilityMode('COMMON')}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  Same criteria for all roles
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="eligibilityMode"
                    checked={eligibilityMode === 'CUSTOM'}
                    onChange={() => setEligibilityMode('CUSTOM')}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  Customize criteria by role
                </label>
              </div>
            </div>

            {/* Roles Section */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900">Job Roles *</h3>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={addRole}
                  className="text-xs h-8"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Role
                </Button>
              </div>

              <div className="space-y-4">
                {roles.map((r, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-lg relative">
                    {roles.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRole(idx)}
                        className="absolute -top-2 -right-2 bg-red-100 text-red-600 hover:bg-red-200 p-1.5 rounded-full shadow-sm transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Role Title *</label>
                        <Input
                          required
                          placeholder="e.g. Software Engineer"
                          value={r.title}
                          onChange={(e) => updateRole(idx, 'title', e.target.value)}
                          className="h-9"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Min CTC (LPA) *</label>
                        <Input
                          type="number"
                          step="0.1"
                          required
                          placeholder="7.0"
                          value={r.minCTC}
                          onChange={(e) => updateRole(idx, 'minCTC', e.target.value === '' ? '' : Number(e.target.value))}
                          className="h-9"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Max CTC (LPA) *</label>
                        <Input
                          type="number"
                          step="0.1"
                          required
                          placeholder="7.0"
                          value={r.maxCTC}
                          onChange={(e) => updateRole(idx, 'maxCTC', e.target.value === '' ? '' : Number(e.target.value))}
                          className="h-9"
                        />
                      </div>
                      
                      <div className="md:col-span-4">
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Openings (Optional)</label>
                        <Input
                          type="number"
                          placeholder="e.g. 10"
                          value={r.openings}
                          onChange={(e) => updateRole(idx, 'openings', e.target.value === '' ? '' : Number(e.target.value))}
                          className="h-9 w-full md:w-1/4"
                        />
                      </div>
                    </div>
                    
                    {/* CUSTOM ELIGIBILITY FOR THIS ROLE */}
                    {eligibilityMode === 'CUSTOM' && (
                      <div className="mt-6 pt-4 border-t border-slate-200">
                        <h4 className="text-xs font-bold text-slate-800 mb-3">Custom Eligibility for {r.title || 'this role'}</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-[11px] font-medium text-slate-600 mb-1">10th %</label>
                            <Input
                              type="number"
                              step="0.1"
                              placeholder=">= 60"
                              value={r.minTenthPercentage}
                              onChange={(e) => updateRole(idx, 'minTenthPercentage', e.target.value === '' ? '' : Number(e.target.value))}
                              className="h-9"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-medium text-slate-600 mb-1">12th %</label>
                            <Input
                              type="number"
                              step="0.1"
                              placeholder=">= 60"
                              value={r.minTwelfthPercentage}
                              onChange={(e) => updateRole(idx, 'minTwelfthPercentage', e.target.value === '' ? '' : Number(e.target.value))}
                              className="h-9"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-medium text-slate-600 mb-1">Min CGPA</label>
                            <Input
                              type="number"
                              step="0.1"
                              placeholder=">= 7.0"
                              value={r.minCgpa}
                              onChange={(e) => updateRole(idx, 'minCgpa', e.target.value === '' ? '' : Number(e.target.value))}
                              className="h-9"
                            />
                          </div>
                          {r.isD2dAllowed === 'Yes' && (
                            <div>
                              <label className="block text-[11px] font-medium text-slate-600 mb-1">Min CPI / D2D CGPA</label>
                              <Input
                                type="number"
                                step="0.1"
                                placeholder=">= 7.0"
                                value={r.minD2dCgpa}
                                onChange={(e) => updateRole(idx, 'minD2dCgpa', e.target.value === '' ? '' : Number(e.target.value))}
                                className="h-9"
                              />
                            </div>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <div>
                            <label className="block text-[11px] font-medium text-slate-600 mb-1">Backlogs Allowed</label>
                            <Input
                              type="number"
                              placeholder="0"
                              value={r.maxActiveBacklogs}
                              onChange={(e) => updateRole(idx, 'maxActiveBacklogs', e.target.value === '' ? '' : Number(e.target.value))}
                              className="h-9"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-medium text-slate-600 mb-1">D2D Allowed</label>
                            <select
                              value={r.isD2dAllowed}
                              onChange={(e) => updateRole(idx, 'isD2dAllowed', e.target.value)}
                              className="w-full h-9 px-3 text-[11px] bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="Yes">Yes</option>
                              <option value="No">No</option>
                            </select>
                          </div>
                        </div>
                        <div className="mt-4">
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-[11px] font-semibold text-slate-700">
                              Allowed Branches <span className="text-red-500">*</span>
                            </label>
                            <button
                              type="button"
                              onClick={() => handleRoleSelectAllBranches(idx)}
                              className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              {DEPARTMENTS.length > 0 && DEPARTMENTS.every(d => r.allowedDepartments.includes(d)) ? 'Deselect All' : 'Select All'}
                            </button>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {DEPARTMENTS.map((dept) => (
                              <label key={dept} className="flex items-center gap-2 text-[11px] text-slate-700 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={r.allowedDepartments.includes(dept)}
                                  onChange={() => handleRoleDeptToggle(idx, dept)}
                                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                />
                                {dept}
                              </label>
                            ))}
                          </div>
                          {r.branchError && (
                            <p className="text-[10px] text-red-500 mt-1 font-medium">Please select at least one branch for this role.</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
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
            {eligibilityMode === 'COMMON' && (
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
                
                {isD2dAllowed === 'Yes' && (
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
                )}
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
              
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-slate-700">
                    Allowed Branches <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleSelectAllBranches}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    {isAllBranchesSelected ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                <div className="mb-2.5 pb-2 border-b border-slate-100 flex items-center">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAllBranchesSelected}
                      onChange={handleSelectAllBranches}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Select All Branches</span>
                  </label>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {DEPARTMENTS.map((dept) => (
                    <label key={dept} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={allowedDepartments.includes(dept)}
                        onChange={() => handleDeptToggle(dept)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      {dept}
                    </label>
                  ))}
                </div>

                {branchError && (
                  <p className="text-[11px] text-red-500 mt-2 font-medium">
                    Please select at least one branch for this recruitment drive.
                  </p>
                )}
              </div>
            </div>
            )}

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
