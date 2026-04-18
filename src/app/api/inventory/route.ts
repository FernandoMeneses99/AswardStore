import { NextRequest, NextResponse } from 'next/server';
import { inventoryService } from '@/src/infrastructure/database/inventory.service';
import { stockAdjustmentSchema } from '@/src/infrastructure/validators/schemas';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const action = searchParams.get('action');
    const variantId = searchParams.get('variantId');
    const warehouseId = searchParams.get('warehouseId');
    
    // Get stock by variant
    if (action === 'by-variant' && variantId) {
      const stock = await inventoryService.getStockByVariant(variantId);
      return NextResponse.json({ success: true, data: stock });
    }
    
    // Get stock by warehouse
    if (action === 'by-warehouse' && warehouseId) {
      const stock = await inventoryService.getStockByWarehouse(warehouseId);
      return NextResponse.json({ success: true, data: stock });
    }
    
    // Get stock movements
    if (action === 'movements') {
      const limit = parseInt(searchParams.get('limit') || '50');
      const movements = await inventoryService.getStockMovements(variantId, warehouseId, limit);
      return NextResponse.json({ success: true, data: movements });
    }
    
    // Get low stock products
    if (action === 'low-stock') {
      const threshold = parseInt(searchParams.get('threshold') || '10');
      const products = await inventoryService.getLowStockProducts(threshold);
      return NextResponse.json({ success: true, data: products });
    }
    
    // Get warehouses
    if (action === 'warehouses') {
      const warehouses = await inventoryService.getWarehouses();
      return NextResponse.json({ success: true, data: warehouses });
    }
    
    return NextResponse.json({ success: false, error: 'Acción no válida' }, { status: 400 });
    
  } catch (error: any) {
    console.error('Inventory API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;
    
    if (action === 'adjust-stock') {
      const validated = stockAdjustmentSchema.parse(data);
      const movement = await inventoryService.adjustStock(
        validated.variantId,
        validated.warehouseId,
        validated.quantity,
        validated.movementType,
        validated.notes
      );
      return NextResponse.json({ success: true, data: movement }, { status: 201 });
    }
    
    if (action === 'transfer') {
      const { variantId, fromWarehouseId, toWarehouseId, quantity, notes } = data;
      const movement = await inventoryService.transferStock(
        variantId,
        fromWarehouseId,
        toWarehouseId,
        quantity,
        notes
      );
      return NextResponse.json({ success: true, data: movement }, { status: 201 });
    }
    
    if (action === 'reserve') {
      const { variantId, warehouseId, quantity } = data;
      await inventoryService.reserveStock(variantId, warehouseId, quantity);
      return NextResponse.json({ success: true, message: 'Stock reservado' });
    }
    
    if (action === 'release') {
      const { variantId, warehouseId, quantity } = data;
      await inventoryService.releaseStock(variantId, warehouseId, quantity);
      return NextResponse.json({ success: true, message: 'Stock liberado' });
    }
    
    if (action === 'create-warehouse') {
      const warehouse = await inventoryService.createWarehouse(data);
      return NextResponse.json({ success: true, data: warehouse }, { status: 201 });
    }
    
    return NextResponse.json({ success: false, error: 'Acción no válida' }, { status: 400 });
    
  } catch (error: any) {
    console.error('Inventory POST Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;
    
    if (action === 'update-warehouse') {
      const warehouse = await inventoryService.updateWarehouse(data.id, data);
      return NextResponse.json({ success: true, data: warehouse });
    }
    
    return NextResponse.json({ success: false, error: 'Acción no válida' }, { status: 400 });
    
  } catch (error: any) {
    console.error('Inventory PUT Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}