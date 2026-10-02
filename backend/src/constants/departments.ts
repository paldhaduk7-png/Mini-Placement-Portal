export const VALID_DEPARTMENTS = [
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
] as const;

export type Department = (typeof VALID_DEPARTMENTS)[number];

export const DEFAULT_DEPARTMENT = 'Computer Engineering';
