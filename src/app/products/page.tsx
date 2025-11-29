// src/app/products/page.tsx
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Product, ProductSearchParams, ProductFormData, Category, ProductDetails } from '../../types/inventory';
import Navigation from '../../components/Navigation';
import '../../styles/products.css';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5001/api';

// สร้าง axios instance
const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductDetails | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formLoading, setFormLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [detailLoading, setDetailLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
    productName: '',
    description: '',
    categoryId: '',
    price: '',
    stockQuantity: '0',
    reorderLevel: '0'
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // แก้ไข fetchProducts ให้ใช้ endpoint เดียว
  const fetchProducts = async (searchParams?: ProductSearchParams) => {
    try {
      setLoading(true);
      setError(null);
      
      // ใช้ endpoint เดียวสำหรับทั้งโหลดข้อมูลและค้นหา
      let url = '/products';
      let params: any = {};
      
      // เพิ่ม parameter การค้นหาถ้ามี
      if (searchParams) {
        if (searchParams.q && searchParams.q.trim() !== '') {
          params.q = searchParams.q.trim();
        }
        if (searchParams.category && searchParams.category !== 'all') {
          params.category = searchParams.category;
        }
      }
      
      const response = await api.get(url, { params });
      setProducts(response.data || []);
      
    } catch (err: any) {
      console.error('Error fetching products:', err);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'ไม่สามารถโหลดข้อมูลสินค้าได้';
      setError(errorMessage);
      
      // ถ้าโหลดข้อมูลล้มเหลว ให้ลองโหลดใหม่โดยไม่ใช้ parameter
      if (Object.keys(params).length > 0) {
        console.log('Loading failed with params, trying without params...');
        try {
          const fallbackResponse = await api.get('/products');
          setProducts(fallbackResponse.data || []);
          setError(`การค้นหาล้มเหลว: ${errorMessage} (แสดงข้อมูลทั้งหมดแทน)`);
        } catch (fallbackError: any) {
          console.error('Fallback also failed:', fallbackError);
          setError('ไม่สามารถโหลดข้อมูลสินค้าได้ กรุณาลองใหม่ภายหลัง');
        }
      }
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchProductDetails = async (productId: number) => {
    try {
      setDetailLoading(true);
      const response = await api.get(`/products/${productId}`);
      setSelectedProduct(response.data);
    } catch (err: any) {
      console.error('Error fetching product details:', err);
      alert('ไม่สามารถโหลดรายละเอียดสินค้าได้: ' + (err.response?.data?.error || err.message));
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // ส่ง parameter การค้นหาไปกับ endpoint หลัก
    await fetchProducts({ 
      q: searchQuery.trim(), 
      category: selectedCategory 
    });
  };

  const handleResetSearch = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    // โหลดใหม่โดยไม่ส่ง parameter
    fetchProducts();
  };

  const addStock = async (productId: number, quantity: number) => {
    try {
      await api.post(`/products/${productId}/add-stock`, {
        quantity,
        notes: `เพิ่มสต็อกโดยผู้ดูแล: ${quantity} ชิ้น`
      });
      await fetchProducts();
      alert(`เพิ่มสต็อกสินค้าเรียบร้อยแล้ว ${quantity} ชิ้น`);
    } catch (error: any) {
      console.error('Error adding stock:', error);
      alert('เกิดข้อผิดพลาดในการเพิ่มสต็อก: ' + (error.response?.data?.error || error.message));
    }
  };

  const stockOut = async (productId: number, quantity: number) => {
    try {
      await api.post(`/products/${productId}/stock-out`, {
        quantity,
        notes: `จ่ายออกโดยผู้ดูแล: ${quantity} ชิ้น`
      });
      await fetchProducts();
      alert(`จ่ายออกสินค้าเรียบร้อยแล้ว ${quantity} ชิ้น`);
    } catch (error: any) {
      console.error('Error reducing stock:', error);
      if (error.response?.data?.error === 'สต็อกไม่เพียงพอ') {
        alert(`สต็อกไม่เพียงพอ! สต็อกปัจจุบัน: ${error.response.data.currentStock} ชิ้น`);
      } else {
        alert('เกิดข้อผิดพลาดในการจ่ายออกสินค้า: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const productData = {
        productName: formData.productName.trim(),
        description: formData.description.trim(),
        categoryId: parseInt(formData.categoryId),
        price: parseFloat(formData.price),
        stockQuantity: parseInt(formData.stockQuantity),
        reorderLevel: parseInt(formData.reorderLevel)
      };

      // Validate required fields
      if (!productData.productName || !productData.categoryId || isNaN(productData.price)) {
        alert('กรุณากรอกข้อมูลให้ครบถ้วน (ชื่อสินค้า, หมวดหมู่, ราคา)');
        setFormLoading(false);
        return;
      }

      if (productData.price < 0) {
        alert('ราคาต้องไม่ต่ำกว่า 0');
        setFormLoading(false);
        return;
      }

      const response = await api.post('/products', productData);

      if (response.status === 201) {
        alert(response.data.message);
        setShowAddForm(false);
        resetForm();
        await fetchProducts();
      }
    } catch (error: any) {
      console.error('Error adding product:', error);
      alert(error.response?.data?.error || 'เกิดข้อผิดพลาดในการเพิ่มสินค้า');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    setFormLoading(true);

    try {
      const productData = {
        productName: formData.productName.trim(),
        description: formData.description.trim(),
        categoryId: parseInt(formData.categoryId),
        price: parseFloat(formData.price),
        reorderLevel: parseInt(formData.reorderLevel),
        isActive: true
      };

      // Validate required fields
      if (!productData.productName || !productData.categoryId || isNaN(productData.price)) {
        alert('กรุณากรอกข้อมูลให้ครบถ้วน (ชื่อสินค้า, หมวดหมู่, ราคา)');
        setFormLoading(false);
        return;
      }

      if (productData.price < 0) {
        alert('ราคาต้องไม่ต่ำกว่า 0');
        setFormLoading(false);
        return;
      }

      const response = await api.put(`/products/${editingProduct.ProductID}`, productData);

      if (response.status === 200) {
        alert(response.data.message);
        setShowEditForm(false);
        setEditingProduct(null);
        resetForm();
        await fetchProducts();
      }
    } catch (error: any) {
      console.error('Error updating product:', error);
      alert(error.response?.data?.error || 'เกิดข้อผิดพลาดในการแก้ไขสินค้า');
    } finally {
      setFormLoading(false);
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
  };

  const openEditForm = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      productName: product.ProductName,
      description: product.Description || '',
      categoryId: product.CategoryID.toString(),
      price: product.Price.toString(),
      stockQuantity: product.StockQuantity.toString(),
      reorderLevel: product.ReorderLevel.toString()
    });
    setShowEditForm(true);
  };

  const closeEditForm = () => {
    setShowEditForm(false);
    setEditingProduct(null);
    resetForm();
  };

  const openDetailModal = async (product: Product) => {
    setSelectedProduct(product as ProductDetails);
    setShowDetailModal(true);
    await fetchProductDetails(product.ProductID);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedProduct(null);
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
            <div className="header-icon">📦</div>
            <h1>จัดการสินค้า</h1>
            <p>จัดการข้อมูลสินค้าและสต็อกทั้งหมด {products.length} รายการ</p>
          </div>

          {error && (
            <div className="alert alert-error">
              <span className="alert-icon">⚠️</span>
              <span className="alert-message">{error}</span>
              <button onClick={() => fetchProducts()} className="btn btn-sm btn-retry">ลองอีกครั้ง</button>
            </div>
          )}

          <div className="stats-summary">
            <div className="stat-box stat-total">
              <div className="stat-icon-wrapper">
                <span className="stat-icon">📦</span>
              </div>
              <div className="stat-content">
                <div className="stat-label">สินค้าทั้งหมด</div>
                <div className="stat-value">{products.length}</div>
              </div>
            </div>
            <div className="stat-box stat-instock">
              <div className="stat-icon-wrapper">
                <span className="stat-icon">✅</span>
              </div>
              <div className="stat-content">
                <div className="stat-label">สต็อกปกติ</div>
                <div className="stat-value">
                  {products.filter(p => p.StockQuantity > p.ReorderLevel).length}
                </div>
              </div>
            </div>
            <div className="stat-box stat-lowstock">
              <div className="stat-icon-wrapper">
                <span className="stat-icon">⚠️</span>
              </div>
              <div className="stat-content">
                <div className="stat-label">ใกล้หมด</div>
                <div className="stat-value">
                  {products.filter(p => p.StockQuantity <= p.ReorderLevel && p.StockQuantity > 0).length}
                </div>
              </div>
            </div>
            <div className="stat-box stat-outstock">
              <div className="stat-icon-wrapper">
                <span className="stat-icon">🔴</span>
              </div>
              <div className="stat-content">
                <div className="stat-label">หมดสต็อก</div>
                <div className="stat-value">
                  {products.filter(p => p.StockQuantity === 0).length}
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="search-filter-bar">
            <form onSubmit={handleSearch} className="search-filter-content">
              <div className="search-group">
                <label htmlFor="search" className="search-label">
                  ค้นหาสินค้า
                </label>
                <input
                  type="text"
                  id="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                  placeholder="ค้นหาด้วยชื่อสินค้า, คำอธิบาย, หรือราคา..."
                />
                <div className="search-tips">
                  <small>ตัวอย่าง: "airpod", "1500", "เครื่องเสียง"</small>
                </div>
              </div>
              
              <div className="filter-group">
                <label htmlFor="category" className="search-label">
                  หมวดหมู่
                </label>
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="form-select"
                >
                  <option value="all">ทั้งหมด</option>
                  {categories.map(category => (
                    <option key={category.CategoryID} value={category.CategoryID}>
                      {category.CategoryName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="action-buttons">
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={searchLoading}
                >
                  {searchLoading ? (
                    <>
                      <span className="loading-spinner-small"></span>
                      <span>กำลังค้นหา...</span>
                    </>
                  ) : (
                    <>
                      <span className="btn-icon">🔍</span>
                      <span>ค้นหา</span>
                    </>
                  )}
                </button>
                <button 
                  type="button" 
                  onClick={handleResetSearch}
                  className="btn btn-secondary"
                >
                  <span className="btn-icon">🔄</span>
                  <span>รีเซ็ต</span>
                </button>
              </div>
            </form>
          </div>

          <div className="action-bar">
            <div className="action-buttons">
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="btn btn-primary"
              >
                <span className="btn-icon">➕</span>
                <span>{showAddForm ? 'ยกเลิก' : 'เพิ่มสินค้าใหม่'}</span>
              </button>
              <button 
                onClick={() => fetchProducts()} 
                className="btn btn-secondary"
              >
                <span className="btn-icon">🔄</span>
                <span>รีเฟรช</span>
              </button>
            </div>
          </div>

          {/* Add Product Form */}
          {showAddForm && (
            <div className="add-product-form">
              <div className="card">
                <div className="card-header">
                  <div className="card-title">
                    <h2>📝 เพิ่มสินค้าใหม่</h2>
                    <p className="card-subtitle">กรอกข้อมูลสินค้าที่ต้องการเพิ่มลงในระบบ</p>
                  </div>
                </div>
                <div className="form-container">
                  <form onSubmit={handleSubmit} className="product-form">
                    <div className="form-section">
                      <h3 className="section-title">ข้อมูลพื้นฐาน</h3>
                      <div className="form-group">
                        <label htmlFor="productName" className="form-label">
                          ชื่อสินค้า *
                        </label>
                        <input
                          type="text"
                          id="productName"
                          name="productName"
                          value={formData.productName}
                          onChange={handleInputChange}
                          className="form-input"
                          placeholder="กรอกชื่อสินค้า..."
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="description" className="form-label">
                          คำอธิบาย
                        </label>
                        <textarea
                          id="description"
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          className="form-textarea"
                          placeholder="กรอกคำอธิบายสินค้า..."
                          rows={3}
                        />
                      </div>
                    </div>

                    <div className="form-section">
                      <h3 className="section-title">รายละเอียดสินค้า</h3>
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="categoryId" className="form-label">
                            หมวดหมู่ *
                          </label>
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
                        <div className="form-group">
                          <label htmlFor="price" className="form-label">
                            ราคา (บาท) *
                          </label>
                          <input
                            type="number"
                            id="price"
                            name="price"
                            value={formData.price}
                            onChange={handleInputChange}
                            className="form-input"
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="form-section">
                      <h3 className="section-title">การจัดการสต็อก</h3>
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="stockQuantity" className="form-label">
                            จำนวนสต็อกเริ่มต้น
                          </label>
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
                          <p className="form-help">จำนวนสินค้าในสต็อกเริ่มต้น</p>
                        </div>
                        <div className="form-group">
                          <label htmlFor="reorderLevel" className="form-label">
                            ระดับแจ้งเตือน *
                          </label>
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
                          <p className="form-help">ระบบจะแจ้งเตือนเมื่อสต็อกต่ำกว่าระดับนี้</p>
                        </div>
                      </div>
                    </div>

                    <div className="form-actions">
                      <button
                        type="button"
                        onClick={() => setShowAddForm(false)}
                        className="btn btn-secondary"
                      >
                        ยกเลิก
                      </button>
                      <button
                        type="submit"
                        disabled={formLoading}
                        className="btn btn-success"
                      >
                        {formLoading ? 'กำลังบันทึก...' : 'บันทึกสินค้า'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Products Table */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <h2>📦 รายการสินค้าทั้งหมด</h2>
                <p className="card-subtitle">จัดการข้อมูลสินค้าและสต็อกในระบบ</p>
              </div>
            </div>

            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>สินค้า</th>
                    <th>หมวดหมู่</th>
                    <th className="text-center">ราคา</th>
                    <th className="text-center">สต็อกปัจจุบัน</th>
                    <th className="text-center">แจ้งเตือนต่ำกว่า</th>
                    <th className="text-center">สถานะ</th>
                    <th className="text-center">การจัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center">
                        <div className="empty-state">
                          <div className="empty-icon">📦</div>
                          <p className="empty-text">ไม่พบข้อมูลสินค้า</p>
                          <p className="empty-subtext">
                            {searchQuery || selectedCategory !== 'all' 
                              ? 'ลองเปลี่ยนเงื่อนไขการค้นหาหรือรีเซ็ตการค้นหา' 
                              : 'เริ่มต้นโดยการเพิ่มสินค้าใหม่'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => (
                      <tr key={product.ProductID} className="table-row-hover">
                        <td>
                          <div className="product-info">
                            <div className="product-icon">📦</div>
                            <div className="product-details">
                              <div className="product-name">{product.ProductName}</div>
                              {product.Description && (
                                <div className="product-description">
                                  {product.Description}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="category-badge">
                            {product.CategoryName}
                          </span>
                        </td>
                        <td className="text-center">
                          <span className="price-tag">
                            ฿{product.Price.toLocaleString()}
                          </span>
                        </td>
                        <td className="text-center">
                          <div className="stock-info">
                            <span className={`stock-badge ${
                              product.StockQuantity === 0 ? 'stock-zero' :
                              product.StockQuantity <= product.ReorderLevel ? 'stock-low' : 'stock-normal'
                            }`}>
                              {product.StockQuantity.toLocaleString()} ชิ้น
                            </span>
                          </div>
                        </td>
                        <td className="text-center">
                          <div className="reorder-info">
                            <span className={`reorder-level ${
                              product.StockQuantity <= product.ReorderLevel ? 'reorder-alert' : 'reorder-normal'
                            }`}>
                              {product.StockQuantity <= product.ReorderLevel ? '⚠️ ' : ''}
                              {product.ReorderLevel} ชิ้น
                            </span>
                            {product.StockQuantity <= product.ReorderLevel && (
                              <div className="alert-message">
                                ⚠️ สต็อกใกล้ถึงระดับแจ้งเตือน
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="text-center">
                          <span className={`status-badge ${
                            product.StockQuantity === 0 ? 'out-of-stock' :
                            product.StockQuantity <= product.ReorderLevel ? 'low-stock' : 'in-stock'
                          }`}>
                            {product.StockQuantity === 0 ? '🔴 หมด' :
                             product.StockQuantity <= product.ReorderLevel ? '🟡 ใกล้หมด' : '🟢 ปกติ'}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <div className="action-group">
                              <div className="action-label">จัดการสต็อก</div>
                              <div className="button-group">
                                <button
                                  onClick={() => addStock(product.ProductID, 1)}
                                  className="btn btn-success btn-xs"
                                  title="เพิ่มสต็อก 1 ชิ้น"
                                >
                                  <span className="btn-icon-sm">+1</span>
                                </button>
                                <button
                                  onClick={() => addStock(product.ProductID, 5)}
                                  className="btn btn-success btn-xs"
                                  title="เพิ่มสต็อก 5 ชิ้น"
                                >
                                  <span className="btn-icon-sm">+5</span>
                                </button>
                                <button
                                  onClick={() => stockOut(product.ProductID, 1)}
                                  className="btn btn-warning btn-xs"
                                  disabled={product.StockQuantity < 1}
                                  title="จ่ายออก 1 ชิ้น"
                                >
                                  <span className="btn-icon-sm">-1</span>
                                </button>
                              </div>
                            </div>
                            <div className="action-group">
                              <div className="action-label">จัดการข้อมูล</div>
                              <div className="button-group">
                                <button
                                  onClick={() => openEditForm(product)}
                                  className="btn btn-info btn-xs"
                                >
                                  <span className="btn-icon">✏️</span>
                                  <span>แก้ไข</span>
                                </button>
                                <button
                                  onClick={() => openDetailModal(product)}
                                  className="btn btn-primary btn-xs"
                                >
                                  <span className="btn-icon">👁️</span>
                                  <span>รายละเอียด</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Product Modal */}
      {showEditForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">✏️ แก้ไขสินค้า</h3>
              <button onClick={closeEditForm} className="modal-close">
                ✕
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleEditSubmit} className="product-form">
                <div className="form-section">
                  <h3 className="section-title">ข้อมูลพื้นฐาน</h3>
                  <div className="form-group">
                    <label htmlFor="edit-productName" className="form-label">
                      ชื่อสินค้า *
                    </label>
                    <input
                      type="text"
                      id="edit-productName"
                      name="productName"
                      value={formData.productName}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="กรอกชื่อสินค้า..."
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="edit-description" className="form-label">
                      คำอธิบาย
                    </label>
                    <textarea
                      id="edit-description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="form-textarea"
                      placeholder="กรอกคำอธิบายสินค้า..."
                      rows={3}
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h3 className="section-title">รายละเอียดสินค้า</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="edit-categoryId" className="form-label">
                        หมวดหมู่ *
                      </label>
                      <select
                        id="edit-categoryId"
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
                    <div className="form-group">
                      <label htmlFor="edit-price" className="form-label">
                        ราคา (บาท) *
                      </label>
                      <input
                        type="number"
                        id="edit-price"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3 className="section-title">การจัดการสต็อก</h3>
                  <div className="form-group">
                    <label htmlFor="edit-reorderLevel" className="form-label">
                      ระดับแจ้งเตือน *
                    </label>
                    <input
                      type="number"
                      id="edit-reorderLevel"
                      name="reorderLevel"
                      value={formData.reorderLevel}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="0"
                      min="0"
                      required
                    />
                    <p className="form-help">ระบบจะแจ้งเตือนเมื่อสต็อกต่ำกว่าระดับนี้</p>
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      สต็อกปัจจุบัน
                    </label>
                    <input
                      type="text"
                      value={`${editingProduct?.StockQuantity || 0} ชิ้น`}
                      className="form-input"
                      disabled
                    />
                    <p className="form-help">
                      ใช้ปุ่มจัดการสต็อกในตารางเพื่อเพิ่ม/ลดสต็อก
                    </p>
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    onClick={closeEditForm}
                    className="btn btn-secondary"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="btn btn-success"
                  >
                    {formLoading ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {showDetailModal && selectedProduct && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">📋 รายละเอียดสินค้า</h3>
              <button onClick={closeDetailModal} className="modal-close">
                ✕
              </button>
            </div>
            <div className="modal-body">
              {detailLoading ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p className="loading-text">กำลังโหลดรายละเอียด...</p>
                </div>
              ) : (
                <div className="product-detail-content">
                  <div className="detail-section">
                    <div className="detail-header">
                      <div className="product-icon-large">📦</div>
                      <div className="product-title">
                        <h4>{selectedProduct.ProductName}</h4>
                        <span className="category-badge-large">
                          {selectedProduct.CategoryName}
                        </span>
                      </div>
                    </div>
                    
                    {selectedProduct.Description && (
                      <div className="detail-group">
                        <label>คำอธิบาย:</label>
                        <p className="detail-description">{selectedProduct.Description}</p>
                      </div>
                    )}
                  </div>

                  <div className="detail-grid">
                    <div className="detail-card">
                      <div className="detail-card-icon">💰</div>
                      <div className="detail-card-content">
                        <div className="detail-card-label">ราคา</div>
                        <div className="detail-card-value">
                          ฿{selectedProduct.Price.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="detail-card">
                      <div className="detail-card-icon">📊</div>
                      <div className="detail-card-content">
                        <div className="detail-card-label">สต็อกปัจจุบัน</div>
                        <div className="detail-card-value">
                          {selectedProduct.StockQuantity.toLocaleString()} ชิ้น
                        </div>
                      </div>
                    </div>

                    <div className="detail-card">
                      <div className="detail-card-icon">⚠️</div>
                      <div className="detail-card-content">
                        <div className="detail-card-label">ระดับแจ้งเตือน</div>
                        <div className="detail-card-value">
                          {selectedProduct.ReorderLevel} ชิ้น
                        </div>
                      </div>
                    </div>

                    <div className="detail-card">
                      <div className="detail-card-icon">📅</div>
                      <div className="detail-card-content">
                        <div className="detail-card-label">วันที่เพิ่ม</div>
                        <div className="detail-card-value">
                          {new Date(selectedProduct.CreatedDate).toLocaleDateString('th-TH')}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h4 className="section-title">สถานะสินค้า</h4>
                    <div className={`status-indicator ${
                      selectedProduct.StockQuantity === 0 ? 'status-out' :
                      selectedProduct.StockQuantity <= selectedProduct.ReorderLevel ? 'status-low' : 'status-normal'
                    }`}>
                      {selectedProduct.StockQuantity === 0 ? (
                        <>
                          <span className="status-icon">🔴</span>
                          <span className="status-text">หมดสต็อก</span>
                        </>
                      ) : selectedProduct.StockQuantity <= selectedProduct.ReorderLevel ? (
                        <>
                          <span className="status-icon">🟡</span>
                          <span className="status-text">สต็อกใกล้หมด</span>
                        </>
                      ) : (
                        <>
                          <span className="status-icon">🟢</span>
                          <span className="status-text">สต็อกปกติ</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="form-actions">
                    <button
                      onClick={() => {
                        closeDetailModal();
                        openEditForm(selectedProduct);
                      }}
                      className="btn btn-info"
                    >
                      <span className="btn-icon">✏️</span>
                      <span>แก้ไขสินค้า</span>
                    </button>
                    <button
                      onClick={closeDetailModal}
                      className="btn btn-secondary"
                    >
                      ปิด
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}