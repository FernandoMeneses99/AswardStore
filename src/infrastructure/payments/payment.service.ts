import { db } from '../database';
import { payments, paymentWebhooks, orders } from '../database/schema';
import { eq, and } from 'drizzle-orm';
import type { PaymentMethod, PaymentStatus } from '../../types';

interface BoldPaymentRequest {
  order_id: string;
  amount: number;
  currency: string;
  payment_method: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  return_url: string;
  webhook_url: string;
}

interface BoldPaymentResponse {
  id: string;
  status: string;
  amount: number;
  checkout_url: string;
}

export class PaymentService {
  private boldApiKey: string;
  private boldApiUrl: string;

  constructor() {
    this.boldApiKey = process.env.BOLD_API_KEY || '';
    this.boldApiUrl = process.env.BOLD_API_URL || 'https://api.boldcheckout.com';
  }

  async createBoldPayment(orderId: string, returnUrl: string): Promise<BoldPaymentResponse> {
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
    });

    if (!order) {
      throw new Error('Orden no encontrada');
    }

    const [payment] = await db.insert(payments).values({
      orderId,
      method: 'bold',
      status: 'pending',
      amount: order.totalAmount,
      currency: order.currency,
    }).returning();

    const boldRequest: BoldPaymentRequest = {
      order_id: payment.id,
      amount: Number(order.totalAmount) * 100,
      currency: order.currency,
      payment_method: 'card',
      customer: {
        name: order.customerName || 'Cliente',
        email: order.customerEmail || '',
        phone: order.customerPhone || '',
      },
      return_url: returnUrl,
      webhook_url: process.env.BOLD_WEBHOOK_URL || '',
    };

    try {
      const response = await fetch(`${this.boldApiUrl}/v1/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.boldApiKey}`,
        },
        body: JSON.stringify(boldRequest),
      });

      if (!response.ok) {
        throw new Error(`Bold API error: ${response.statusText}`);
      }

      const data = await response.json();

      await db.update(payments)
        .set({ externalId: data.id })
        .where(eq(payments.id, payment.id));

      return data;
    } catch (error) {
      await db.update(payments)
        .set({ status: 'failed' })
        .where(eq(payments.id, payment.id));
      throw error;
    }
  }

  async handleWebhook(eventType: string, payload: any) {
    const [webhook] = await db.insert(paymentWebhooks).values({
      eventType,
      payload: JSON.stringify(payload),
      processed: false,
    }).returning();

    switch (eventType) {
      case 'payment.approved':
        await this.handlePaymentApproved(payload);
        break;
      case 'payment.declined':
        await this.handlePaymentDeclined(payload);
        break;
      case 'payment.cancelled':
        await this.handlePaymentCancelled(payload);
        break;
      case 'payment.refunded':
        await this.handlePaymentRefunded(payload);
        break;
    }

    await db.update(paymentWebhooks)
      .set({ processed: true })
      .where(eq(paymentWebhooks.id, webhook.id));
  }

  private async handlePaymentApproved(payload: any) {
    const payment = await db.query.payments.findFirst({
      where: eq(payments.externalId, payload.payment_id),
      with: {
        order: true,
      },
    });

    if (payment) {
      await db.update(payments)
        .set({ 
          status: 'completed',
          externalStatus: 'approved',
          paidAt: new Date(),
        })
        .where(eq(payments.id, payment.id));

      await db.update(orders)
        .set({ status: 'confirmed' })
        .where(eq(orders.id, payment.orderId));
    }
  }

  private async handlePaymentDeclined(payload: any) {
    const payment = await db.query.payments.findFirst({
      where: eq(payments.externalId, payload.payment_id),
    });

    if (payment) {
      await db.update(payments)
        .set({ 
          status: 'failed',
          externalStatus: 'declined',
        })
        .where(eq(payments.id, payment.id));

      await db.update(orders)
        .set({ status: 'cancelled' })
        .where(eq(orders.id, payment.orderId));
    }
  }

  private async handlePaymentCancelled(payload: any) {
    const payment = await db.query.payments.findFirst({
      where: eq(payments.externalId, payload.payment_id),
    });

    if (payment) {
      await db.update(payments)
        .set({ status: 'failed' })
        .where(eq(payments.id, payment.id));
    }
  }

  private async handlePaymentRefunded(payload: any) {
    const payment = await db.query.payments.findFirst({
      where: eq(payments.externalId, payload.payment_id),
    });

    if (payment) {
      await db.update(payments)
        .set({ status: 'refunded' })
        .where(eq(payments.id, payment.id));

      await db.update(orders)
        .set({ status: 'refunded' })
        .where(eq(orders.id, payment.orderId));
    }
  }

  async createCashOnDeliveryPayment(orderId: string) {
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
    });

    if (!order) {
      throw new Error('Orden no encontrada');
    }

    const [payment] = await db.insert(payments).values({
      orderId,
      method: 'cash_on_delivery',
      status: 'pending',
      amount: order.totalAmount,
      currency: order.currency,
    }).returning();

    return payment;
  }

  async getPaymentById(paymentId: string) {
    return db.query.payments.findFirst({
      where: eq(payments.id, paymentId),
      with: {
        order: true,
      },
    });
  }

  async getPaymentByOrderId(orderId: string) {
    return db.query.payments.findFirst({
      where: eq(payments.orderId, orderId),
    });
  }

  async processRefund(paymentId: string, amount?: number) {
    const payment = await db.query.payments.findFirst({
      where: eq(payments.id, paymentId),
    });

    if (!payment || payment.status !== 'completed') {
      throw new Error('Pago no válido para reembolso');
    }

    if (payment.method === 'bold' && payment.externalId) {
      // Call Bold API for refund
      const response = await fetch(`${this.boldApiUrl}/v1/payments/${payment.externalId}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.boldApiKey}`,
        },
        body: JSON.stringify({ amount: (amount || Number(payment.amount)) * 100 }),
      });

      if (!response.ok) {
        throw new Error('Error al procesar reembolso en Bold');
      }
    }

    await db.update(payments)
      .set({ status: 'refunded' })
      .where(eq(payments.id, paymentId));

    const order = await db.query.orders.findFirst({
      where: eq(orders.id, payment.orderId),
    });

    if (order) {
      await db.update(orders)
        .set({ status: 'refunded' })
        .where(eq(orders.id, order.id));
    }
  }
}

export const paymentService = new PaymentService();