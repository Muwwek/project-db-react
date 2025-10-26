'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Order, OrderDetails } from '../../types/inventory';
import Navigation from '../../components/Navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5001/api';

axios.defaults.baseURL = API_BASE;

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/orders');
      setOrders(response.data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('ไม่สามารถโหลดประวัติการขายได้');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetails = async (orderId: number) => {
    try {
      const response = await axios.get(`/orders/${orderId}`);
      setSelectedOrder(response.data);
    } catch (err) {
      console.error('Error fetching order details:', err);
      alert('ไม่สามารถโหลดรายละเอียดคำสั่งซื้อได้');
    }
  };

  const closeOrderDetails = () => {
    setSelectedOrder(null);
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
            <div className="header-icon">📋</div>
            <h1>ประวัติการขาย</h1>
            <p>รายการคำสั่งซื้อและใบเสร็จทั้งหมด</p>
          </div>

          {error && (
            <div className="alert alert-error">
              <span className="alert-icon">⚠️</span>
              <span className="alert-message">{error}</span>
              <button onClick={fetchOrders} className="btn btn-sm btn-retry">ลองอีกครั้ง</button>
            </div>
          )}

          <div className="stats-summary">
            <div className="stat-box stat-total">
              <div className="stat-icon-wrapper">
                <span className="stat-icon">📋</span>
              </div>
              <div className="stat-content">
                <div className="stat-label">คำสั่งซื้อทั้งหมด</div>
                <div className="stat-value">{orders.length}</div>
              </div>
            </div>
            <div className="stat-box stat-completed">
              <div className="stat-icon-wrapper">
                <span className="stat-icon">✅</span>
              </div>
              <div className="stat-content">
                <div className="stat-label">สำเร็จ</div>
                <div className="stat-value">
                  {orders.filter(o => o.Status === 'COMPLETED').length}
                </div>
              </div>
            </div>
            <div className="stat-box stat-pending">
              <div className="stat-icon-wrapper">
                <span className="stat-icon">⏳</span>
              </div>
              <div className="stat-content">
                <div className="stat-label">รอดำเนินการ</div>
                <div className="stat-value">
                  {orders.filter(o => o.Status !== 'COMPLETED').length}
                </div>
              </div>
            </div>
            <div className="stat-box stat-revenue">
              <div className="stat-icon-wrapper">
                <span className="stat-icon">💰</span>
              </div>
              <div className="stat-content">
                <div className="stat-label">รายได้ทั้งหมด</div>
                <div className="stat-value">
                  ฿{orders.reduce((sum, o) => sum + o.TotalAmount, 0).toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <h2>รายการคำสั่งซื้อ</h2>
                <p className="card-subtitle">ทั้งหมด {orders.length} รายการ</p>
              </div>
              <button onClick={fetchOrders} className="btn btn-primary">
                <span className="btn-icon">🔄</span>
                <span>รีเฟรช</span>
              </button>
            </div>

            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>เลขที่คำสั่งซื้อ</th>
                    <th>ลูกค้า</th>
                    <th>วันที่</th>
                    <th className="text-center">จำนวนสินค้า</th>
                    <th className="text-center">ยอดรวม</th>
                    <th className="text-center">สถานะ</th>
                    <th className="text-center">การดำเนินการ</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.OrderID} className="table-row-hover">
                      <td>
                        <div className="order-id-cell">
                          <span className="order-icon">🧾</span>
                          <span className="order-id">#{order.OrderID}</span>
                        </div>
                      </td>
                      <td>
                        <div className="customer-cell">
                          <span className="customer-icon">👤</span>
                          <span className="customer-name">{order.CustomerName}</span>
                        </div>
                      </td>
                      <td>
                        <div className="date-cell">
                          <div className="date-main">
                            {new Date(order.OrderDate).toLocaleDateString('th-TH', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                          <div className="date-time">
                            {new Date(order.OrderDate).toLocaleTimeString('th-TH', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </td>
                      <td className="text-center">
                        <span className="item-count-badge">{order.ItemCount} ชิ้น</span>
                      </td>
                      <td className="text-center">
                        <span className="total-amount-badge">฿{order.TotalAmount.toLocaleString()}</span>
                      </td>
                      <td className="text-center">
                        <span className={`status-badge ${order.Status === 'COMPLETED' ? 'completed' : 'pending'}`}>
                          {order.Status === 'COMPLETED' ? '✅ สำเร็จ' : '⏳ รอดำเนินการ'}
                        </span>
                      </td>
                      <td className="text-center">
                        <button
                          onClick={() => fetchOrderDetails(order.OrderID)}
                          className="btn btn-sm btn-detail"
                        >
                          <span className="btn-icon-sm">👁️</span>
                          <span>ดูรายละเอียด</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {orders.length === 0 && !loading && (
              <div className="empty-state">
                <div className="empty-icon">🛒</div>
                <p className="empty-text">ไม่พบประวัติการขาย</p>
                <p className="empty-subtext">ยังไม่มีรายการคำสั่งซื้อ</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {selectedOrder && (
        <div className="modal-overlay" onClick={closeOrderDetails}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <h2>รายละเอียดคำสั่งซื้อ #{selectedOrder.order.OrderID}</h2>
                <p className="modal-subtitle">ข้อมูลสินค้าและการชำระเงิน</p>
              </div>
              <button onClick={closeOrderDetails} className="btn btn-sm btn-close">
                <span>✕</span>
              </button>
            </div>
            <div className="modal-content">
              <div className="order-info-card">
                <div className="info-header">
                  <span className="info-icon">ℹ️</span>
                  <span>ข้อมูลคำสั่งซื้อ</span>
                </div>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">👤 ลูกค้า</span>
                    <span className="info-value">{selectedOrder.order.CustomerName}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">📅 วันที่</span>
                    <span className="info-value">
                      {new Date(selectedOrder.order.OrderDate).toLocaleDateString('th-TH', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">📊 สถานะ</span>
                    <span className={`status-badge ${selectedOrder.order.Status === 'COMPLETED' ? 'completed' : 'pending'}`}>
                      {selectedOrder.order.Status === 'COMPLETED' ? '✅ สำเร็จ' : '⏳ รอดำเนินการ'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="order-items-card">
                <div className="items-header">
                  <span className="items-icon">📦</span>
                  <span>รายการสินค้า</span>
                </div>
                <div className="items-list">
                  {selectedOrder.items.map((item, index) => (
                    <div key={item.OrderItemID} className="item-row">
                      <div className="item-number">{index + 1}</div>
                      <div className="item-details">
                        <div className="item-name">{item.ProductName}</div>
                        <div className="item-category">{item.CategoryName}</div>
                      </div>
                      <div className="item-pricing">
                        <div className="item-unit-price">฿{item.UnitPrice.toLocaleString()} × {item.Quantity}</div>
                        <div className="item-total-price">฿{(item.UnitPrice * item.Quantity).toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="order-total-card">
                <div className="total-row">
                  <span className="total-label">💰 ยอดรวมทั้งหมด</span>
                  <span className="total-value">฿{selectedOrder.order.TotalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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

        .stat-box.stat-completed {
          background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
          border-color: #6ee7b7;
        }

        .stat-box.stat-pending {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border-color: #fbbf24;
        }

        .stat-box.stat-revenue {
          background: linear-gradient(135deg, #e9d5ff 0%, #d8b4fe 100%);
          border-color: #c084fc;
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

        .btn:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .btn-primary {
          background: linear-gradient(135deg, #a78bfa 0%, #818cf8 100%);
          color: white;
        }

        .btn-detail {
          background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
          color: white;
        }

        .btn-close {
          background: linear-gradient(135deg, #f87171 0%, #ef4444 100%);
          color: white;
          width: 36px;
          height: 36px;
          padding: 0;
          border-radius: 50%;
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

        .btn-icon-sm {
          font-size: 14px;
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

        .order-id-cell {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .order-icon {
          font-size: 20px;
        }

        .order-id {
          font-weight: 700;
          color: #7c3aed;
          font-size: 15px;
        }

        .customer-cell {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .customer-icon {
          font-size: 20px;
        }

        .customer-name {
          font-weight: 600;
          color: #111827;
        }

        .date-cell {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .date-main {
          font-weight: 600;
          color: #374151;
        }

        .date-time {
          font-size: 12px;
          color: #9ca3af;
        }

        .item-count-badge {
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
          color: #1e40af;
          padding: 6px 14px;
          border-radius: 10px;
          font-weight: 700;
          border: 1px solid #93c5fd;
          display: inline-block;
        }

        .total-amount-badge {
          background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
          color: #065f46;
          padding: 6px 14px;
          border-radius: 10px;
          font-weight: 700;
          border: 1px solid #6ee7b7;
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

        .status-badge.completed {
          background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
          color: #065f46;
          border-color: #6ee7b7;
        }

        .status-badge.pending {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          color: #92400e;
          border-color: #fbbf24;
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

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
          backdrop-filter: blur(4px);
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .modal {
          background: white;
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
          max-width: 700px;
          width: 100%;
          max-height: 85vh;
          overflow-y: auto;
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 28px 32px;
          background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
          border-bottom: 2px solid #e9d5ff;
        }

        .modal-title h2 {
          margin: 0 0 4px 0;
          color: #581c87;
          font-size: 22px;
          font-weight: 700;
        }

        .modal-subtitle {
          margin: 0;
          font-size: 13px;
          color: #7c3aed;
          font-weight: 500;
        }

        .modal-content {
          padding: 24px 32px;
        }

        .order-info-card {
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
          border: 2px solid #93c5fd;
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 20px;
        }

        .info-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 700;
          color: #1e40af;
          margin-bottom: 16px;
          font-size: 16px;
        }

        .info-icon {
          font-size: 20px;
        }

        .info-grid {
          display: grid;
          gap: 12px;
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: white;
          border-radius: 10px;
          border: 1px solid #bfdbfe;
        }

        .info-label {
          font-weight: 600;
          color: #4b5563;
          font-size: 14px;
        }

        .info-value {
          font-weight: 700;
          color: #111827;
          font-size: 14px;
        }

        .order-items-card {
          background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%);
          border: 2px solid #c084fc;
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 20px;
        }

        .items-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 700;
          color: #6b21a8;
          margin-bottom: 16px;
          font-size: 16px;
        }

        .items-icon {
          font-size: 20px;
        }

        .items-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .item-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: white;
          border-radius: 12px;
          border: 1px solid #d8b4fe;
        }

        .item-number {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #a78bfa 0%, #818cf8 100%);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 14px;
          flex-shrink: 0;
        }

        .item-details {
          flex: 1;
        }

        .item-name {
          font-weight: 700;
          color: #111827;
          font-size: 15px;
          margin-bottom: 4px;
        }

        .item-category {
          font-size: 13px;
          color: #6b7280;
          font-weight: 500;
        }

        .item-pricing {
          text-align: right;
        }

        .item-unit-price {
          font-size: 13px;
          color: #6b7280;
          margin-bottom: 4px;
        }

        .item-total-price {
          font-size: 16px;
          font-weight: 800;
          color: #059669;
        }

        .order-total-card {
          background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
          border: 2px solid #6ee7b7;
          border-radius: 16px;
          padding: 20px;
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background: white;
          border-radius: 12px;
          border: 1px solid #a7f3d0;
        }

        .total-label {
          font-size: 16px;
          font-weight: 700;
          color: #065f46;
        }

        .total-value {
          font-size: 28px;
          font-weight: 800;
          color: #059669;
        }

        @media (max-width: 768px) {
          .container {
            padding: 20px 16px;
          }

          .page-header h1 {
            font-size: 28px;
          }

          .stats-summary {
            grid-template-columns: 1fr;
          }

          .card-header {
            flex-direction: column;
            gap: 16px;
            align-items: flex-start;
          }

          .table-container {
            overflow-x: scroll;
          }

          .table {
            min-width: 800px;
          }

          .modal {
            margin: 10px;
            max-height: 90vh;
          }

          .modal-header,
          .modal-content {
            padding: 20px;
          }

          .item-row {
            flex-direction: column;
            align-items: flex-start;
          }

          .item-pricing {
            text-align: left;
            width: 100%;
          }
        }
      `}</style>;
    </div>
  );
}