import type { Role } from './api-client';

export function canWrite(role: Role) {
  return role === 'admin' || role === 'recruiter';
}

export function canDelete(role: Role) {
  return role === 'admin';
}
