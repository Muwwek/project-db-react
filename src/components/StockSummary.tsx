'use client';

import { StockMovementSummary } from '../types/inventory';

interface StockSummaryProps {
  summary: StockMovementSummary[];
}

export default function StockSummary({ summary }: StockSummaryProps) {
  if (!summary || !Array.isArray(summary)) {
    return (
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold">สรุปการเคลื่อนไหวสต็อก</h2>
        </div>
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <p className="empty-text">ไม่พบข้อมูลการเคลื่อนไหว</p>
        </div>
      </div>
    );
  }

  // คำนวณสถิติทั้งหมด
  const totalStats = {
    totalIn: summary.reduce((acc, item) => acc + (item.TotalIn || 0), 0),
    totalOut: summary.reduce((acc, item) => acc + (item.TotalOut || 0), 0),
    totalInValue: summary.reduce((acc, item) => acc + (item.TotalInValue || 0), 0),
    totalOutValue: summary.reduce((acc, item) => acc + (item.TotalOutValue || 0), 0)
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">สรุปการเคลื่อนไหวสต็อก</h2>
            <p className="text-sm text-gray-600">รายงานสรุปสต็อกสินค้าทั้งหมด</p>
          </div>
          <div className="text-right">
            <div className="total-count">{summary.length}</div>
            <div className="total-label">รายการสินค้า</div>
          </div>
        </div>
      </div>
      
      <div className="summary-cards">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="summary-card in">
            <div className="card-icon">📥</div>
            <div className="card-content">
              <p className="card-label">รับเข้าทั้งหมด</p>
              <p className="card-value">
                {totalStats.totalIn.toLocaleString()}
              </p>
              <p className="card-subvalue">฿{totalStats.totalInValue.toLocaleString()}</p>
            </div>
          </div>
          
          <div className="summary-card out">
            <div className="card-icon">📤</div>
            <div className="card-content">
              <p className="card-label">จ่ายออกทั้งหมด</p>
              <p className="card-value">
                {totalStats.totalOut.toLocaleString()}
              </p>
              <p className="card-subvalue">฿{totalStats.totalOutValue.toLocaleString()}</p>
            </div>
          </div>
          
          <div className="summary-card value">
            <div className="card-icon">💰</div>
            <div className="card-content">
              <p className="card-label">มูลค่ารับเข้า</p>
              <p className="card-value">฿{totalStats.totalInValue.toLocaleString()}</p>
            </div>
          </div>

          <div className="summary-card revenue">
            <div className="card-icon">💵</div>
            <div className="card-content">
              <p className="card-label">รายได้รวม</p>
              <p className="card-value">฿{totalStats.totalOutValue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>สินค้า</th>
              <th>หมวดหมู่</th>
              <th>สต็อกปัจจุบัน</th>
              <th>รับเข้า</th>
              <th>จ่ายออก</th>
              <th>มูลค่ารับเข้า</th>
              <th>มูลค่าจ่ายออก</th>
              <th>สต็อกสุทธิ</th>
            </tr>
          </thead>
          <tbody>
            {summary.map((item, index) => (
              <tr key={index} className="table-row">
                <td>
                  <div className="product-info">
                    <div className="product-name">{item.ProductName}</div>
                  </div>
                </td>
                <td>
                  <span className="category-badge">{item.CategoryName}</span>
                </td>
                <td>
                  <div className="stock-quantity">{item.StockQuantity?.toLocaleString() || 0}</div>
                </td>
                <td>
                  <div className="movement-in">{item.TotalIn?.toLocaleString() || 0}</div>
                </td>
                <td>
                  <div className="movement-out">{item.TotalOut?.toLocaleString() || 0}</div>
                </td>
                <td>
                  <div className="value-in">฿{(item.TotalInValue || 0).toLocaleString()}</div>
                </td>
                <td>
                  <div className="value-out">฿{(item.TotalOutValue || 0).toLocaleString()}</div>
                </td>
                <td>
                  <div className={`net-stock ${(item.NetStock || 0) <= (item.MinStockLevel || 0) ? 'low-stock' : ''}`}>
                    {item.NetStock?.toLocaleString() || item.StockQuantity?.toLocaleString() || 0}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {summary.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <p className="empty-text">ไม่พบข้อมูลการเคลื่อนไหว</p>
            <p className="empty-subtext">ยังไม่มีรายการเคลื่อนไหวสต็อก</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .card {
          background: white;
          border-radius: 4px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          border: 1px solid #d1d5db;
          margin-bottom: 24px;
        }
        .card-header {
          padding: 24px;
          border-bottom: 2px solid #e5e7eb;
          background: linear-gradient(to bottom, #ffffff, #fafafa);
        }
        .summary-cards {
          padding: 24px;
          border-bottom: 2px solid #e5e7eb;
          background: #f8f9fa;
        }
        .summary-card {
          background: white;
          padding: 20px;
          border-radius: 4px;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
          border: 1px solid #d1d5db;
          display: flex;
          align-items: center;
        }
        .summary-card.in {
          border-left: 4px solid #16a34a;
          background: linear-gradient(to right, #f0fdf4, #ffffff);
        }
        .summary-card.out {
          border-left: 4px solid #dc2626;
          background: linear-gradient(to right, #fef2f2, #ffffff);
        }
        .summary-card.value {
          border-left: 4px solid #2563eb;
          background: linear-gradient(to right, #eff6ff, #ffffff);
        }
        .summary-card.revenue {
          border-left: 4px solid #16a34a;
          background: linear-gradient(to right, #f0fdf4, #dcfce7);
        }
        .card-icon {
          width: 52px;
          height: 52px;
          background: #f3f4f6;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 16px;
          font-size: 22px;
          border: 1px solid #e5e7eb;
        }
        .summary-card.in .card-icon {
          background: #16a34a;
          color: white;
          border: none;
        }
        .summary-card.out .card-icon {
          background: #dc2626;
          color: white;
          border: none;
        }
        .summary-card.value .card-icon {
          background: #2563eb;
          color: white;
          border: none;
        }
        .summary-card.revenue .card-icon {
          background: #16a34a;
          color: white;
          border: none;
        }
        .card-label {
          font-size: 14px;
          color: #6b7280;
          margin: 0;
          font-weight: 500;
        }
        .card-value {
          font-size: 22px;
          font-weight: 700;
          color: #111827;
          margin: 4px 0 0 0;
        }
        .card-subvalue {
          font-size: 13px;
          color: #6b7280;
          margin: 2px 0 0 0;
          font-weight: 500;
        }
        .summary-card.revenue .card-value {
          color: #16a34a;
        }
        .total-count {
          font-size: 36px;
          font-weight: 700;
          color: #1f2937;
        }
        .total-label {
          font-size: 14px;
          color: #6b7280;
          font-weight: 500;
        }
        .table-container {
          overflow-x: auto;
        }
        .table {
          width: 100%;
          border-collapse: collapse;
        }
        .table th {
          background: linear-gradient(to bottom, #f9fafb, #f3f4f6);
          padding: 14px 16px;
          text-align: left;
          font-weight: 600;
          color: #1f2937;
          border-bottom: 2px solid #d1d5db;
          font-size: 14px;
        }
        .table td {
          padding: 14px 16px;
          border-bottom: 1px solid #e5e7eb;
          font-size: 14px;
        }
        .table-row:hover {
          background-color: #f9fafb;
        }
        .product-info {
          display: flex;
          flex-direction: column;
        }
        .product-name {
          font-weight: 600;
          color: #1f2937;
        }
        .category-badge {
          background: #2563eb;
          color: white;
          padding: 4px 10px;
          border-radius: 3px;
          font-size: 12px;
          font-weight: 500;
          display: inline-block;
        }
        .stock-quantity {
          font-weight: 600;
          color: #1f2937;
        }
        .movement-in {
          color: #16a34a;
          font-weight: 600;
        }
        .movement-out {
          color: #dc2626;
          font-weight: 600;
        }
        .value-in {
          color: #2563eb;
          font-weight: 600;
        }
        .value-out {
          color: #16a34a;
          font-weight: 600;
        }
        .net-stock {
          font-weight: 700;
          color: #1f2937;
        }
        .net-stock.low-stock {
          color: #dc2626;
          font-weight: 700;
        }
        .empty-state {
          text-align: center;
          padding: 48px 20px;
        }
        .empty-icon {
          font-size: 64px;
          margin-bottom: 16px;
          color: #9ca3af;
        }
        .empty-text {
          color: #6b7280;
          font-size: 18px;
          margin-bottom: 8px;
          font-weight: 500;
        }
        .empty-subtext {
          color: #9ca3af;
          font-size: 14px;
        }

        @media (max-width: 768px) {
          .grid-cols-4 {
            grid-template-columns: 1fr;
          }
          .summary-card {
            padding: 16px;
          }
          .card-icon {
            width: 44px;
            height: 44px;
            margin-right: 12px;
            font-size: 18px;
          }
          .card-value {
            font-size: 20px;
          }
          .table {
            font-size: 13px;
          }
          .table th,
          .table td {
            padding: 10px 12px;
          }
        }
      `}</style>
    </div>
  );
}