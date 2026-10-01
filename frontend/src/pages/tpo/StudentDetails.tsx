import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import studentService from '@/services/student.service';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  User,
  GraduationCap,
  Building,
  Mail,
  Phone,
  FileText,
  Eye,
} from 'lucide-react';
import type { Student } from '@/types/student';

export const StudentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [student, setStudent] = useState<Student | null>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    if (id) loadStudent(id);
  }, [id]);

  const loadStudent = async (studentId: string) => {
    setIsLoading(true);
    try {
      const [studentRes, appsRes] = await Promise.all([
        studentService.getStudentById(studentId),
        import('@/services/application.service').then(m => m.default.getTpoApplications({ studentId }))
      ]);
      const data = (studentRes as any)?.data || studentRes;
      setStudent(data);
      const appsList = (appsRes as any)?.data || appsRes || [];
      setApplications(appsList);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load student details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!id) return;
    setIsVerifying(true);
    try {
      await studentService.verifyStudent(id, { status: 'VERIFIED' });
      toast.success('Student profile has been verified successfully!');
      await loadStudent(id);
    } catch (err: any) {
      toast.error(err.message || 'Verification failed.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleReject = async () => {
    if (!id) return;
    if (!rejectionReason.trim()) {
      toast.error('Please specify a rejection reason.');
      return;
    }
    setIsVerifying(true);
    try {
      await studentService.verifyStudent(id, {
        status: 'REJECTED',
        rejectionReason: rejectionReason.trim(),
      });
      toast.success('Student profile marked as rejected.');
      setShowRejectDialog(false);
      setRejectionReason('');
      await loadStudent(id);
    } catch (err: any) {
      toast.error(err.message || 'Action failed.');
    } finally {
      setIsVerifying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" text="Loading student credentials..." />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto mb-2" />
        <h3 className="text-base font-semibold text-slate-800">Student Profile Not Found</h3>
        <Button variant="outline" size="sm" onClick={() => navigate('/tpo/students')} className="mt-4">
          Return to Students
        </Button>
      </div>
    );
  }

  const isVerified = student.verificationStatus === 'VERIFIED';
  const isRejected = student.verificationStatus === 'REJECTED';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/tpo/students')}
        className="text-slate-600 hover:text-slate-900 -ml-2"
      >
        <ArrowLeft className="h-4 w-4 mr-1.5" />
        Back to Students
      </Button>

      {/* Main Student Header Card */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 bg-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-200 font-bold text-xl overflow-hidden shrink-0">
              {student.profilePhoto ? (
                <img src={student.profilePhoto} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                student.fullName?.charAt(0) || 'S'
              )}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold tracking-tight text-white">{student.fullName || 'Profile Not Completed'}</h1>
                {student.profileCompleted ? (
                  isVerified ? (
                    <Badge variant="success">Verified</Badge>
                  ) : isRejected ? (
                    <Badge variant="destructive">Rejected</Badge>
                  ) : (
                    <Badge variant="warning">Pending Verification</Badge>
                  )
                ) : (
                  <Badge variant="outline" className="border-slate-500 text-slate-300">Not Completed</Badge>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-4 mt-1.5 text-xs text-slate-300">
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5 text-blue-400" />
                  {student.user?.email || 'N/A'}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5 text-blue-400" />
                  {student.phone || 'N/A'}
                </span>
                <span>Dept: {student.department || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Verification Action Buttons */}
          <div className="flex items-center gap-2">
            {!isVerified && student.profileCompleted && (
              <Button
                onClick={handleVerify}
                isLoading={isVerifying}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 shadow-sm"
              >
                <CheckCircle2 className="h-4 w-4 mr-1.5" />
                Verify Student
              </Button>
            )}
            {!isRejected && student.profileCompleted && (
              <Button
                variant="outline"
                onClick={() => setShowRejectDialog(true)}
                disabled={isVerifying}
                className="border-red-400/40 text-red-300 hover:bg-red-500/20 text-xs font-semibold"
              >
                <XCircle className="h-4 w-4 mr-1.5" />
                Reject Profile
              </Button>
            )}
            {!student.profileCompleted && (
              <span className="text-xs text-slate-300 bg-slate-800 px-3 py-1.5 rounded border border-slate-700 shadow-sm">
                Awaiting Profile Submission
              </span>
            )}
          </div>
        </div>

        {isRejected && student.rejectionReason && (
          <div className="p-4 bg-red-50 border-b border-red-200 text-red-800 text-xs flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
            <span>
              <strong>Rejection Reason:</strong> {student.rejectionReason}
            </span>
          </div>
        )}

        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Personal Details */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <h3 className="text-xs font-bold text-slate-700 uppercase mb-3 flex items-center gap-1.5">
                <User className="h-4 w-4 text-blue-600" />
                Personal Information
              </h3>
              <dl className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <dt className="text-slate-500">Student Type:</dt>
                  <dd className="font-semibold text-blue-700">{student.studentType || 'N/A'}</dd>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <dt className="text-slate-500">Date of Birth:</dt>
                  <dd className="font-semibold text-slate-800">{student.dob ? formatDate(student.dob) : 'N/A'}</dd>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <dt className="text-slate-500">Profile Lock Status:</dt>
                  <dd className="font-semibold text-slate-800">
                    {!student.profileCompleted ? 'Not Completed' : student.isProfileLocked ? 'Locked by Student' : 'Draft / Unlocked'}
                  </dd>
                </div>
                <div className="flex justify-between py-1">
                  <dt className="text-slate-500">Registered On:</dt>
                  <dd className="font-semibold text-slate-800">{student.createdAt ? formatDate(student.createdAt) : 'N/A'}</dd>
                </div>
              </dl>
            </div>

            {/* Academic Information */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <h3 className="text-xs font-bold text-slate-700 uppercase mb-3 flex items-center gap-1.5">
                <GraduationCap className="h-4 w-4 text-blue-600" />
                College & Board Performance
              </h3>
              <dl className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <dt className="text-slate-500">Current CGPA:</dt>
                  <dd className="font-bold text-blue-600 text-sm">{student.currentCgpa ?? 'N/A'}</dd>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <dt className="text-slate-500">Active / Total Backlogs:</dt>
                  <dd className="font-semibold text-slate-800">
                    {student.activeBacklogs ?? 'N/A'} / {student.totalBacklogs ?? 'N/A'}
                  </dd>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <dt className="text-slate-500">10th Percentage:</dt>
                  <dd className="font-semibold text-slate-800">{student.tenthPercentage != null ? `${student.tenthPercentage}%` : 'N/A'}</dd>
                </div>
                {student.studentType === 'REGULAR' ? (
                  <div className="flex justify-between py-1">
                    <dt className="text-slate-500">12th Percentage:</dt>
                    <dd className="font-semibold text-slate-800">
                      {student.twelfthPercentage ? `${student.twelfthPercentage}%` : 'N/A'}
                    </dd>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <dt className="text-slate-500">D2D Diploma CGPA:</dt>
                      <dd className="font-semibold text-slate-800">{student.d2dCgpa ?? 'N/A'}</dd>
                    </div>
                    <div className="flex justify-between py-1">
                      <dt className="text-slate-500">Diploma College:</dt>
                      <dd className="font-semibold text-slate-800">{student.diplomaCollege ?? 'N/A'}</dd>
                    </div>
                  </>
                )}
              </dl>
            </div>

          </div>

          {/* Placement Information */}
          {(() => {
            const selectedApps = applications.filter((a) => a.status === 'SELECTED');
            const currentPlacementApp =
              selectedApps.find((a) => a.isCurrentPlacement) ||
              (selectedApps.length > 0 ? selectedApps[0] : null);
            const previousPlacements = currentPlacementApp
              ? selectedApps.filter((a) => a.id !== currentPlacementApp.id)
              : [];

            if (!currentPlacementApp && previousPlacements.length === 0) {
              return null;
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {currentPlacementApp && (
                  <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50">
                    <h3 className="text-xs font-bold text-emerald-800 uppercase mb-3 flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      Current Placement
                    </h3>
                    <div className="space-y-1">
                      <div className="font-bold text-slate-900">{currentPlacementApp.drive?.company?.name || 'Company'}</div>
                      <div className="text-sm font-semibold text-emerald-700">₹{currentPlacementApp.drive?.ctc || 0} LPA</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="success">SELECTED</Badge>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                          CURRENT PLACEMENT
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                {previousPlacements.length > 0 && (
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                    <h3 className="text-xs font-bold text-slate-700 uppercase mb-3 flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-slate-400" />
                      Previous Placements
                    </h3>
                    <div className="space-y-4">
                      {previousPlacements.map((app) => (
                        <div key={app.id} className="space-y-1 pb-3 border-b border-slate-200 last:border-0 last:pb-0">
                          <div className="font-bold text-slate-700">{app.drive?.company?.name || 'Company'}</div>
                          <div className="text-sm font-semibold text-slate-600">₹{app.drive?.ctc || 0} LPA</div>
                          <div className="mt-1">
                            <span className="text-[10px] font-medium text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded block w-max">
                              REPLACED
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* 10th Marks Detail Grid */}
          <div className="p-4 rounded-xl border border-slate-200">
            <h3 className="text-xs font-bold text-slate-700 uppercase mb-3 flex items-center gap-1.5">
              <Building className="h-4 w-4 text-blue-600" />
              Standard 10th Subject Marks Breakdown
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-[11px] text-slate-500 block">Maths</span>
                <span className="font-bold text-sm text-slate-900 block mt-0.5">{student.tenthMathsMarks ?? '-'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-[11px] text-slate-500 block">Science</span>
                <span className="font-bold text-sm text-slate-900 block mt-0.5">{student.tenthScienceMarks ?? '-'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-[11px] text-slate-500 block">English</span>
                <span className="font-bold text-sm text-slate-900 block mt-0.5">{student.tenthEnglishMarks ?? '-'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-[11px] text-slate-500 block">Social Sci</span>
                <span className="font-bold text-sm text-slate-900 block mt-0.5">{student.tenthSocialScienceMarks ?? '-'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-[11px] text-slate-500 block">Language</span>
                <span className="font-bold text-sm text-slate-900 block mt-0.5">{student.tenthLanguageMarks ?? '-'}</span>
              </div>
            </div>
          </div>

          {/* Resume Section */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
            <h3 className="text-xs font-bold text-slate-700 uppercase mb-3 flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-blue-600" />
              Resume Document
            </h3>
            {student.resumeUrl ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-lg border border-slate-200">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-lg bg-red-100/80 border border-red-200 flex items-center justify-center text-red-600 font-bold text-xs shrink-0">
                    PDF
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">
                      {student.resumeFileName || 'Student_Resume.pdf'}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {student.resumeUploadedAt
                        ? `Uploaded ${formatDate(student.resumeUploadedAt)}`
                        : 'PDF Document'}
                    </p>
                  </div>
                </div>
                <a
                  href={
                    student.resumeUrl.startsWith('http://') || student.resumeUrl.startsWith('https://')
                      ? student.resumeUrl
                      : `${(import.meta.env.VITE_API_URL as string)?.replace(/\/api\/?$/, '') || 'http://localhost:5000'}${student.resumeUrl.startsWith('/') ? '' : '/'}${student.resumeUrl}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold transition-colors shadow-xs shrink-0"
                >
                  <Eye className="h-3.5 w-3.5" />
                  View Resume
                </a>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No resume uploaded by student.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Reject Modal Dialog */}
      {showRejectDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Reject Student Profile</h3>
            <p className="text-xs text-slate-500">
              Provide a clear reason for rejecting this profile. The student will be informed to rectify the discrepancy.
            </p>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. 10th marks mismatch with uploaded marksheet."
              className="w-full text-xs p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRejectDialog(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleReject}
                isLoading={isVerifying}
                className="text-xs"
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
