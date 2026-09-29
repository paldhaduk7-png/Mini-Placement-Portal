import { CheckCircle2, Clock, AlertTriangle, ShieldCheck, Lock } from 'lucide-react'
import { Student } from '../../types/student'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { formatDate } from '../../lib/utils'
import { VERIFICATION_STATUS_COLORS } from '../../constants'

export function ProfileCard({ student }: { student: Student }) {
  const isRegular = student.studentType === 'REGULAR'

  return (
    <div className="space-y-6">
      {/* Locked & Verification Banner */}
      {student.isProfileLocked ? (
        <div className="flex items-start gap-3.5 p-4 rounded-xl border border-emerald-200 bg-emerald-50/70 text-emerald-900 shadow-2xs">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-sm text-emerald-900">Profile Submitted & Locked</h4>
              <Badge variant="outline" className="text-[10px] bg-white text-emerald-800 border-emerald-300">
                <Lock className="h-3 w-3 mr-1 inline" /> Read Only
              </Badge>
            </div>
            <p className="text-xs text-emerald-700 mt-1">
              You cannot edit your profile now. It is currently under review and verification by the TPO.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3.5 p-4 rounded-xl border border-amber-200 bg-amber-50/70 text-amber-900 shadow-2xs">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-white">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-sm text-amber-900">Profile Pending Submission</h4>
            <p className="text-xs text-amber-700 mt-1">
              Your profile is not yet locked. Please review your details and submit so the TPO can verify your eligibility.
            </p>
          </div>
        </div>
      )}

      {/* Personal Details */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold text-slate-800">Personal Details</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Verification:</span>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                VERIFICATION_STATUS_COLORS[student.verificationStatus]
              }`}
            >
              {student.verificationStatus === 'VERIFIED' && <CheckCircle2 className="h-3 w-3 mr-1" />}
              {student.verificationStatus === 'PENDING' && <Clock className="h-3 w-3 mr-1" />}
              {student.verificationStatus === 'REJECTED' && <AlertTriangle className="h-3 w-3 mr-1" />}
              {student.verificationStatus}
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-xs text-slate-400 block font-medium">Full Name</span>
            <span className="text-slate-800 font-semibold">{student.fullName}</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Email</span>
            <span className="text-slate-800 font-semibold">{student.user?.email || 'N/A'}</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Phone</span>
            <span className="text-slate-800 font-semibold">{student.phone}</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Date of Birth</span>
            <span className="text-slate-800 font-semibold">{formatDate(student.dob)}</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Department</span>
            <span className="text-slate-800 font-semibold">{student.department}</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Student Type</span>
            <span className="text-slate-800 font-semibold">
              <Badge variant="secondary">{student.studentType}</Badge>
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Academic Details */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-base font-semibold text-slate-800">Academic Details</CardTitle>
        </CardHeader>
        <CardContent className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <span className="text-xs text-slate-500 block font-medium">Current CGPA</span>
            <span className="text-lg font-bold text-blue-700">{student.currentCgpa}</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <span className="text-xs text-slate-500 block font-medium">10th Percentage</span>
            <span className="text-lg font-bold text-slate-800">{student.tenthPercentage}%</span>
          </div>
          {isRegular ? (
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <span className="text-xs text-slate-500 block font-medium">12th Percentage</span>
              <span className="text-lg font-bold text-slate-800">
                {student.twelfthPercentage != null ? `${student.twelfthPercentage}%` : 'N/A'}
              </span>
            </div>
          ) : (
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <span className="text-xs text-slate-500 block font-medium">D2D CGPA</span>
              <span className="text-lg font-bold text-blue-700">{student.d2dCgpa ?? 'N/A'}</span>
            </div>
          )}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <span className="text-xs text-slate-500 block font-medium">Active Backlogs</span>
            <span
              className={`text-lg font-bold ${
                student.activeBacklogs > 0 ? 'text-rose-600' : 'text-emerald-600'
              }`}
            >
              {student.activeBacklogs}
            </span>
          </div>
        </CardContent>

        {/* Std 10 Marks breakdown */}
        <div className="px-6 pb-6 pt-2">
          <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Std 10 Subject Marks Breakdown
          </h5>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
            <div className="p-2 rounded bg-slate-50/80 border border-slate-100">
              <span className="text-slate-500 block">Maths</span>
              <span className="font-semibold text-slate-800">{student.tenthMathsMarks}</span>
            </div>
            <div className="p-2 rounded bg-slate-50/80 border border-slate-100">
              <span className="text-slate-500 block">Science</span>
              <span className="font-semibold text-slate-800">{student.tenthScienceMarks}</span>
            </div>
            <div className="p-2 rounded bg-slate-50/80 border border-slate-100">
              <span className="text-slate-500 block">English</span>
              <span className="font-semibold text-slate-800">{student.tenthEnglishMarks}</span>
            </div>
            <div className="p-2 rounded bg-slate-50/80 border border-slate-100">
              <span className="text-slate-500 block">Social Sci</span>
              <span className="font-semibold text-slate-800">{student.tenthSocialScienceMarks}</span>
            </div>
            <div className="p-2 rounded bg-slate-50/80 border border-slate-100">
              <span className="text-slate-500 block">Total Marks</span>
              <span className="font-semibold text-slate-800">
                {student.tenthTotalMarks} / {student.tenthMaxMarks}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default ProfileCard
