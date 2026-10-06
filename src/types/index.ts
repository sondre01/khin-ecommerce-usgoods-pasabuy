export type UserRole = 'CUSTOMER' | 'ADMIN';

export type OrderStatus =
  | 'PENDING_QUOTE'
  | 'ORDER_PLACED'
  | 'PURCHASED_IN_US'
  | 'IN_TRANSIT_FORWARDER'
  | 'ARRIVED_IN_PH'
  | 'OUT_FOR_LOCAL_DELIVERY'
  | 'COMPLETED'
  | 'CANCELLED';

export type PaymentOption = 'FULL_PAYMENT' | 'DOWNPAYMENT_50';

export type PaymentStatus = 'UNPAID' | 'PARTIALLY_PAID' | 'FULLY_PAID' | 'REFUNDED';

export type PaymentMethod =
  | 'GCASH'
  | 'MAYA'
  | 'BDO_BANK_TRANSFER'
  | 'BPI_BANK_TRANSFER'
  | 'CREDIT_CARD'
  | 'CASH_ON_PICKUP';

export type ReceiptReviewStatus = 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  role: UserRole;
  shippingAddress?: {
    street: string;
    barangay: string;
    city: string;
    province: string;
    postalCode: string;
  };
}

export interface Product {
  id: string;
  title: string;
  description: string;
  category: string;
  brand?: 'Calvin Klein' | 'Tommy Hilfiger' | 'Polo Ralph Lauren' | 'Lacoste' | string;
  retailerName: string;
  sourceUrl: string;
  imageUrls: string[];
  weightLbs: number;
  basePriceUsd: number;
  sellingPricePhp: number;
  isCustomRequest: boolean;
  isActive: boolean;
  stockQuantity: number;
  allocatedSlots?: number;
  claimedSlots?: number;
  isLiveShoppingDrop?: boolean;
  lineupTag?: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId?: string;
  productTitle: string;
  sourceUrl?: string;
  variantDetails?: Record<string, string>;
  quantity: number;
  unitPriceUsd: number;
  unitPricePhp: number;
  landedCostSnapshot: LandedCostBreakdown;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  status: OrderStatus;
  paymentPlan: PaymentOption;
  paymentStatus: PaymentStatus;
  subtotalPhp: number;
  shippingFeePhPhp: number;
  totalAmountPhp: number;
  amountPaidPhp: number;
  remainingBalancePhp: number;
  usStoreOrderRef?: string;
  cargoTrackingNumber?: string;
  localCourierName?: string;
  localTrackingNumber?: string;
  deliveryAddress: {
    fullName: string;
    phone: string;
    street: string;
    barangay: string;
    city: string;
    province: string;
    postalCode: string;
  };
  customerNotes?: string;
  adminNotes?: string;
  items: OrderItem[];
  payments: PaymentRecord[];
  statusHistory: OrderStatusHistory[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderStatusHistory {
  id: string;
  orderId: string;
  stage: OrderStatus;
  comment?: string;
  updatedBy?: string;
  createdAt: string;
}

export interface PaymentRecord {
  id: string;
  orderId: string;
  amountPhp: number;
  paymentType: PaymentOption;
  method: PaymentMethod;
  referenceNumber?: string;
  proofReceiptUrl: string;
  reviewStatus: ReceiptReviewStatus;
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface LandedCostInput {
  basePriceUsd: number;
  weightLbs: number;
  usStateTaxRate?: number;    // e.g. 0.00 for Oregon (tax-free forwarder) or 0.07 for California
  cargoRatePerLbUsd?: number; // e.g. $7.50/lb air cargo forwarder rate
  handlingFeeUsd?: number;    // Box handling / processing
  usdToPhpRate: number;       // Spot exchange rate with FX buffer (e.g. 59.00)
  profitMarginRate?: number;  // Service margin (e.g. 0.15 for 15%)
}

export interface LandedCostBreakdown {
  usBasePriceUsd: number;
  usStateTaxUsd: number;
  estCargoFeeUsd: number;
  handlingFeeUsd: number;
  totalLandedUsd: number;
  effectiveExchangeRate: number;
  baseCostPhp: number;
  marginAmountPhp: number;
  finalSellingPricePhp: number;
  minimum50PctDownpaymentPhp: number;
}

export type RestockRequestStatus =
  | 'PENDING_REVIEW'
  | 'SELLER_CONTACTED'
  | 'SOURCED_AT_OUTLET'
  | 'DEPOSIT_COLLECTED'
  | 'FULFILLED'
  | 'UNAVAILABLE';

export interface RestockRequest {
  id: string;
  referenceCode: string;
  userId?: string;
  customerName: string;
  customerContact: string;
  customerEmail: string;
  productId: string;
  productTitle: string;
  productBrand: string;
  productCategory: string;
  basePriceUsd: number;
  estimatedSellingPricePhp: number;
  minimum50PctDownpaymentPhp: number;
  desiredSize: string;
  preferredColor: string;
  notes?: string;
  sellerNotes?: string;
  status: RestockRequestStatus;
  createdAt: string;
  updatedAt: string;
}
