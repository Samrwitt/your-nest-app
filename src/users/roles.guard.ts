
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from './entities/role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('role', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // No roles are required, access granted
    }

    const { user } = context.switchToHttp().getRequest();

    return requiredRoles.some((role) => this.checkUserRole(user, role));
  }

  private checkUserRole(user: any, requiredRole: Role): boolean {
    if (!user || !user.roles) {
      return false;
    }

    switch (requiredRole) {
      case Role.Admin:
        return user.roles.includes(Role.Admin);
      case Role.User:
        return user.roles.includes(Role.User);
      default:
        return false;
    }
  }
}
