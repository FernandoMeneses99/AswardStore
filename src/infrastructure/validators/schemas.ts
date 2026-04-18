import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'Debe contenir al menos una mayúscula')
    .regex(/[a-z]/, 'Debe contener al menos una minúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  avatarUrl: z.string().url().optional(),
});

export const addressSchema = z.object({
  type: z.enum(['shipping', 'billing']).default('shipping'),
  name: z.string().optional(),
  addressLine1: z.string().min(5, 'Dirección muy corta'),
  addressLine2: z.string().optional(),
  city: z.string().min(2, 'Ciudad requerida'),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().default('Colombia'),
  isDefault: z.boolean().default(false),
});

export const createProductSchema = z.object({
  name: z.string().min(3, 'Nombre muy corto'),
  description: z.string().optional(),
  shortDescription: z.string().max(500).optional(),
  categoryId: z.string().uuid().optional(),
  brand: z.string().optional(),
  basePrice: z.number().positive('El precio debe ser positivo'),
  compareAtPrice: z.number().positive().optional(),
  costPerItem: z.number().positive().optional(),
  weight: z.number().positive().optional(),
  requiresShipping: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  metaTitle: z.string().max(200).optional(),
  metaDescription: z.string().max(500).optional(),
});

export const createVariantSchema = z.object({
  productId: z.string().uuid(),
  sku: z.string().min(3, 'SKU muy corto').max(50),
  name: z.string().optional(),
  price: z.number().positive().optional(),
  compareAtPrice: z.number().positive().optional(),
  inventoryQuantity: z.number().int().min(0).default(0),
  lowStockThreshold: z.number().int().min(0).default(10),
  weight: z.number().positive().optional(),
  isActive: z.boolean().default(true),
  attributes: z.array(z.object({
    name: z.string(),
    value: z.string(),
  })).optional(),
});

export const updateVariantSchema = createVariantSchema.partial().omit({ productId: true });

export const createCategorySchema = z.object({
  name: z.string().min(2, 'Nombre muy corto'),
  description: z.string().optional(),
  parentId: z.string().uuid().optional(),
  imageUrl: z.string().url().optional(),
  sortOrder: z.number().int().default(0),
});

export const createOrderSchema = z.object({
  items: z.array(z.object({
    variantId: z.string().uuid(),
    quantity: z.number().int().positive(),
  })),
  shippingAddressId: z.string().uuid().optional(),
  billingAddressId: z.string().uuid().optional(),
  couponCode: z.string().optional(),
  notes: z.string().optional(),
});

export const createPaymentSchema = z.object({
  orderId: z.string().uuid(),
  method: z.enum(['bold', 'cash_on_delivery', 'transfer']),
  paymentMethodDetails: z.object({
    cardLast4: z.string().optional(),
    cardBrand: z.string().optional(),
    phoneNumber: z.string().optional(),
  }).optional(),
});

export const createCouponSchema = z.object({
  code: z.string().min(3).max(50),
  description: z.string().optional(),
  discountType: z.enum(['percentage', 'fixed']),
  discountValue: z.number().positive(),
  minOrderAmount: z.number().positive().optional(),
  maxUses: z.number().int().positive().optional(),
  validFrom: z.date().optional(),
  validUntil: z.date().optional(),
});

export const stockAdjustmentSchema = z.object({
  variantId: z.string().uuid(),
  warehouseId: z.string().uuid(),
  quantity: z.number().int(),
  movementType: z.enum(['purchase', 'sale', 'transfer', 'adjustment', 'return']),
  notes: z.string().optional(),
});

export const createReviewSchema = z.object({
  productId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(255).optional(),
  content: z.string().max(2000).optional(),
});

export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(20),
});

export const idParamSchema = z.object({
  id: z.string().uuid(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type CreateVariantInput = z.infer<typeof createVariantSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type CreateCouponInput = z.infer<typeof createCouponSchema>;
export type StockAdjustmentInput = z.infer<typeof stockAdjustmentSchema>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;