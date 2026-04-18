import { NextRequest, NextResponse } from 'next/server';
import { userService } from '@/src/infrastructure/database/user.service';
import { updateUserSchema, addressSchema } from '@/src/infrastructure/validators/schemas';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const action = searchParams.get('action');
    const userId = searchParams.get('userId');
    const email = searchParams.get('email');
    
    // Get current user (from session/token - would come from auth middleware in production)
    if (action === 'me') {
      // In production, get userId from session
      return NextResponse.json({ success: false, error: 'Autenticación requerida' }, { status: 401 });
    }
    
    // Get user by ID
    if (action === 'by-id' && userId) {
      const user = await userService.getUserById(userId);
      if (!user) {
        return NextResponse.json({ success: false, error: 'Usuario no encontrado' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: user });
    }
    
    // Get user by email
    if (action === 'by-email' && email) {
      const user = await userService.getUserByEmail(email);
      if (!user) {
        return NextResponse.json({ success: false, error: 'Usuario no encontrado' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: user });
    }
    
    // Get user addresses
    if (action === 'addresses' && userId) {
      const addresses = await userService.getUserAddresses(userId);
      return NextResponse.json({ success: true, data: addresses });
    }
    
    // Get users list (admin)
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const roleId = searchParams.get('roleId') || undefined;
    const isActive = searchParams.get('isActive') === 'true' ? true : searchParams.get('isActive') === 'false' ? false : undefined;
    
    const result = await userService.getUsers({ page, pageSize, roleId, isActive });
    return NextResponse.json({ success: true, data: result });
    
  } catch (error: any) {
    console.error('Users API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;
    
    if (action === 'create') {
      const user = await userService.createUser(data);
      return NextResponse.json({ success: true, data: user }, { status: 201 });
    }
    
    if (action === 'add-address') {
      const { userId, address } = data;
      const validated = addressSchema.parse(address);
      const result = await userService.addAddress(userId, validated);
      return NextResponse.json({ success: true, data: result }, { status: 201 });
    }
    
    if (action === 'change-password') {
      const { userId, currentPassword, newPassword } = data;
      await userService.changePassword(userId, currentPassword, newPassword);
      return NextResponse.json({ success: true, message: 'Contraseña actualizada' });
    }
    
    return NextResponse.json({ success: false, error: 'Acción no válida' }, { status: 400 });
    
  } catch (error: any) {
    console.error('Users POST Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;
    
    if (action === 'update') {
      const { userId, ...updates } = data;
      const validated = updateUserSchema.parse(updates);
      const user = await userService.updateUser(userId, validated);
      return NextResponse.json({ success: true, data: user });
    }
    
    if (action === 'update-address') {
      const { addressId, userId, address } = data;
      const validated = addressSchema.partial().parse(address);
      const result = await userService.updateAddress(addressId, userId, validated);
      return NextResponse.json({ success: true, data: result });
    }
    
    if (action === 'toggle-active') {
      const { userId, isActive } = data;
      const user = await userService.updateUser(userId, { isActive });
      return NextResponse.json({ success: true, data: user });
    }
    
    return NextResponse.json({ success: false, error: 'Acción no válida' }, { status: 400 });
    
  } catch (error: any) {
    console.error('Users PUT Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;
    
    if (action === 'delete') {
      await userService.deleteUser(data.userId);
      return NextResponse.json({ success: true, message: 'Usuario eliminado' });
    }
    
    if (action === 'delete-address') {
      await userService.deleteAddress(data.addressId, data.userId);
      return NextResponse.json({ success: true, message: 'Dirección eliminada' });
    }
    
    return NextResponse.json({ success: false, error: 'Acción no válida' }, { status: 400 });
    
  } catch (error: any) {
    console.error('Users DELETE Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}