import { NextRequest, NextResponse } from 'next/server';
import { orderService } from '@/src/infrastructure/database/order.service';
import { createOrderSchema } from '@/src/infrastructure/validators/schemas';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const action = searchParams.get('action');
    const orderId = searchParams.get('orderId');
    const orderNumber = searchParams.get('orderNumber');
    const userId = searchParams.get('userId');
    
    // Get order by ID
    if (action === 'by-id' && orderId) {
      const order = await orderService.getOrderById(orderId);
      if (!order) {
        return NextResponse.json({ success: false, error: 'Orden no encontrada' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: order });
    }
    
    // Get order by number
    if (action === 'by-number' && orderNumber) {
      const order = await orderService.getOrderByNumber(orderNumber);
      if (!order) {
        return NextResponse.json({ success: false, error: 'Orden no encontrada' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: order });
    }
    
    // Get user orders
    if (action === 'user-orders' && userId) {
      const page = parseInt(searchParams.get('page') || '1');
      const pageSize = parseInt(searchParams.get('pageSize') || '10');
      const result = await orderService.getUserOrders(userId, page, pageSize);
      return NextResponse.json({ success: true, data: result });
    }
    
    // Get order stats (for admin dashboard)
    if (action === 'stats') {
      const stats = await orderService.getOrderStats();
      return NextResponse.json({ success: true, data: stats });
    }
    
    // Get orders with filters (admin)
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const status = searchParams.get('status') || undefined;
    const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined;
    const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined;
    
    const result = await orderService.getOrders({ page, pageSize, status, startDate, endDate });
    return NextResponse.json({ success: true, data: result });
    
  } catch (error: any) {
    console.error('Orders API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;
    
    if (action === 'create') {
      const validated = createOrderSchema.parse(data);
      const order = await orderService.createOrder(validated);
      return NextResponse.json({ success: true, data: order }, { status: 201 });
    }
    
    return NextResponse.json({ success: false, error: 'Acción no válida' }, { status: 400 });
    
  } catch (error: any) {
    console.error('Orders POST Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;
    
    if (action === 'update-status') {
      const { orderId, status, notes } = data;
      const order = await orderService.updateOrderStatus(orderId, status, notes);
      return NextResponse.json({ success: true, data: order });
    }
    
    return NextResponse.json({ success: false, error: 'Acción no válida' }, { status: 400 });
    
  } catch (error: any) {
    console.error('Orders PUT Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}