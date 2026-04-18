import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/src/infrastructure/auth/auth.service';
import { registerSchema, loginSchema } from '@/src/infrastructure/validators/schemas';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      const body = await request.json();
      const { action } = body;
      
      if (action === 'register') {
        const validated = registerSchema.parse(body);
        const result = await authService.register(
          validated.email,
          validated.password,
          validated.name,
          validated.phone
        );
        
        return NextResponse.json({
          success: true,
          data: result,
          message: 'Usuario registrado correctamente'
        }, { status: 201 });
      }
      
      if (action === 'login') {
        const validated = loginSchema.parse(body);
        const ip = request.headers.get('x-forwarded-for') || undefined;
        const userAgent = request.headers.get('user-agent') || undefined;
        
        const result = await authService.login(
          validated.email,
          validated.password,
          ip,
          userAgent
        );
        
        return NextResponse.json({
          success: true,
          data: result
        });
      }
      
      if (action === 'refresh') {
        const { refreshToken } = body;
        if (!refreshToken) {
          return NextResponse.json({
            success: false,
            error: 'Token de刷新 requerido'
          }, { status: 400 });
        }
        
        const result = await authService.refreshToken(refreshToken);
        
        return NextResponse.json({
          success: true,
          data: result
        });
      }
      
      if (action === 'verify-mfa') {
        const { userId, code } = body;
        const result = await authService.verifyMfa(userId, code);
        
        return NextResponse.json({
          success: true,
          data: result
        });
      }
    }
    
    return NextResponse.json({
      success: false,
      error: 'Acción no válida'
    }, { status: 400 });
    
  } catch (error: any) {
    console.error('Auth API Error:', error);
    
    const statusCode = error.message.includes('inválidas') || 
                       error.message.includes('no existe') ||
                       error.message.includes('bloqueada') ? 401 : 400;
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Error en el servidor'
    }, { status: statusCode });
  }
}