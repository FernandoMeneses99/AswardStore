import { db } from '../database';
import { users, roles, addresses, auditLogs } from '../database/schema';
import { eq, and } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'crypto';

export class UserService {
  async getUsers(filters: { page?: number; pageSize?: number; roleId?: string; isActive?: boolean }) {
    const { page = 1, pageSize = 20, roleId, isActive } = filters;
    
    const conditions = [];
    if (roleId) conditions.push(eq(users.roleId, roleId));
    if (isActive !== undefined) conditions.push(eq(users.isActive, isActive));
    
    const [usersList, total] = await Promise.all([
      db.select({
        id: users.id,
        email: users.email,
        name: users.name,
        phone: users.phone,
        avatarUrl: users.avatarUrl,
        isActive: users.isActive,
        roleId: users.roleId,
        createdAt: users.createdAt,
        lastLoginAt: users.lastLoginAt,
      })
        .from(users)
        .where(conditions.length ? and(...conditions) : undefined)
        .orderBy(users.createdAt)
        .limit(pageSize)
        .offset((page - 1) * pageSize),
      db.select({ count: sql`count(*)::int` })
        .from(users)
        .where(conditions.length ? and(...conditions) : undefined),
    ]);
    
    return {
      data: usersList,
      total: total[0]?.count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((total[0]?.count || 0) / pageSize),
    };
  }

  async getUserById(userId: string) {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      with: {
        role: true,
        addresses: true,
      },
    });
    
    if (!user) return null;
    
    const { passwordHash, mfaSecret, ...safeUser } = user;
    return safeUser;
  }

  async getUserByEmail(email: string) {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
      with: {
        role: true,
      },
    });
    
    return user;
  }

  async createUser(data: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    roleId?: string;
  }) {
    const existingUser = await this.getUserByEmail(data.email);
    if (existingUser) {
      throw new Error('El email ya está en uso');
    }
    
    const passwordHash = await bcrypt.hash(data.password, 12);
    
    const defaultRole = await db.query.roles.findFirst({
      where: eq(roles.name, 'cliente'),
    });
    
    const [user] = await db.insert(users).values({
      email: data.email,
      passwordHash,
      name: data.name,
      phone: data.phone,
      roleId: data.roleId || defaultRole!.id,
      isActive: true,
    }).returning();
    
    return this.sanitizeUser(user);
  }

  async updateUser(userId: string, data: {
    name?: string;
    phone?: string;
    avatarUrl?: string;
    roleId?: string;
    isActive?: boolean;
    mfaEnabled?: boolean;
  }) {
    const [user] = await db.update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    
    if (!user) throw new Error('Usuario no encontrado');
    
    return this.sanitizeUser(user);
  }

  async deleteUser(userId: string) {
    await db.update(users)
      .set({ isActive: false })
      .where(eq(users.id, userId));
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });
    
    if (!user || !user.passwordHash) {
      throw new Error('Usuario no válido');
    }
    
    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      throw new Error('Contraseña actual incorrecta');
    }
    
    const newPasswordHash = await bcrypt.hash(newPassword, 12);
    
    await db.update(users)
      .set({ 
        passwordHash: newPasswordHash,
        passwordChangedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
    
    return { success: true };
  }

  async addAddress(userId: string, addressData: any) {
    if (addressData.isDefault) {
      await db.update(addresses)
        .set({ isDefault: false })
        .where(eq(addresses.userId, userId));
    }
    
    const [address] = await db.insert(addresses).values({
      userId,
      ...addressData,
    }).returning();
    
    return address;
  }

  async updateAddress(addressId: string, userId: string, data: any) {
    if (data.isDefault) {
      await db.update(addresses)
        .set({ isDefault: false })
        .where(and(eq(addresses.userId, userId), eq(addresses.isDefault, true)));
    }
    
    const [address] = await db.update(addresses)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(addresses.id, addressId), eq(addresses.userId, userId)))
      .returning();
    
    return address;
  }

  async deleteAddress(addressId: string, userId: string) {
    await db.delete(addresses)
      .where(and(eq(addresses.id, addressId), eq(addresses.userId, userId)));
  }

  async getUserAddresses(userId: string) {
    return db.select()
      .from(addresses)
      .where(eq(addresses.userId, userId));
  }

  async logAction(userId: string, action: string, entityType?: string, entityId?: string, oldValues?: any, newValues?: any, ipAddress?: string) {
    await db.insert(auditLogs).values({
      userId,
      action,
      entityType,
      entityId,
      oldValues: oldValues ? JSON.stringify(oldValues) : null,
      newValues: newValues ? JSON.stringify(newValues) : null,
      ipAddress: ipAddress || null,
    });
  }

  async getUserPermissions(userId: string) {
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

  private sanitizeUser(user: any) {
    const { passwordHash, mfaSecret, failedLoginAttempts, lockedUntil, ...sanitized } = user;
    return sanitized;
  }
}

export const userService = new UserService();

import { sql } from 'drizzle-orm';