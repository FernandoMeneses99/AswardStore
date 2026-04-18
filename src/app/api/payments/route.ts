import { NextRequest, NextResponse } from 'next/server';
import { paymentService } from '@/src/infrastructure/payments/payment.service';
import { createPaymentSchema } from '@/src/infrastructure/validators/schemas';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const action = searchParams.get('action');
    const paymentId = searchParams.get('paymentId');
    const orderId = searchParams.get('orderId');
    
    if (action === 'by-id' && paymentId) {
      const payment = await paymentService.getPaymentById(paymentId);
      if (!payment) {
        return NextResponse.json({ success: false, error: 'Pago no encontrado' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: payment });
    }
    
    if (action === 'by-order' && orderId) {
      const payment = await paymentService.getPaymentByOrderId(orderId);
      if (!payment) {
        return NextResponse.json({ success: false, error: 'Pago no encontrado' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: payment });
    }
    
    return NextResponse.json({ success: false, error: 'Parámetros inválidos' }, { status: 400 });
    
  } catch (error: any) {
    console.error('Payments API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;
    
    if (action === 'create-bold') {
      const { orderId, returnUrl } = data;
      const result = await paymentService.createBoldPayment(orderId, returnUrl);
      return NextResponse.json({ success: true, data: result });
    }
    
    if (action === 'create-cod') {
      const { orderId } = data;
      const payment = await paymentService.createCashOnDeliveryPayment(orderId);
      return NextResponse.json({ success: true, data: payment }, { status: 201 });
    }
    
    if (action === 'refund') {
      const { paymentId, amount } = data;
      await paymentService.processRefund(paymentId, amount);
      return NextResponse.json({ success: true, message: 'Reembolso procesado' });
    }
    
    return NextResponse.json({ success: false, error: 'Acción no válida' }, { status: 400 });
    
  } catch (error: any) {
    console.error('Payments POST Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// Webhook endpoint for Bold payments
export async function PUT(request: NextRequest) {
  try {
    const payload = await request.json();
    const eventType = payload.type || payload.event_type;
    
    if (!eventType) {
      return NextResponse.json({ success: false, error: 'Tipo de evento requerido' }, { status: 400 });
    }
    
    await paymentService.handleWebhook(eventType, payload);
    
    return NextResponse.json({ success: true, message: 'Webhook procesado' });
    
  } catch (error: any) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}