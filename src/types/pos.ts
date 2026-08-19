// src/types/pos.ts

export interface Category {
  _id: string;
  name: string;
  slug: string;
}

export interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  stock: number; // Porsi matang siap jual
  image?: string;
  categoryId: string;
  category?: {
    _id: string;
    name: string;
  };
  isAvailable?: boolean;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  savedQuantity?: number;
  notes?: string;
}

export type OrderType = 'dine_in' | 'takeaway' | 'reservation' | 'qr_order';
export type PaymentStatus = 'unpaid' | 'dp_paid' | 'paid';

export interface Order {
  _id: string;
  invoiceNumber: string;
  tableNumber?: string; // Opsional: kosong / "Bungkus" untuk takeaway
  customerName: string;
  orderType: OrderType;
  paymentStatus: PaymentStatus;
  items: OrderItem[];
  voidedItems?: {
    name: string;
    quantity: number;
    price: number;
    date: string;
  }[];
  subtotal: number;
  dpAmount: number;
  guideCommission: number;
  grandTotal: number;
  amountReceived?: number;
  changeAmount?: number;
  partnerId?: string;
  partnerName?: string;
  servedBy?: string;
  cashierName?: string;
  cashierId?: string;
  isVoided?: boolean;
  voidReason?: string;
  voidedBy?: string;
  createdAt?: string;
  updatedAt?: string;
  isSmartMerged?: boolean; // Indikator visual bahwa pesanan ini hasil penggabungan QR pesanan meja
}

export interface Partner {
  _id: string;
  name: string;
  isActive: boolean;
}

export interface Expense {
  _id: string;
  description: string;
  amount: number;
  recordedBy: string;
  date: string;
}

export interface DailyReport {
  totalGrossRevenue: number;
  totalGuideCommissions: number;
  totalExpenses: number;
  netProfit: number;
  totalOrders: number;
}
