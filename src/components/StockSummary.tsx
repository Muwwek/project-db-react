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
        <div className="header-content">
          <div className="header-text">
            <h2 className="header-title">สรุปการเคลื่อนไหวสต็อก</h2>
            <p className="header-subtitle">รายงานสรุปสต็อกสินค้าทั้งหมด</p>
          </div>
          <div className="header-stats">
            <div className="total-count">{summary.length}</div>
            <div className="total-label">รายการสินค้า</div>
          </div>
        </div>
      </div>
      
      <div className="summary-cards">
        <div className="grid-container">
          <div className="summary-card in">
            <div className="card-icon-wrapper">
              <div className="card-icon">📥</div>
            </div>
            <div className="card-content">
              <p className="card-label">รับเข้าทั้งหมด</p>
              <p className="card-value">
                {totalStats.totalIn.toLocaleString()}
              </p>
              <p className="card-subvalue">฿{totalStats.totalInValue.toLocaleString()}</p>
            </div>
          </div>
          
          <div className="summary-card out">
            <div className="card-icon-wrapper">
              <div className="card-icon">📤</div>
            </div>
            <div className="card-content">
              <p className="card-label">จ่ายออกทั้งหมด</p>
              <p className="card-value">
                {totalStats.totalOut.toLocaleString()}
              </p>
              <p className="card-subvalue">฿{totalStats.totalOutValue.toLocaleString()}</p>
            </div>
          </div>
          
          <div className="summary-card value">
            <div className="card-icon-wrapper">
              <div className="card-icon">💰</div>
            </div>
            <div className="card-content">
              <p className="card-label">มูลค่ารับเข้า</p>
              <p className="card-value">฿{totalStats.totalInValue.toLocaleString()}</p>
            </div>
          </div>

          <div className="summary-card revenue">
            <div className="card-icon-wrapper">
              <div className="card-icon">💵</div>
            </div>
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
              <th className="text-center">สต็อกปัจจุบัน</th>
              <th className="text-center">รับเข้า</th>
              <th className="text-center">จ่ายออก</th>
              <th className="text-center">มูลค่ารับเข้า</th>
              <th className="text-center">มูลค่าจ่ายออก</th>
              <th className="text-center">สต็อกสุทธิ</th>
            </tr>
          </thead>
          <tbody>
            {summary.map((item, index) => (
              <tr key={index} className="table-row">
                <td>
                  <div className="product-info">
                    <div className="product-icon">📦</div>
                    <div className="product-name">{item.ProductName}</div>
                  </div>
                </td>
                <td>
                  <span className="category-badge">{item.CategoryName}</span>
                </td>
                <td className="text-center">
                  <div className="stock-quantity">{item.StockQuantity?.toLocaleString() || 0}</div>
                </td>
                <td className="text-center">
                  <div className="movement-in">
                    <span className="movement-icon">📥</span>
                    {item.TotalIn?.toLocaleString() || 0}
                  </div>
                </td>
                <td className="text-center">
                  <div className="movement-out">
                    <span className="movement-icon">📤</span>
                    {item.TotalOut?.toLocaleString() || 0}
                  </div>
                </td>
                <td className="text-center">
                  <div className="value-in">฿{(item.TotalInValue || 0).toLocaleString()}</div>
                </td>
                <td className="text-center">
                  <div className="value-out">฿{(item.TotalOutValue || 0).toLocaleString()}</div>
                </td>
                <td className="text-center">
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
          border-radius: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          border: 2px solid #e5e7eb;
          margin-bottom: 32px;
          overflow: hidden;
          animation: fadeIn 0.5s ease;
        }

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

        .card-header {
          padding: 28px 32px;
          background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
          border-bottom: 2px solid #e9d5ff;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-text {
          flex: 1;
        }

        .header-title {
          margin: 0 0 4px 0;
          color: #581c87;
          font-size: 24px;
          font-weight: 700;
        }

        .header-subtitle {
          margin: 0;
          font-size: 14px;
          color: #7c3aed;
          font-weight: 500;
        }

        .header-stats {
          text-align: right;
          background: white;
          padding: 16px 24px;
          border-radius: 12px;
          border: 2px solid #e9d5ff;
          box-shadow: 0 2px 8px rgba(124, 58, 237, 0.1);
        }

        .total-count {
          font-size: 40px;
          font-weight: 800;
          background: linear-gradient(135deg, #7c3aed 0%, #2563eb 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1;
          margin-bottom: 4px;
        }

        .total-label {
          font-size: 13px;
          color: #6b7280;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .summary-cards {
          padding: 24px 32px;
          background: linear-gradient(135deg, #fef3f0 0%, #f0f9ff 100%);
          border-bottom: 2px solid #e9d5ff;
        }

        .grid-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }

        .summary-card {
          background: white;
          padding: 24px;
          border-radius: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          border: 2px solid;
          display: flex;
          align-items: center;
          gap: 16px;
          transition: all 0.3s ease;
          animation: slideUp 0.5s ease;
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

        .summary-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
        }

        .summary-card.in {
          background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
          border-color: #6ee7b7;
        }

        .summary-card.out {
          background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
          border-color: #fca5a5;
        }

        .summary-card.value {
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
          border-color: #93c5fd;
        }

        .summary-card.revenue {
          background: linear-gradient(135deg, #d1fae5 0%, #6ee7b7 100%);
          border-color: #10b981;
        }

        .card-icon-wrapper {
          flex-shrink: 0;
        }

        .card-icon {
          width: 64px;
          height: 64px;
          background: white;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 30px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease;
        }

        .summary-card:hover .card-icon {
          transform: scale(1.1) rotate(5deg);
        }

        .card-content {
          flex: 1;
        }

        .card-label {
          font-size: 13px;
          color: #4b5563;
          margin: 0 0 6px 0;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .card-value {
          font-size: 28px;
          font-weight: 800;
          color: #111827;
          margin: 0 0 4px 0;
          line-height: 1;
        }

        .card-subvalue {
          font-size: 14px;
          color: #6b7280;
          margin: 0;
          font-weight: 600;
        }

        .summary-card.revenue .card-value {
          color: #059669;
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

        .table th.text-center {
          text-align: center;
        }

        .table td {
          padding: 20px;
          color: #374151;
          font-size: 14px;
          border-bottom: 1px solid #f3f4f6;
        }

        .table td.text-center {
          text-align: center;
        }

        .table-row {
          transition: all 0.2s ease;
        }

        .table-row:hover {
          background: linear-gradient(135deg, #fef3f0 0%, #faf5ff 100%);
        }

        .product-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .product-icon {
          font-size: 24px;
          flex-shrink: 0;
        }

        .product-name {
          font-weight: 700;
          color: #111827;
          font-size: 15px;
        }

        .category-badge {
          background: linear-gradient(135deg, #a78bfa 0%, #818cf8 100%);
          color: white;
          padding: 6px 14px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 700;
          display: inline-block;
          border: 1px solid #8b5cf6;
          box-shadow: 0 2px 6px rgba(124, 58, 237, 0.2);
        }

        .stock-quantity {
          font-weight: 700;
          color: #111827;
          font-size: 15px;
          background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
          padding: 8px 16px;
          border-radius: 8px;
          display: inline-block;
          border: 1px solid #d1d5db;
        }

        .movement-in,
        .movement-out {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 14px;
        }

        .movement-in {
          color: #065f46;
          background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
          border: 1px solid #6ee7b7;
        }

        .movement-out {
          color: #991b1b;
          background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
          border: 1px solid #fca5a5;
        }

        .movement-icon {
          font-size: 16px;
        }

        .value-in {
          color: #1e40af;
          font-weight: 700;
          font-size: 15px;
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
          padding: 8px 16px;
          border-radius: 8px;
          display: inline-block;
          border: 1px solid #93c5fd;
        }

        .value-out {
          color: #065f46;
          font-weight: 700;
          font-size: 15px;
          background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
          padding: 8px 16px;
          border-radius: 8px;
          display: inline-block;
          border: 1px solid #6ee7b7;
        }

        .net-stock {
          font-weight: 800;
          color: #111827;
          font-size: 16px;
          background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
          padding: 10px 18px;
          border-radius: 10px;
          display: inline-block;
          border: 2px solid #d1d5db;
        }

        .net-stock.low-stock {
          color: #991b1b;
          background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
          border-color: #fca5a5;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
        }

        .empty-icon {
          font-size: 64px;
          margin-bottom: 16px;
          opacity: 0.5;
          filter: grayscale(50%);
        }

        .empty-text {
          color: #4b5563;
          font-size: 18px;
          margin: 0 0 8px 0;
          font-weight: 600;
        }

        .empty-subtext {
          color: #9ca3af;
          font-size: 14px;
          margin: 0;
        }

        @media (max-width: 768px) {
          .card-header {
            padding: 20px;
          }

          .header-content {
            flex-direction: column;
            gap: 16px;
            align-items: flex-start;
          }

          .header-stats {
            width: 100%;
            text-align: center;
          }

          .summary-cards {
            padding: 20px;
          }

          .grid-container {
            grid-template-columns: 1fr;
          }

          .summary-card {
            padding: 20px;
          }

          .card-icon {
            width: 56px;
            height: 56px;
            font-size: 26px;
          }

          .card-value {
            font-size: 24px;
          }

          .table-container {
            overflow-x: scroll;
          }

          .table {
            min-width: 1000px;
          }

          .table th,
          .table td {
            padding: 12px 16px;
            font-size: 13px;
          }
        }
      `}</style>
    </div>
  );
}