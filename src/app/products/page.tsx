'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Product } from '../../types/inventory';
import Navigation from '../../components/Navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5001/api';

axios.defaults.baseURL = API_BASE;

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/products');
      setProducts(response.data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('ไม่สามารถโหลดข้อมูลสินค้าได้');
    } finally {
      setLoading(false);
    }
  };

  const addStock = async (productId: number, quantity: number) => {
    try {
      await axios.post(`/products/${productId}/add-stock`, {
        quantity,
        notes: `เพิ่มสต็อกโดยผู้ดูแล: ${quantity} ชิ้น`
      });
      await fetchProducts();
      alert(`เพิ่มสต็อกสินค้าเรียบร้อยแล้ว ${quantity} ชิ้น`);
    } catch (error) {
      console.error('Error adding stock:', error);
      alert('เกิดข้อผิดพลาดในการเพิ่มสต็อก');
    }
  };

  const stockOut = async (productId: number, quantity: number) => {
    try {
      await axios.post(`/products/${productId}/stock-out`, {
        quantity,
        notes: `จ่ายออกโดยผู้ดูแล: ${quantity} ชิ้น`
      });
      await fetchProducts();
      alert(`จ่ายออกสินค้าเรียบร้อยแล้ว ${quantity} ชิ้น`);
    } catch (error: any) {
      console.error('Error reducing stock:', error);
      if (error.response?.data?.error === 'สต็อกไม่เพียงพอ') {
        alert(`สต็อกไม่เพียงพอ! สต็อกปัจจุบัน: ${error.response.data.currentStock} ชิ้น`);
      } else {
        alert('เกิดข้อผิดพลาดในการจ่ายออกสินค้า');
      }
    }
  };

  if (loading) {
    return (
      <div className="app-container">
        <Navigation />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Navigation />
      
      <main className="app-main">
        <div className="container">
          <div className="page-header">
            <div className="header-icon">📦</div>
            <h1>จัดการสินค้า</h1>
            <p>จัดการข้อมูลสินค้าและสต็อกทั้งหมด {products.length} รายการ</p>
          </div>

          {error && (
            <div className="alert alert-error">
              <span className="alert-icon">⚠️</span>
              <span className="alert-message">{error}</span>
              <button onClick={fetchProducts} className="btn btn-sm btn-retry">ลองอีกครั้ง</button>
            </div>
          )}

          <div className="stats-summary">
            <div className="stat-box stat-total">
              <div className="stat-icon-wrapper">
                <span className="stat-icon">📦</span>
              </div>
              <div className="stat-content">
                <div className="stat-label">สินค้าทั้งหมด</div>
                <div className="stat-value">{products.length}</div>
              </div>
            </div>
            <div className="stat-box stat-instock">
              <div className="stat-icon-wrapper">
                <span className="stat-icon">✅</span>
              </div>
              <div className="stat-content">
                <div className="stat-label">สต็อกปกติ</div>
                <div className="stat-value">
                  {products.filter(p => p.StockQuantity > p.ReorderLevel).length}
                </div>
              </div>
            </div>
            <div className="stat-box stat-lowstock">
              <div className="stat-icon-wrapper">
                <span className="stat-icon">⚠️</span>
              </div>
              <div className="stat-content">
                <div className="stat-label">ใกล้หมด</div>
                <div className="stat-value">
                  {products.filter(p => p.StockQuantity <= p.ReorderLevel && p.StockQuantity > 0).length}
                </div>
              </div>
            </div>
            <div className="stat-box stat-outstock">
              <div className="stat-icon-wrapper">
                <span className="stat-icon">🔴</span>
              </div>
              <div className="stat-content">
                <div className="stat-label">หมดสต็อก</div>
                <div className="stat-value">
                  {products.filter(p => p.StockQuantity === 0).length}
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <h2>รายการสินค้าทั้งหมด</h2>
                <p className="card-subtitle">จัดการเพิ่ม-ลดสต็อกสินค้า</p>
              </div>
              <div className="header-actions">
                <button onClick={fetchProducts} className="btn btn-primary">
                  <span className="btn-icon">🔄</span>
                  <span>รีเฟรช</span>
                </button>
              </div>
            </div>

            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>สินค้า</th>
                    <th>หมวดหมู่</th>
                    <th className="text-center">ราคา</th>
                    <th className="text-center">สต็อก</th>
                    <th className="text-center">ระดับสั่งซื้อ</th>
                    <th className="text-center">สถานะ</th>
                    <th className="text-center">การจัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.ProductID} className="table-row-hover">
                      <td>
                        <div className="product-info">
                          <div className="product-icon">📦</div>
                          <div className="product-details">
                            <div className="product-name">{product.ProductName}</div>
                            <div className="product-description">{product.Description}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="category-badge">{product.CategoryName}</span>
                      </td>
                      <td className="text-center">
                        <span className="price-tag">฿{product.Price.toLocaleString()}</span>
                      </td>
                      <td className="text-center">
                        <span className={`stock-badge ${
                          product.StockQuantity === 0 ? 'stock-zero' :
                          product.StockQuantity <= product.ReorderLevel ? 'stock-low' : 'stock-normal'
                        }`}>
                          {product.StockQuantity.toLocaleString()}
                        </span>
                      </td>
                      <td className="text-center">
                        <span className="reorder-badge">{product.ReorderLevel}</span>
                      </td>
                      <td className="text-center">
                        <span className={`status-badge ${
                          product.StockQuantity === 0 ? 'out-of-stock' :
                          product.StockQuantity <= product.ReorderLevel ? 'low-stock' : 'in-stock'
                        }`}>
                          {product.StockQuantity === 0 ? '🔴 หมด' :
                           product.StockQuantity <= product.ReorderLevel ? '🟡 ใกล้หมด' : '🟢 ปกติ'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <div className="action-group">
                            <div className="action-label">เพิ่มสต็อก</div>
                            <div className="button-group">
                              <button
                                onClick={() => addStock(product.ProductID, 10)}
                                className="btn btn-xs btn-success"
                              >
                                <span className="btn-icon-sm">+</span>
                                <span>10</span>
                              </button>
                              <button
                                onClick={() => addStock(product.ProductID, 50)}
                                className="btn btn-xs btn-success"
                              >
                                <span className="btn-icon-sm">+</span>
                                <span>50</span>
                              </button>
                            </div>
                          </div>
                          <div className="action-group">
                            <div className="action-label">จ่ายออก</div>
                            <div className="button-group">
                              <button
                                onClick={() => stockOut(product.ProductID, 5)}
                                className="btn btn-xs btn-warning"
                                disabled={product.StockQuantity < 5}
                              >
                                <span className="btn-icon-sm">-</span>
                                <span>5</span>
                              </button>
                              <button
                                onClick={() => stockOut(product.ProductID, 10)}
                                className="btn btn-xs btn-warning"
                                disabled={product.StockQuantity < 10}
                              >
                                <span className="btn-icon-sm">-</span>
                                <span>10</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {products.length === 0 && !loading && (
              <div className="empty-state">
                <div className="empty-icon">📦</div>
                <p className="empty-text">ไม่พบข้อมูลสินค้า</p>
                <p className="empty-subtext">กรุณาตรวจสอบการเชื่อมต่อฐานข้อมูล</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <style jsx>{`
        .app-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #fef3f0 0%, #f0f9ff 50%, #faf5ff 100%);
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
        }

        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 4px solid #f3e8ff;
          border-top: 4px solid #a78bfa;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .loading-text {
          margin-top: 16px;
          color: #6b7280;
          font-size: 16px;
        }

        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 32px 20px;
        }

        .page-header {
          text-align: center;
          margin-bottom: 32px;
          animation: fadeInDown 0.5s ease;
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .header-icon {
          font-size: 56px;
          margin-bottom: 12px;
          filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
        }

        .page-header h1 {
          font-size: 36px;
          font-weight: 700;
          background: linear-gradient(135deg, #7c3aed 0%, #2563eb 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0 0 8px 0;
        }

        .page-header p {
          color: #6b7280;
          font-size: 16px;
          margin: 0;
        }

        .alert-error {
          background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
          border: 2px solid #fca5a5;
          border-radius: 16px;
          padding: 16px 20px;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.15);
        }

        .alert-icon {
          font-size: 24px;
        }

        .alert-message {
          flex: 1;
          color: #991b1b;
          font-weight: 500;
        }

        .stats-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
          animation: fadeInUp 0.5s ease;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .stat-box {
          background: white;
          border-radius: 16px;
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          border: 2px solid;
          transition: all 0.3s ease;
        }

        .stat-box:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .stat-box.stat-total {
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
          border-color: #93c5fd;
        }

        .stat-box.stat-instock {
          background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
          border-color: #6ee7b7;
        }

        .stat-box.stat-lowstock {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border-color: #fbbf24;
        }

        .stat-box.stat-outstock {
          background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
          border-color: #f87171;
        }

        .stat-icon-wrapper {
          width: 60px;
          height: 60px;
          background: white;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .stat-icon {
          font-size: 30px;
        }

        .stat-content {
          flex: 1;
        }

        .stat-label {
          font-size: 13px;
          font-weight: 600;
          color: #4b5563;
          margin-bottom: 4px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-value {
          font-size: 32px;
          font-weight: 800;
          color: #111827;
          line-height: 1;
        }

        .card {
          background: white;
          border-radius: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          border: 2px solid #e5e7eb;
          margin-bottom: 32px;
          overflow: hidden;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 28px 32px;
          background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
          border-bottom: 2px solid #e9d5ff;
        }

        .card-title h2 {
          margin: 0 0 4px 0;
          color: #581c87;
          font-size: 24px;
          font-weight: 700;
        }

        .card-subtitle {
          margin: 0;
          font-size: 14px;
          color: #7c3aed;
          font-weight: 500;
        }

        .header-actions {
          display: flex;
          gap: 12px;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          border: none;
          border-radius: 10px;
          padding: 10px 20px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
        }

        .btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          box-shadow: none;
        }

        .btn:hover:not(:disabled) {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .btn-primary {
          background: linear-gradient(135deg, #a78bfa 0%, #818cf8 100%);
          color: white;
        }

        .btn-success {
          background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
          color: white;
        }

        .btn-warning {
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          color: white;
        }

        .btn-retry {
          background: #fee2e2;
          color: #991b1b;
        }

        .btn-retry:hover:not(:disabled) {
          background: #fecaca;
        }

        .btn-sm {
          padding: 8px 16px;
          font-size: 13px;
        }

        .btn-xs {
          padding: 6px 12px;
          font-size: 12px;
          font-weight: 700;
        }

        .btn-icon {
          font-size: 16px;
        }

        .btn-icon-sm {
          font-size: 14px;
          font-weight: 800;
        }

        .table-container {
          overflow-x: auto;
          padding: 0;
        }

        .table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
        }

        .table thead tr {
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
        }

        .table th {
          padding: 16px 20px;
          text-align: left;
          color: #0c4a6e;
          font-weight: 700;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 2px solid #bae6fd;
          white-space: nowrap;
        }

        .table td {
          padding: 20px;
          color: #374151;
          font-size: 14px;
          border-bottom: 1px solid #f3f4f6;
        }

        .table-row-hover {
          transition: all 0.2s ease;
        }

        .table-row-hover:hover {
          background: linear-gradient(135deg, #fef3f0 0%, #faf5ff 100%);
        }

        .text-center {
          text-align: center;
        }

        .product-info {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .product-icon {
          font-size: 28px;
          flex-shrink: 0;
        }

        .product-details {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .product-name {
          font-weight: 700;
          color: #111827;
          font-size: 15px;
        }

        .product-description {
          color: #6b7280;
          font-size: 13px;
          max-width: 300px;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          line-height: 1.4;
        }

        .category-badge {
          display: inline-block;
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
          color: #1e40af;
          padding: 6px 14px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          border: 1px solid #93c5fd;
        }

        .price-tag {
          font-weight: 700;
          color: #7c3aed;
          padding: 6px 14px;
          background: #f3e8ff;
          border-radius: 10px;
          display: inline-block;
          border: 1px solid #e9d5ff;
        }

        .stock-badge {
          font-weight: 700;
          padding: 6px 14px;
          border-radius: 10px;
          display: inline-block;
          border: 2px solid;
        }

        .stock-badge.stock-normal {
          background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
          color: #065f46;
          border-color: #6ee7b7;
        }

        .stock-badge.stock-low {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          color: #92400e;
          border-color: #fbbf24;
        }

        .stock-badge.stock-zero {
          background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
          color: #991b1b;
          border-color: #f87171;
        }

        .reorder-badge {
          font-weight: 600;
          color: #d97706;
          padding: 6px 14px;
          background: #fef3c7;
          border-radius: 10px;
          display: inline-block;
          border: 1px solid #fde68a;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 6px 14px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 700;
          border: 2px solid;
        }

        .status-badge.in-stock {
          background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
          color: #065f46;
          border-color: #6ee7b7;
        }

        .status-badge.low-stock {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          color: #92400e;
          border-color: #fbbf24;
        }

        .status-badge.out-of-stock {
          background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
          color: #991b1b;
          border-color: #f87171;
        }

        .action-buttons {
          display: flex;
          flex-direction: column;
          gap: 12px;
          min-width: 200px;
        }

        .action-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .action-label {
          font-size: 11px;
          font-weight: 700;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .button-group {
          display: flex;
          gap: 6px;
        }

        .button-group .btn {
          flex: 1;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
        }

        .empty-icon {
          font-size: 64px;
          margin-bottom: 16px;
          opacity: 0.6;
        }

        .empty-text {
          font-size: 18px;
          font-weight: 600;
          color: #4b5563;
          margin: 0 0 8px 0;
        }

        .empty-subtext {
          font-size: 14px;
          color: #9ca3af;
          margin: 0;
        }

        @media (max-width: 1024px) {
          .stats-summary {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .container {
            padding: 20px 16px;
          }

          .page-header h1 {
            font-size: 28px;
          }

          .header-icon {
            font-size: 48px;
          }

          .stats-summary {
            grid-template-columns: 1fr;
          }

          .stat-box {
            padding: 20px;
          }

          .card-header {
            flex-direction: column;
            gap: 16px;
            align-items: flex-start;
            padding: 20px;
          }

          .btn {
            width: 100%;
          }

          .table-container {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }

          .table {
            min-width: 900px;
          }

          .table th,
          .table td {
            padding: 12px 16px;
            font-size: 13px;
          }
        }

        @media (max-width: 480px) {
          .page-header h1 {
            font-size: 24px;
          }

          .stat-value {
            font-size: 26px;
          }

          .card-title h2 {
            font-size: 20px;
          }

          .action-buttons {
            min-width: 180px;
          }
        }
      `}</style>
    </div>
  );
}