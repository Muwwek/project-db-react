'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'ภาพรวม', icon: '📊', color: '#8b5cf6', bg: '#f5f3ff' },
    { href: '/sell', label: 'ขายสินค้า', icon: '🛒', color: '#10b981', bg: '#ecfdf5' },
    { href: '/orders', label: 'ประวัติการขาย', icon: '📋', color: '#f59e0b', bg: '#fffbeb' },
    { href: '/products', label: 'จัดการสินค้า', icon: '📦', color: '#3b82f6', bg: '#eff6ff' },
    { href: '/stock', label: 'การเคลื่อนไหว', icon: '📈', color: '#ec4899', bg: '#fdf2f8' },
    { href: '/reports', label: 'รายงาน', icon: '📊', color: '#6366f1', bg: '#eef2ff' },
  ];

  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-header">
          <div className="nav-logo">
            <div className="logo-icon">📦</div>
            <div className="logo-text">
              <h1 className="nav-title">อันนาช้อปบึงกาฬ</h1>
              <p className="nav-subtitle">น้องมิสทีน กับ พี่พร</p>
            </div>
          </div>
        </div>
        
        <div className="nav-items">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item ${isActive ? 'nav-item-active' : ''}`}
                style={{
                  '--item-color': item.color,
                  '--item-bg': item.bg,
                } as React.CSSProperties}
              >
                <div className="nav-item-content">
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </div>
                {isActive && <div className="active-underline"></div>}
              </Link>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .navigation {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          position: sticky;
          top: 0;
          z-index: 1000;
        }
        .nav-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 24px;
        }
        .nav-header {
          padding: 20px 0 16px;
        }
        .nav-logo {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .logo-icon {
          font-size: 40px;
          background: rgba(255, 255, 255, 0.95);
          width: 64px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 16px;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
          border: 3px solid rgba(255, 255, 255, 0.5);
        }
        .logo-text {
          flex: 1;
        }
        .nav-title {
          font-size: 28px;
          font-weight: 700;
          color: white;
          margin: 0;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          letter-spacing: -0.5px;
        }
        .nav-subtitle {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.9);
          margin: 4px 0 0 0;
          font-weight: 500;
          letter-spacing: 0.3px;
        }
        .nav-items {
          display: flex;
          gap: 12px;
          padding-bottom: 0;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .nav-items::-webkit-scrollbar {
          display: none;
        }
        .nav-item {
          position: relative;
          text-decoration: none;
          white-space: nowrap;
          border-radius: 14px 14px 0 0;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          background: rgba(255, 255, 255, 0.15);
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-bottom: none;
          padding: 3px 3px 0 3px;
        }
        .nav-item-content {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px 14px 18px;
          border-radius: 11px 11px 0 0;
          background: rgba(255, 255, 255, 0.1);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .nav-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
          border-color: rgba(255, 255, 255, 0.5);
        }
        .nav-item:hover .nav-item-content {
          background: rgba(255, 255, 255, 0.2);
        }
        .nav-item-active {
          background: white;
          border-color: white;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
        }
        .nav-item-active .nav-item-content {
          background: var(--item-bg, #f3f4f6);
        }
        .nav-item-active:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        }
        .active-underline {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: var(--item-color, #667eea);
          animation: slideIn 0.3s ease-out;
        }
        @keyframes slideIn {
          from {
            transform: scaleX(0);
          }
          to {
            transform: scaleX(1);
          }
        }
        .nav-icon {
          font-size: 22px;
          display: flex;
          align-items: center;
          transition: transform 0.3s ease;
        }
        .nav-item:hover .nav-icon {
          transform: scale(1.15) rotate(5deg);
        }
        .nav-label {
          font-size: 15px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.95);
          transition: color 0.3s ease;
        }
        .nav-item-active .nav-label {
          color: var(--item-color, #374151);
        }

        @media (max-width: 768px) {
          .nav-container {
            padding: 0 16px;
          }
          .nav-header {
            padding: 16px 0 12px;
          }
          .logo-icon {
            width: 52px;
            height: 52px;
            font-size: 30px;
            border-radius: 14px;
          }
          .nav-title {
            font-size: 20px;
          }
          .nav-subtitle {
            font-size: 12px;
          }
          .nav-items {
            gap: 8px;
          }
          .nav-item {
            padding: 2px 2px 0 2px;
          }
          .nav-item-content {
            padding: 9px 14px 13px 14px;
          }
          .active-underline {
            height: 3px;
          }
          .nav-icon {
            font-size: 20px;
          }
          .nav-label {
            font-size: 14px;
          }
        }

        @media (max-width: 480px) {
          .nav-title {
            font-size: 18px;
          }
          .nav-subtitle {
            display: none;
          }
          .nav-items {
            gap: 6px;
          }
          .nav-item-content {
            padding: 8px 12px 12px 12px;
            gap: 6px;
          }
          .nav-icon {
            font-size: 18px;
          }
          .nav-label {
            font-size: 13px;
          }
        }
      `}</style>
    </nav>
  );
}