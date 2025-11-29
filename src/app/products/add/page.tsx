'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// --- Interfaces ---
interface Category {
  CategoryID: number;
  CategoryName: string;
}

interface ProductFormData {
  productName: string;
  description: string;
  categoryId: string;
  price: string;
  stockQuantity: string;
  reorderLevel: string;
}

interface NotificationState {
  message: string;
  type: 'success' | 'error' | 'info';
  visible: boolean;
}

// --- Helper Icons (SVG) ---
const IconBox = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="icon-svg">
    <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
  </svg>
);

const IconTag = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="icon-svg">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.737.517l2.755-1.26c.956-.437 1.581-1.42 1.581-2.438V10.875a2.25 2.25 0 0 0-.659-1.591L9.568 3Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
  </svg>
);

const IconCurrencyBaht = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="icon-svg">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const IconArchiveBox = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="icon-svg">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
  </svg>
);

const IconStock = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="icon-svg">
   <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
  </svg>
);

const IconAlert = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="icon-svg">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
  </svg>
);

// --- Main Component ---
export default function AddProduct() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
    productName: '',
    description: '',
    categoryId: '',
    price: '',
    stockQuantity: '0',
    reorderLevel: '0'
  });

  // --- Notification State ---
  const [notification, setNotification] = useState<NotificationState>({
    message: '',
    type: 'info',
    visible: false
  });

  // Show notification function
  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ message, type, visible: true });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, visible: false }));
    }, 3000);
  };

  // ดึงข้อมูลหมวดหมู่
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        } else {
          showNotification('ไม่สามารถโหลดข้อมูลหมวดหมู่ได้', 'error');
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        showNotification('เกิดข้อผิดพลาดในการเชื่อมต่อ (Categories)', 'error');
      }
    };

    fetchCategories();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const productData = {
        productName: formData.productName.trim(),
        description: formData.description.trim(),
        categoryId: parseInt(formData.categoryId),
        price: parseFloat(formData.price),
        stockQuantity: parseInt(formData.stockQuantity),
        reorderLevel: parseInt(formData.reorderLevel)
      };

      if (!productData.productName || !productData.categoryId || isNaN(productData.price)) {
        showNotification('กรุณากรอกข้อมูลให้ครบถ้วน (ชื่อสินค้า, หมวดหมู่, ราคา)', 'error');
        setLoading(false);
        return;
      }

      if (productData.price < 0) {
        showNotification('ราคาต้องไม่ต่ำกว่า 0', 'error');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      const result = await response.json();

      if (response.ok) {
        showNotification(result.message || 'เพิ่มสินค้าสำเร็จ!', 'success');
        router.push('/product2');
      } else {
        showNotification(result.error || 'เกิดข้อผิดพลาดในการเพิ่มสินค้า', 'error');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      showNotification('เกิดข้อผิดพลาดในการเชื่อมต่อ (Submit)', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      productName: '',
      description: '',
      categoryId: '',
      price: '',
      stockQuantity: '0',
      reorderLevel: '0'
    });
    showNotification('ล้างข้อมูลในฟอร์มแล้ว', 'info');
  };

  return (
    <>
      <div className="page-container">
        {/* --- Header --- */}
        <div className="header">
          <div className="title-section">
            <h1 className="title">เพิ่มสินค้าใหม่</h1>
            <p className="subtitle">เพิ่มสินค้าใหม่เข้าสู่ระบบจัดการสต็อกสินค้า</p>
          </div>
          <div className="actions">
            <button 
              type="button" 
              className="btn-back"
              onClick={() => router.push('/product2')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '18px', height: '18px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              กลับหน้ารายการ
            </button>
          </div>
        </div>

        {/* --- Form Layout Grid --- */}
        <form onSubmit={handleSubmit} className="form-grid-layout">
          
          {/* --- Main Form Card (Left) --- */}
          <div className="form-card main-form">
            <div className="form-section">
              <h2 className="section-title">
                <IconBox />
                <span>ข้อมูลพื้นฐาน</span>
              </h2>
              
              <div className="form-group">
                <label htmlFor="productName" className="form-label">
                  ชื่อสินค้า <span className="required">*</span>
                </label>
                <div className="input-group">
                  <span className="input-icon"><IconTag /></span>
                  <input
                    type="text"
                    id="productName"
                    name="productName"
                    value={formData.productName}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="เช่น: มิสทีน ไวท์สปา"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description" className="form-label">คำอธิบาย</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="form-textarea"
                  placeholder="กรอกคำอธิบายสินค้า (ถ้ามี)"
                  rows={4}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="categoryId" className="form-label">
                    หมวดหมู่ <span className="required">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-icon"><IconArchiveBox /></span>
                    <select
                      id="categoryId"
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleInputChange}
                      className="form-select"
                      required
                    >
                      <option value="">เลือกหมวดหมู่</option>
                      {categories.map(category => (
                        <option key={category.CategoryID} value={category.CategoryID}>
                          {category.CategoryName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="price" className="form-label">
                    ราคา (บาท) <span className="required">*</span>
                  </label>
                   <div className="input-group">
                     <span className="input-icon"><IconCurrencyBaht /></span>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h2 className="section-title">
                <IconStock />
                <span>การจัดการสต็อก</span>
              </h2>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="stockQuantity" className="form-label">สต็อกเริ่มต้น</label>
                   <div className="input-group">
                     <span className="input-icon input-icon-text">#</span>
                    <input
                      type="number"
                      id="stockQuantity"
                      name="stockQuantity"
                      value={formData.stockQuantity}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <p className="form-help">จำนวนสินค้าที่มีในสต็อกเริ่มต้น</p>
                </div>

                <div className="form-group">
                  <label htmlFor="reorderLevel" className="form-label">
                    ระดับแจ้งเตือน <span className="required">*</span>
                  </label>
                  <div className="input-group">
                     <span className="input-icon"><IconAlert /></span>
                    <input
                      type="number"
                      id="reorderLevel"
                      name="reorderLevel"
                      value={formData.reorderLevel}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="0"
                      min="0"
                      required
                    />
                  </div>
                  <p className="form-help">ระบบจะแจ้งเตือนเมื่อสต็อกต่ำกว่านี้</p>
                </div>
              </div>
            </div>
          </div>

          {/* --- Actions Card (Right & Sticky) --- */}
          <div className="form-card actions-sidebar">
            <h2 className="section-title-action">การดำเนินการ</h2>
            <div className="action-info-box">
              <div className="info-icon">ℹ️</div>
              <p className="info-text">กรุณาตรวจสอบข้อมูลให้ถูกต้องก่อนบันทึก</p>
            </div>
            <div className="form-actions">
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    <span>กำลังบันทึก...</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    <span>บันทึกข้อมูลสินค้า</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="btn-secondary"
                disabled={loading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '18px', height: '18px' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                <span>ล้างข้อมูล</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* --- Notification Component --- */}
      <div className={`notification ${notification.type} ${notification.visible ? 'show' : ''}`}>
        <div className="notification-icon">
          {notification.type === 'success' && (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          )}
          {notification.type === 'error' && (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          {notification.type === 'info' && (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
          )}
        </div>
        <p>{notification.message}</p>
        <button className="notification-close" onClick={() => setNotification(prev => ({...prev, visible: false}))}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '16px', height: '16px' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* --- Global & Component Styles --- */}
      <style jsx global>{`
        body {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          color: #0f172a;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
      `}</style>
      
      <style jsx>{`
        /* --- Page Layout --- */
        .page-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 32px 24px;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 40px;
          gap: 24px;
        }

        .title-section {
          flex: 1;
        }

        .title {
          font-size: 36px;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 8px 0;
          letter-spacing: -0.5px;
          background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .subtitle {
          font-size: 17px;
          color: #64748b;
          margin: 0;
          font-weight: 500;
        }

        .btn-back {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #ffffff;
          color: #475569;
          border: 2px solid #e2e8f0;
          padding: 12px 20px;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
        }
        .btn-back:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
        }

        /* --- Form Grid --- */
        .form-grid-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
        }

        @media (min-width: 1024px) {
          .form-grid-layout {
            grid-template-columns: 2fr 1fr;
          }
        }

        /* --- Card Styling --- */
        .form-card {
          background: white;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
          padding: 32px;
        }

        /* --- Sticky Sidebar --- */
        .actions-sidebar {
          height: fit-content;
        }
        @media (min-width: 1024px) {
          .actions-sidebar {
            position: sticky;
            top: 32px;
          }
        }

        /* --- Form Elements --- */
        .form-section {
          padding-bottom: 32px;
          margin-bottom: 32px;
          border-bottom: 2px solid #f1f5f9;
        }
        .main-form .form-section:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }

        .section-title {
          font-size: 22px;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 28px 0;
          display: flex;
          align-items: center;
          gap: 12px;
          padding-bottom: 16px;
          border-bottom: 3px solid #e2e8f0;
        }
        
        .section-title :global(.icon-svg) {
          width: 26px;
          height: 26px;
          color: #3b82f6;
        }
        
        .section-title-action {
          font-size: 20px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 20px 0;
          padding-bottom: 12px;
          border-bottom: 2px solid #f1f5f9;
        }

        .action-info-box {
          background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
          border: 2px solid #bfdbfe;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 24px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .info-icon {
          font-size: 20px;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .info-text {
          font-size: 14px;
          color: #1e40af;
          margin: 0;
          line-height: 1.6;
          font-weight: 600;
        }

        .form-group {
          margin-bottom: 24px;
        }
        .form-group:last-child {
          margin-bottom: 0;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }
        @media (min-width: 768px) {
          .form-row {
            grid-template-columns: 1fr 1fr;
          }
        }

        .form-label {
          display: block;
          font-size: 15px;
          font-weight: 600;
          color: #334155;
          margin-bottom: 10px;
        }

        .required {
          color: #ef4444;
          margin-left: 2px;
        }

        /* --- Input Group (Icon + Input) --- */
        .input-group {
          position: relative;
        }
        .input-icon {
          position: absolute;
          top: 50%;
          left: 16px;
          transform: translateY(-50%);
          color: #94a3b8;
          pointer-events: none;
          display: flex;
          align-items: center;
          z-index: 1;
        }
        .input-icon :global(.icon-svg) {
          width: 22px;
          height: 22px;
        }
        .input-icon-text {
          font-size: 18px;
          font-weight: 700;
        }

        .form-input,
        .form-select,
        .form-textarea {
          width: 100%;
          padding: 14px 18px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 15px;
          transition: all 0.2s;
          background: #ffffff;
          color: #1e293b;
          font-weight: 500;
        }
        
        .input-group .form-input,
        .input-group .form-select {
          padding-left: 52px;
        }

        .form-input:focus,
        .form-select:focus,
        .form-textarea:focus {
          outline: none;
          border-color: #3b82f6;
          background: #ffffff;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        }

        .form-textarea {
          resize: vertical;
          min-height: 100px;
          line-height: 1.6;
        }
        
        .form-select {
          background-image: url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20"%3E%3Cpath stroke="%2364748b" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 8l4 4 4-4"/%3E%3C/svg%3E');
          background-position: right 1rem center;
          background-repeat: no-repeat;
          background-size: 1.5em 1.5em;
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
          padding-right: 3rem;
        }

        .form-help {
          font-size: 13px;
          color: #64748b;
          margin: 8px 0 0 0;
          font-weight: 500;
        }

        /* --- Action Buttons --- */
        .form-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .btn-primary {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border: none;
          padding: 16px 24px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
            box-shadow: 0 4px 6px rgba(5, 150, 105, 0.3);
        }
        items: center;
          justify-content: center;
          gap: 10px;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
          letter-spacing: 0.3px;
        }

        .btn-primary:hover:not(:disabled) {
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
          box-shadow: 0 6px 16px rgba(16, 185, 129, 0.35);
        }

        .btn-primary:disabled {
          background: linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%);
          cursor: not-allowed;
          box-shadow: none;
        }

        .btn-secondary {
          background: #ffffff;
          color: #475569;
          border: 2px solid #e2e8f0;
          padding: 14px 20px;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #f8fafc;
          border-color: #cbd5e1;
        }

        .btn-secondary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        /* --- Spinner --- */
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .spinner {
          display: inline-block;
          width: 18px;
          height: 18px;
          border: 3px solid rgba(255,255,255,0.3);
          border-radius: 50%;
          border-top-color: #fff;
          animation: spin 0.8s linear infinite;
        }

        /* --- Notification Toast --- */
        .notification {
          position: fixed;
          bottom: 32px;
          right: 32px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.15);
          padding: 18px 24px;
          display: flex;
          align-items: center;
          gap: 14px;
          transform: translateX(calc(100% + 32px));
          transition: transform 0.3s ease;
          border-left: 4px solid #3b82f6;
          z-index: 9999;
          min-width: 320px;
          max-width: 420px;
        }
        .notification.show {
          transform: translateX(0);
        }
        .notification.success { 
          border-color: #10b981;
          background: linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%);
        }
        .notification.error { 
          border-color: #ef4444;
          background: linear-gradient(135deg, #ffffff 0%, #fef2f2 100%);
        }
        .notification.info { 
          border-color: #3b82f6;
          background: linear-gradient(135deg, #ffffff 0%, #eff6ff 100%);
        }
        
        .notification-icon {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .notification.success .notification-icon { 
          background: #d1fae5;
          color: #047857;
        }
        .notification.error .notification-icon { 
          background: #fee2e2;
          color: #dc2626;
        }
        .notification.info .notification-icon { 
          background: #dbeafe;
          color: #2563eb;
        }
        
        .notification p {
          flex: 1;
          margin: 0;
          font-size: 15px;
          font-weight: 600;
          color: #1e293b;
          line-height: 1.5;
        }
        .notification-close {
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          transition: all 0.2s;
        }
        .notification-close:hover {
          background: #f1f5f9;
          color: #64748b;
        }

        /* --- Responsive --- */
        @media (max-width: 768px) {
          .page-container {
            padding: 20px 16px;
          }
          .header {
            flex-direction: column;
            align-items: stretch;
            gap: 16px;
            margin-bottom: 28px;
          }
          .title {
            font-size: 28px;
          }
          .subtitle {
            font-size: 15px;
          }
          .btn-back {
            justify-content: center;
          }
          .form-card {
            padding: 24px;
          }
          .form-row {
            grid-template-columns: 1fr;
          }
          .section-title {
            font-size: 19px;
          }
          .notification {
            bottom: 20px;
            right: 20px;
            left: 20px;
            min-width: auto;
          }
        }

        @media (max-width: 480px) {
          .title {
            font-size: 24px;
          }
          .form-card {
            padding: 20px;
          }
          .form-input,
          .form-select,
          .form-textarea {
            font-size: 14px;
          }
        }
      `}</style>
    </>
  );
}