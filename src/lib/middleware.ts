import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/src/infrastructure/auth/auth.service';
import { db } from '@/src/infrastructure/database';
import { users, roles, permissions, rolePermissions } from '@/src/infrastructure/database/schema';
import { eq, and } from 'drizzle-orm';

export async function authMiddleware(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
                request.cookies.get('auth-token')?.value;

  if (!token) {
    return { authenticated: false, user: null };
  }

  try {
    const user = await authService.validateSession(token);
    return { authenticated: !!user, user };
  } catch {
    return { authenticated: false, user: null };
  }
}

export async function requireAuth(requiredRoles?: string[]) {
  return async (request: NextRequest) => {
    const { authenticated, user } = await authMiddleware(request);

    if (!authenticated) {
      throw new Error('UNAUTHORIZED');
    }

    if (requiredRoles && requiredRoles.length > 0) {
      const userRole = user?.role?.name;
      if (!userRole || !requiredRoles.includes(userRole)) {
        throw new Error('FORBIDDEN');
      }
    }

    return user;
  };
}

export async function checkPermission(permission: string) {
  return async (request: NextRequest) => {
    const { authenticated, user } = await authMiddleware(request);

    if (!authenticated) {
      throw new Error('UNAUTHORIZED');
    }

    if (!user) {
      throw new Error('FORBIDDEN');
    }

    const userPermissions = await getUserPermissions(user.id);
    
    if (!userPermissions.includes(permission) && user.role?.name !== 'superadmin') {
      throw new Error('FORBIDDEN');
    }

    return user;
  };
}

async function getUserPermissions(userId: string): Promise<string[]> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: {
      role: {
        with: {
          permissions: true,
        },
      },
    },
  });

  if (!user || !user.role) return [];

  return user.role.permissions.map(p => p.name);
}

export async function rateLimitMiddleware(request: NextRequest, limit: number = 100, windowMs: number = 60000) {
  const ip = request.headers.get('x-forwarded-for') || request.ip || 'unknown';
  const key = `rate-limit:${ip}`;
  
  // In production, use Redis for distributed rate limiting
  // For now, use simple in-memory (per-instance)
  const now = Date.now();
  const windowStart = now - windowMs;
  
  // This would be replaced with actual Redis implementation
  return { allowed: true, remaining: limit - 1 };
}

export function withSecurityHeaders(response: NextResponse) {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  return response;
}

export async function csrfMiddleware(request: NextRequest) {
  const method = request.method;
  
  // Skip CSRF for GET, HEAD, OPTIONS
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return true;
  }

  const csrfToken = request.headers.get('x-csrf-token');
  const sessionToken = request.cookies.get('csrf-token')?.value;

  if (!csrfToken || !sessionToken || csrfToken !== sessionToken) {
    return false;
  }

  return true;
}

export function sanitizeInput(input: string): string {
  if (!input) return '';
  
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
}

export function validateRequestBody(body: any, schema: any) {
  try {
    return schema.parse(body);
  } catch (error: any) {
    throw new Error(`Validación fallida: ${error.errors.map((e: any) => e.message).join(', ')}`);
  }
}