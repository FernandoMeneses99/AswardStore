import { NextRequest, NextResponse } from 'next/server';
import { productService } from '@/src/infrastructure/database/product.service';
import { createProductSchema, createVariantSchema, createCategorySchema } from '@/src/infrastructure/validators/schemas';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const action = searchParams.get('action');
    const slug = searchParams.get('slug');
    const id = searchParams.get('id');
    const featured = searchParams.get('featured');
    const search = searchParams.get('search');
    
    // Get single product by slug
    if (action === 'product' && slug) {
      const product = await productService.getProductBySlug(slug);
      if (!product) {
        return NextResponse.json({ success: false, error: 'Producto no encontrado' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: product });
    }
    
    // Get single product by ID
    if (action === 'product-by-id' && id) {
      const product = await productService.getProductById(id);
      if (!product) {
        return NextResponse.json({ success: false, error: 'Producto no encontrado' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: product });
    }
    
    // Get featured products
    if (action === 'featured') {
      const limit = parseInt(searchParams.get('limit') || '8');
      const products = await productService.getFeaturedProducts(limit);
      return NextResponse.json({ success: true, data: products });
    }
    
    // Get categories
    if (action === 'categories') {
      const categories = await productService.getCategories();
      return NextResponse.json({ success: true, data: categories });
    }
    
    // Search products
    if (action === 'search' && search) {
      const limit = parseInt(searchParams.get('limit') || '20');
      const products = await productService.searchProducts(search, limit);
      return NextResponse.json({ success: true, data: products });
    }
    
    // Get products with filters
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const category = searchParams.get('category') || undefined;
    const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined;
    const inStock = searchParams.get('inStock') === 'true';
    const isFeatured = searchParams.get('isFeatured') === 'true';
    const sortBy = searchParams.get('sortBy') as any;
    
    const result = await productService.getProducts({
      page,
      pageSize,
      category,
      minPrice,
      maxPrice,
      inStock,
      isFeatured,
      sortBy
    });
    
    return NextResponse.json({ success: true, data: result });
    
  } catch (error: any) {
    console.error('Products API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    
    if (!contentType.includes('application/json')) {
      return NextResponse.json({ success: false, error: 'Content-Type requerido' }, { status: 400 });
    }
    
    const body = await request.json();
    const { action } = body;
    
    // Create product
    if (action === 'create-product') {
      const validated = createProductSchema.parse(body.data);
      const product = await productService.createProduct(validated);
      return NextResponse.json({ success: true, data: product }, { status: 201 });
    }
    
    // Create variant
    if (action === 'create-variant') {
      const validated = createVariantSchema.parse(body.data);
      const variant = await productService.createVariant(validated.productId, validated);
      return NextResponse.json({ success: true, data: variant }, { status: 201 });
    }
    
    // Create category
    if (action === 'create-category') {
      const validated = createCategorySchema.parse(body.data);
      const { db } = await import('@/src/infrastructure/database');
      const { categories } = await import('@/src/infrastructure/database/schema');
      const [category] = await db.insert(categories).values({
        ...validated,
        slug: validated.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      }).returning();
      return NextResponse.json({ success: true, data: category }, { status: 201 });
    }
    
    // Add product image
    if (action === 'add-image') {
      const { productId, url, isPrimary } = body;
      const image = await productService.addProductImage(productId, url, isPrimary);
      return NextResponse.json({ success: true, data: image }, { status: 201 });
    }
    
    return NextResponse.json({ success: false, error: 'Acción no válida' }, { status: 400 });
    
  } catch (error: any) {
    console.error('Products POST Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;
    
    if (action === 'update-product') {
      const product = await productService.updateProduct(data.id, data);
      return NextResponse.json({ success: true, data: product });
    }
    
    if (action === 'update-variant') {
      const variant = await productService.updateVariant(data.id, data);
      return NextResponse.json({ success: true, data: variant });
    }
    
    if (action === 'delete-product') {
      await productService.deleteProduct(data.id);
      return NextResponse.json({ success: true, message: 'Producto eliminado' });
    }
    
    if (action === 'delete-variant') {
      await productService.deleteVariant(data.id);
      return NextResponse.json({ success: true, message: 'Variante eliminada' });
    }
    
    return NextResponse.json({ success: false, error: 'Acción no válida' }, { status: 400 });
    
  } catch (error: any) {
    console.error('Products PUT Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}