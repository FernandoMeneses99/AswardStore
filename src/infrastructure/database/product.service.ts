import { db } from '../database';
import { 
  products, 
  productVariants, 
  productImages, 
  categories,
  variantAttributes,
  reviews,
  warehouseStock,
} from '../database/schema';
import { eq, and, ilike, inArray, desc, asc, sql, or } from 'drizzle-orm';
import type { IFilterOptions } from '../../types';

export class ProductService {
  async getProducts(filters: IFilterOptions & { page: number; pageSize: number }) {
    const { 
      category, 
      minPrice, 
      maxPrice, 
      colors, 
      sizes, 
      inStock, 
      isFeatured, 
      sortBy,
      page = 1, 
      pageSize = 20 
    } = filters;

    const conditions = [eq(products.isActive, true)];

    if (category) {
      conditions.push(eq(products.categoryId, category));
    }

    if (minPrice !== undefined) {
      conditions.push(sql`${products.basePrice} >= ${minPrice}`);
    }

    if (maxPrice !== undefined) {
      conditions.push(sql`${products.basePrice} <= ${maxPrice}`);
    }

    if (isFeatured) {
      conditions.push(eq(products.isFeatured, true));
    }

    const orderBy = sortBy === 'price_asc' 
      ? asc(products.basePrice)
      : sortBy === 'price_desc'
      ? desc(products.basePrice)
      : sortBy === 'newest'
      ? desc(products.createdAt)
      : desc(products.createdAt);

    const [productsList, total] = await Promise.all([
      db.select()
        .from(products)
        .where(and(...conditions))
        .orderBy(orderBy)
        .limit(pageSize)
        .offset((page - 1) * pageSize),
      db.select({ count: sql<number>`count(*)::int` })
        .from(products)
        .where(and(...conditions)),
    ]);

    const productIds = productsList.map(p => p.id);
    
    const [variants, images] = await Promise.all([
      db.select()
        .from(productVariants)
        .where(inArray(productVariants.productId, productIds)),
      db.select()
        .from(productImages)
        .where(and(
          inArray(productImages.productId, productIds),
          eq(productImages.isPrimary, true)
        )),
    ]);

    const productsWithDetails = productsList.map(product => ({
      ...product,
      variants: variants.filter(v => v.productId === product.id),
      primaryImage: images.find(i => i.productId === product.id),
    }));

    return {
      data: productsWithDetails,
      total: total[0]?.count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((total[0]?.count || 0) / pageSize),
    };
  }

  async getProductBySlug(slug: string) {
    const product = await db.query.products.findFirst({
      where: and(eq(products.slug, slug), eq(products.isActive, true)),
      with: {
        category: true,
        variants: {
          where: eq(productVariants.isActive, true),
          with: {
            attributes: true,
          },
        },
        images: {
          orderBy: [asc(productImages.sortOrder)],
        },
        tags: true,
      },
    });

    if (!product) return null;

    const [reviewsData, avgRating] = await Promise.all([
      db.select()
        .from(reviews)
        .where(and(eq(reviews.productId, product.id), eq(reviews.isApproved, true)))
        .orderBy(desc(reviews.createdAt))
        .limit(10),
      db.select({ avg: sql<number>`avg(${reviews.rating})` })
        .from(reviews)
        .where(and(eq(reviews.productId, product.id), eq(reviews.isApproved, true))),
    ]);

    return {
      ...product,
      reviews: reviewsData,
      avgRating: avgRating[0]?.avg || 0,
    };
  }

  async getProductById(id: string) {
    const product = await db.query.products.findFirst({
      where: eq(products.id, id),
      with: {
        category: true,
        variants: {
          with: {
            attributes: true,
            images: true,
          },
        },
        images: true,
      },
    });
    return product;
  }

  async createProduct(data: any) {
    const [product] = await db.insert(products).values({
      ...data,
      slug: this.generateSlug(data.name),
    }).returning();
    return product;
  }

  async updateProduct(id: string, data: any) {
    const [product] = await db.update(products)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return product;
  }

  async deleteProduct(id: string) {
    await db.update(products)
      .set({ isActive: false })
      .where(eq(products.id, id));
  }

  async createVariant(productId: string, data: any) {
    const [variant] = await db.insert(productVariants).values({
      ...data,
      productId,
    }).returning();

    if (data.attributes?.length) {
      await db.insert(variantAttributes).values(
        data.attributes.map((attr: any) => ({
          variantId: variant.id,
          attributeName: attr.name,
          attributeValue: attr.value,
        }))
      );
    }

    return variant;
  }

  async updateVariant(id: string, data: any) {
    const [variant] = await db.update(productVariants)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(productVariants.id, id))
      .returning();
    return variant;
  }

  async deleteVariant(id: string) {
    await db.update(productVariants)
      .set({ isActive: false })
      .where(eq(productVariants.id, id));
  }

  async addProductImage(productId: string, url: string, isPrimary: boolean = false) {
    if (isPrimary) {
      await db.update(productImages)
        .set({ isPrimary: false })
        .where(and(eq(productImages.productId, productId), eq(productImages.isPrimary, true)));
    }

    const [image] = await db.insert(productImages).values({
      productId,
      url,
      isPrimary,
    }).returning();
    return image;
  }

  async getCategories() {
    return db.select()
      .from(categories)
      .where(eq(categories.isActive, true))
      .orderBy(asc(categories.sortOrder));
  }

  async getFeaturedProducts(limit: number = 8) {
    const productsList = await db.select()
      .from(products)
      .where(and(eq(products.isActive, true), eq(products.isFeatured, true)))
      .orderBy(desc(products.createdAt))
      .limit(limit);

    const productIds = productsList.map(p => p.id);
    
    const [variants, images] = await Promise.all([
      db.select()
        .from(productVariants)
        .where(and(inArray(productVariants.productId, productIds), eq(productVariants.isActive, true))),
      db.select()
        .from(productImages)
        .where(and(inArray(productImages.productId, productIds), eq(productImages.isPrimary, true))),
    ]);

    return productsList.map(product => ({
      ...product,
      variants: variants.filter(v => v.productId === product.id),
      primaryImage: images.find(i => i.productId === product.id),
    }));
  }

  async searchProducts(query: string, limit: number = 20) {
    return db.select()
      .from(products)
      .where(and(
        eq(products.isActive, true),
        or(
          ilike(products.name, `%${query}%`),
          ilike(products.description, `%${query}%`)
        )
      ))
      .limit(limit);
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}

export const productService = new ProductService();