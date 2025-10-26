'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Product, CartItem } from '../../types/inventory';
import Navigation from '../../components/Navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5001/api';

// ตั้ง baseURL ให้ถูกต้อง
axios.defaults.baseURL = API_BASE;

export default function SellPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [selling, setSelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/products');
      setProducts(response.data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('ไม่สามารถโหลดข้อมูลสินค้าได้');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.productId === product.ProductID);
    
    if (existingItem) {
      if (existingItem.quantity >= product.StockQuantity) {
        alert('ไม่สามารถเพิ่มได้ เนื่องจากสต็อกไม่เพียงพอ');
        return;
      }
      setCart(cart.map(item =>
        item.productId === product.ProductID
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      if (product.StockQuantity < 1) {
        alert('สต็อกสินค้าไม่เพียงพอ');
        return;
      }
      setCart([
        ...cart,
        {
          productId: product.ProductID,
          productName: product.ProductName,
          categoryName: product.CategoryName,
          price: product.Price,
          quantity: 1,
          stock: product.StockQuantity
        }
      ]);
    }
  };

  const updateCartQuantity = (productId: number, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }

    const product = products.find(p => p.ProductID === productId);
    if (product && quantity > product.StockQuantity) {
      alert('ไม่สามารถเพิ่มได้ เนื่องจากสต็อกไม่เพียงพอ');
      return;
    }

    setCart(cart.map(item =>
      item.productId === productId
        ? { ...item, quantity }
        : item
    ));
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setCustomerName('');
    setNotes('');
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleSell = async () => {
    if (cart.length === 0) {
      alert('กรุณาเลือกสินค้าที่ต้องการขาย');
      return;
    }

    if (!customerName.trim()) {
      alert('กรุณากรอกชื่อลูกค้า');
      return;
    }

    try {
      setSelling(true);
      setError(null);

      const response = await axios.post('/products/sell', {
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        })),
        customerName: customerName.trim(),
        notes: notes.trim() || 'ไม่มีหมายเหตุ'
      });

      setSuccess(`ขายสินค้าเรียบร้อยแล้ว! รายการที่ #${response.data.orderId} รวมยอด: ฿${response.data.totalAmount.toLocaleString()}`);
      clearCart();
      await fetchProducts();
      
      setTimeout(() => setSuccess(null), 5000);
    } catch (error: any) {
      console.error('Error selling products:', error);
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError('เกิดข้อผิดพลาดในการขายสินค้า');
      }
    } finally {
      setSelling(false);
    }
  };

  if (loading) {
    return (
      <div className="app-container">
        <Navigation />
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>กำลังโหลดข้อมูล...</p>
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
            <div className="header-content">
              <div className="header-icon">🛒</div>
              <div>
                <h1>ขายสินค้า</h1>
                <p>ระบบขายสินค้าและออกใบเสร็จ</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="alert alert-error">
              <div className="alert-content">
                <span className="alert-icon">⚠️</span>
                <span>{error}</span>
              </div>
              <button onClick={() => setError(null)} className="alert-close">✕</button>
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              <div className="alert-content">
                <span className="alert-icon">✅</span>
                <span>{success}</span>
              </div>
              <button onClick={() => setSuccess(null)} className="alert-close">✕</button>
            </div>
          )}

          <div className="sell-grid">
            <div className="products-section">
              <div className="section-header">
                <div className="section-title">
                  <span className="section-icon">📦</span>
                  <h2>รายการสินค้า</h2>
                  <span className="product-count">{products.length} รายการ</span>
                </div>
                <button onClick={fetchProducts} className="btn btn-refresh">
                  <span className="btn-icon">🔄</span>
                  รีเฟรช
                </button>
              </div>

              <div className="products-grid">
                {products.map((product) => (
                  <div key={product.ProductID} className="product-card">
                    <div className="product-badge-container">
                      {product.StockQuantity === 0 && (
                        <span className="badge badge-danger">สินค้าหมด</span>
                      )}
                      {product.StockQuantity > 0 && product.StockQuantity <= product.ReorderLevel && (
                        <span className="badge badge-warning">สต็อกต่ำ</span>
                      )}
                    </div>
                    <div className="product-info">
                      <h3 className="product-name">{product.ProductName}</h3>
                      <span className="product-category">{product.CategoryName}</span>
                      <p className="product-description">{product.Description}</p>
                      <div className="product-footer">
                        <div className="product-price-box">
                          <span className="price-label">ราคา</span>
                          <span className="product-price">฿{product.Price.toLocaleString()}</span>
                        </div>
                        <div className="product-stock-box">
                          <span className="stock-label">คงเหลือ</span>
                          <span className={`product-stock ${product.StockQuantity <= product.ReorderLevel ? 'low' : ''}`}>
                            {product.StockQuantity}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => addToCart(product)}
                      disabled={product.StockQuantity === 0}
                      className="btn btn-add-cart"
                    >
                      <span className="btn-icon">🛒</span>
                      {product.StockQuantity === 0 ? 'สินค้าหมด' : 'เพิ่มในตะกร้า'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="cart-section">
              <div className="cart-card">
                <div className="cart-header">
                  <div className="cart-title">
                    <span className="cart-icon">🛒</span>
                    <h2>ตะกร้าสินค้า</h2>
                    {cart.length > 0 && (
                      <span className="cart-badge">{cart.length}</span>
                    )}
                  </div>
                  {cart.length > 0 && (
                    <button onClick={clearCart} className="btn btn-clear">
                      <span className="btn-icon">🗑️</span>
                      ล้าง
                    </button>
                  )}
                </div>

                {cart.length === 0 ? (
                  <div className="empty-cart">
                    <div className="empty-icon">🛒</div>
                    <p className="empty-text">ตะกร้าว่างเปล่า</p>
                    <p className="empty-subtext">เลือกสินค้าที่ต้องการซื้อจากด้านซ้าย</p>
                  </div>
                ) : (
                  <>
                    <div className="cart-items">
                      {cart.map((item) => (
                        <div key={item.productId} className="cart-item">
                          <div className="item-main">
                            <div className="item-info">
                              <h4 className="item-name">{item.productName}</h4>
                              <span className="item-category">{item.categoryName}</span>
                              <div className="item-price-unit">฿{item.price.toLocaleString()} / ชิ้น</div>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.productId)}
                              className="btn btn-remove"
                              title="ลบออกจากตะกร้า"
                            >
                              ✕
                            </button>
                          </div>
                          <div className="item-controls">
                            <div className="quantity-controls">
                              <button
                                onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                                className="btn btn-quantity"
                              >
                                −
                              </button>
                              <span className="quantity">{item.quantity}</span>
                              <button
                                onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                                disabled={item.quantity >= item.stock}
                                className="btn btn-quantity"
                              >
                                +
                              </button>
                            </div>
                            <div className="item-total">
                              <span className="total-label">รวม</span>
                              <span className="total-value">฿{(item.price * item.quantity).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="cart-summary">
                      <div className="summary-row">
                        <span>จำนวนรายการ</span>
                        <span className="summary-value">{cart.length} รายการ</span>
                      </div>
                      <div className="summary-row">
                        <span>จำนวนชิ้น</span>
                        <span className="summary-value">{cart.reduce((sum, item) => sum + item.quantity, 0)} ชิ้น</span>
                      </div>
                      <div className="summary-total">
                        <span>ยอดรวมทั้งสิ้น</span>
                        <span className="total-amount">฿{getTotalAmount().toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="customer-section">
                      <h3 className="section-subtitle">
                        <span className="subtitle-icon">👤</span>
                        ข้อมูลลูกค้า
                      </h3>
                      <div className="form-group">
                        <label>ชื่อลูกค้า <span className="required">*</span></label>
                        <input
                          type="text"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="กรอกชื่อลูกค้า"
                          className="form-input"
                        />
                      </div>
                      <div className="form-group">
                        <label>หมายเหตุ</label>
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="หมายเหตุเพิ่มเติม (ถ้ามี)"
                          className="form-textarea"
                          rows={3}
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleSell}
                      disabled={selling || cart.length === 0 || !customerName.trim()}
                      className="btn btn-checkout"
                    >
                      {selling ? (
                        <>
                          <span className="spinner"></span>
                          กำลังดำเนินการ...
                        </>
                      ) : (
                        <>
                          <span className="btn-icon">✅</span>
                          ชำระเงิน ฿{getTotalAmount().toLocaleString()}
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        .app-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #ffd1dc 0%, #ffe4e1 50%, #e0f2f7 100%);
          background-attachment: fixed;
        }
        .app-main {
          padding: 24px 0;
        }
        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 20px;
        }
        .page-header {
          margin-bottom: 24px;
        }
        .header-content {
          background: white;
          padding: 24px;
          border-radius: 16px;
          box-shadow: 0 8px 24px rgba(255, 182, 193, 0.3);
          display: flex;
          align-items: center;
          gap: 16px;
          border: 2px solid #ffb6c1;
        }
        .header-icon {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          box-shadow: 0 6px 16px rgba(255, 154, 158, 0.4);
        }
        .header-content h1 {
          font-size: 28px;
          color: #1f2937;
          margin: 0;
          font-weight: 700;
        }
        .header-content p {
          color: #6b7280;
          margin: 4px 0 0 0;
          font-size: 14px;
        }
        .sell-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
        }
        .products-section {
          background: white;
          border-radius: 16px;
          box-shadow: 0 8px 24px rgba(173, 216, 230, 0.3);
          border: 2px solid #b0e0e6;
          padding: 24px;
        }
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 2px solid #f3f4f6;
        }
        .section-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .section-icon {
          font-size: 24px;
        }
        .section-title h2 {
          margin: 0;
          color: #1f2937;
          font-size: 20px;
          font-weight: 700;
        }
        .product-count {
          background: linear-gradient(135deg, #a8e6cf 0%, #dcedc1 100%);
          color: #2d6a4f;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }
        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
          max-height: 70vh;
          overflow-y: auto;
          padding-right: 8px;
        }
        .products-grid::-webkit-scrollbar {
          width: 6px;
        }
        .products-grid::-webkit-scrollbar-track {
          background: #f3f4f6;
          border-radius: 3px;
        }
        .products-grid::-webkit-scrollbar-thumb {
          background: #9ca3af;
          border-radius: 3px;
        }
        .product-card {
          border: 2px solid #ffd1dc;
          border-radius: 16px;
          padding: 16px;
          background: white;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .product-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #ff9a9e 0%, #fecfef 50%, #a8e6cf 100%);
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }
        .product-card:hover {
          box-shadow: 0 12px 28px rgba(255, 182, 193, 0.3);
          transform: translateY(-4px);
          border-color: #ffb6c1;
        }
        .product-card:hover::before {
          transform: scaleX(1);
        }
        .product-badge-container {
          position: absolute;
          top: 12px;
          right: 12px;
        }
        .badge {
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .badge-danger {
          background: linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%);
          color: #dc2626;
        }
        .badge-warning {
          background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%);
          color: #d97706;
        }
        .product-info {
          margin-bottom: 12px;
        }
        .product-name {
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 6px 0;
          font-size: 16px;
        }
        .product-category {
          background: linear-gradient(135deg, #e0c3fc 0%, #d5aaff 100%);
          color: #6b21a8;
          padding: 3px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .product-description {
          color: #6b7280;
          font-size: 13px;
          margin: 12px 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          line-height: 1.5;
        }
        .product-footer {
          display: flex;
          gap: 12px;
          margin-bottom: 12px;
        }
        .product-price-box, .product-stock-box {
          flex: 1;
          background: linear-gradient(135deg, #ffeef8 0%, #fff5f7 100%);
          padding: 10px;
          border-radius: 12px;
          border: 2px solid #ffd1dc;
        }
        .price-label, .stock-label {
          display: block;
          font-size: 11px;
          color: #6b7280;
          margin-bottom: 4px;
          font-weight: 500;
          text-transform: uppercase;
        }
        .product-price {
          font-weight: 700;
          color: #16a34a;
          font-size: 18px;
        }
        .product-stock {
          font-size: 18px;
          font-weight: 700;
          color: #1f2937;
        }
        .product-stock.low {
          color: #dc2626;
        }
        .cart-section {
          position: sticky;
          top: 24px;
          height: fit-content;
        }
        .cart-card {
          background: white;
          border-radius: 16px;
          box-shadow: 0 8px 24px rgba(168, 230, 207, 0.3);
          border: 2px solid #a8e6cf;
          padding: 24px;
        }
        .cart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 2px solid #f3f4f6;
        }
        .cart-title {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .cart-icon {
          font-size: 24px;
        }
        .cart-title h2 {
          margin: 0;
          color: #1f2937;
          font-size: 20px;
          font-weight: 700;
        }
        .cart-badge {
          background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
          color: white;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 700;
        }
        .empty-cart {
          text-align: center;
          padding: 60px 20px;
        }
        .empty-icon {
          font-size: 64px;
          margin-bottom: 16px;
          opacity: 0.3;
        }
        .empty-text {
          font-size: 18px;
          color: #1f2937;
          margin: 0 0 8px 0;
          font-weight: 600;
        }
        .empty-subtext {
          font-size: 14px;
          color: #6b7280;
        }
        .cart-items {
          max-height: 320px;
          overflow-y: auto;
          margin-bottom: 20px;
          padding-right: 8px;
        }
        .cart-items::-webkit-scrollbar {
          width: 6px;
        }
        .cart-items::-webkit-scrollbar-track {
          background: #f3f4f6;
          border-radius: 3px;
        }
        .cart-items::-webkit-scrollbar-thumb {
          background: #9ca3af;
          border-radius: 3px;
        }
        .cart-item {
          padding: 16px;
          border: 2px solid #e0f2f7;
          border-radius: 16px;
          margin-bottom: 12px;
          background: linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%);
        }
        .item-main {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 12px;
        }
        .item-info {
          flex: 1;
        }
        .item-name {
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 6px 0;
          font-size: 14px;
        }
        .item-category {
          background: linear-gradient(135deg, #e0c3fc 0%, #d5aaff 100%);
          color: #6b21a8;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
        }
        .item-price-unit {
          color: #6b7280;
          font-size: 12px;
          margin-top: 6px;
          font-weight: 500;
        }
        .item-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .quantity-controls {
          display: flex;
          align-items: center;
          gap: 12px;
          background: linear-gradient(135deg, #ffeef8 0%, #fff5f7 100%);
          padding: 6px 12px;
          border-radius: 16px;
          border: 2px solid #ffd1dc;
        }
        .quantity {
          min-width: 30px;
          text-align: center;
          font-weight: 700;
          color: #1f2937;
          font-size: 16px;
        }
        .item-total {
          text-align: right;
        }
        .total-label {
          display: block;
          font-size: 11px;
          color: #6b7280;
          margin-bottom: 2px;
          text-transform: uppercase;
        }
        .total-value {
          font-weight: 700;
          color: #16a34a;
          font-size: 16px;
        }
        .cart-summary {
          background: linear-gradient(135deg, #e0f2f7 0%, #b0e0e6 100%);
          border: 2px solid #87ceeb;
          border-radius: 16px;
          padding: 16px;
          margin-bottom: 20px;
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          font-size: 14px;
          color: #6b7280;
        }
        .summary-value {
          font-weight: 600;
          color: #1f2937;
        }
        .summary-total {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 12px;
          margin-top: 12px;
          border-top: 2px solid #e5e7eb;
        }
        .summary-total span:first-child {
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
        }
        .total-amount {
          font-size: 28px;
          font-weight: 700;
          background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #a8e6cf 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .customer-section {
          margin-bottom: 20px;
        }
        .section-subtitle {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0 0 16px 0;
          color: #1f2937;
          font-size: 16px;
          font-weight: 700;
        }
        .subtitle-icon {
          font-size: 20px;
        }
        .form-group {
          margin-bottom: 16px;
        }
        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #374151;
          font-size: 14px;
        }
        .required {
          color: #dc2626;
          font-weight: 700;
        }
        .form-input, .form-textarea {
          width: 100%;
          padding: 12px 14px;
          border: 2px solid #e0f2f7;
          border-radius: 12px;
          font-size: 14px;
          transition: all 0.2s ease;
        }
        .form-input:focus, .form-textarea:focus {
          outline: none;
          border-color: #87ceeb;
          box-shadow: 0 0 0 4px rgba(135, 206, 235, 0.2);
        }
        .form-textarea {
          resize: vertical;
          min-height: 80px;
          font-family: inherit;
        }
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 18px;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          text-align: center;
          transition: all 0.3s ease;
          border: 2px solid transparent;
        }
        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .btn-icon {
          font-size: 16px;
        }
        .btn-refresh {
          background: linear-gradient(135deg, #a8e6cf 0%, #dcedc1 100%);
          color: #2d6a4f;
          padding: 8px 16px;
          font-size: 13px;
        }
        .btn-refresh:hover:not(:disabled) {
          box-shadow: 0 6px 16px rgba(168, 230, 207, 0.5);
          transform: translateY(-2px);
        }
        .btn-add-cart {
          background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
          color: white;
          width: 100%;
          padding: 10px 16px;
          font-size: 14px;
        }
        .btn-add-cart:hover:not(:disabled) {
          box-shadow: 0 8px 20px rgba(255, 154, 158, 0.5);
          transform: translateY(-2px);
        }
        .btn-clear {
          background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%);
          color: #d97706;
          padding: 6px 12px;
          font-size: 13px;
        }
        .btn-clear:hover:not(:disabled) {
          box-shadow: 0 6px 12px rgba(253, 203, 110, 0.4);
        }
        .btn-remove {
          background: linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%);
          color: white;
          padding: 6px 10px;
          font-size: 16px;
          width: 32px;
          height: 32px;
        }
        .btn-remove:hover:not(:disabled) {
          box-shadow: 0 6px 12px rgba(255, 154, 158, 0.4);
        }
        .btn-quantity {
          background: white;
          color: #ff9a9e;
          border: 2px solid #ffd1dc;
          padding: 6px 12px;
          font-size: 16px;
          font-weight: 700;
          width: 36px;
          height: 36px;
        }
        .btn-quantity:hover:not(:disabled) {
          background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
          color: white;
          border-color: #ff9a9e;
        }
        .btn-checkout {
          background: linear-gradient(135deg, #a8e6cf 0%, #84d9a6 100%);
          color: white;
          width: 100%;
          padding: 16px 24px;
          font-size: 18px;
          font-weight: 700;
          box-shadow: 0 6px 16px rgba(168, 230, 207, 0.4);
        }
        .btn-checkout:hover:not(:disabled) {
          box-shadow: 0 10px 24px rgba(168, 230, 207, 0.6);
          transform: translateY(-2px);
        }
        .alert {
          padding: 14px 18px;
          border-radius: 16px;
          margin-bottom: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border: 2px solid;
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
        }
        .alert-content {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }
        .alert-icon {
          font-size: 20px;
        }
        .alert-error {
          background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
          border-color: #fecaca;
          color: #dc2626;
        }
        .alert-success {
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
          border-color: #bbf7d0;
          color: #16a34a;
        }
        .alert-close {
          background: transparent;
          border: none;
          color: inherit;
          font-size: 20px;
          cursor: pointer;
          padding: 4px 8px;
          opacity: 0.6;
          transition: opacity 0.2s ease;
        }
        .alert-close:hover {
          opacity: 1;
        }
        .loading {
          text-align: center;
          padding: 80px 20px;
          color: white;
        }
        .loading-spinner {
          width: 60px;
          height: 60px;
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-top: 4px solid white;
          border-radius: 50%;
          margin: 0 auto 20px;
          animation: spin 1s linear infinite;
        }
        .loading p {
          font-size: 18px;
          font-weight: 600;
        }
        .spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 1024px) {
          .sell-grid {
            grid-template-columns: 1fr;
          }
          .cart-section {
            position: static;
          }
        }

        @media (max-width: 768px) {
          .container {
            padding: 0 16px;
          }
          .header-content {
            padding: 16px;
          }
          .header-icon {
            width: 48px;
            height: 48px;
            font-size: 24px;
          }
          .header-content h1 {
            font-size: 22px;
          }
          .products-grid {
            grid-template-columns: 1fr;
          }
          .section-title {
            flex-wrap: wrap;
          }
          .item-main {
            flex-direction: column;
            gap: 12px;
          }
          .item-controls {
            flex-direction: column;
            gap: 12px;
            width: 100%;
          }
          .quantity-controls {
            width: 100%;
            justify-content: center;
          }
          .item-total {
            width: 100%;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}