export const VALID_DEPARTMENTS = [
  'Computer Engineering',
  'Information Technology',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
  'Electronics & Communication',
] as const;

export type Department = (typeof VALID_DEPARTMENTS)[number];

export const DEFAULT_DEPARTMENT = 'Computer Engineering';
