import { Link } from 'react-router-dom'
import { Eye } from 'lucide-react'
import { Student } from '../../types/student'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { VERIFICATION_STATUS_COLORS } from '../../constants'

export function StudentTable({ students }: { students: Student[] }) {
  return (
    <div className="rounded-xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead>Student Name</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>CGPA</TableHead>
            <TableHead>10th %</TableHead>
            <TableHead>12th / D2D</TableHead>
            <TableHead>Backlogs</TableHead>
            <TableHead>Profile</TableHead>
            <TableHead>Verification</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student, index) => (
            <TableRow key={student.id}>
              <TableCell className="font-medium text-slate-400 text-xs">{index + 1}</TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold overflow-hidden shrink-0">
                    {student.profilePhoto ? (
                      <img src={student.profilePhoto} alt="" className="h-full w-full object-cover" />
                    ) : (
                      student.fullName?.charAt(0) || 'S'
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 text-sm">{student.fullName || 'Not Provided'}</div>
                    <div className="text-xs text-slate-400">{student.user?.email || student.phone}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-xs font-medium text-slate-700">
                {student.department || <span className="text-slate-400 italic">N/A</span>}
              </TableCell>
              <TableCell>
                {student.studentType ? (
                  <Badge variant="secondary" className="text-[10px]">
                    {student.studentType}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] text-slate-400">N/A</Badge>
                )}
              </TableCell>
              <TableCell className="font-bold text-blue-700 text-sm">
                {student.currentCgpa != null ? student.currentCgpa : '-'}
              </TableCell>
              <TableCell className="text-xs font-medium text-slate-700">
                {student.tenthPercentage != null ? `${student.tenthPercentage}%` : '-'}
              </TableCell>
              <TableCell className="text-xs font-medium text-slate-700">
                {!student.profileCompleted
                  ? '-'
                  : student.studentType === 'REGULAR'
                  ? student.twelfthPercentage != null
                    ? `${student.twelfthPercentage}%`
                    : 'N/A'
                  : student.d2dCgpa != null
                  ? `${student.d2dCgpa} (D2D)`
                  : 'N/A'}
              </TableCell>
              <TableCell>
                <span
                  className={`text-xs font-bold ${
                    student.activeBacklogs != null && student.activeBacklogs > 0
                      ? 'text-rose-600'
                      : student.activeBacklogs === 0 ? 'text-emerald-600' : 'text-slate-400'
                  }`}
                >
                  {student.activeBacklogs != null ? student.activeBacklogs : '-'}
                </span>
              </TableCell>
              <TableCell>
                {student.profileCompleted ? (
                  student.isProfileLocked ? (
                    <Badge variant="outline" className="text-[10px] border-emerald-200 text-emerald-700 bg-emerald-50">Locked</Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] border-blue-200 text-blue-700 bg-blue-50">Submitted</Badge>
                  )
                ) : (
                  <Badge variant="outline" className="text-[10px] border-slate-200 text-slate-600 bg-slate-50">Not Completed</Badge>
                )}
              </TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                    VERIFICATION_STATUS_COLORS[student.verificationStatus]
                  }`}
                >
                  {student.verificationStatus}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <Link to={`/tpo/students/${student.id}`}>
                  <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
                    <Eye className="h-3.5 w-3.5" />
                    <span>Review</span>
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default StudentTable
