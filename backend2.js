app.get('/api/products/search', async (req, res) => {
  try {
    const { q, category } = req.query;
    
    console.log('Search request received:', { q, category });
    
    // สร้าง base query
    let query = `
      SELECT 
        p.ProductID,
        p.ProductName,
        p.Description,
        p.CategoryID,
        c.CategoryName,
        p.Price,
        p.StockQuantity,
        p.ReorderLevel,
        p.IsActive,
        p.CreatedDate
      FROM Products p 
      INNER JOIN Categories c ON p.CategoryID = c.CategoryID 
      WHERE p.IsActive = 1
    `;
    
    const request = pool.request();
    let hasCondition = false;
    
    // Handle search query
    if (q && q.trim() !== '') {
      query += ' AND (p.ProductName LIKE @search OR p.Description LIKE @search)';
      request.input('search', sql.NVarChar, `%${q}%`);
      hasCondition = true;
    }
    
    // Handle category filter
    if (category && category !== 'all') {
      const categoryId = parseInt(category);
      if (!isNaN(categoryId) && categoryId > 0) {
        query += ' AND c.CategoryID = @categoryId';
        request.input('categoryId', sql.Int, categoryId);
        hasCondition = true;
      }
    }
    
    // ถ้าไม่มีเงื่อนไขการค้นหา ให้ส่งคืนข้อมูลทั้งหมด
    if (!hasCondition) {
      query = `
        SELECT 
          p.ProductID,
          p.ProductName,
          p.Description,
          p.CategoryID,
          c.CategoryName,
          p.Price,
          p.StockQuantity,
          p.ReorderLevel,
          p.IsActive,
          p.CreatedDate
        FROM Products p 
        INNER JOIN Categories c ON p.CategoryID = c.CategoryID 
        WHERE p.IsActive = 1
      `;
    }
    
    query += ' ORDER BY p.ProductName';
    
    console.log('Executing query:', query);
    
    const result = await request.query(query);
    
    console.log(`Found ${result.recordset.length} products`);
    
    res.json(result.recordset);
    
  } catch (err) {
    console.error('Error searching products:', err);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'เกิดข้อผิดพลาดในการค้นหาสินค้า',
      details: err.message
    });
  }
});