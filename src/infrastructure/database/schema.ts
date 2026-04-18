import { pgTable, text, timestamp, uuid, boolean, integer, decimal, jsonb, inet } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================
// ROLES & PERMISSIONS
// ============================================

export const roles = pgTable('roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const permissions = pgTable('permissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  resource: text('resource').notNull(),
  action: text('action').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const rolePermissions = pgTable('role_permissions', {
  roleId: uuid('role_id').references(() => roles.id, { onDelete: 'cascade' }),
  permissionId: uuid('permission_id').references(() => permissions.id, { onDelete: 'cascade' }),
});

// ============================================
// USERS
// ============================================

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash'),
  name: text('name').notNull(),
  phone: text('phone'),
  avatarUrl: text('avatar_url'),
  roleId: uuid('role_id').references(() => roles.id).notNull(),
  isActive: boolean('is_active').default(true),
  emailVerified: boolean('email_verified').default(false),
  mfaEnabled: boolean('mfa_enabled').default(false),
  mfaSecret: text('mfa_secret'),
  failedLoginAttempts: integer('failed_login_attempts').default(0),
  lockedUntil: timestamp('locked_until'),
  lastLoginAt: timestamp('last_login_at'),
  passwordChangedAt: timestamp('password_changed_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const addresses = pgTable('addresses', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  type: text('type').default('shipping'),
  name: text('name'),
  addressLine1: text('address_line1').notNull(),
  addressLine2: text('address_line2'),
  city: text('city').notNull(),
  state: text('state'),
  postalCode: text('postal_code'),
  country: text('country').default('Colombia'),
  isDefault: boolean('is_default').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const socialLogins = pgTable('social_logins', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  provider: text('provider').notNull(),
  providerId: text('provider_id').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  tokenHash: text('token_hash').notNull(),
  userAgent: text('user_agent'),
  ipAddress: inet('ip_address'),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const refreshTokens = pgTable('refresh_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  tokenHash: text('token_hash').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  revoked: boolean('revoked').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// ============================================
// CATALOG
// ============================================

export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  parentId: uuid('parent_id'),
  imageUrl: text('image_url'),
  isActive: boolean('is_active').default(true),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  shortDescription: text('short_description'),
  categoryId: uuid('category_id'),
  brand: text('brand'),
  isActive: boolean('is_active').default(true),
  isFeatured: boolean('is_featured').default(false),
  metaTitle: text('meta_title'),
  metaDescription: text('meta_description'),
  basePrice: decimal('base_price', { precision: 12, scale: 2 }).notNull(),
  compareAtPrice: decimal('compare_at_price', { precision: 12, scale: 2 }),
  costPerItem: decimal('cost_per_item', { precision: 12, scale: 2 }),
  weight: decimal('weight', { precision: 10, scale: 2 }),
  requiresShipping: boolean('requires_shipping').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const productVariants = pgTable('product_variants', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  sku: text('sku').notNull().unique(),
  name: text('name'),
  price: decimal('price', { precision: 12, scale: 2 }),
  compareAtPrice: decimal('compare_at_price', { precision: 12, scale: 2 }),
  inventoryQuantity: integer('inventory_quantity').default(0),
  lowStockThreshold: integer('low_stock_threshold').default(10),
  weight: decimal('weight', { precision: 10, scale: 2 }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const variantAttributes = pgTable('variant_attributes', {
  id: uuid('id').primaryKey().defaultRandom(),
  variantId: uuid('variant_id').references(() => productVariants.id, { onDelete: 'cascade' }).notNull(),
  attributeName: text('attribute_name').notNull(),
  attributeValue: text('attribute_value').notNull(),
});

export const productImages = pgTable('product_images', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  url: text('url').notNull(),
  altText: text('alt_text'),
  isPrimary: boolean('is_primary').default(false),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

export const productTags = pgTable('product_tags', {
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  tag: text('tag').notNull(),
});

// ============================================
// INVENTORY
// ============================================

export const warehouses = pgTable('warehouses', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  code: text('code').notNull().unique(),
  address: text('address'),
  city: text('city'),
  isActive: boolean('is_active').default(true),
  isDefault: boolean('is_default').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const stockMovements = pgTable('stock_movements', {
  id: uuid('id').primaryKey().defaultRandom(),
  variantId: uuid('variant_id').references(() => productVariants.id).notNull(),
  warehouseId: uuid('warehouse_id').references(() => warehouses.id).notNull(),
  movementType: text('movement_type').notNull(),
  quantity: integer('quantity').notNull(),
  referenceType: text('reference_type'),
  referenceId: uuid('reference_id'),
  notes: text('notes'),
  performedBy: uuid('performed_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
});

export const warehouseStock = pgTable('warehouse_stock', {
  id: uuid('id').primaryKey().defaultRandom(),
  variantId: uuid('variant_id').references(() => productVariants.id, { onDelete: 'cascade' }).notNull(),
  warehouseId: uuid('warehouse_id').references(() => warehouses.id, { onDelete: 'cascade' }).notNull(),
  quantity: integer('quantity').default(0),
  reservedQuantity: integer('reserved_quantity').default(0),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ============================================
// ORDERS
// ============================================

export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderNumber: text('order_number').notNull().unique(),
  userId: uuid('user_id').references(() => users.id, { setNull: true }),
  status: text('status').default('pending'),
  subtotal: decimal('subtotal', { precision: 12, scale: 2 }).notNull(),
  taxAmount: decimal('tax_amount', { precision: 12, scale: 2 }).default(0),
  shippingAmount: decimal('shipping_amount', { precision: 12, scale: 2 }).default(0),
  discountAmount: decimal('discount_amount', { precision: 12, scale: 2 }).default(0),
  totalAmount: decimal('total_amount', { precision: 12, scale: 2 }).notNull(),
  currency: text('currency').default('COP'),
  customerName: text('customer_name'),
  customerEmail: text('customer_email'),
  customerPhone: text('customer_phone'),
  shippingAddressId: uuid('shipping_address_id'),
  billingAddressId: uuid('billing_address_id'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const orderItems = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').references(() => orders.id, { onDelete: 'cascade' }).notNull(),
  variantId: uuid('variant_id').references(() => productVariants.id).notNull(),
  productName: text('product_name').notNull(),
  variantName: text('variant_name'),
  sku: text('sku'),
  quantity: integer('quantity').notNull(),
  unitPrice: decimal('unit_price', { precision: 12, scale: 2 }).notNull(),
  totalPrice: decimal('total_price', { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const orderStatusHistory = pgTable('order_status_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').references(() => orders.id, { onDelete: 'cascade' }).notNull(),
  status: text('status').notNull(),
  notes: text('notes'),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
});

// ============================================
// PAYMENTS
// ============================================

export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').references(() => orders.id).notNull(),
  method: text('method').notNull(),
  status: text('status').default('pending'),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  currency: text('currency').default('COP'),
  externalId: text('external_id'),
  externalStatus: text('external_status'),
  paymentMethodDetails: jsonb('payment_method_details'),
  receiptUrl: text('receipt_url'),
  paidAt: timestamp('paid_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const paymentWebhooks = pgTable('payment_webhooks', {
  id: uuid('id').primaryKey().defaultRandom(),
  paymentId: uuid('payment_id').references(() => payments.id),
  eventType: text('event_type').notNull(),
  payload: jsonb('payload').notNull(),
  processed: boolean('processed').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// ============================================
// SHIPPING
// ============================================

export const shipments = pgTable('shipments', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').references(() => orders.id).notNull(),
  carrier: text('carrier'),
  trackingNumber: text('tracking_number'),
  status: text('status').default('pending'),
  shippingMethod: text('shipping_method'),
  shippingCost: decimal('shipping_cost', { precision: 12, scale: 2 }),
  estimatedDelivery: timestamp('estimated_delivery'),
  shippedAt: timestamp('shipped_at'),
  deliveredAt: timestamp('delivered_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const shippingZones = pgTable('shipping_zones', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  regions: jsonb('regions').notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const shippingRates = pgTable('shipping_rates', {
  id: uuid('id').primaryKey().defaultRandom(),
  zoneId: uuid('zone_id').references(() => shippingZones.id).notNull(),
  method: text('method').notNull(),
  minWeight: decimal('min_weight', { precision: 10, scale: 2 }),
  maxWeight: decimal('max_weight', { precision: 10, scale: 2 }),
  price: decimal('price', { precision: 12, scale: 2 }).notNull(),
  estimatedDays: integer('estimated_days'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ============================================
// MARKETING
// ============================================

export const coupons = pgTable('coupons', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: text('code').notNull().unique(),
  description: text('description'),
  discountType: text('discount_type').notNull(),
  discountValue: decimal('discount_value', { precision: 12, scale: 2 }).notNull(),
  minOrderAmount: decimal('min_order_amount', { precision: 12, scale: 2 }),
  maxUses: integer('max_uses'),
  usedCount: integer('used_count').default(0),
  validFrom: timestamp('valid_from'),
  validUntil: timestamp('valid_until'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const couponUsage = pgTable('coupon_usage', {
  id: uuid('id').primaryKey().defaultRandom(),
  couponId: uuid('coupon_id').references(() => coupons.id).notNull(),
  orderId: uuid('order_id').references(() => orders.id).notNull(),
  userId: uuid('user_id').references(() => users.id),
  discountApplied: decimal('discount_applied', { precision: 12, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow(),
});

export const promotions = pgTable('promotions', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  discountType: text('discount_type').notNull(),
  discountValue: decimal('discount_value', { precision: 12, scale: 2 }).notNull(),
  applicableProducts: jsonb('applicable_products'),
  applicableCategories: jsonb('applicable_categories'),
  minOrderAmount: decimal('min_order_amount', { precision: 12, scale: 2 }),
  validFrom: timestamp('valid_from'),
  validUntil: timestamp('valid_until'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ============================================
// REVIEWS & WISHLISTS
// ============================================

export const reviews = pgTable('reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id),
  rating: integer('rating').notNull(),
  title: text('title'),
  content: text('content'),
  isVerifiedPurchase: boolean('is_verified_purchase').default(false),
  isApproved: boolean('is_approved').default(true),
  helpfulCount: integer('helpful_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const wishlists = pgTable('wishlists', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  sessionId: text('session_id'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const wishlistItems = pgTable('wishlist_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  wishlistId: uuid('wishlist_id').references(() => wishlists.id, { onDelete: 'cascade' }).notNull(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  variantId: uuid('variant_id').references(() => productVariants.id),
  createdAt: timestamp('created_at').defaultNow(),
});

// ============================================
// NOTIFICATIONS
// ============================================

export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  type: text('type').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  data: jsonb('data'),
  isRead: boolean('is_read').default(false),
  sentViaEmail: boolean('sent_via_email').default(false),
  sentViaSms: boolean('sent_via_sms').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const emailQueue = pgTable('email_queue', {
  id: uuid('id').primaryKey().defaultRandom(),
  toEmail: text('to_email').notNull(),
  toName: text('to_name'),
  subject: text('subject').notNull(),
  body: text('body').notNull(),
  status: text('status').default('pending'),
  attempts: integer('attempts').default(0),
  sentAt: timestamp('sent_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

// ============================================
// AUDIT & SECURITY
// ============================================

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  action: text('action').notNull(),
  entityType: text('entity_type'),
  entityId: uuid('entity_id'),
  oldValues: jsonb('old_values'),
  newValues: jsonb('new_values'),
  ipAddress: inet('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const fraudLogs = pgTable('fraud_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventType: text('event_type').notNull(),
  userId: uuid('user_id').references(() => users.id),
  ipAddress: inet('ip_address'),
  userAgent: text('user_agent'),
  details: jsonb('details'),
  severity: text('severity').default('low'),
  actionTaken: text('action_taken'),
  createdAt: timestamp('created_at').defaultNow(),
});

// ============================================
// RELATIONS
// ============================================

export const rolesRelations = relations(roles, ({ many }) => ({
  users: many(users),
  permissions: many(rolePermissions),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  role: one(roles, { fields: [users.roleId], references: [roles.id] }),
  addresses: many(addresses),
  socialLogins: many(socialLogins),
  sessions: many(sessions),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  variants: many(productVariants),
  images: many(productImages),
  tags: many(productTags),
}));

export const productVariantsRelations = relations(productVariants, ({ one, many }) => ({
  product: one(products, { fields: [productVariants.productId], references: [products.id] }),
  attributes: many(variantAttributes),
  images: many(productImages),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  items: many(orderItems),
  payments: many(payments),
  shipments: many(shipments),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  order: one(orders, { fields: [payments.orderId], references: [orders.id] }),
}));

// ============================================
// TYPE EXPORTS
// ============================================

export type Role = typeof roles.$inferSelect;
export type User = typeof users.$inferSelect;
export type Product = typeof products.$inferSelect;
export type ProductVariant = typeof productVariants.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Warehouse = typeof warehouses.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
export type Review = typeof reviews.$inferSelect;