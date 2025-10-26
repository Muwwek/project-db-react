'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Product, StockMovementSummary } from '../../types/inventory';
import Navigation from '../../components/Navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5001/api';

axios.defaults.baseURL = API_BASE;

export default function ReportsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [summary, setSummary] = useState<StockMovementSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const [productsRes, summaryRes] = await Promise.all([
        axios.get('/products'),
        axios.get('/stock-movements/summary')
      ]);
      setProducts(productsRes.data || []);
      setSummary(summaryRes.data || []);
    } catch (err) {
      console.error('Error fetching report data:', err);
      setError('ไม่สามารถโหลดข้อมูลรายงานได้');
    } finally {
      setLoading(false);
    }
  };

  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.StockQuantity <= p.ReorderLevel).length;
  const outOfStockProducts = products.filter(p => p.StockQuantity === 0).length;
  const totalStockValue = products.reduce((acc, product) => acc + (product.Price * product.StockQuantity), 0);
  const totalIn = summary.reduce((acc, item) => acc + (item.TotalIn || 0), 0);
  const totalOut = summary.reduce((acc, item) => acc + (item.TotalOut || 0), 0);

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
            <div className="header-icon">📊</div>
            <h1>รายงานสรุป</h1>
            <p>รายงานสรุปและสถิติต่างๆ ของระบบ</p>
          </div>

          {error && (
            <div className="alert alert-error">
              <span className="alert-icon">⚠️</span>
              <span className="alert-message">{error}</span>
              <button onClick={fetchReportData} className="btn btn-sm btn-retry">ลองอีกครั้ง</button>
            </div>
          )}

          <div className="reports-grid">
            <div className="report-card large">
              <div className="report-header">
                <div className="report-title">
                  <h2>📊 สรุปภาพรวม</h2>
                  <p className="report-subtitle">ภาพรวมสถิติสินค้าคงคลัง</p>
                </div>
                <button onClick={fetchReportData} className="btn btn-primary btn-sm">
                  <span className="btn-icon">🔄</span>
                  <span>อัพเดต</span>
                </button>
              </div>
              <div className="stats-grid">
                <div className="stat-item stat-blue">
                  <div className="stat-icon-container">
                    <div className="stat-icon">📦</div>
                  </div>
                  <div className="stat-content">
                    <div className="stat-label">สินค้าทั้งหมด</div>
                    <div className="stat-value">{totalProducts}</div>
                    <div className="stat-unit">รายการ</div>
                  </div>
                </div>
                <div className="stat-item stat-yellow">
                  <div className="stat-icon-container">
                    <div className="stat-icon">⚠️</div>
                  </div>
                  <div className="stat-content">
                    <div className="stat-label">สินค้าใกล้หมด</div>
                    <div className="stat-value">{lowStockProducts}</div>
                    <div className="stat-unit">รายการ</div>
                  </div>
                </div>
                <div className="stat-item stat-red">
                  <div className="stat-icon-container">
                    <div className="stat-icon">🔴</div>
                  </div>
                  <div className="stat-content">
                    <div className="stat-label">สินค้าหมด</div>
                    <div className="stat-value">{outOfStockProducts}</div>
                    <div className="stat-unit">รายการ</div>
                  </div>
                </div>
                <div className="stat-item stat-green">
                  <div className="stat-icon-container">
                    <div className="stat-icon">💰</div>
                  </div>
                  <div className="stat-content">
                    <div className="stat-label">มูลค่าสต็อก</div>
                    <div className="stat-value">฿{totalStockValue.toLocaleString()}</div>
                    <div className="stat-unit">บาท</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="report-card movement-card">
              <div className="report-header">
                <div className="report-title">
                  <h3>📈 การเคลื่อนไหว</h3>
                  <p className="report-subtitle-sm">สรุปการรับเข้า-จ่ายออก</p>
                </div>
              </div>
              <div className="movement-stats">
                <div className="movement-item movement-in">
                  <div className="movement-icon-wrapper">
                    <div className="movement-icon">📥</div>
                  </div>
                  <div className="movement-content">
                    <div className="movement-label">รับเข้าทั้งหมด</div>
                    <div className="movement-value">{totalIn.toLocaleString()}</div>
                    <div className="movement-unit">ชิ้น</div>
                  </div>
                </div>
                <div className="movement-item movement-out">
                  <div className="movement-icon-wrapper">
                    <div className="movement-icon">📤</div>
                  </div>
                  <div className="movement-content">
                    <div className="movement-label">จ่ายออกทั้งหมด</div>
                    <div className="movement-value">{totalOut.toLocaleString()}</div>
                    <div className="movement-unit">ชิ้น</div>
                  </div>
                </div>
                <div className="movement-net">
                  <div className="net-label">สุทธิ</div>
                  <div className="net-value">{(totalIn - totalOut).toLocaleString()}</div>
                </div>
              </div>
            </div>

            <div className="report-card">
              <div className="report-header">
                <div className="report-title">
                  <h3>🎯 สินค้าใกล้หมด</h3>
                  <p className="report-subtitle-sm">ต้องเติมสต็อก</p>
                </div>
              </div>
              <div className="low-stock-list">
                {products
                  .filter(p => p.StockQuantity <= p.ReorderLevel)
                  .slice(0, 5)
                  .map(product => (
                    <div key={product.ProductID} className="low-stock-item">
                      <div className="item-left">
                        <div className="item-icon">📦</div>
                        <div className="item-info">
                          <div className="product-name">{product.ProductName}</div>
                          <div className="product-category">{product.CategoryName}</div>
                        </div>
                      </div>
                      <div className="stock-info">
                        <span className="stock-quantity">{product.StockQuantity}</span>
                        <span className="stock-separator">/</span>
                        <span className="reorder-level">{product.ReorderLevel}</span>
                      </div>
                    </div>
                  ))}
                {products.filter(p => p.StockQuantity <= p.ReorderLevel).length === 0 && (
                  <div className="empty-message">
                    <div className="empty-icon">✨</div>
                    <p>ไม่มีสินค้าใกล้หมด</p>
                  </div>
                )}
              </div>
            </div>

            <div className="report-card">
              <div className="report-header">
                <div className="report-title">
                  <h3>💎 สินค้ามูลค่าสูง</h3>
                  <p className="report-subtitle-sm">Top 5 มูลค่าสต็อก</p>
                </div>
              </div>
              <div className="high-value-list">
                {products
                  .sort((a, b) => (b.Price * b.StockQuantity) - (a.Price * a.StockQuantity))
                  .slice(0, 5)
                  .map((product, index) => (
                    <div key={product.ProductID} className="high-value-item">
                      <div className="rank-badge">{index + 1}</div>
                      <div className="item-left">
                        <div className="item-icon">📦</div>
                        <div className="item-info">
                          <div className="product-name">{product.ProductName}</div>
                          <div className="product-qty">{product.StockQuantity.toLocaleString()} ชิ้น</div>
                        </div>
                      </div>
                      <div className="value-info">
                        ฿{(product.Price * product.StockQuantity).toLocaleString()}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <h2>📋 รายงานสินค้าทั้งหมด</h2>
                <p className="card-subtitle">รายละเอียดสินค้าคงคลังแบบเต็ม</p>
              </div>
              <button onClick={() => window.print()} className="btn btn-primary">
                <span className="btn-icon">🖨️</span>
                <span>พิมพ์รายงาน</span>
              </button>
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
                    <th className="text-center">มูลค่าสต็อก</th>
                    <th className="text-center">สถานะ</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.ProductID} className="table-row-hover">
                      <td>
                        <div className="product-cell">
                          <div className="product-icon-sm">📦</div>
                          <span className="product-name-bold">{product.ProductName}</span>
                        </div>
                      </td>
                      <td>
                        <span className="category-badge">{product.CategoryName}</span>
                      </td>
                      <td className="text-center">
                        <span className="price-tag">฿{product.Price.toLocaleString()}</span>
                      </td>
                      <td className="text-center">
                        <span className="stock-number">{product.StockQuantity.toLocaleString()}</span>
                      </td>
                      <td className="text-center">
                        <span className="reorder-number">{product.ReorderLevel}</span>
                      </td>
                      <td className="text-center">
                        <span className="value-tag">฿{(product.Price * product.StockQuantity).toLocaleString()}</span>
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
          margin-bottom: 40px;
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

        .reports-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
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

        .report-card {
          background: white;
          border-radius: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          border: 2px solid #e5e7eb;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .report-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .report-card.large {
          grid-column: 1 / 3;
        }

        .report-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
          border-bottom: 2px solid #e9d5ff;
        }

        .report-title h2, .report-title h3 {
          margin: 0 0 4px 0;
          color: #581c87;
          font-weight: 700;
        }

        .report-title h2 {
          font-size: 22px;
        }

        .report-title h3 {
          font-size: 18px;
        }

        .report-subtitle {
          margin: 0;
          font-size: 14px;
          color: #7c3aed;
          font-weight: 500;
        }

        .report-subtitle-sm {
          margin: 0;
          font-size: 12px;
          color: #7c3aed;
          font-weight: 500;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          padding: 24px;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          border-radius: 16px;
          transition: all 0.3s ease;
        }

        .stat-item:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        }

        .stat-item.stat-blue {
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
          border: 2px solid #93c5fd;
        }

        .stat-item.stat-yellow {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border: 2px solid #fbbf24;
        }

        .stat-item.stat-red {
          background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
          border: 2px solid #f87171;
        }

        .stat-item.stat-green {
          background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
          border: 2px solid #6ee7b7;
        }

        .stat-icon-container {
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
          font-size: 28px;
          font-weight: 800;
          color: #111827;
          line-height: 1;
        }

        .stat-unit {
          font-size: 12px;
          color: #6b7280;
          margin-top: 2px;
          font-weight: 500;
        }

        .movement-card {
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
        }

        .movement-stats {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .movement-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          border-radius: 14px;
          transition: all 0.3s ease;
        }

        .movement-item:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .movement-item.movement-in {
          background: white;
          border: 2px solid #86efac;
          box-shadow: 0 4px 12px rgba(34, 197, 94, 0.15);
        }

        .movement-item.movement-out {
          background: white;
          border: 2px solid #fca5a5;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.15);
        }

        .movement-icon-wrapper {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .movement-item.movement-in .movement-icon-wrapper {
          background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
        }

        .movement-item.movement-out .movement-icon-wrapper {
          background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
        }

        .movement-icon {
          font-size: 24px;
        }

        .movement-content {
          flex: 1;
        }

        .movement-label {
          font-size: 13px;
          font-weight: 600;
          color: #4b5563;
          margin-bottom: 4px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .movement-value {
          font-size: 24px;
          font-weight: 800;
          line-height: 1;
        }

        .movement-item.movement-in .movement-value {
          color: #059669;
        }

        .movement-item.movement-out .movement-value {
          color: #dc2626;
        }

        .movement-unit {
          font-size: 12px;
          color: #6b7280;
          margin-top: 2px;
          font-weight: 500;
        }

        .movement-net {
          background: white;
          border: 2px solid #c084fc;
          border-radius: 14px;
          padding: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 4px 12px rgba(168, 85, 247, 0.15);
        }

        .net-label {
          font-size: 14px;
          font-weight: 700;
          color: #7c3aed;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .net-value {
          font-size: 26px;
          font-weight: 800;
          color: #6b21a8;
        }

        .low-stock-list, .high-value-list {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .low-stock-item, .high-value-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px;
          border-radius: 12px;
          background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
          border: 2px solid #fde68a;
          transition: all 0.3s ease;
        }

        .low-stock-item:hover, .high-value-item:hover {
          box-shadow: 0 2px 8px rgba(251, 191, 36, 0.15);
        }

        .high-value-item {
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
          border-color: #86efac;
        }

        .item-left {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }

        .item-icon {
          font-size: 24px;
        }

        .item-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .product-name {
          font-weight: 600;
          color: #111827;
          font-size: 14px;
        }

        .product-category {
          font-size: 12px;
          color: #6b7280;
          font-weight: 500;
        }

        .product-qty {
          font-size: 12px;
          color: #059669;
          font-weight: 600;
        }

        .stock-info {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 14px;
        }

        .stock-quantity {
          font-weight: 800;
          color: #dc2626;
          font-size: 18px;
        }

        .stock-separator {
          color: #9ca3af;
          font-weight: 600;
        }

        .reorder-level {
          color: #6b7280;
          font-weight: 600;
        }

        .value-info {
          color: #059669;
          font-weight: 800;
          font-size: 16px;
          white-space: nowrap;
        }

        .rank-badge {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          color: white;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 16px;
          box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
        }

        .empty-message {
          text-align: center;
          padding: 40px 20px;
        }

        .empty-icon {
          font-size: 48px;
          margin-bottom: 12px;
        }

        .empty-message p {
          color: #9ca3af;
          font-size: 14px;
          font-style: italic;
          margin: 0;
        }

        .card {
          background: white;
          border-radius: 20px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
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

        .btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: none;
          border-radius: 12px;
          padding: 12px 24px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .btn-primary {
          background: linear-gradient(135deg, #a78bfa 0%, #818cf8 100%);
          color: white;
        }

        .btn-primary:hover {
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
        }

        .btn-retry {
          background: #fee2e2;
          color: #991b1b;
        }

        .btn-retry:hover {
          background: #fecaca;
        }

        .btn-sm {
          padding: 8px 16px;
          font-size: 13px;
        }

        .btn-icon {
          font-size: 16px;
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
          padding: 16px 20px;
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

        .product-cell {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .product-icon-sm {
          font-size: 20px;
        }

        .product-name-bold {
          font-weight: 600;
          color: #111827;
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
          padding: 4px 12px;
          background: #f3e8ff;
          border-radius: 8px;
          display: inline-block;
        }

        .stock-number {
          font-weight: 600;
          color: #4b5563;
          padding: 4px 12px;
          background: #f3f4f6;
          border-radius: 8px;
          display: inline-block;
        }

        .reorder-number {
          font-weight: 600;
          color: #d97706;
          padding: 4px 12px;
          background: #fef3c7;
          border-radius: 8px;
          display: inline-block;
        }

        .value-tag {
          font-weight: 700;
          color: #059669;
          padding: 4px 12px;
          background: #d1fae5;
          border-radius: 8px;
          display: inline-block;
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

        @media (max-width: 1200px) {
          .reports-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .report-card.large {
            grid-column: 1 / 3;
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

          .reports-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .report-card.large {
            grid-column: 1;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .report-header {
            flex-direction: column;
            gap: 16px;
            align-items: flex-start;
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
            justify-content: center;
          }

          .table-container {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }

          .table {
            min-width: 800px;
          }

          .table th,
          .table td {
            padding: 12px 16px;
            font-size: 13px;
          }

          .stat-value {
            font-size: 24px;
          }

          .movement-value {
            font-size: 20px;
          }
        }

        @media (max-width: 480px) {
          .page-header h1 {
            font-size: 24px;
          }

          .stat-item {
            padding: 16px;
          }

          .stat-icon-container {
            width: 50px;
            height: 50px;
          }

          .stat-icon {
            font-size: 24px;
          }

          .stat-value {
            font-size: 20px;
          }

          .card-title h2 {
            font-size: 20px;
          }

          .low-stock-item, .high-value-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .stock-info, .value-info {
            align-self: flex-end;
          }
        }

        @media print {
          .btn, .alert, .movement-card, .report-card:not(.large) {
            display: none !important;
          }

          .app-container {
            background: white;
          }

          .reports-grid {
            display: block;
          }

          .report-card.large {
            margin-bottom: 20px;
            box-shadow: none;
            border: 1px solid #000;
          }

          .card {
            box-shadow: none;
            border: 1px solid #000;
            page-break-inside: avoid;
          }

          .table {
            font-size: 12px;
          }

          .table th,
          .table td {
            padding: 8px 12px;
          }

          .page-header {
            margin-bottom: 20px;
          }

          .header-icon {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}