import { db } from '../database';
import { 
  orders, 
  orderItems, 
  orderStatusHistory,
  productVariants,
  warehouseStock,
  addresses,
  coupons,
  couponUsage,
  payments,
} from '../database/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'crypto';

export class OrderService {
  async createOrder(data: {
    userId?: string;
    items: { variantId: string; quantity: number }[];
    shippingAddressId?: string;
    billingAddressId?: string;
    couponCode?: string;
    notes?: string;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
  }) {
    return db.transaction(async (tx) => {
      // Get variant details and calculate totals
      let subtotal = 0;
      const orderItemsData = [];
      
      for (const item of data.items) {
        const [variant] = await tx.select()
          .from(productVariants)
          .where(eq(productVariants.id, item.variantId));
        
        if (!variant || !variant.isActive) {
          throw new Error(`Variante ${item.variantId} no disponible`);
        }
        
        const itemTotal = Number(variant.price || 0) * item.quantity;
        subtotal += itemTotal;
        
        orderItemsData.push({
          variantId: item.variantId,
          productName: '', // Will be populated from product
          variantName: variant.name,
          sku: variant.sku,
          quantity: item.quantity,
          unitPrice: variant.price || 0,
          totalPrice: itemTotal,
        });
      }
      
      // Validate stock
      for (const item of data.items) {
        const [stock] = await tx.select()
          .from(warehouseStock)
          .where(eq(warehouseStock.variantId, item.variantId));
        
        if (!stock || stock.quantity - stock.reservedQuantity < item.quantity) {
          throw new Error('Stock insuficiente para uno o más productos');
        }
      }
      
      // Apply coupon if provided
      let discountAmount = 0;
      if (data.couponCode) {
        const [coupon] = await tx.select()
          .from(coupons)
          .where(and(
            eq(coupons.code, data.couponCode),
            eq(coupons.isActive, true)
          ));
        
        if (coupon) {
          if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
            throw new Error('Cupón agotado');
          }
          
          if (coupon.validUntil && new Date(coupon.validUntil) < new Date()) {
            throw new Error('Cupón expirado');
          }
          
          if (coupon.minOrderAmount && subtotal < Number(coupon.minOrderAmount)) {
            throw new Error(`Monto mínimo de $${coupon.minOrderAmount} para usar este cupón`);
          }
          
          discountAmount = coupon.discountType === 'percentage'
            ? subtotal * (Number(coupon.discountValue) / 100)
            : Number(coupon.discountValue);
        }
      }
      
      // Calculate totals
      const taxAmount = subtotal * 0.19; // 19% VAT
      const shippingAmount = subtotal > 150000 ? 0 : 15000; // Free shipping over 150k
      const totalAmount = subtotal + taxAmount + shippingAmount - discountAmount;
      
      // Create order
      const [order] = await tx.insert(orders).values({
        userId: data.userId || null,
        status: 'pending',
        subtotal,
        taxAmount,
        shippingAmount,
        discountAmount,
        totalAmount,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        shippingAddressId: data.shippingAddressId,
        billingAddressId: data.billingAddressId,
        notes: data.notes,
      }).returning();
      
      // Update product names in order items
      for (let i = 0; i < orderItemsData.length; i++) {
        const [variant] = await tx.select()
          .from(productVariants)
          .where(eq(productVariants.id, orderItemsData[i].variantId));
        
        // Get product name - would need to join with products table
        orderItemsData[i].productName = `Producto ${i + 1}`;
      }
      
      // Create order items
      await tx.insert(orderItems).values(
        orderItemsData.map(item => ({
          orderId: order.id,
          ...item,
        }))
      );
      
      // Reserve stock
      for (const item of data.items) {
        const [stock] = await tx.select()
          .from(warehouseStock)
          .where(eq(warehouseStock.variantId, item.variantId));
        
        if (stock) {
          await tx.update(warehouseStock)
            .set({ reservedQuantity: stock.reservedQuantity + item.quantity })
            .where(eq(warehouseStock.variantId, item.variantId));
        }
      }
      
      // Update coupon usage
      if (data.couponCode) {
        await tx.update(coupons)
          .set({ usedCount: sql`used_count + 1` })
          .where(eq(coupons.code, data.couponCode));
      }
      
      // Create initial status history
      await tx.insert(orderStatusHistory).values({
        orderId: order.id,
        status: 'pending',
        notes: 'Orden creada',
      });
      
      return {
        ...order,
        items: orderItemsData,
      };
    });
  }

  async getOrderById(orderId: string) {
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: {
        items: true,
        payments: true,
      },
    });
    
    return order;
  }

  async getOrderByNumber(orderNumber: string) {
    const order = await db.query.orders.findFirst({
      where: eq(orders.orderNumber, orderNumber),
      with: {
        items: true,
        payments: true,
      },
    });
    
    return order;
  }

  async getUserOrders(userId: string, page: number = 1, pageSize: number = 10) {
    const [ordersList, total] = await Promise.all([
      db.select()
        .from(orders)
        .where(eq(orders.userId, userId))
        .orderBy(desc(orders.createdAt))
        .limit(pageSize)
        .offset((page - 1) * pageSize),
      db.select({ count: sql<number>`count(*)::int` })
        .from(orders)
        .where(eq(orders.userId, userId)),
    ]);
    
    return {
      data: ordersList,
      total: total[0]?.count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((total[0]?.count || 0) / pageSize),
    };
  }

  async updateOrderStatus(orderId: string, status: string, notes?: string, performedBy?: string) {
    const [order] = await db.update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, orderId))
      .returning();
    
    if (!order) {
      throw new Error('Orden no encontrada');
    }
    
    await db.insert(orderStatusHistory).values({
      orderId,
      status,
      notes,
      createdBy: performedBy || null,
    });
    
    // Release stock if cancelled
    if (status === 'cancelled') {
      const items = await db.select()
        .from(orderItems)
        .where(eq(orderItems.orderId, orderId));
      
      for (const item of items) {
        const [stock] = await db.select()
          .from(warehouseStock)
          .where(eq(warehouseStock.variantId, item.variantId));
        
        if (stock) {
          await db.update(warehouseStock)
            .set({ 
              quantity: stock.quantity + item.quantity,
              reservedQuantity: Math.max(0, stock.reservedQuantity - item.quantity),
            })
            .where(eq(warehouseStock.variantId, item.variantId));
        }
      }
    }
    
    return order;
  }

  async getOrders(filters: {
    status?: string;
    page?: number;
    pageSize?: number;
    startDate?: Date;
    endDate?: Date;
  }) {
    const { status, page = 1, pageSize = 20, startDate, endDate } = filters;
    
    const conditions = [];
    if (status) conditions.push(eq(orders.status, status));
    if (startDate) conditions.push(sql`${orders.createdAt} >= ${startDate}`);
    if (endDate) conditions.push(sql`${orders.createdAt} <= ${endDate}`);
    
    const [ordersList, total] = await Promise.all([
      db.select()
        .from(orders)
        .where(conditions.length ? and(...conditions) : undefined)
        .orderBy(desc(orders.createdAt))
        .limit(pageSize)
        .offset((page - 1) * pageSize),
      db.select({ count: sql<number>`count(*)::int` })
        .from(orders)
        .where(conditions.length ? and(...conditions) : undefined),
    ]);
    
    return {
      data: ordersList,
      total: total[0]?.count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((total[0]?.count || 0) / pageSize),
    };
  }

  async getOrderStats() {
    const [totalOrders, totalRevenue, ordersByStatus, recentOrders] = await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(orders),
      db.select({ total: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)` }).from(orders),
      db.select({ status: orders.status, count: sql<number>`count(*)::int` })
        .from(orders)
        .groupBy(orders.status),
      db.select()
        .from(orders)
        .orderBy(desc(orders.createdAt))
        .limit(5),
    ]);
    
    return {
      totalOrders: totalOrders[0]?.count || 0,
      totalRevenue: Number(totalOrders[0]?.total || 0),
      ordersByStatus,
      recentOrders,
    };
  }
}

export const orderService = new OrderService();