import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const ctx = GqlExecutionContext.create(context);
    const { req } = ctx.getContext();
    const roles = this.reflector.get<string[]>('roles', ctx.getHandler());
    if (roles && req.user && req.user.roles && req.user.roles.length) {
      return matchRoles(roles, req.user.roles);
    }
    return false;
  }
}

export function matchRoles(requiredRoles: string[], userRoles: string[]) {
  return requiredRoles.some(requiredRole =>
    userRoles.some(userRole => requiredRole === userRole),
  );
}
