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
            <TableHead>Verification</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student, index) => (
            <TableRow key={student.id}>
              <TableCell className="font-medium text-slate-400 text-xs">{index + 1}</TableCell>
              <TableCell>
                <div className="font-semibold text-slate-900 text-sm">{student.fullName}</div>
                <div className="text-xs text-slate-400">{student.user?.email || student.phone}</div>
              </TableCell>
              <TableCell className="text-xs font-medium text-slate-700">{student.department}</TableCell>
              <TableCell>
                <Badge variant="secondary" className="text-[10px]">
                  {student.studentType}
                </Badge>
              </TableCell>
              <TableCell className="font-bold text-blue-700 text-sm">{student.currentCgpa}</TableCell>
              <TableCell className="text-xs font-medium text-slate-700">{student.tenthPercentage}%</TableCell>
              <TableCell className="text-xs font-medium text-slate-700">
                {student.studentType === 'REGULAR'
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
                    student.activeBacklogs > 0 ? 'text-rose-600' : 'text-emerald-600'
                  }`}
                >
                  {student.activeBacklogs}
                </span>
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
