export interface Product {
  ProductID: number;
  ProductName: string;
  Description: string;
  CategoryID: number;
  CategoryName: string;
  Price: number;
  StockQuantity: number;
  ReorderLevel: number;
  IsActive: boolean;
  CreatedDate: string;
}

export interface LowStockProduct {
  ProductID: number;
  ProductName: string;
  CategoryName: string;
  StockQuantity: number;
  ReorderLevel: number;
  Price: number;
}

export interface StockMovementSummary {
  ProductID: number;
  ProductName: string;
  CategoryName: string;
  StockQuantity: number;
  MinStockLevel: number;
  TotalIn: number;
  TotalOut: number;
  NetStock: number;
  Price: number;
}

export interface StockMovementHistory {
  MovementID: number;
  ProductID: number;
  ProductName: string;
  CategoryName: string;
  MovementType: string;
  Quantity: number;
  PreviousStock: number;
  NewStock: number;
  Notes: string;
  MovementDate: string;
}

export interface StockMovementSummary {
  ProductID: number;
  ProductName: string;
  CategoryName: string;
  StockQuantity: number;
  MinStockLevel: number;
  TotalIn: number;
  TotalOut: number;
  TotalInValue: number;
  TotalOutValue: number;
  NetStock: number;
  Price: number;
}

export interface Order {
  OrderID: number;
  CustomerName: string;
  TotalAmount: number;
  Status: string;
  OrderDate: string;
  ItemCount: number;
}

export interface OrderItem {
  OrderItemID: number;
  OrderID: number;
  ProductID: number;
  ProductName: string;
  CategoryName: string;
  Description: string;
  Quantity: number;
  UnitPrice: number;
  TotalPrice: number;
}

export interface OrderDetails {
  order: Order;
  items: OrderItem[];
}

export interface CartItem {
  productId: number;
  productName: string;
  categoryName: string;
  price: number;
  quantity: number;
  stock: number;
}

// เพิ่ม interface ใหม่สำหรับการค้นหาและฟอร์ม
export interface ProductSearchParams {
  q?: string;
  category?: string;
}

export interface ProductFormData {
  productName: string;
  description: string;
  categoryId: string;
  price: string;
  stockQuantity: string;
  reorderLevel: string;
}

export interface Category {
  CategoryID: number;
  CategoryName: string;
  Description?: string;
  IsActive: boolean;
  CreatedDate?: string;
}

// เพิ่ม interface สำหรับรายละเอียดสินค้า
export interface ProductDetails extends Product {
  StockMovements?: StockMovementHistory[];
  TotalSold?: number;
  LastRestocked?: string;
}

export interface ProductSearchParams {
  q?: string;
  category?: string;
}

export interface ProductFormData {
  productName: string;
  description: string;
  categoryId: string;
  price: string;
  stockQuantity: string;
  reorderLevel: string;
}

export interface Category {
  CategoryID: number;
  CategoryName: string;
  Description?: string;
  IsActive: boolean;
  CreatedDate?: string;
}