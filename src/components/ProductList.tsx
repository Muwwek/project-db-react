'use client';

import { Product } from '../types/inventory';

interface ProductListProps {
  products: Product[];
  onAddStock: (productId: number, quantity: number) => void;
}

export default function ProductList({ products, onAddStock }: ProductListProps) {
  const getStockStatus = (stock: number, reorderLevel: number) => {
    if (stock === 0) return { text: 'หมด', color: 'status-out', badgeColor: 'badge-out' };
    if (stock <= reorderLevel) return { text: 'ใกล้หมด', color: 'status-low', badgeColor: 'badge-low' };
    return { text: 'ปกติ', color: 'status-normal', badgeColor: 'badge-normal' };
  };

  const getStockPercentage = (stock: number, reorderLevel: number) => {
    return Math.min((stock / reorderLevel) * 100, 100);
  };

  return (
    <div className="card-container">
      <div className="card-header-section">
        <div className="header-flex">
          <div className="header-left-content">
            <h2 className="header-main-title">รายการสินค้าทั้งหมด</h2>
            <p className="header-subtitle-text">จัดการสต็อกสินค้าทั้งหมด {products.length} รายการ</p>
          </div>
          <div className="header-right-content">
            <div className="count-display">{products.length}</div>
            <div className="count-label">รายการสินค้า</div>
          </div>
        </div>
      </div>
      
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>สินค้า</th>
              <th>หมวดหมู่</th>
              <th>ราคา</th>
              <th>สต็อก</th>
              <th>สถานะ</th>
              <th>ระดับสั่งซื้อ</th>
              <th>การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const status = getStockStatus(product.StockQuantity, product.ReorderLevel);
              const stockPercentage = getStockPercentage(product.StockQuantity, product.ReorderLevel);
              
              return (
                <tr key={product.ProductID} className="data-row">
                  <td>
                    <div className="product-cell">
                      <div className="product-name-text">{product.ProductName}</div>
                      <div className="product-desc-text">{product.Description}</div>
                    </div>
                  </td>
                  <td>
                    <span className="category-tag">{product.CategoryName}</span>
                  </td>
                  <td>
                    <div className="price-display">฿{product.Price.toLocaleString()}</div>
                  </td>
                  <td>
                    <div className="stock-cell">
                      <div className="progress-mini">
                        <div
                          className={`progress-fill-mini ${status.badgeColor}`}
                          style={{ width: `${stockPercentage}%` }}
                        ></div>
                      </div>
                      <span className={`quantity-text ${product.StockQuantity <= product.ReorderLevel ? 'quantity-low' : ''}`}>
                        {product.StockQuantity}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className={`status-tag ${status.color}`}>
                      {status.text}
                    </span>
                  </td>
                  <td className="reorder-cell">
                    {product.ReorderLevel}
                  </td>
                  <td>
                    <div className="action-group">
                      <button
                        onClick={() => onAddStock(product.ProductID, 10)}
                        className="action-btn action-btn-small"
                      >
                        +10
                      </button>
                      <button
                        onClick={() => onAddStock(product.ProductID, 25)}
                        className="action-btn action-btn-small"
                      >
                        +25
                      </button>
                      <button
                        onClick={() => onAddStock(product.ProductID, 100)}
                        className="action-btn action-btn-small"
                      >
                        +100
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {products.length === 0 && (
          <div className="empty-container">
            <div className="empty-icon-display">📦</div>
            <p className="empty-main-text">ไม่พบข้อมูลสินค้า</p>
            <p className="empty-sub-text">กรุณาตรวจสอบการเชื่อมต่อฐานข้อมูล</p>
          </div>
        )}
      </div>

      <style jsx>{`
        /* ===== CARD CONTAINER ===== */
        .card-container {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(254, 243, 243, 0.98) 100%);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          box-shadow: 
            0 4px 16px rgba(0, 0, 0, 0.06),
            0 2px 8px rgba(0, 0, 0, 0.04),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);
          border: 2px solid rgba(226, 232, 240, 0.8);
          overflow: hidden;
          margin-bottom: 24px;
        }

        /* ===== HEADER ===== */
        .card-header-section {
          padding: 24px 28px;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 249, 255, 0.95) 100%);
          border-bottom: 2px solid rgba(226, 232, 240, 0.6);
        }

        .header-flex {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-left-content {
          flex: 1;
        }

        .header-main-title {
          font-size: 22px;
          font-weight: 800;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0;
          letter-spacing: -0.5px;
        }

        .header-subtitle-text {
          font-size: 14px;
          color: #64748b;
          margin: 4px 0 0 0;
          font-weight: 600;
        }

        .header-right-content {
          text-align: right;
        }

        .count-display {
          font-size: 32px;
          font-weight: 800;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -1px;
        }

        .count-label {
          font-size: 13px;
          color: #94a3b8;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        /* ===== TABLE ===== */
        .table-wrapper {
          overflow-x: auto;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
        }

        .data-table thead {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        }

        .data-table th {
          padding: 16px 20px;
          text-align: left;
          font-weight: 800;
          color: #1e293b;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          border-bottom: 2px solid rgba(226, 232, 240, 0.8);
        }

        .data-table td {
          padding: 16px 20px;
          border-bottom: 1px solid rgba(226, 232, 240, 0.5);
        }

        .data-row {
          transition: background-color 0.2s ease;
        }

        .data-row:hover {
          background: linear-gradient(90deg, rgba(240, 249, 255, 0.5) 0%, rgba(224, 242, 254, 0.3) 100%);
        }

        /* ===== PRODUCT CELL ===== */
        .product-cell {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .product-name-text {
          font-weight: 700;
          color: #1e293b;
          font-size: 15px;
        }

        .product-desc-text {
          color: #64748b;
          font-size: 13px;
          max-width: 300px;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          line-height: 1.4;
        }

        /* ===== CATEGORY TAG ===== */
        .category-tag {
          display: inline-block;
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
          color: #1e40af;
          padding: 6px 14px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 700;
          border: 1px solid rgba(59, 130, 246, 0.2);
        }

        /* ===== PRICE ===== */
        .price-display {
          font-size: 18px;
          font-weight: 800;
          color: #1e293b;
          letter-spacing: -0.3px;
        }

        /* ===== STOCK CELL ===== */
        .stock-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .progress-mini {
          width: 70px;
          background: rgba(226, 232, 240, 0.6);
          border-radius: 8px;
          height: 8px;
          overflow: hidden;
          box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .progress-fill-mini {
          height: 100%;
          border-radius: 8px;
          transition: width 0.4s ease;
          position: relative;
        }

        .progress-fill-mini::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 50%;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.3) 0%, transparent 100%);
        }

        .progress-fill-mini.badge-out {
          background: linear-gradient(90deg, #dc2626 0%, #b91c1c 100%);
        }

        .progress-fill-mini.badge-low {
          background: linear-gradient(90deg, #f59e0b 0%, #d97706 100%);
        }

        .progress-fill-mini.badge-normal {
          background: linear-gradient(90deg, #10b981 0%, #059669 100%);
        }

        .quantity-text {
          font-weight: 700;
          color: #1e293b;
          font-size: 15px;
        }

        .quantity-low {
          color: #dc2626;
          font-weight: 800;
        }

        /* ===== STATUS TAG ===== */
        .status-tag {
          display: inline-block;
          padding: 6px 14px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 700;
          border: 1px solid;
        }

        .status-out {
          background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
          color: #dc2626;
          border-color: rgba(220, 38, 38, 0.3);
        }

        .status-low {
          background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
          color: #d97706;
          border-color: rgba(217, 119, 6, 0.3);
        }

        .status-normal {
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
          color: #059669;
          border-color: rgba(5, 150, 105, 0.3);
        }

        /* ===== REORDER LEVEL ===== */
        .reorder-cell {
          color: #64748b;
          font-size: 15px;
          font-weight: 700;
        }

        /* ===== ACTION BUTTONS ===== */
        .action-group {
          display: flex;
          gap: 6px;
        }

        .action-btn {
          padding: 7px 12px;
          border: none;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .action-btn-small {
          background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
          color: white;
          box-shadow: 0 2px 6px rgba(59, 130, 246, 0.25);
          border: 1px solid rgba(59, 130, 246, 0.3);
        }

        .action-btn-small:hover {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          box-shadow: 0 4px 10px rgba(59, 130, 246, 0.35);
          transform: translateY(-1px);
        }

        .action-btn-small:active {
          transform: translateY(0);
        }

        /* ===== EMPTY STATE ===== */
        .empty-container {
          text-align: center;
          padding: 60px 20px;
          background: linear-gradient(135deg, rgba(248, 250, 252, 0.8) 0%, rgba(241, 245, 249, 0.8) 100%);
        }

        .empty-icon-display {
          font-size: 72px;
          margin-bottom: 20px;
          opacity: 0.5;
        }

        .empty-main-text {
          color: #64748b;
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .empty-sub-text {
          color: #94a3b8;
          font-size: 14px;
          font-weight: 600;
        }

        /* ===== RESPONSIVE ===== */
        @media (max-width: 1024px) {
          .data-table {
            font-size: 14px;
          }

          .data-table th,
          .data-table td {
            padding: 12px 16px;
          }
        }

        @media (max-width: 768px) {
          .card-header-section {
            padding: 20px;
          }

          .header-flex {
            flex-direction: column;
            gap: 16px;
            text-align: center;
          }

          .header-left-content,
          .header-right-content {
            width: 100%;
            text-align: center;
          }

          .action-group {
            flex-direction: column;
          }

          .action-btn-small {
            font-size: 11px;
            padding: 6px 10px;
          }

          .data-table {
            font-size: 13px;
          }

          .data-table th,
          .data-table td {
            padding: 10px 12px;
          }

          .product-name-text {
            font-size: 14px;
          }

          .product-desc-text {
            font-size: 12px;
          }

          .progress-mini {
            width: 50px;
          }
        }

        @media (max-width: 480px) {
          .header-main-title {
            font-size: 18px;
          }

          .count-display {
            font-size: 28px;
          }

          .data-table th {
            font-size: 11px;
            padding: 8px 10px;
          }

          .data-table td {
            padding: 8px 10px;
          }

          .category-tag,
          .status-tag {
            font-size: 11px;
            padding: 4px 10px;
          }

          .price-display {
            font-size: 16px;
          }
        }
      `}</style>
    </div>
  );
}