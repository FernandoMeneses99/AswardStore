import { db } from '../database';
import { 
  warehouseStock, 
  stockMovements, 
  warehouses, 
  productVariants,
} from '../database/schema';
import { eq, and, sql } from 'drizzle-orm';
import type { MovementType } from '../../types';

export class InventoryService {
  async getStockByWarehouse(warehouseId: string) {
    return db.select()
      .from(warehouseStock)
      .where(eq(warehouseStock.warehouseId, warehouseId));
  }

  async getStockByVariant(variantId: string) {
    const stock = await db.select()
      .from(warehouseStock)
      .where(eq(warehouseStock.variantId, variantId));

    const totalQuantity = stock.reduce((sum, s) => sum + s.quantity, 0);
    const totalReserved = stock.reduce((sum, s) => sum + s.reservedQuantity, 0);

    return {
      warehouses: stock,
      totalQuantity,
      availableQuantity: totalQuantity - totalReserved,
      reservedQuantity: totalReserved,
    };
  }

  async adjustStock(
    variantId: string,
    warehouseId: string,
    quantity: number,
    movementType: MovementType,
    notes?: string,
    performedBy?: string
  ) {
    return db.transaction(async (tx) => {
      const [movement] = await tx.insert(stockMovements).values({
        variantId,
        warehouseId,
        movementType,
        quantity,
        notes,
        performedBy: performedBy || null,
      }).returning();

      const [currentStock] = await tx.select()
        .from(warehouseStock)
        .where(and(
          eq(warehouseStock.variantId, variantId),
          eq(warehouseStock.warehouseId, warehouseId)
        ));

      if (currentStock) {
        await tx.update(warehouseStock)
          .set({
            quantity: currentStock.quantity + quantity,
            updatedAt: new Date(),
          })
          .where(and(
            eq(warehouseStock.variantId, variantId),
            eq(warehouseStock.warehouseId, warehouseId)
          ));
      } else {
        await tx.insert(warehouseStock).values({
          variantId,
          warehouseId,
          quantity,
        });
      }

      await tx.update(productVariants)
        .set({ 
          inventoryQuantity: sql`(
            SELECT COALESCE(SUM(quantity - reserved_quantity), 0)
            FROM warehouse_stock
            WHERE variant_id = ${variantId}
          )`,
        })
        .where(eq(productVariants.id, variantId));

      return movement;
    });
  }

  async transferStock(
    variantId: string,
    fromWarehouseId: string,
    toWarehouseId: string,
    quantity: number,
    notes?: string,
    performedBy?: string
  ) {
    return db.transaction(async (tx) => {
      await tx.insert(stockMovements).values({
        variantId,
        warehouseId: fromWarehouseId,
        movementType: 'transfer',
        quantity: -quantity,
        notes: `Transfer to ${toWarehouseId}. ${notes || ''}`,
        performedBy: performedBy || null,
      });

      await tx.insert(stockMovements).values({
        variantId,
        warehouseId: toWarehouseId,
        movementType: 'transfer',
        quantity: quantity,
        notes: `Transfer from ${fromWarehouseId}. ${notes || ''}`,
        performedBy: performedBy || null,
      });

      const [fromStock] = await tx.select()
        .from(warehouseStock)
        .where(and(
          eq(warehouseStock.variantId, variantId),
          eq(warehouseStock.warehouseId, fromWarehouseId)
        ));

      if (fromStock && fromStock.quantity >= quantity) {
        await tx.update(warehouseStock)
          .set({ quantity: fromStock.quantity - quantity })
          .where(and(
            eq(warehouseStock.variantId, variantId),
            eq(warehouseStock.warehouseId, fromWarehouseId)
          ));

        const [toStock] = await tx.select()
          .from(warehouseStock)
          .where(and(
            eq(warehouseStock.variantId, variantId),
            eq(warehouseStock.warehouseId, toWarehouseId)
          ));

        if (toStock) {
          await tx.update(warehouseStock)
            .set({ quantity: toStock.quantity + quantity })
            .where(and(
              eq(warehouseStock.variantId, variantId),
              eq(warehouseStock.warehouseId, toWarehouseId)
            ));
        } else {
          await tx.insert(warehouseStock).values({
            variantId,
            warehouseId: toWarehouseId,
            quantity,
          });
        }
      } else {
        throw new Error('Stock insuficiente para transferencia');
      }
    });
  }

  async getStockMovements(variantId?: string, warehouseId?: string, limit: number = 50) {
    const conditions = [];
    if (variantId) conditions.push(eq(stockMovements.variantId, variantId));
    if (warehouseId) conditions.push(eq(stockMovements.warehouseId, warehouseId));

    return db.select()
      .from(stockMovements)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(sql`${stockMovements.createdAt} DESC`)
      .limit(limit);
  }

  async getLowStockProducts(threshold: number = 10) {
    const result = await db.select({
      variant: productVariants,
      totalStock: sql<number>`COALESCE(SUM(${warehouseStock.quantity}), 0)`,
    })
    .from(productVariants)
    .leftJoin(warehouseStock, eq(productVariants.id, warehouseStock.variantId))
    .where(eq(productVariants.isActive, true))
    .groupBy(productVariants.id)
    .having(sql`COALESCE(SUM(${warehouseStock.quantity}), 0) <= ${threshold}`);

    return result;
  }

  async getWarehouses() {
    return db.select()
      .from(warehouses)
      .where(eq(warehouses.isActive, true));
  }

  async createWarehouse(data: any) {
    const [warehouse] = await db.insert(warehouses).values(data).returning();
    return warehouse;
  }

  async updateWarehouse(id: string, data: any) {
    const [warehouse] = await db.update(warehouses)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(warehouses.id, id))
      .returning();
    return warehouse;
  }

  async reserveStock(variantId: string, warehouseId: string, quantity: number) {
    return db.transaction(async (tx) => {
      const [stock] = await tx.select()
        .from(warehouseStock)
        .where(and(
          eq(warehouseStock.variantId, variantId),
          eq(warehouseStock.warehouseId, warehouseId)
        ));

      if (!stock || stock.quantity - stock.reservedQuantity < quantity) {
        throw new Error('Stock insuficiente');
      }

      await tx.update(warehouseStock)
        .set({ reservedQuantity: stock.reservedQuantity + quantity })
        .where(and(
          eq(warehouseStock.variantId, variantId),
          eq(warehouseStock.warehouseId, warehouseId)
        ));

      await tx.insert(stockMovements).values({
        variantId,
        warehouseId,
        movementType: 'sale',
        quantity: -quantity,
        notes: 'Stock reservado para pedido',
      });
    });
  }

  async releaseStock(variantId: string, warehouseId: string, quantity: number) {
    const [stock] = await db.select()
      .from(warehouseStock)
      .where(and(
        eq(warehouseStock.variantId, variantId),
        eq(warehouseStock.warehouseId, warehouseId)
      ));

    if (stock && stock.reservedQuantity >= quantity) {
      await db.update(warehouseStock)
        .set({ reservedQuantity: stock.reservedQuantity - quantity })
        .where(and(
          eq(warehouseStock.variantId, variantId),
          eq(warehouseStock.warehouseId, warehouseId)
        ));
    }
  }
}

export const inventoryService = new InventoryService();