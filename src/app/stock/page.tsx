'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { StockMovementSummary, StockMovementHistory } from '../../types/inventory';
import Navigation from '../../components/Navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5001/api';

axios.defaults.baseURL = API_BASE;

export default function StockPage() {
  const [summary, setSummary] = useState<StockMovementSummary[]>([]);
  const [history, setHistory] = useState<StockMovementHistory[]>([]);
  const [activeTab, setActiveTab] = useState<'summary' | 'history'>('summary');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStockData();
  }, []);

  const fetchStockData = async () => {
    try {
      setLoading(true);
      const [summaryRes, historyRes] = await Promise.all([
        axios.get('/stock-movements/summary'),
        axios.get('/stock-movements/history')
      ]);
      setSummary(summaryRes.data || []);
      setHistory(historyRes.data || []);
    } catch (err) {
      console.error('Error fetching stock data:', err);
      setError('ไม่สามารถโหลดข้อมูลการเคลื่อนไหวได้');
    } finally {
      setLoading(false);
    }
  };

  const getMovementTypeColor = (type: string) => {
    return type === 'IN' ? 'movement-in' : 'movement-out';
  };

  const getMovementTypeText = (type: string) => {
    return type === 'IN' ? 'รับเข้า' : 'จ่ายออก';
  };

  const getMovementIcon = (type: string) => {
    return type === 'IN' ? '📥' : '📤';
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
            <div className="header-icon">📈</div>
            <h1>การเคลื่อนไหวสต็อก</h1>
            <p>ติดตามการรับเข้าและจ่ายออกสินค้า</p>
          </div>

          {error && (
            <div className="alert alert-error">
              <span className="alert-icon">⚠️</span>
              <span className="alert-message">{error}</span>
              <button onClick={fetchStockData} className="btn btn-sm btn-retry">ลองอีกครั้ง</button>
            </div>
          )}

          <div className="tabs">
            <button 
              className={`tab ${activeTab === 'summary' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('summary')}
            >
              <span className="tab-icon">📊</span>
              <span>สรุปสต็อก</span>
            </button>
            <button 
              className={`tab ${activeTab === 'history' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              <span className="tab-icon">📋</span>
              <span>ประวัติการเคลื่อนไหว</span>
            </button>
          </div>

          {activeTab === 'summary' && (
            <>
              <div className="stats-grid">
                <div className="stat-card stat-card-blue">
                  <div className="stat-icon-container">
                    <div className="stat-icon">📥</div>
                  </div>
                  <div className="stat-content">
                    <div className="stat-label">รับเข้าทั้งหมด</div>
                    <div className="stat-value">
                      {summary.reduce((acc, item) => acc + (item.TotalIn || 0), 0).toLocaleString()}
                    </div>
                    <div className="stat-unit">ชิ้น</div>
                  </div>
                </div>
                
                <div className="stat-card stat-card-purple">
                  <div className="stat-icon-container">
                    <div className="stat-icon">📤</div>
                  </div>
                  <div className="stat-content">
                    <div className="stat-label">จ่ายออกทั้งหมด</div>
                    <div className="stat-value">
                      {summary.reduce((acc, item) => acc + (item.TotalOut || 0), 0).toLocaleString()}
                    </div>
                    <div className="stat-unit">ชิ้น</div>
                  </div>
                </div>
                
                <div className="stat-card stat-card-green">
                  <div className="stat-icon-container">
                    <div className="stat-icon">📦</div>
                  </div>
                  <div className="stat-content">
                    <div className="stat-label">รายการสินค้า</div>
                    <div className="stat-value">{summary.length}</div>
                    <div className="stat-unit">รายการ</div>
                  </div>
                </div>

                <div className="stat-card stat-card-orange">
                  <div className="stat-icon-container">
                    <div className="stat-icon">💰</div>
                  </div>
                  <div className="stat-content">
                    <div className="stat-label">มูลค่ารับเข้า</div>
                    <div className="stat-value">
                      ฿{summary.reduce((acc, item) => acc + ((item.TotalIn || 0) * (item.Price || 0)), 0).toLocaleString()}
                    </div>
                    <div className="stat-unit">บาท</div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <div className="card-title">
                    <h2>สรุปการเคลื่อนไหวสต็อก</h2>
                    <p className="card-subtitle">ภาพรวมการรับเข้าและจ่ายออกสินค้า</p>
                  </div>
                  <button onClick={fetchStockData} className="btn btn-primary">
                    <span className="btn-icon">🔄</span>
                    <span>อัพเดต</span>
                  </button>
                </div>

                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>สินค้า</th>
                        <th>หมวดหมู่</th>
                        <th className="text-center">สต็อกปัจจุบัน</th>
                        <th className="text-center">รับเข้า</th>
                        <th className="text-center">จ่ายออก</th>
                        <th className="text-center">สต็อกสุทธิ</th>
                        <th className="text-center">สถานะ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary.map((item, index) => (
                        <tr key={index} className="table-row-hover">
                          <td>
                            <div className="product-cell">
                              <div className="product-icon">📦</div>
                              <span className="product-name">{item.ProductName}</span>
                            </div>
                          </td>
                          <td>
                            <span className="category-badge">{item.CategoryName}</span>
                          </td>
                          <td className="text-center">
                            <span className="stock-number">{item.StockQuantity?.toLocaleString()}</span>
                          </td>
                          <td className="text-center">
                            <span className="in-number">{item.TotalIn?.toLocaleString()}</span>
                          </td>
                          <td className="text-center">
                            <span className="out-number">{item.TotalOut?.toLocaleString()}</span>
                          </td>
                          <td className="text-center">
                            <span className={`net-number ${(item.NetStock || 0) <= (item.MinStockLevel || 0) ? 'low' : ''}`}>
                              {item.NetStock?.toLocaleString() || item.StockQuantity?.toLocaleString()}
                            </span>
                          </td>
                          <td className="text-center">
                            <span className={`status-badge ${
                              (item.NetStock || item.StockQuantity || 0) === 0 ? 'out-of-stock' :
                              (item.NetStock || item.StockQuantity || 0) <= (item.MinStockLevel || 0) ? 'low-stock' : 'in-stock'
                            }`}>
                              {(item.NetStock || item.StockQuantity || 0) === 0 ? '🔴 หมด' :
                              (item.NetStock || item.StockQuantity || 0) <= (item.MinStockLevel || 0) ? '🟡 ใกล้หมด' : '🟢 ปกติ'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {summary.length === 0 && !loading && (
                  <div className="empty-state">
                    <div className="empty-icon">📈</div>
                    <p className="empty-text">ไม่พบข้อมูลการเคลื่อนไหว</p>
                    <p className="empty-subtext">ยังไม่มีรายการเคลื่อนไหวสต็อก</p>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'history' && (
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <h2>ประวัติการเคลื่อนไหวสต็อก</h2>
                  <p className="card-subtitle">บันทึกการรับเข้าและจ่ายออกสินค้า</p>
                </div>
                <button onClick={fetchStockData} className="btn btn-primary">
                  <span className="btn-icon">🔄</span>
                  <span>อัพเดต</span>
                </button>
              </div>

              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>วันที่</th>
                      <th>สินค้า</th>
                      <th className="text-center">ประเภท</th>
                      <th className="text-center">จำนวน</th>
                      <th className="text-center">สต็อกก่อน</th>
                      <th className="text-center">สต็อกหลัง</th>
                      <th>หมายเหตุ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((item) => (
                      <tr key={item.MovementID} className="table-row-hover">
                        <td>
                          <div className="date-cell">
                            {new Date(item.MovementDate).toLocaleDateString('th-TH', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                            <span className="time-text">
                              {new Date(item.MovementDate).toLocaleTimeString('th-TH', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="product-cell">
                            <div className="product-icon">📦</div>
                            <span className="product-name">{item.ProductName}</span>
                          </div>
                        </td>
                        <td className="text-center">
                          <span className={`movement-badge ${getMovementTypeColor(item.MovementType)}`}>
                            {getMovementIcon(item.MovementType)} {getMovementTypeText(item.MovementType)}
                          </span>
                        </td>
                        <td className="text-center">
                          <span className={item.MovementType === 'IN' ? 'in-number' : 'out-number'}>
                            {item.Quantity.toLocaleString()}
                          </span>
                        </td>
                        <td className="text-center">
                          <span className="stock-number">{item.PreviousStock.toLocaleString()}</span>
                        </td>
                        <td className="text-center">
                          <span className="stock-number">{item.NewStock.toLocaleString()}</span>
                        </td>
                        <td>
                          <span className="notes-text">{item.Notes || '-'}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {history.length === 0 && !loading && (
                <div className="empty-state">
                  <div className="empty-icon">📋</div>
                  <p className="empty-text">ไม่พบประวัติการเคลื่อนไหว</p>
                  <p className="empty-subtext">ยังไม่มีรายการเคลื่อนไหวสต็อก</p>
                </div>
              )}
            </div>
          )}
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

        .tabs {
          display: flex;
          background: white;
          padding: 8px;
          border-radius: 16px;
          margin-bottom: 32px;
          border: 2px solid #e5e7eb;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
          gap: 8px;
        }

        .tab {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 14px 24px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 15px;
          color: #6b7280;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .tab-icon {
          font-size: 20px;
        }

        .tab:hover:not(.tab-active) {
          background: #f9fafb;
          color: #374151;
        }

        .tab-active {
          background: linear-gradient(135deg, #a78bfa 0%, #818cf8 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
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

        .stat-card {
          background: white;
          border-radius: 20px;
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 20px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
          transition: all 0.3s ease;
          border: 2px solid transparent;
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
        }

        .stat-card-blue {
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
          border-color: #93c5fd;
        }

        .stat-card-purple {
          background: linear-gradient(135deg, #e9d5ff 0%, #d8b4fe 100%);
          border-color: #c084fc;
        }

        .stat-card-green {
          background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
          border-color: #6ee7b7;
        }

        .stat-card-orange {
          background: linear-gradient(135deg, #fed7aa 0%, #fdba74 100%);
          border-color: #fb923c;
        }

        .stat-icon-container {
          width: 70px;
          height: 70px;
          background: white;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .stat-icon {
          font-size: 36px;
        }

        .stat-content {
          flex: 1;
        }

        .stat-label {
          font-size: 14px;
          font-weight: 600;
          color: #4b5563;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-value {
          font-size: 32px;
          font-weight: 800;
          color: #111827;
          line-height: 1;
        }

        .stat-unit {
          font-size: 13px;
          color: #6b7280;
          margin-top: 4px;
          font-weight: 500;
        }

        .card {
          background: white;
          border-radius: 20px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
          margin-bottom: 32px;
          border: 2px solid #e5e7eb;
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
          font-size: 24px;
          font-weight: 700;
          color: #581c87;
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
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(139, 92, 246, 0.4);
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

        .table th:first-child {
          border-top-left-radius: 0;
        }

        .table th:last-child {
          border-top-right-radius: 0;
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

        .product-icon {
          font-size: 20px;
        }

        .product-name {
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

        .stock-number {
          font-weight: 600;
          color: #4b5563;
          padding: 4px 12px;
          background: #f3f4f6;
          border-radius: 8px;
          display: inline-block;
        }

        .in-number {
          font-weight: 700;
          color: #059669;
          padding: 4px 12px;
          background: #d1fae5;
          border-radius: 8px;
          display: inline-block;
        }

        .out-number {
          font-weight: 700;
          color: #dc2626;
          padding: 4px 12px;
          background: #fee2e2;
          border-radius: 8px;
          display: inline-block;
        }

        .net-number {
          font-weight: 700;
          color: #2563eb;
          padding: 4px 12px;
          background: #dbeafe;
          border-radius: 8px;
          display: inline-block;
        }

        .net-number.low {
          color: #d97706;
          background: #fed7aa;
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

        .movement-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 700;
          border: 2px solid;
        }

        .movement-badge.movement-in {
          background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
          color: #065f46;
          border-color: #6ee7b7;
        }

        .movement-badge.movement-out {
          background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
          color: #991b1b;
          border-color: #f87171;
        }

        .date-cell {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .time-text {
          font-size: 12px;
          color: #9ca3af;
          font-weight: 500;
        }

        .notes-text {
          color: #6b7280;
          font-size: 13px;
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
          .stats-grid {
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

          .tabs {
            flex-direction: column;
            gap: 8px;
          }

          .tab {
            padding: 12px 16px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .stat-card {
            padding: 20px;
          }

          .stat-icon-container {
            width: 60px;
            height: 60px;
          }

          .stat-icon {
            font-size: 30px;
          }

          .stat-value {
            font-size: 26px;
          }

          .card-header {
            flex-direction: column;
            gap: 16px;
            align-items: flex-start;
            padding: 20px;
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
        }

        @media (max-width: 480px) {
          .page-header h1 {
            font-size: 24px;
          }

          .stat-value {
            font-size: 22px;
          }

          .card-title h2 {
            font-size: 20px;
          }

          .btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}