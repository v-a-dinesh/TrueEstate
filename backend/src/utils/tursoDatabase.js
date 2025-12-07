import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config();

let db = null;

export const connectTurso = async () => {
  try {
    db = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });

    // Test connection
    await db.execute('SELECT 1');
    console.log('Turso Database Connected');

    // Create transactions table if not exists
    await createTransactionsTable();

    return db;
  } catch (error) {
    console.error('Turso connection error:', error);
    throw error;
  }
};

const createTransactionsTable = async () => {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      transactionId INTEGER NOT NULL,
      date TEXT NOT NULL,
      customerId TEXT NOT NULL,
      customerName TEXT NOT NULL,
      phoneNumber TEXT NOT NULL,
      gender TEXT NOT NULL,
      age INTEGER NOT NULL,
      customerRegion TEXT NOT NULL,
      customerType TEXT NOT NULL,
      productId TEXT NOT NULL,
      productName TEXT NOT NULL,
      brand TEXT NOT NULL,
      productCategory TEXT NOT NULL,
      tags TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      pricePerUnit REAL NOT NULL,
      discountPercentage REAL NOT NULL,
      totalAmount REAL NOT NULL,
      finalAmount REAL NOT NULL,
      paymentMethod TEXT NOT NULL,
      orderStatus TEXT NOT NULL,
      deliveryType TEXT NOT NULL,
      storeId TEXT NOT NULL,
      storeLocation TEXT NOT NULL,
      salespersonId TEXT NOT NULL,
      employeeName TEXT NOT NULL,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await db.execute(createTableSQL);

  // Create indexes for better performance
  const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_customer_name ON transactions(customerName)',
    'CREATE INDEX IF NOT EXISTS idx_phone_number ON transactions(phoneNumber)',
    'CREATE INDEX IF NOT EXISTS idx_customer_region ON transactions(customerRegion)',
    'CREATE INDEX IF NOT EXISTS idx_gender ON transactions(gender)',
    'CREATE INDEX IF NOT EXISTS idx_product_category ON transactions(productCategory)',
    'CREATE INDEX IF NOT EXISTS idx_payment_method ON transactions(paymentMethod)',
    'CREATE INDEX IF NOT EXISTS idx_date ON transactions(date)',
  ];

  for (const indexSQL of indexes) {
    try {
      await db.execute(indexSQL);
    } catch (error) {
      // Index might already exist, ignore error
    }
  }

  console.log('Transactions table and indexes created');
};

export const getDb = () => {
  if (!db) {
    return null; // Return null instead of throwing error to allow CSV fallback
  }
  return db;
};

export default { connectTurso, getDb };
