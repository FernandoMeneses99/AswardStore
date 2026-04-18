import { db } from '../database';
import { users, roles, sessions, refreshTokens } from '../database/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'crypto';

export class AuthService {
  async register(email: string, password: string, name: string, phone?: string) {
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      throw new Error('El usuario ya existe');
    }

    const passwordHash = await bcrypt.hash(password, 12);
    
    const [user] = await db.insert(users).values({
      email,
      passwordHash,
      name,
      phone,
      roleId: (await this.getDefaultRole()).id,
      isActive: true,
    }).returning();

    return this.sanitizeUser(user);
  }

  async login(email: string, password: string, ip?: string, userAgent?: string) {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
      with: {
        role: true,
      },
    });

    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    if (!user.isActive) {
      throw new Error('Cuenta desactivada');
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new Error(`Cuenta bloqueada hasta ${user.lockedUntil.toLocaleString()}`);
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash || '');

    if (!isValidPassword) {
      await this.recordFailedLogin(user.id);
      throw new Error('Credenciales inválidas');
    }

    if (user.mfaEnabled) {
      return { requiresMfa: true, userId: user.id };
    }

    await this.recordSuccessfulLogin(user.id);
    return this.createSession(user, ip, userAgent);
  }

  async verifyMfa(userId: string, code: string) {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user || !user.mfaSecret) {
      throw new Error('Usuario no válido');
    }

    // Implement TOTP verification here
    const isValid = this.verifyTotp(user.mfaSecret, code);
    
    if (!isValid) {
      throw new Error('Código inválido');
    }

    await this.recordSuccessfulLogin(userId);
    return this.createSession(user, undefined, undefined);
  }

  async logout(sessionId: string) {
    await db.delete(sessions).where(eq(sessions.id, sessionId));
  }

  async refreshToken(token: string) {
    const tokenHash = this.hashToken(token);
    
    const refreshToken = await db.query.refreshTokens.findFirst({
      where: eq(refreshTokens.tokenHash, tokenHash),
      with: {
        user: true,
      },
    });

    if (!refreshToken || refreshToken.revoked || refreshToken.expiresAt < new Date()) {
      throw new Error('Token inválido');
    }

    const newAccessToken = this.generateAccessToken(refreshToken.user);
    const newRefreshToken = this.generateRefreshToken();

    await db.update(refreshTokens)
      .set({ revoked: true })
      .where(eq(refreshTokens.id, refreshToken.id));

    await db.insert(refreshTokens).values({
      userId: refreshToken.userId,
      tokenHash: this.hashToken(newRefreshToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async validateSession(token: string) {
    const tokenHash = this.hashToken(token);
    
    const session = await db.query.sessions.findFirst({
      where: eq(sessions.tokenHash, tokenHash),
      with: {
        user: {
          with: {
            role: true,
          },
        },
      },
    });

    if (!session || session.expiresAt < new Date()) {
      return null;
    }

    return this.sanitizeUser(session.user);
  }

  private async getDefaultRole() {
    const role = await db.query.roles.findFirst({
      where: eq(roles.name, 'cliente'),
    });
    return role!;
  }

  private async recordFailedLogin(userId: string) {
    await db.update(users)
      .set({
        failedLoginAttempts: (users.failedLoginAttempts || 0) + 1,
        lockedUntil: undefined,
      })
      .where(eq(users.id, userId));

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (user && user.failedLoginAttempts >= 5) {
      const lockDuration = 15 * 60 * 1000;
      await db.update(users)
        .set({
          lockedUntil: new Date(Date.now() + lockDuration),
        })
        .where(eq(users.id, userId));
    }
  }

  private async recordSuccessfulLogin(userId: string) {
    await db.update(users)
      .set({
        failedLoginAttempts: 0,
        lockedUntil: undefined,
        lastLoginAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  private async createSession(user: any, ip?: string, userAgent?: string) {
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const [session] = await db.insert(sessions).values({
      userId: user.id,
      tokenHash: this.hashToken(accessToken),
      ipAddress: ip,
      userAgent,
      expiresAt,
    }).returning();

    await db.insert(refreshTokens).values({
      userId: user.id,
      tokenHash: this.hashToken(refreshToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken,
      expiresAt: session.expiresAt,
    };
  }

  private generateAccessToken(user: any): string {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role?.name,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor((Date.now() + 24 * 60 * 60 * 1000) / 1000),
    };
    return Buffer.from(JSON.stringify(payload)).toString('base64');
  }

  private generateRefreshToken(): string {
    return require('crypto').randomBytes(64).toString('hex');
  }

  private hashToken(token: string): string {
    return require('crypto').createHash('sha256').update(token).digest('hex');
  }

  private verifyTotp(secret: string, code: string): boolean {
    // Implement TOTP verification
    return true;
  }

  private sanitizeUser(user: any) {
    const { passwordHash, mfaSecret, failedLoginAttempts, lockedUntil, ...sanitized } = user;
    return sanitized;
  }
}

export const authService = new AuthService();