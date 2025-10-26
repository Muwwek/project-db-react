'use client';

import { LowStockProduct } from '../types/inventory';

interface LowStockAlertProps {
  products: LowStockProduct[];
  onAddStock: (productId: number, quantity: number) => void;
}

export default function LowStockAlert({ products, onAddStock }: LowStockAlertProps) {
  if (products.length === 0) {
    return null;
  }

  const getUrgencyLevel = (stock: number, reorderLevel: number) => {
    const percentage = (stock / reorderLevel) * 100;
    if (percentage <= 25) return 'high';
    if (percentage <= 50) return 'medium';
    return 'low';
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'alert-danger';
      case 'medium': return 'alert-warning';
      case 'low': return 'alert-info';
      default: return 'alert-info';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'high': return '🔴';
      case 'medium': return '🟠';
      case 'low': return '🟡';
      default: return '⚪';
    }
  };

  return (
    <div className="low-stock-container">
      <div className="card-header-alert">
        <div className="header-content-wrapper">
          <div className="alert-icon-wrapper">
            <span className="alert-icon-inner">!</span>
          </div>
          <div className="header-text">
            <h2 className="header-title">สินค้าใกล้หมดสต็อก</h2>
            <p className="header-subtitle">
              มีสินค้าที่ต้องสั่งซื้อเพิ่ม {products.length} รายการ
            </p>
          </div>
          <div className="alert-badge">
            <span>{products.length}</span>
          </div>
        </div>
      </div>

      <div className="card-body-content">
        <div className="products-grid">
          {products.map((product) => {
            const urgency = getUrgencyLevel(product.StockQuantity, product.ReorderLevel);
            const stockPercentage = (product.StockQuantity / product.ReorderLevel) * 100;
            
            return (
              <div
                key={product.ProductID}
                className={`product-card-item urgency-${urgency}`}
              >
                <div className="product-header-section">
                  <div className="product-title-row">
                    <span className="urgency-indicator">{getUrgencyIcon(urgency)}</span>
                    <h3 className="product-title">{product.ProductName}</h3>
                  </div>
                  <p className="product-category-text">
                    {product.CategoryName}
                  </p>
                </div>
                
                <div className="product-info-section">
                  <div className="info-row">
                    <span className="info-label">สต็อกปัจจุบัน:</span>
                    <span className="info-value">{product.StockQuantity} ชิ้น</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">ระดับสั่งซื้อ:</span>
                    <span className="info-value">{product.ReorderLevel} ชิ้น</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">ราคา:</span>
                    <span className="info-value">฿{product.Price.toLocaleString()}</span>
                  </div>
                </div>

                <div className="progress-section">
                  <div className="progress-header">
                    <span className="progress-label">ระดับสต็อก</span>
                    <span className="progress-percentage">{Math.round(stockPercentage)}%</span>
                  </div>
                  <div className="progress-track">
                    <div
                      className={`progress-indicator urgency-${urgency}`}
                      style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="quick-actions">
                  <button
                    onClick={() => onAddStock(product.ProductID, 20)}
                    className="action-btn action-btn-quick"
                  >
                    +20
                  </button>
                  <button
                    onClick={() => onAddStock(product.ProductID, 50)}
                    className="action-btn action-btn-quick"
                  >
                    +50
                  </button>
                  <button
                    onClick={() => onAddStock(product.ProductID, 100)}
                    className="action-btn action-btn-quick"
                  >
                    +100
                  </button>
                </div>

                <div className="custom-add-section">
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    placeholder="ระบุจำนวน"
                    className="custom-add-input"
                    id={`quick-add-${product.ProductID}`}
                  />
                  <button
                    onClick={() => {
                      const input = document.getElementById(`quick-add-${product.ProductID}`) as HTMLInputElement;
                      const quantity = parseInt(input.value);
                      if (quantity > 0) {
                        onAddStock(product.ProductID, quantity);
                        input.value = '';
                      }
                    }}
                    className="action-btn action-btn-custom"
                  >
                    เพิ่ม
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="summary-section">
          <div className="summary-grid">
            <div className="summary-card summary-high">
              <div className="summary-number">
                {products.filter(p => getUrgencyLevel(p.StockQuantity, p.ReorderLevel) === 'high').length}
              </div>
              <div className="summary-label">ระดับวิกฤต</div>
            </div>
            <div className="summary-card summary-medium">
              <div className="summary-number">
                {products.filter(p => getUrgencyLevel(p.StockQuantity, p.ReorderLevel) === 'medium').length}
              </div>
              <div className="summary-label">ระดับเตือน</div>
            </div>
            <div className="summary-card summary-low">
              <div className="summary-number">
                {products.filter(p => getUrgencyLevel(p.StockQuantity, p.ReorderLevel) === 'low').length}
              </div>
              <div className="summary-label">ระดับสังเกต</div>
            </div>
          </div>
        </div>

        <div className="recommendation-box">
          <span className="recommendation-icon">💡</span>
          <p className="recommendation-text">
            <strong>คำแนะนำ:</strong> ควรสั่งซื้อสินค้าที่มีระดับวิกฤตและระดับเตือนโดยด่วน เพื่อป้องกันการขาดสต็อก
          </p>
        </div>
      </div>

      <style jsx>{`
        /* ===== CONTAINER ===== */
        .low-stock-container {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(254, 243, 243, 0.95) 100%);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 
            0 8px 24px rgba(244, 63, 94, 0.15),
            0 2px 8px rgba(0, 0, 0, 0.05),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);
          border: 2px solid rgba(244, 63, 94, 0.3);
          margin-bottom: 32px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .low-stock-container:hover {
          transform: translateY(-2px);
          box-shadow: 
            0 12px 32px rgba(244, 63, 94, 0.2),
            0 4px 12px rgba(0, 0, 0, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);
        }

        /* ===== HEADER ===== */
        .card-header-alert {
          background: linear-gradient(135deg, #f43f5e 0%, #e11d48 50%, #be123c 100%);
          padding: 24px 28px;
          position: relative;
          overflow: hidden;
        }

        .card-header-alert::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, transparent 70%);
          pointer-events: none;
        }

        .header-content-wrapper {
          display: flex;
          align-items: center;
          position: relative;
          z-index: 1;
        }

        .alert-icon-wrapper {
          width: 52px;
          height: 52px;
          background: linear-gradient(135deg, #ffffff 0%, #fef2f2 100%);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          flex-shrink: 0;
        }

        .alert-icon-inner {
          color: #dc2626;
          font-weight: 900;
          font-size: 28px;
        }

        .header-text {
          flex: 1;
        }

        .header-title {
          font-size: 24px;
          font-weight: 800;
          color: white;
          margin: 0;
          letter-spacing: -0.5px;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .header-subtitle {
          font-size: 15px;
          color: rgba(255, 255, 255, 0.95);
          margin: 4px 0 0 0;
          font-weight: 600;
        }

        .alert-badge {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%);
          backdrop-filter: blur(10px);
          border-radius: 24px;
          padding: 8px 20px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .alert-badge span {
          color: white;
          font-weight: 800;
          font-size: 20px;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        }

        /* ===== BODY CONTENT ===== */
        .card-body-content {
          padding: 28px;
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
          margin-bottom: 28px;
        }

        /* ===== PRODUCT CARDS ===== */
        .product-card-item {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(254, 243, 243, 0.98) 100%);
          backdrop-filter: blur(5px);
          border-radius: 16px;
          padding: 24px;
          border: 2px solid;
          border-left-width: 5px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .product-card-item::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -5px;
          width: 5px;
          height: 200%;
          background: linear-gradient(180deg, transparent 0%, currentColor 50%, transparent 100%);
          animation: shimmer 3s ease-in-out infinite;
        }

        @keyframes shimmer {
          0%, 100% { top: -50%; opacity: 0.5; }
          50% { top: 50%; opacity: 1; }
        }

        .product-card-item.urgency-high {
          border-color: rgba(244, 63, 94, 0.6);
          background: linear-gradient(135deg, rgba(254, 242, 242, 0.98) 0%, rgba(254, 226, 226, 0.98) 100%);
        }

        .product-card-item.urgency-high::before {
          color: #f43f5e;
        }

        .product-card-item.urgency-medium {
          border-color: rgba(251, 146, 60, 0.6);
          background: linear-gradient(135deg, rgba(255, 251, 235, 0.98) 0%, rgba(254, 243, 199, 0.98) 100%);
        }

        .product-card-item.urgency-medium::before {
          color: #fb923c;
        }

        .product-card-item.urgency-low {
          border-color: rgba(96, 165, 250, 0.6);
          background: linear-gradient(135deg, rgba(240, 249, 255, 0.98) 0%, rgba(224, 242, 254, 0.98) 100%);
        }

        .product-card-item.urgency-low::before {
          color: #60a5fa;
        }

        .product-card-item:hover {
          transform: translateY(-4px) scale(1.01);
        }

        .product-card-item.urgency-high:hover {
          box-shadow: 0 12px 32px rgba(244, 63, 94, 0.25);
          border-color: rgba(244, 63, 94, 0.9);
        }

        .product-card-item.urgency-medium:hover {
          box-shadow: 0 12px 32px rgba(251, 146, 60, 0.25);
          border-color: rgba(251, 146, 60, 0.9);
        }

        .product-card-item.urgency-low:hover {
          box-shadow: 0 12px 32px rgba(96, 165, 250, 0.25);
          border-color: rgba(96, 165, 250, 0.9);
        }

        /* ===== PRODUCT HEADER ===== */
        .product-header-section {
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 2px solid rgba(0, 0, 0, 0.05);
        }

        .product-title-row {
          display: flex;
          align-items: center;
          margin-bottom: 6px;
        }

        .urgency-indicator {
          margin-right: 10px;
          font-size: 18px;
          flex-shrink: 0;
        }

        .product-title {
          font-weight: 800;
          color: #1e293b;
          margin: 0;
          font-size: 18px;
          letter-spacing: -0.3px;
        }

        .product-category-text {
          color: #64748b;
          font-size: 14px;
          margin: 0;
          font-weight: 600;
          padding-left: 28px;
        }

        /* ===== PRODUCT INFO ===== */
        .product-info-section {
          margin-bottom: 18px;
          background: rgba(255, 255, 255, 0.6);
          padding: 12px;
          border-radius: 10px;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
          font-size: 14px;
        }

        .info-row:last-child {
          margin-bottom: 0;
        }

        .info-label {
          color: #64748b;
          font-weight: 600;
        }

        .info-value {
          font-weight: 800;
          color: #1e293b;
        }

        /* ===== PROGRESS BAR ===== */
        .progress-section {
          margin-bottom: 18px;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .progress-label {
          font-size: 13px;
          color: #64748b;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .progress-percentage {
          font-size: 14px;
          font-weight: 800;
          color: #1e293b;
        }

        .progress-track {
          width: 100%;
          background: rgba(226, 232, 240, 0.8);
          border-radius: 10px;
          height: 12px;
          overflow: hidden;
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .progress-indicator {
          height: 100%;
          border-radius: 10px;
          transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        .progress-indicator::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 50%;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.3) 0%, transparent 100%);
          border-radius: 10px 10px 0 0;
        }

        .progress-indicator.urgency-high {
          background: linear-gradient(90deg, #f43f5e 0%, #e11d48 100%);
        }

        .progress-indicator.urgency-medium {
          background: linear-gradient(90deg, #fb923c 0%, #f97316 100%);
        }

        .progress-indicator.urgency-low {
          background: linear-gradient(90deg, #60a5fa 0%, #3b82f6 100%);
        }

        /* ===== ACTION BUTTONS ===== */
        .quick-actions {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-bottom: 12px;
        }

        .action-btn {
          padding: 10px 16px;
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .action-btn::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.5);
          transform: translate(-50%, -50%);
          transition: width 0.5s, height 0.5s;
        }

        .action-btn:hover::before {
          width: 300px;
          height: 300px;
        }

        .action-btn-quick {
          background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .action-btn-quick:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
        }

        .action-btn-quick:active {
          transform: translateY(0);
        }

        /* ===== CUSTOM ADD ===== */
        .custom-add-section {
          display: flex;
          gap: 8px;
        }

        .custom-add-input {
          flex: 1;
          border: 2px solid rgba(226, 232, 240, 0.8);
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.3s ease;
          background: rgba(255, 255, 255, 0.8);
        }

        .custom-add-input:focus {
          outline: none;
          border-color: #60a5fa;
          box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1);
          background: white;
        }

        .action-btn-custom {
          background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
          color: white;
          padding: 10px 24px;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .action-btn-custom:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
        }

        /* ===== SUMMARY SECTION ===== */
        .summary-section {
          margin-bottom: 24px;
          padding: 20px 0;
          border-top: 2px solid rgba(0, 0, 0, 0.05);
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .summary-card {
          padding: 20px;
          border-radius: 16px;
          text-align: center;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 2px solid;
        }

        .summary-card:hover {
          transform: translateY(-4px) scale(1.02);
        }

        .summary-high {
          background: linear-gradient(135deg, rgba(254, 242, 242, 0.95) 0%, rgba(254, 226, 226, 0.95) 100%);
          border-color: rgba(244, 63, 94, 0.4);
        }

        .summary-high:hover {
          box-shadow: 0 8px 24px rgba(244, 63, 94, 0.25);
          border-color: rgba(244, 63, 94, 0.7);
        }

        .summary-medium {
          background: linear-gradient(135deg, rgba(255, 251, 235, 0.95) 0%, rgba(254, 243, 199, 0.95) 100%);
          border-color: rgba(251, 146, 60, 0.4);
        }

        .summary-medium:hover {
          box-shadow: 0 8px 24px rgba(251, 146, 60, 0.25);
          border-color: rgba(251, 146, 60, 0.7);
        }

        .summary-low {
          background: linear-gradient(135deg, rgba(240, 249, 255, 0.95) 0%, rgba(224, 242, 254, 0.95) 100%);
          border-color: rgba(96, 165, 250, 0.4);
        }

        .summary-low:hover {
          box-shadow: 0 8px 24px rgba(96, 165, 250, 0.25);
          border-color: rgba(96, 165, 250, 0.7);
        }

        .summary-number {
          font-size: 36px;
          font-weight: 900;
          margin-bottom: 8px;
          letter-spacing: -1px;
        }

        .summary-high .summary-number {
          background: linear-gradient(135deg, #f43f5e 0%, #e11d48 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .summary-medium .summary-number {
          background: linear-gradient(135deg, #fb923c 0%, #f97316 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .summary-low .summary-number {
          background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .summary-label {
          font-size: 14px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .summary-high .summary-label { color: #dc2626; }
        .summary-medium .summary-label { color: #ea580c; }
        .summary-low .summary-label { color: #2563eb; }

        /* ===== RECOMMENDATION ===== */
        .recommendation-box {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 20px 24px;
          background: linear-gradient(135deg, rgba(240, 249, 255, 0.95) 0%, rgba(224, 242, 254, 0.95) 100%);
          border-radius: 16px;
          border: 2px solid rgba(96, 165, 250, 0.4);
          box-shadow: 0 4px 12px rgba(96, 165, 250, 0.1);
          transition: all 0.3s ease;
        }

        .recommendation-box:hover {
          border-color: rgba(96, 165, 250, 0.7);
          box-shadow: 0 6px 20px rgba(96, 165, 250, 0.2);
        }

        .recommendation-icon {
          font-size: 24px;
          flex-shrink: 0;
        }

        .recommendation-text {
          margin: 0;
          font-size: 15px;
          color: #1e293b;
          line-height: 1.6;
          font-weight: 600;
        }

        .recommendation-text strong {
          font-weight: 800;
          color: #2563eb;
        }

        /* ===== RESPONSIVE DESIGN ===== */
        @media (max-width: 1200px) {
          .products-grid {
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 16px;
          }
        }

        @media (max-width: 768px) {
          .card-body-content {
            padding: 20px;
          }

          .products-grid {
            grid-template-columns: 1fr;
          }

          .summary-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .quick-actions {
            grid-template-columns: 1fr;
          }

          .header-content-wrapper {
            flex-wrap: wrap;
          }

          .alert-badge {
            margin-top: 12px;
            width: 100%;
            text-align: center;
          }
        }

        @media (max-width: 480px) {
          .card-header-alert {
            padding: 20px;
          }

          .header-title {
            font-size: 20px;
          }

          .alert-icon-wrapper {
            width: 44px;
            height: 44px;
          }

          .alert-icon-inner {
            font-size: 24px;
          }

          .product-card-item {
            padding: 20px;
          }

          .custom-add-section {
            flex-direction: column;
          }

          .action-btn-custom {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}