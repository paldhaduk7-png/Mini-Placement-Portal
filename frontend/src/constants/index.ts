export const DEPARTMENTS = [
  'Artificial Intelligence and Machine Learning',
  'Automobile Engineering',
  'Biomedical Engineering',
  'Chemical Engineering',
  'Civil Engineering',
  'Computer Engineering',
  'Electrical Engineering',
  'Electronics & Communication Engineering',
  'Environment Engineering',
  'Information Technology',
  'Instrumentation & Control Engineering',
  'Mechanical Engineering',
  'Plastic Technology',
  'Robotics and Automation',
  'Rubber Technology',
  'Textile Technology',
]

export const STUDENT_TYPES = [
  { label: 'Regular Student', value: 'REGULAR' },
  { label: 'D2D (Diploma to Degree)', value: 'D2D' },
]

export const APPLICATION_STATUS_COLORS: Record<string, string> = {
  APPLIED: 'bg-blue-50 text-blue-700 border-blue-200',
  SHORTLISTED: 'bg-purple-50 text-purple-700 border-purple-200',
  INTERVIEW: 'bg-amber-50 text-amber-700 border-amber-200',
  SELECTED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  REJECTED: 'bg-rose-50 text-rose-700 border-rose-200',
}

export const VERIFICATION_STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  VERIFIED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  REJECTED: 'bg-rose-50 text-rose-700 border-rose-200',
}
