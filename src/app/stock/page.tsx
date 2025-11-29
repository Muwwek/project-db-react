'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { StockMovementSummary, StockMovementHistory } from '../../types/inventory';
import Navigation from '../../components/Navigation';
import '../../styles/stock.css';

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
      
      // เรียงลำดับ summary ตามสถานะสต็อก: หมด → ใกล้หมด → ปกติ
      const sortedSummary = (summaryRes.data || []).sort((a: StockMovementSummary, b: StockMovementSummary) => {
        const stockA = a.NetStock || a.StockQuantity || 0;
        const stockB = b.NetStock || b.StockQuantity || 0;
        const minStockA = a.MinStockLevel || 0;
        const minStockB = b.MinStockLevel || 0;
        
        // 1. สินค้าหมดสต็อก (stock = 0) - มาก่อน
        if (stockA === 0 && stockB !== 0) return -1;
        if (stockA !== 0 && stockB === 0) return 1;
        
        // 2. สินค้าใกล้หมด (stock <= minStock) - มาถัดไป
        if (stockA <= minStockA && stockB > minStockB) return -1;
        if (stockA > minStockA && stockB <= minStockB) return 1;
        
        // 3. เรียงตามจำนวนสต็อก (น้อยไปมาก)
        return stockA - stockB;
      });
      
      setSummary(sortedSummary);
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

  const getStockStatus = (item: StockMovementSummary) => {
    const stock = item.NetStock || item.StockQuantity || 0;
    const minStock = item.MinStockLevel || 0;
    
    if (stock === 0) return 'out-of-stock';
    if (stock <= minStock) return 'low-stock';
    return 'in-stock';
  };

  const getStockStatusText = (item: StockMovementSummary) => {
    const stock = item.NetStock || item.StockQuantity || 0;
    const minStock = item.MinStockLevel || 0;
    
    if (stock === 0) return '🔴 หมด';
    if (stock <= minStock) return '🟡 ใกล้หมด';
    return '🟢 ปกติ';
  };

  if (loading) {
    return (
      <div className="stock-container">
        <Navigation />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="stock-container">
      <Navigation />
      
      <main className="app-main">
        <div className="stock-content">
          <div className="stock-header">
            <div className="header-icon">📈</div>
            <h1>การเคลื่อนไหวสต็อก</h1>
            <p>ติดตามการรับเข้าและจ่ายออกสินค้า</p>
          </div>

          {error && (
            <div className="alert alert-error">
              <span className="alert-icon">⚠️</span>
              <span className="alert-message">{error}</span>
              <button onClick={fetchStockData} className="stock-btn stock-btn-sm stock-btn-retry">
                ลองอีกครั้ง
              </button>
            </div>
          )}

          <div className="stock-tabs">
            <button 
              className={`stock-tab ${activeTab === 'summary' ? 'stock-tab-active' : ''}`}
              onClick={() => setActiveTab('summary')}
            >
              <span className="stock-tab-icon">📊</span>
              <span>สรุปสต็อก</span>
            </button>
            <button 
              className={`stock-tab ${activeTab === 'history' ? 'stock-tab-active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              <span className="stock-tab-icon">📋</span>
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

              <div className="stock-card">
                <div className="stock-card-header">
                  <div className="stock-card-title">
                    <h2>สรุปการเคลื่อนไหวสต็อก</h2>
                    <p className="stock-card-subtitle">ภาพรวมการรับเข้าและจ่ายออกสินค้า (เรียงตามสถานะสต็อก)</p>
                  </div>
                  <button onClick={fetchStockData} className="stock-btn stock-btn-primary">
                    <span className="stock-btn-icon">🔄</span>
                    <span>อัพเดต</span>
                  </button>
                </div>

                <div className="table-container">
                  <table className="stock-table">
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
                            <span className={`net-number ${getStockStatus(item) === 'low-stock' ? 'low' : ''}`}>
                              {item.NetStock?.toLocaleString() || item.StockQuantity?.toLocaleString()}
                            </span>
                          </td>
                          <td className="text-center">
                            <span className={`stock-status-badge ${getStockStatus(item)}`}>
                              {getStockStatusText(item)}
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
            <div className="stock-card">
              <div className="stock-card-header">
                <div className="stock-card-title">
                  <h2>ประวัติการเคลื่อนไหวสต็อก</h2>
                  <p className="stock-card-subtitle">บันทึกการรับเข้าและจ่ายออกสินค้า</p>
                </div>
                <button onClick={fetchStockData} className="stock-btn stock-btn-primary">
                  <span className="stock-btn-icon">🔄</span>
                  <span>อัพเดต</span>
                </button>
              </div>

              <div className="table-container">
                <table className="stock-table">
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
    </div>
  );
}