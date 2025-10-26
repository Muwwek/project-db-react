import express from 'express';
import sql from 'mssql';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.BACKEND_PORT || 5001;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

const dbConfig = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || '568393',
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME || 'InventoryManagement',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
    instanceName: 'SQLEXPRESS'
  },
  port: parseInt(process.env.DB_PORT) || 1433
};

let pool;

async function connectDB() {
  try {
    console.log('🔄 Attempting to connect to SQL Server...');
    console.log('Server:', dbConfig.server);
    console.log('Database:', dbConfig.database);
    console.log('Instance:', dbConfig.options.instanceName);
    
    pool = await sql.connect(dbConfig);
    console.log('✅ Connected to SQL Server successfully');
    console.log(`📊 Database: ${dbConfig.database}`);
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    console.log('💡 Troubleshooting tips:');
    console.log('   1. ตรวจสอบว่า SQL Server กำลังทำงานอยู่');
    console.log('   2. ตรวจสอบว่า SQL Server Browser กำลังทำงานอยู่');
    console.log('   3. ตรวจสอบ instance name ให้ถูกต้อง');
    console.log('   4. ตรวจสอบ username/password');
    process.exit(1);
  }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend is running',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Database connection test endpoint
app.get('/api/db-test', async (req, res) => {
  try {
    const result = await pool.request().query('SELECT @@VERSION as version');
    res.json({ 
      status: 'OK', 
      message: 'Database connection successful',
      version: result.recordset[0].version
    });
  } catch (err) {
    res.status(500).json({ 
      status: 'ERROR', 
      message: 'Database connection failed',
      error: err.message 
    });
  }
});

// Products endpoints
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.request()
      .query(`
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
        ORDER BY p.ProductName
      `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/products/low-stock', async (req, res) => {
  try {
    const result = await pool.request()
      .query(`
        SELECT 
          p.ProductID,
          p.ProductName,
          c.CategoryName,
          p.StockQuantity,
          p.ReorderLevel,
          p.Price
        FROM Products p
        INNER JOIN Categories c ON p.CategoryID = c.CategoryID
        WHERE p.IsActive = 1 
          AND p.StockQuantity <= p.ReorderLevel
        ORDER BY p.StockQuantity ASC
      `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching low stock products:', err);
    res.status(500).json({ error: err.message });
  }
});



// Add stock endpoint
app.post('/api/products/:id/add-stock', async (req, res) => {
  const transaction = new sql.Transaction(pool);
  
  try {
    await transaction.begin();
    
    const productId = req.params.id;
    const { quantity, notes } = req.body;

    // 1. Get current stock
    const currentStockResult = await transaction.request()
      .input('productId', sql.Int, productId)
      .query('SELECT StockQuantity FROM Products WHERE ProductID = @productId');
    
    const currentStock = currentStockResult.recordset[0].StockQuantity;
    const newStock = currentStock + quantity;

    // 2. Update product stock
    await transaction.request()
      .input('productId', sql.Int, productId)
      .input('quantity', sql.Int, quantity)
      .query('UPDATE Products SET StockQuantity = StockQuantity + @quantity WHERE ProductID = @productId');

    // 3. Record stock movement
    await transaction.request()
      .input('productId', sql.Int, productId)
      .input('quantity', sql.Int, quantity)
      .input('movementType', sql.NVarChar, 'IN')
      .input('previousStock', sql.Int, currentStock)
      .input('newStock', sql.Int, newStock)
      .input('notes', sql.NVarChar, notes || 'Manual stock addition')
      .query(`
        INSERT INTO StockMovements (ProductID, MovementType, Quantity, PreviousStock, NewStock, Notes, MovementDate)
        VALUES (@productId, @movementType, @quantity, @previousStock, @newStock, @notes, GETDATE())
      `);

    await transaction.commit();

    res.json({ 
      success: true, 
      message: `เพิ่มสต็อกเรียบร้อยแล้ว ${quantity} ชิ้น`,
      newStock: newStock
    });
  } catch (err) {
    await transaction.rollback();
    console.error('Error adding stock:', err);
    res.status(500).json({ error: err.message });
  }
});

// Stock out endpoint
app.post('/api/products/:id/stock-out', async (req, res) => {
  const transaction = new sql.Transaction(pool);
  
  try {
    await transaction.begin();
    
    const productId = req.params.id;
    const { quantity, notes } = req.body;

    // 1. Get current stock
    const currentStockResult = await transaction.request()
      .input('productId', sql.Int, productId)
      .query('SELECT StockQuantity FROM Products WHERE ProductID = @productId');
    
    const currentStock = currentStockResult.recordset[0].StockQuantity;
    
    // 2. Check if stock is sufficient
    if (currentStock < quantity) {
      await transaction.rollback();
      return res.status(400).json({ 
        error: 'สต็อกไม่เพียงพอ', 
        currentStock,
        requested: quantity 
      });
    }

    const newStock = currentStock - quantity;

    // 3. Update product stock
    await transaction.request()
      .input('productId', sql.Int, productId)
      .input('quantity', sql.Int, quantity)
      .query('UPDATE Products SET StockQuantity = StockQuantity - @quantity WHERE ProductID = @productId');

    // 4. Record stock movement
    await transaction.request()
      .input('productId', sql.Int, productId)
      .input('quantity', sql.Int, quantity)
      .input('movementType', sql.NVarChar, 'OUT')
      .input('previousStock', sql.Int, currentStock)
      .input('newStock', sql.Int, newStock)
      .input('notes', sql.NVarChar, notes || 'Manual stock reduction')
      .query(`
        INSERT INTO StockMovements (ProductID, MovementType, Quantity, PreviousStock, NewStock, Notes, MovementDate)
        VALUES (@productId, @movementType, @quantity, @previousStock, @newStock, @notes, GETDATE())
      `);

    await transaction.commit();

    res.json({ 
      success: true, 
      message: `จ่ายออกสินค้าเรียบร้อยแล้ว ${quantity} ชิ้น`,
      newStock: newStock
    });
  } catch (err) {
    await transaction.rollback();
    console.error('Error reducing stock:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get stock movements history
app.get('/api/stock-movements/history', async (req, res) => {
  try {
    const result = await pool.request()
      .query(`
        SELECT 
          sm.MovementID,
          sm.ProductID,
          p.ProductName,
          c.CategoryName,
          sm.MovementType,
          sm.Quantity,
          sm.PreviousStock,
          sm.NewStock,
          sm.Notes,
          sm.MovementDate
        FROM StockMovements sm
        INNER JOIN Products p ON sm.ProductID = p.ProductID
        INNER JOIN Categories c ON p.CategoryID = c.CategoryID
        ORDER BY sm.MovementDate DESC
      `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching stock movements history:', err);
    res.status(500).json({ error: err.message });
  }
});

// Stock Movements endpoints
app.get('/api/stock-movements/summary', async (req, res) => {
  try {
    const result = await pool.request()
      .query(`
        SELECT 
          p.ProductID,
          p.ProductName,
          c.CategoryName,
          p.StockQuantity,
          p.ReorderLevel as MinStockLevel,
          p.Price,
          ISNULL(SUM(CASE WHEN sm.MovementType = 'IN' THEN sm.Quantity ELSE 0 END), 0) as TotalIn,
          ISNULL(SUM(CASE WHEN sm.MovementType = 'OUT' THEN sm.Quantity ELSE 0 END), 0) as TotalOut,
          ISNULL(SUM(CASE WHEN sm.MovementType = 'IN' THEN sm.Quantity * p.Price ELSE 0 END), 0) as TotalInValue,
          ISNULL(SUM(CASE WHEN sm.MovementType = 'OUT' THEN sm.Quantity * p.Price ELSE 0 END), 0) as TotalOutValue,
          p.StockQuantity as NetStock
        FROM Products p
        INNER JOIN Categories c ON p.CategoryID = c.CategoryID
        LEFT JOIN StockMovements sm ON p.ProductID = sm.ProductID
        WHERE p.IsActive = 1
        GROUP BY p.ProductID, p.ProductName, c.CategoryName, p.StockQuantity, p.ReorderLevel, p.Price
        ORDER BY p.ProductName
      `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching stock movements summary:', err);
    res.status(500).json({ error: err.message });
  }
});

// Sell products endpoint
app.post('/api/products/sell', async (req, res) => {
  const transaction = new sql.Transaction(pool);
  
  try {
    await transaction.begin();
    
    const { items, customerName, notes } = req.body;

    // 1. Validate stock and calculate total
    let totalAmount = 0;
    const stockChecks = [];

    for (const item of items) {
      const productResult = await transaction.request()
        .input('productId', sql.Int, item.productId)
        .query('SELECT ProductName, StockQuantity, Price FROM Products WHERE ProductID = @productId');
      
      if (productResult.recordset.length === 0) {
        await transaction.rollback();
        return res.status(404).json({ error: `ไม่พบสินค้า ID: ${item.productId}` });
      }

      const product = productResult.recordset[0];
      
      if (product.StockQuantity < item.quantity) {
        await transaction.rollback();
        return res.status(400).json({ 
          error: `สต็อกไม่เพียงพอ: ${product.ProductName}`,
          productName: product.ProductName,
          currentStock: product.StockQuantity,
          requested: item.quantity
        });
      }

      stockChecks.push({
        productId: item.productId,
        currentStock: product.StockQuantity,
        newStock: product.StockQuantity - item.quantity,
        price: product.Price
      });

      totalAmount += product.Price * item.quantity;
    }

    // 2. Create order (แก้ไขให้มี field Notes)
    const orderResult = await transaction.request()
      .input('customerName', sql.NVarChar, customerName || 'ลูกค้าทั่วไป')
      .input('totalAmount', sql.Decimal(10,2), totalAmount)
      .input('status', sql.NVarChar, 'COMPLETED')
      .input('notes', sql.NVarChar, notes || 'ไม่มีหมายเหตุ')
      .query(`
        INSERT INTO Orders (CustomerName, TotalAmount, Status, Notes, OrderDate)
        OUTPUT INSERTED.OrderID
        VALUES (@customerName, @totalAmount, @status, @notes, GETDATE())
      `);

    const orderId = orderResult.recordset[0].OrderID;

    // 3. Create order items and update stock
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const stockCheck = stockChecks[i];

      // Insert order item
      await transaction.request()
        .input('orderId', sql.Int, orderId)
        .input('productId', sql.Int, item.productId)
        .input('quantity', sql.Int, item.quantity)
        .input('unitPrice', sql.Decimal(10,2), stockCheck.price)
        .query(`
          INSERT INTO OrderItems (OrderID, ProductID, Quantity, UnitPrice)
          VALUES (@orderId, @productId, @quantity, @unitPrice)
        `);

      // Update product stock
      await transaction.request()
        .input('productId', sql.Int, item.productId)
        .input('quantity', sql.Int, item.quantity)
        .query('UPDATE Products SET StockQuantity = StockQuantity - @quantity WHERE ProductID = @productId');

      // Record stock movement
      await transaction.request()
        .input('productId', sql.Int, item.productId)
        .input('quantity', sql.Int, item.quantity)
        .input('movementType', sql.NVarChar, 'OUT')
        .input('previousStock', sql.Int, stockCheck.currentStock)
        .input('newStock', sql.Int, stockCheck.newStock)
        .input('notes', sql.NVarChar, `ขายให้: ${customerName || 'ลูกค้าทั่วไป'} - ${notes || 'ไม่มีหมายเหตุ'}`)
        .query(`
          INSERT INTO StockMovements (ProductID, MovementType, Quantity, PreviousStock, NewStock, Notes, MovementDate)
          VALUES (@productId, @movementType, @quantity, @previousStock, @newStock, @notes, GETDATE())
        `);
    }

    await transaction.commit();

    res.json({ 
      success: true, 
      message: `ขายสินค้าเรียบร้อยแล้ว`,
      orderId: orderId,
      totalAmount: totalAmount,
      items: items.length
    });
  } catch (err) {
    await transaction.rollback();
    console.error('Error selling products:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get orders history (แก้ไขให้มี field Notes)
app.get('/api/orders', async (req, res) => {
  try {
    const result = await pool.request()
      .query(`
        SELECT 
          o.OrderID,
          o.CustomerName,
          o.TotalAmount,
          o.Status,
          o.OrderDate,
          o.Notes,
          COUNT(oi.OrderItemID) as ItemCount
        FROM Orders o
        LEFT JOIN OrderItems oi ON o.OrderID = oi.OrderID
        GROUP BY o.OrderID, o.CustomerName, o.TotalAmount, o.Status, o.OrderDate, o.Notes
        ORDER BY o.OrderDate DESC
      `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get order details (แก้ไขให้มี field Notes)
app.get('/api/orders/:id', async (req, res) => {
  try {
    const orderId = req.params.id;
    
    const orderResult = await pool.request()
      .input('orderId', sql.Int, orderId)
      .query(`
        SELECT 
          o.*,
          COUNT(oi.OrderItemID) as ItemCount
        FROM Orders o
        LEFT JOIN OrderItems oi ON o.OrderID = oi.OrderID
        WHERE o.OrderID = @orderId
        GROUP BY o.OrderID, o.CustomerName, o.TotalAmount, o.Status, o.OrderDate, o.Notes
      `);

    const itemsResult = await pool.request()
      .input('orderId', sql.Int, orderId)
      .query(`
        SELECT 
          oi.*,
          p.ProductName,
          p.Description,
          c.CategoryName
        FROM OrderItems oi
        INNER JOIN Products p ON oi.ProductID = p.ProductID
        INNER JOIN Categories c ON p.CategoryID = c.CategoryID
        WHERE oi.OrderID = @orderId
      `);

    res.json({
      order: orderResult.recordset[0] || null,
      items: itemsResult.recordset
    });
  } catch (err) {
    console.error('Error fetching order details:', err);
    res.status(500).json({ error: err.message });
  }
});

// Revenue summary endpoint
app.get('/api/revenue/summary', async (req, res) => {
  try {
    const result = await pool.request()
      .query(`
        SELECT 
          COUNT(*) as TotalOrders,
          SUM(TotalAmount) as TotalRevenue,
          AVG(TotalAmount) as AverageOrderValue,
          MIN(OrderDate) as FirstOrderDate,
          MAX(OrderDate) as LastOrderDate
        FROM Orders 
        WHERE Status = 'COMPLETED'
      `);
    
    const dailyResult = await pool.request()
      .query(`
        SELECT 
          CAST(OrderDate AS DATE) as OrderDay,
          COUNT(*) as OrderCount,
          SUM(TotalAmount) as DailyRevenue
        FROM Orders 
        WHERE Status = 'COMPLETED'
        GROUP BY CAST(OrderDate AS DATE)
        ORDER BY OrderDay DESC
      `);

    res.json({
      summary: result.recordset[0] || {},
      daily: dailyResult.recordset || []
    });
  } catch (err) {
    console.error('Error fetching revenue summary:', err);
    res.status(500).json({ error: err.message });
  }
});

// Top selling products endpoint
app.get('/api/revenue/top-products', async (req, res) => {
  try {
    const result = await pool.request()
      .query(`
        SELECT 
          p.ProductID,
          p.ProductName,
          c.CategoryName,
          SUM(oi.Quantity) as TotalSold,
          SUM(oi.Quantity * oi.UnitPrice) as TotalRevenue,
          p.Price
        FROM OrderItems oi
        INNER JOIN Orders o ON oi.OrderID = o.OrderID
        INNER JOIN Products p ON oi.ProductID = p.ProductID
        INNER JOIN Categories c ON p.CategoryID = c.CategoryID
        WHERE o.Status = 'COMPLETED'
        GROUP BY p.ProductID, p.ProductName, c.CategoryName, p.Price
        ORDER BY TotalRevenue DESC
      `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching top products:', err);
    res.status(500).json({ error: err.message });
  }
});

// Categories endpoints
app.get('/api/categories', async (req, res) => {
  try {
    const result = await pool.request()
      .query('SELECT * FROM Categories ORDER BY CategoryName');
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: err.message });
  }
});

// Start server
async function startServer() {
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`🚀 Backend server running on port ${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🔗 Database test: http://localhost:${PORT}/api/db-test`);
    console.log(`📦 Products API: http://localhost:${PORT}/api/products`);
    console.log(`🛒 Sell API: http://localhost:${PORT}/api/products/sell`);
    console.log(`📋 Orders API: http://localhost:${PORT}/api/orders`);
    console.log(`💰 Revenue API: http://localhost:${PORT}/api/revenue/summary`);
    console.log(`⚠️  Low Stock API: http://localhost:${PORT}/api/products/low-stock`);
    console.log(`📊 Stock Summary API: http://localhost:${PORT}/api/stock-movements/summary`);
    console.log(`📈 Stock History API: http://localhost:${PORT}/api/stock-movements/history`);
  });
}

startServer().catch(console.error);