//src/components/Navigation.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  // "navItems" data is perfect, we'll keep it as is.
  // The pastel 'bg' and 'color' are used for the active state.
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
                {/* We removed the active-underline div for a cleaner "pill" style */}
              </Link>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        /* --- Base & Header --- */
        .navigation {
          background: #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          border-bottom: 1px solid #e5e7eb; /* Light border for formal look */
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
          padding: 16px 0;
        }
        .nav-logo {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .logo-icon {
          font-size: 32px;
          background: #eef2ff; /* Soft pastel background (from reports) */
          color: #6366f1;
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 14px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.04);
          border: none;
        }
        .nav-title {
          font-size: 24px;
          font-weight: 600;
          color: #1f2937; /* Dark text for formality */
          margin: 0;
        }
        .nav-subtitle {
          font-size: 14px;
          color: #6b7281; /* Medium-gray text */
          margin: 4px 0 0 0;
          font-weight: 400;
        }
        
        /* --- Navigation Items (Tabs) --- */
        .nav-items {
          display: flex;
          gap: 8px; /* Spacing between items */
          padding-bottom: 12px; /* Space from bottom edge */
          overflow-x: auto;
          scrollbar-width: none;
        }
        .nav-items::-webkit-scrollbar {
          display: none;
        }

        /* --- Individual Nav Item (Link) --- */
        .nav-item {
          text-decoration: none;
          white-space: nowrap;
          border-radius: 12px; /* Rounded corners for the pill */
          transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        /* The "pill" content area */
        .nav-item-content {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          border-radius: 12px; /* Match the link */
          transition: background-color 0.3s ease, box-shadow 0.3s ease;
        }
        
        /* --- Inactive State --- */
        .nav-icon {
          font-size: 20px;
          color: #6b7281; /* Gray icon */
          transition: color 0.3s ease, transform 0.3s ease;
        }
        .nav-label {
          font-size: 15px;
          font-weight: 500;
          color: #4b5563; /* Darker gray text */
          transition: color 0.3s ease;
        }
        
        /* --- Hover State (Inactive) --- */
        .nav-item:not(.nav-item-active):hover .nav-item-content {
          background: #f3f4f6; /* Light gray hover */
        }
        .nav-item:not(.nav-item-active):hover .nav-label {
          color: #1f2937;
        }
        
        /* --- Active State --- */
        .nav-item-active .nav-item-content {
          background: var(--item-bg, #f3f4f6); /* Pastel background from props */
          box-shadow: 0 4px 10px -2px rgba(0, 0, 0, 0.06);
        }
        .nav-item-active .nav-icon {
          color: var(--item-color, #374151); /* Pastel text color from props */
        }
        .nav-item-active .nav-label {
          color: var(--item-color, #374151); /* Pastel text color from props */
          font-weight: 600; /* Bold active label */
        }
        
        /* Subtle hover/active animations */
        .nav-item:hover {
          transform: translateY(-1px);
        }
        .nav-item-active {
          pointer-events: none; /* Disable click on active item */
        }
        .nav-item-active .nav-icon {
           transform: scale(1.05);
        }

        /* --- Responsive --- */
        @media (max-width: 768px) {
          .nav-container {
            padding: 0 16px;
          }
          .nav-header {
            padding: 12px 0 8px;
          }
          .logo-icon {
            width: 48px;
            height: 48px;
            font-size: 28px;
            border-radius: 12px;
          }
          .nav-title {
            font-size: 20px;
          }
          .nav-subtitle {
            font-size: 13px;
          }
          .nav-items {
            gap: 6px;
            padding-bottom: 10px;
          }
          .nav-item-content {
            padding: 8px 12px;
          }
          .nav-icon {
            font-size: 18px;
          }
          .nav-label {
            font-size: 14px;
          }
        }

        @media (max-width: 480px) {
          .nav-subtitle {
            display: none; /* Hide subtitle on very small screens */
          }
          .logo-icon {
             width: 44px;
             height: 44px;
             font-size: 24px;
          }
          .nav-title {
             font-size: 18px;
          }
          .nav-item-content {
            padding: 8px 10px;
            gap: 6px;
          }
        }
      `}</style>
    </nav>
  );
}