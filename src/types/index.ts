export type UserRole = 'superadmin' | 'admin' | 'vendedor' | 'bodeguero' | 'soporte' | 'cliente';

export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'processing' 
  | 'shipped' 
  | 'delivered' 
  | 'cancelled' 
  | 'refunded';

export type PaymentStatus = 
  | 'pending' 
  | 'processing' 
  | 'completed' 
  | 'failed' 
  | 'refunded';

export type PaymentMethod = 
  | 'bold' 
  | 'cash_on_delivery' 
  | 'transfer';

export type ShipmentStatus = 
  | 'pending' 
  | 'label_created' 
  | 'shipped' 
  | 'in_transit' 
  | 'delivered' 
  | 'failed';

export type MovementType = 
  | 'purchase' 
  | 'sale' 
  | 'transfer' 
  | 'adjustment' 
  | 'return';

export interface IPaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface IApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface IAuthPayload {
  userId: string;
  email: string;
  role: UserRole;
  permissions: string[];
}

export interface ITokenPayload {
  sub: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

export interface ICartItem {
  variantId: string;
  quantity: number;
  price: number;
  productName: string;
  variantName?: string;
  sku: string;
  imageUrl?: string;
}

export interface IWishlistItem {
  productId: string;
  variantId?: string;
  addedAt: Date;
}

export interface IFilterOptions {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  colors?: string[];
  sizes?: string[];
  inStock?: boolean;
  isFeatured?: boolean;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'popular';
}