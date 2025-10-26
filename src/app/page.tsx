'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Product, LowStockProduct, StockMovementSummary } from '../types/inventory';
import LowStockAlert from '../components/LowStockAlert';
import ProductList from '../components/ProductList';
import StockSummary from '../components/StockSummary';
import Navigation from '../components/Navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5001/api';

axios.defaults.baseURL = API_BASE;

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [summary, setSummary] = useState<StockMovementSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  const checkBackendStatus = async () => {
    try {
      await axios.get('/health');
      setBackendStatus('online');
      return true;
    } catch (err) {
      setBackendStatus('offline');
      return false;
    }
  };

  useEffect(() => {
    const initializeApp = async () => {
      const isBackendOnline = await checkBackendStatus();
      
      if (isBackendOnline) {
        await fetchData();
      } else {
        setError('Backend server is not available. Please make sure the backend is running on port 5001.');
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [productsRes, lowStockRes, summaryRes] = await Promise.all([
        axios.get('/products'),
        axios.get('/products/low-stock'),
        axios.get('/stock-movements/summary')
      ]);

      setProducts(productsRes.data || []);
      setLowStockProducts(lowStockRes.data || []);
      setSummary(summaryRes.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('ไม่สามารถโหลดข้อมูลได้');
      setProducts([]);
      setLowStockProducts([]);
      setSummary([]);
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
      
      await fetchData();
      alert(`เพิ่มสต็อกสินค้าเรียบร้อยแล้ว ${quantity} ชิ้น`);
    } catch (error) {
      console.error('Error adding stock:', error);
      alert('เกิดข้อผิดพลาดในการเพิ่มสต็อก');
    }
  };

  const getStatusColor = () => {
    switch (backendStatus) {
      case 'online': return '#10b981';
      case 'offline': return '#ef4444';
      default: return '#f59e0b';
    }
  };

  const getStatusText = () => {
    switch (backendStatus) {
      case 'online': return 'Backend Online';
      case 'offline': return 'Backend Offline';
      default: return 'Checking Status...';
    }
  };

  const totalStockValue = products.reduce((acc, product) => acc + (product.Price * product.StockQuantity), 0);
  const totalInValue = summary.reduce((acc, item) => acc + (item.TotalInValue || 0), 0);
  const totalOutValue = summary.reduce((acc, item) => acc + (item.TotalOutValue || 0), 0);
  const netRevenue = totalOutValue;

  if (loading) {
    return (
      <div className="app-container">
        <Navigation />
        <div className="loading-container">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <p className="loading-text">กำลังโหลดข้อมูล...</p>
            <div className="status-container">
              <div 
                className="status-dot" 
                style={{ backgroundColor: getStatusColor() }}
              ></div>
              <span className="status-text">{getStatusText()}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container">
        <Navigation />
        <div className="error-container">
          <div className="error-content">
            <div className="error-icon">⚠️</div>
            <h2 className="error-title">เกิดข้อผิดพลาด</h2>
            <p className="error-message">{error}</p>
            <div className="alert alert-warning">
              <p>💡 ตรวจสอบว่า backend กำลังทำงานอยู่ที่ port 5001</p>
            </div>
            <div className="button-group">
              <button onClick={fetchData} className="btn btn-primary">
                ลองอีกครั้ง
              </button>
              <button onClick={() => window.location.reload()} className="btn btn-secondary">
                รีเฟรชหน้า
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Navigation />
      
      <main className="app-main">
        <div className="container">
          <div className="dashboard-header">
            <div className="header-content">
              <div className="header-left">
                <h1 className="app-title">ภาพรวมระบบ</h1>
                <p className="app-subtitle">Dashboard Overview</p>
              </div>
              <div className="header-right">
                <div className="status-info">
                  <div 
                    className="status-dot" 
                    style={{ backgroundColor: getStatusColor() }}
                  ></div>
                  <span className="status-text">{getStatusText()}</span>
                </div>
                <p className="product-count-label">สินค้าทั้งหมด</p>
                <p className="product-count">{products.length} รายการ</p>
              </div>
            </div>
          </div>

          <div className="value-stats">
            <div className="value-card value-card-1">
              <div className="value-icon">💰</div>
              <div className="value-content">
                <div className="value-label">มูลค่าสต็อกปัจจุบัน</div>
                <div className="value-amount">฿{totalStockValue.toLocaleString()}</div>
              </div>
            </div>
            <div className="value-card value-card-2">
              <div className="value-icon">📥</div>
              <div className="value-content">
                <div className="value-label">มูลค่ารับเข้า</div>
                <div className="value-amount">฿{totalInValue.toLocaleString()}</div>
              </div>
            </div>
            <div className="value-card value-card-3">
              <div className="value-icon">📤</div>
              <div className="value-content">
                <div className="value-label">มูลค่าจ่ายออก</div>
                <div className="value-amount">฿{totalOutValue.toLocaleString()}</div>
              </div>
            </div>
            <div className="value-card value-card-revenue">
              <div className="value-icon">💵</div>
              <div className="value-content">
                <div className="value-label">รายได้รวม</div>
                <div className="value-amount">฿{netRevenue.toLocaleString()}</div>
              </div>
            </div>
          </div>

          <LowStockAlert products={lowStockProducts} onAddStock={addStock} />
          
          <div className="dashboard-grid">
            <div className="main-content">
              <div className="section-spacing">
                <ProductList products={products} onAddStock={addStock} />
              </div>
              <StockSummary summary={summary} />
            </div>
            
            <div className="sidebar">
              <div className="quick-stats">
                <h3>สถิติด่วน</h3>
                <div className="stat-item">
                  <span className="stat-label">สินค้าทั้งหมด</span>
                  <span className="stat-value">{products.length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">สินค้าใกล้หมด</span>
                  <span className="stat-value warning">{lowStockProducts.length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">มูลค่าสต็อก</span>
                  <span className="stat-value">฿{totalStockValue.toLocaleString()}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">รายได้รวม</span>
                  <span className="stat-value success">฿{netRevenue.toLocaleString()}</span>
                </div>
              </div>

              <div className="quick-actions">
                <h3>การดำเนินการด่วน</h3>
                <div className="action-buttons">
                  <a href="/products" className="btn btn-primary">
                    📦 จัดการสินค้า
                  </a>
                  <a href="/stock" className="btn btn-secondary">
                    📈 ดูการเคลื่อนไหว
                  </a>
                  <button onClick={fetchData} className="btn btn-success">
                    🔄 อัพเดตข้อมูล
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        /* ===== BASE STYLES ===== */
        .app-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #fff1f2 0%, #fef3f3 25%, #f0f9ff 50%, #fef7f0 75%, #fef3f3 100%);
          position: relative;
        }

        .app-container::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 20% 20%, rgba(251, 207, 232, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(191, 219, 254, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(254, 215, 170, 0.2) 0%, transparent 50%);
          pointer-events: none;
          z-index: 0;
        }

        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 20px;
          position: relative;
          z-index: 1;
        }

        .app-main {
          padding: 0 0 48px 0;
        }

        /* ===== HEADER STYLES ===== */
        .dashboard-header {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(254, 243, 243, 0.95) 100%);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 32px 36px;
          margin: 24px 0 32px 0;
          box-shadow: 
            0 10px 30px rgba(251, 113, 133, 0.15),
            0 4px 15px rgba(147, 51, 234, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);
          border: 2px solid rgba(251, 207, 232, 0.6);
          position: relative;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .dashboard-header::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle, rgba(251, 207, 232, 0.4) 0%, transparent 70%);
          pointer-events: none;
        }

        .dashboard-header::after {
          content: '';
          position: absolute;
          bottom: -50%;
          left: -50%;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle, rgba(191, 219, 254, 0.3) 0%, transparent 70%);
          pointer-events: none;
        }

        .dashboard-header:hover {
          transform: translateY(-2px);
          box-shadow: 
            0 15px 40px rgba(251, 113, 133, 0.2),
            0 6px 20px rgba(147, 51, 234, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
          z-index: 1;
        }

        .header-left {
          flex: 1;
        }

        .app-title {
          font-size: 36px;
          font-weight: 900;
          background: linear-gradient(135deg, #ec4899 0%, #db2777 25%, #8b5cf6 50%, #7c3aed 75%, #3b82f6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0;
          letter-spacing: -1px;
          text-shadow: 0 2px 10px rgba(236, 72, 153, 0.2);
          animation: gradientShift 8s ease infinite;
          background-size: 200% 200%;
        }

        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .app-subtitle {
          font-size: 16px;
          color: #94a3b8;
          margin: 6px 0 0 0;
          font-weight: 600;
          letter-spacing: 0.5px;
        }

        .header-right {
          text-align: right;
        }

        .status-info {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          margin-bottom: 10px;
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.6);
          border-radius: 20px;
          backdrop-filter: blur(5px);
        }

        .status-dot {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          margin-right: 10px;
          animation: pulse 2s ease-in-out infinite;
          box-shadow: 0 0 10px currentColor;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }

        .status-text {
          font-size: 14px;
          color: #64748b;
          font-weight: 600;
        }

        .product-count-label {
          font-size: 14px;
          color: #94a3b8;
          margin: 0 0 4px 0;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .product-count {
          font-size: 28px;
          font-weight: 800;
          background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0;
          letter-spacing: -0.5px;
        }

        /* ===== VALUE STATS CARDS ===== */
        .value-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
          margin-bottom: 32px;
        }

        .value-card {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(254, 243, 243, 0.95) 100%);
          backdrop-filter: blur(10px);
          padding: 28px;
          border-radius: 20px;
          box-shadow: 
            0 8px 24px rgba(0, 0, 0, 0.08),
            0 2px 8px rgba(0, 0, 0, 0.04),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);
          border: 2px solid rgba(251, 207, 232, 0.5);
          display: flex;
          align-items: center;
          gap: 20px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .value-card::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle, rgba(251, 207, 232, 0.3) 0%, transparent 70%);
          pointer-events: none;
          transition: transform 0.6s ease;
        }

        .value-card:hover {
          transform: translateY(-6px) scale(1.02);
          box-shadow: 
            0 16px 40px rgba(0, 0, 0, 0.12),
            0 4px 15px rgba(0, 0, 0, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);
        }

        .value-card:hover::before {
          transform: scale(1.8) rotate(45deg);
        }

        .value-card-1 {
          background: linear-gradient(135deg, rgba(254, 243, 243, 0.95) 0%, rgba(252, 231, 243, 0.95) 100%);
          border-color: rgba(251, 113, 133, 0.6);
        }

        .value-card-1:hover {
          border-color: rgba(251, 113, 133, 0.9);
          box-shadow: 
            0 16px 40px rgba(251, 113, 133, 0.25),
            0 4px 15px rgba(251, 113, 133, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);
        }

        .value-card-2 {
          background: linear-gradient(135deg, rgba(240, 249, 255, 0.95) 0%, rgba(219, 234, 254, 0.95) 100%);
          border-color: rgba(96, 165, 250, 0.6);
        }

        .value-card-2:hover {
          border-color: rgba(96, 165, 250, 0.9);
          box-shadow: 
            0 16px 40px rgba(96, 165, 250, 0.25),
            0 4px 15px rgba(96, 165, 250, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);
        }

        .value-card-3 {
          background: linear-gradient(135deg, rgba(254, 247, 240, 0.95) 0%, rgba(254, 215, 170, 0.95) 100%);
          border-color: rgba(251, 146, 60, 0.6);
        }

        .value-card-3:hover {
          border-color: rgba(251, 146, 60, 0.9);
          box-shadow: 
            0 16px 40px rgba(251, 146, 60, 0.25),
            0 4px 15px rgba(251, 146, 60, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);
        }

        .value-card-revenue {
          background: linear-gradient(135deg, rgba(240, 253, 244, 0.95) 0%, rgba(209, 250, 229, 0.95) 100%);
          border: 2px solid rgba(52, 211, 153, 0.7);
        }

        .value-card-revenue:hover {
          border-color: rgba(52, 211, 153, 1);
          box-shadow: 
            0 16px 40px rgba(16, 185, 129, 0.3),
            0 4px 15px rgba(52, 211, 153, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);
        }

        .value-icon {
          font-size: 42px;
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, rgba(252, 231, 243, 0.8) 0%, rgba(251, 207, 232, 0.8) 100%);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 
            0 8px 20px rgba(251, 113, 133, 0.2),
            inset 0 2px 8px rgba(255, 255, 255, 0.5);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          z-index: 1;
        }

        .value-card:hover .value-icon {
          transform: scale(1.15) rotate(8deg);
          box-shadow: 
            0 12px 28px rgba(251, 113, 133, 0.3),
            inset 0 2px 8px rgba(255, 255, 255, 0.5);
        }

        .value-card-1 .value-icon {
          background: linear-gradient(135deg, rgba(252, 231, 243, 0.9) 0%, rgba(251, 207, 232, 0.9) 100%);
        }

        .value-card-2 .value-icon {
          background: linear-gradient(135deg, rgba(219, 234, 254, 0.9) 0%, rgba(191, 219, 254, 0.9) 100%);
          box-shadow: 
            0 8px 20px rgba(96, 165, 250, 0.2),
            inset 0 2px 8px rgba(255, 255, 255, 0.5);
        }

        .value-card-3 .value-icon {
          background: linear-gradient(135deg, rgba(254, 215, 170, 0.9) 0%, rgba(253, 186, 116, 0.9) 100%);
          box-shadow: 
            0 8px 20px rgba(251, 146, 60, 0.2),
            inset 0 2px 8px rgba(255, 255, 255, 0.5);
        }

        .value-card-revenue .value-icon {
          background: linear-gradient(135deg, rgba(209, 250, 229, 0.9) 0%, rgba(167, 243, 208, 0.9) 100%);
          color: #059669;
          box-shadow: 
            0 8px 20px rgba(16, 185, 129, 0.25),
            inset 0 2px 8px rgba(255, 255, 255, 0.5);
        }

        .value-content {
          flex: 1;
          position: relative;
          z-index: 1;
        }

        .value-label {
          font-size: 13px;
          color: #64748b;
          margin-bottom: 8px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1.2px;
        }

        .value-amount {
          font-size: 32px;
          font-weight: 900;
          color: #1e293b;
          letter-spacing: -1px;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .value-card-revenue .value-amount {
          color: #059669;
          text-shadow: 0 2px 10px rgba(16, 185, 129, 0.3);
        }

        /* ===== DASHBOARD GRID ===== */
        .dashboard-grid {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 28px;
        }

        .main-content {
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        .sidebar {
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        .section-spacing {
          margin-bottom: 0;
        }

        /* ===== QUICK STATS & ACTIONS ===== */
        .quick-stats,
        .quick-actions {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(254, 243, 243, 0.95) 100%);
          backdrop-filter: blur(10px);
          padding: 28px;
          border-radius: 20px;
          box-shadow: 
            0 8px 24px rgba(0, 0, 0, 0.08),
            0 2px 8px rgba(0, 0, 0, 0.04),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);
          border: 2px solid rgba(251, 207, 232, 0.5);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .quick-stats::before,
        .quick-actions::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #ec4899 0%, #8b5cf6 50%, #3b82f6 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .quick-stats:hover,
        .quick-actions:hover {
          transform: translateY(-4px);
          box-shadow: 
            0 16px 40px rgba(0, 0, 0, 0.12),
            0 4px 15px rgba(0, 0, 0, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);
          border-color: rgba(251, 113, 133, 0.8);
        }

        .quick-stats:hover::before,
        .quick-actions:hover::before {
          opacity: 1;
        }

        .quick-stats h3,
        .quick-actions h3 {
          margin: 0 0 24px 0;
          background: linear-gradient(135deg, #ec4899 0%, #db2777 25%, #8b5cf6 50%, #7c3aed 75%, #3b82f6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-size: 22px;
          font-weight: 900;
          letter-spacing: -0.5px;
          text-transform: uppercase;
        }

        .stat-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-radius: 12px;
          margin-bottom: 10px;
          background: linear-gradient(90deg, transparent 0%, rgba(251, 207, 232, 0.15) 100%);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid transparent;
        }

        .stat-item:hover {
          background: linear-gradient(90deg, rgba(251, 207, 232, 0.2) 0%, rgba(251, 207, 232, 0.35) 100%);
          transform: translateX(6px);
          border-color: rgba(251, 113, 133, 0.4);
          box-shadow: 0 4px 12px rgba(251, 113, 133, 0.15);
        }

        .stat-item:last-child {
          margin-bottom: 0;
        }

        .stat-label {
          color: #64748b;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.3px;
        }

        .stat-value {
          font-weight: 800;
          color: #1e293b;
          font-size: 20px;
          letter-spacing: -0.5px;
        }

        .stat-value.warning {
          color: #f43f5e;
          text-shadow: 0 0 15px rgba(244, 63, 94, 0.4);
          animation: warningPulse 2s ease-in-out infinite;
        }

        @keyframes warningPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .stat-value.success {
          color: #10b981;
          text-shadow: 0 0 15px rgba(16, 185, 129, 0.4);
        }

        /* ===== ACTION BUTTONS ===== */
        .action-buttons {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 16px 24px;
          border: none;
          border-radius: 14px;
          cursor: pointer;
          font-size: 15px;
          font-weight: 800;
          text-decoration: none;
          text-align: center;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .btn::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.4);
          transform: translate(-50%, -50%);
          transition: width 0.6s, height 0.6s;
        }

        .btn:hover::before {
          width: 400px;
          height: 400px;
        }

        .btn:active {
          transform: scale(0.95);
        }

        .btn-primary {
          background: linear-gradient(135deg, #ec4899 0%, #db2777 25%, #8b5cf6 75%, #7c3aed 100%);
          color: white;
          box-shadow: 0 6px 18px rgba(236, 72, 153, 0.4);
        }

        .btn-primary:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 12px 28px rgba(236, 72, 153, 0.5);
        }

        .btn-secondary {
          background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #2563eb 100%);
          color: white;
          box-shadow: 0 6px 18px rgba(59, 130, 246, 0.4);
        }

        .btn-secondary:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 12px 28px rgba(59, 130, 246, 0.5);
        }

        .btn-success {
          background: linear-gradient(135deg, #34d399 0%, #10b981 50%, #059669 100%);
          color: white;
          box-shadow: 0 6px 18px rgba(16, 185, 129, 0.4);
        }

        .btn-success:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 12px 28px rgba(16, 185, 129, 0.5);
        }

        /* ===== LOADING STYLES ===== */
        .loading-container {
          min-height: 60vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .loading-content {
          text-align: center;
          padding: 40px;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(254, 243, 243, 0.95) 100%);
          backdrop-filter: blur(10px);
          border-radius: 24px;
          box-shadow: 
            0 12px 36px rgba(0, 0, 0, 0.12),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);
          border: 2px solid rgba(251, 207, 232, 0.6);
        }

        .loading-spinner {
          width: 60px;
          height: 60px;
          border: 5px solid rgba(251, 207, 232, 0.3);
          border-top: 5px solid #ec4899;
          border-right: 5px solid #8b5cf6;
          border-bottom: 5px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
          margin: 0 auto 24px;
          box-shadow: 0 4px 16px rgba(236, 72, 153, 0.3);
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .loading-text {
          color: #64748b;
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 20px;
          letter-spacing: 0.3px;
        }

        .status-container {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 12px 24px;
          background: rgba(255, 255, 255, 0.6);
          border-radius: 20px;
          backdrop-filter: blur(5px);
        }

        /* ===== ERROR STYLES ===== */
        .error-container {
          min-height: 60vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .error-content {
          text-align: center;
          max-width: 500px;
          padding: 40px;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(254, 243, 243, 0.95) 100%);
          backdrop-filter: blur(10px);
          border-radius: 24px;
          box-shadow: 
            0 12px 36px rgba(244, 63, 94, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);
          border: 2px solid rgba(244, 63, 94, 0.4);
        }

        .error-icon {
          font-size: 72px;
          margin-bottom: 20px;
          animation: errorShake 0.5s ease-in-out;
        }

        @keyframes errorShake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }

        .error-title {
          font-size: 28px;
          font-weight: 800;
          background: linear-gradient(135deg, #f43f5e 0%, #ef4444 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 12px;
          letter-spacing: -0.5px;
        }

        .error-message {
          color: #64748b;
          font-size: 16px;
          margin-bottom: 20px;
          line-height: 1.6;
          font-weight: 600;
        }

        .button-group {
          display: flex;
          gap: 14px;
          justify-content: center;
          margin-top: 24px;
          flex-wrap: wrap;
        }

        .alert {
          padding: 16px 20px;
          border-radius: 14px;
          margin-bottom: 20px;
          backdrop-filter: blur(10px);
        }

        .alert-warning {
          background: linear-gradient(135deg, rgba(255, 251, 235, 0.95) 0%, rgba(254, 243, 199, 0.95) 100%);
          border: 2px solid rgba(245, 158, 11, 0.5);
          color: #d97706;
          font-weight: 700;
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);
        }

        .alert-warning p {
          margin: 0;
          line-height: 1.6;
        }

        /* ===== RESPONSIVE DESIGN ===== */
        @media (max-width: 1200px) {
          .dashboard-grid {
            grid-template-columns: 1fr 320px;
            gap: 24px;
          }
        }

        @media (max-width: 1024px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
          
          .sidebar {
            order: -1;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 24px;
          }
        }

        @media (max-width: 768px) {
          .container {
            padding: 0 16px;
          }

          .dashboard-header {
            padding: 24px 20px;
            border-radius: 16px;
          }

          .header-content {
            flex-direction: column;
            text-align: center;
            gap: 20px;
          }

          .header-left {
            width: 100%;
          }

          .header-right {
            text-align: center;
            width: 100%;
          }

          .status-info {
            justify-content: center;
          }

          .app-title {
            font-size: 28px;
          }

          .value-stats {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .value-card {
            padding: 20px;
          }

          .value-icon {
            width: 65px;
            height: 65px;
            font-size: 32px;
          }

          .value-amount {
            font-size: 24px;
          }

          .button-group {
            flex-direction: column;
          }

          .sidebar {
            grid-template-columns: 1fr;
          }

          .quick-stats,
          .quick-actions {
            padding: 20px;
          }
        }

        @media (max-width: 480px) {
          .dashboard-header {
            padding: 20px 16px;
          }

          .app-title {
            font-size: 24px;
          }

          .app-subtitle {
            font-size: 14px;
          }

          .product-count {
            font-size: 24px;
          }

          .value-card {
            padding: 16px;
            gap: 14px;
          }

          .value-icon {
            width: 55px;
            height: 55px;
            font-size: 28px;
          }

          .value-label {
            font-size: 12px;
          }

          .value-amount {
            font-size: 20px;
          }

          .quick-stats h3,
          .quick-actions h3 {
            font-size: 18px;
          }

          .btn {
            padding: 14px 20px;
            font-size: 14px;
          }

          .loading-content,
          .error-content {
            padding: 28px 20px;
          }
        }

        /* ===== UTILITY ANIMATIONS ===== */
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .value-card,
        .quick-stats,
        .quick-actions {
          animation: fadeIn 0.6s ease-out;
        }

        .value-card:nth-child(1) { animation-delay: 0.1s; }
        .value-card:nth-child(2) { animation-delay: 0.2s; }
        .value-card:nth-child(3) { animation-delay: 0.3s; }
        .value-card:nth-child(4) { animation-delay: 0.4s; }

        /* ===== PRINT STYLES ===== */
        @media print {
          .app-container {
            background: white;
          }

          .dashboard-header,
          .value-card,
          .quick-stats,
          .quick-actions {
            box-shadow: none;
            border: 1px solid #e5e7eb;
          }

          .btn {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}