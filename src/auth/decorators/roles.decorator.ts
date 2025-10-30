import { SetMetadata } from '@nestjs/common';
import type { UserRole } from 'src/users/types/user-role.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: [UserRole, ...UserRole[]]) =>
  SetMetadata(ROLES_KEY, roles);
