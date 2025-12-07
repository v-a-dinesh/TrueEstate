import { createClient } from '@libsql/client';
import fs from 'fs';
import csv from 'csv-parser';
import dotenv from 'dotenv';
import readline from 'readline';

dotenv.config();

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════
const CONFIG = {
  BATCH_SIZE: 100,           // Rows per INSERT statement
  CSV_PATH: process.env.CSV_FILE_PATH || './truestate_assignment_dataset.csv'
};

// ═══════════════════════════════════════════════════════════════════════════
// DATABASE CONNECTION
// ═══════════════════════════════════════════════════════════════════════════
const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════
const escape = (str) => {
  if (str === null || str === undefined) return '';
  return String(str).replace(/'/g, "''");
};

const parseNum = (val, isFloat = false) => {
  if (val === null || val === undefined || val === '') return 0;
  const parsed = isFloat ? parseFloat(val) : parseInt(val);
  return isNaN(parsed) ? 0 : parsed;
};

const formatTime = (seconds) => {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
};

const formatNumber = (num) => num.toLocaleString();

// ═══════════════════════════════════════════════════════════════════════════
// MULTI-ROW INSERT
// ═══════════════════════════════════════════════════════════════════════════
const insertBatch = async (batch) => {
  if (batch.length === 0) return { success: 0, failed: 0 };

  const values = batch.map(row => `(
    ${parseNum(row['Transaction ID'])},
    '${escape(row['Date'])}',
    '${escape(row['Customer ID'])}',
    '${escape(row['Customer Name'])}',
    '${escape(row['Phone Number'])}',
    '${escape(row['Gender'])}',
    ${parseNum(row['Age'])},
    '${escape(row['Customer Region'])}',
    '${escape(row['Customer Type'])}',
    '${escape(row['Product ID'])}',
    '${escape(row['Product Name'])}',
    '${escape(row['Brand'])}',
    '${escape(row['Product Category'])}',
    '${escape(row['Tags'])}',
    ${parseNum(row['Quantity'])},
    ${parseNum(row['Price per Unit'], true)},
    ${parseNum(row['Discount Percentage'], true)},
    ${parseNum(row['Total Amount'], true)},
    ${parseNum(row['Final Amount'], true)},
    '${escape(row['Payment Method'])}',
    '${escape(row['Order Status'])}',
    '${escape(row['Delivery Type'])}',
    '${escape(row['Store ID'])}',
    '${escape(row['Store Location'])}',
    '${escape(row['Salesperson ID'])}',
    '${escape(row['Employee Name'])}'
  )`).join(',');

  const sql = `
    INSERT INTO transactions (
      transactionId, date, customerId, customerName, phoneNumber,
      gender, age, customerRegion, customerType, productId,
      productName, brand, productCategory, tags, quantity,
      pricePerUnit, discountPercentage, totalAmount, finalAmount,
      paymentMethod, orderStatus, deliveryType, storeId,
      storeLocation, salespersonId, employeeName
    ) VALUES ${values}
  `;

  try {
    await db.execute(sql);
    return { success: batch.length, failed: 0 };
  } catch (error) {
    // Fallback: insert one by one
    let success = 0;
    let failed = 0;
    
    for (const row of batch) {
      try {
        await db.execute({
          sql: `INSERT INTO transactions (transactionId, date, customerId, customerName, phoneNumber, gender, age, customerRegion, customerType, productId, productName, brand, productCategory, tags, quantity, pricePerUnit, discountPercentage, totalAmount, finalAmount, paymentMethod, orderStatus, deliveryType, storeId, storeLocation, salespersonId, employeeName) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            parseNum(row['Transaction ID']), row['Date'] || '', row['Customer ID'] || '',
            row['Customer Name'] || '', row['Phone Number'] || '', row['Gender'] || '',
            parseNum(row['Age']), row['Customer Region'] || '', row['Customer Type'] || '',
            row['Product ID'] || '', row['Product Name'] || '', row['Brand'] || '',
            row['Product Category'] || '', row['Tags'] || '', parseNum(row['Quantity']),
            parseNum(row['Price per Unit'], true), parseNum(row['Discount Percentage'], true),
            parseNum(row['Total Amount'], true), parseNum(row['Final Amount'], true),
            row['Payment Method'] || '', row['Order Status'] || '', row['Delivery Type'] || '',
            row['Store ID'] || '', row['Store Location'] || '', row['Salesperson ID'] || '',
            row['Employee Name'] || ''
          ]
        });
        success++;
      } catch (e) {
        failed++;
      }
    }
    return { success, failed };
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN STREAMING IMPORT FUNCTION
// ═══════════════════════════════════════════════════════════════════════════
const loadDataToTurso = async () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════════╗');
  console.log('║         TURSO STREAMING DATA LOADER                          ║');
  console.log('║         Memory-Efficient: Processes in chunks                   ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝');
  console.log('');

  // Verify CSV file
  if (!fs.existsSync(CONFIG.CSV_PATH)) {
    console.error(`❌ CSV file not found: ${CONFIG.CSV_PATH}`);
    process.exit(1);
  }

  const fileSize = fs.statSync(CONFIG.CSV_PATH).size;
  console.log(` CSV File: ${CONFIG.CSV_PATH}`);
  console.log(`File Size: ${(fileSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(` Batch Size: ${CONFIG.BATCH_SIZE} rows per INSERT`);
  console.log(`Mode: Streaming (low memory usage)`);
  console.log('');

  try {
    // ─────────────────────────────────────────────────────────────────────────
    // STEP 1: Setup Table
    // ─────────────────────────────────────────────────────────────────────────
    console.log('Step 1/3: Setting up database table...');
    
    await db.execute(`DROP TABLE IF EXISTS transactions`);
    
    await db.execute(`
      CREATE TABLE transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        transactionId INTEGER,
        date TEXT,
        customerId TEXT,
        customerName TEXT,
        phoneNumber TEXT,
        gender TEXT,
        age INTEGER,
        customerRegion TEXT,
        customerType TEXT,
        productId TEXT,
        productName TEXT,
        brand TEXT,
        productCategory TEXT,
        tags TEXT,
        quantity INTEGER,
        pricePerUnit REAL,
        discountPercentage REAL,
        totalAmount REAL,
        finalAmount REAL,
        paymentMethod TEXT,
        orderStatus TEXT,
        deliveryType TEXT,
        storeId TEXT,
        storeLocation TEXT,
        salespersonId TEXT,
        employeeName TEXT
      )
    `);
    
    console.log('Table created\n');

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 2: Stream and Insert Data
    // ─────────────────────────────────────────────────────────────────────────
    console.log('Step 2/3: Streaming and inserting data...\n');
    
    const startTime = Date.now();
    let totalProcessed = 0;
    let totalErrors = 0;
    let batch = [];

    await new Promise((resolve, reject) => {
      const stream = fs.createReadStream(CONFIG.CSV_PATH);
      const parser = csv();
      let isPaused = false;

      const processBatch = async () => {
        if (batch.length === 0) return;
        
        const currentBatch = [...batch];
        batch = []; // Clear batch immediately
        
        const result = await insertBatch(currentBatch);
        totalProcessed += result.success;
        totalErrors += result.failed;

        // Update progress
        const elapsed = (Date.now() - startTime) / 1000;
        const rate = Math.round(totalProcessed / elapsed);
        
        readline.clearLine(process.stdout, 0);
        readline.cursorTo(process.stdout, 0);
        process.stdout.write(
          `   ${formatNumber(totalProcessed)} rows | ` +
          `${formatNumber(rate)} rows/sec | ` +
          `${formatTime(elapsed)}` +
          (totalErrors > 0 ? ` | ${totalErrors} errors` : '')
        );

        // Resume stream if paused
        if (isPaused) {
          isPaused = false;
          stream.resume();
        }
      };

      parser.on('data', async (row) => {
        batch.push(row);
        
        if (batch.length >= CONFIG.BATCH_SIZE) {
          isPaused = true;
          stream.pause();
          await processBatch();
        }
      });

      parser.on('end', async () => {
        // Process remaining rows
        if (batch.length > 0) {
          await processBatch();
        }
        resolve();
      });

      parser.on('error', reject);
      stream.on('error', reject);
      stream.pipe(parser);
    });

    const insertTime = (Date.now() - startTime) / 1000;
    console.log('\n');

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 3: Create Indexes
    // ─────────────────────────────────────────────────────────────────────────
    console.log('Step 3/3: Creating indexes...');
    
    const indexes = [
      'CREATE INDEX idx_customerName ON transactions(customerName COLLATE NOCASE)',
      'CREATE INDEX idx_phoneNumber ON transactions(phoneNumber)',
      'CREATE INDEX idx_date ON transactions(date)',
      'CREATE INDEX idx_customerRegion ON transactions(customerRegion)',
      'CREATE INDEX idx_gender ON transactions(gender)',
      'CREATE INDEX idx_productCategory ON transactions(productCategory)',
      'CREATE INDEX idx_paymentMethod ON transactions(paymentMethod)',
      'CREATE INDEX idx_age ON transactions(age)'
    ];

    for (const sql of indexes) {
      await db.execute(sql);
    }
    
    console.log('Indexes created\n');

    // ─────────────────────────────────────────────────────────────────────────
    // FINAL STATS
    // ─────────────────────────────────────────────────────────────────────────
    const avgRate = Math.round(totalProcessed / insertTime);

    console.log('╔══════════════════════════════════════════════════════════════════╗');
    console.log('║                     IMPORT COMPLETE                           ║');
    console.log('╠══════════════════════════════════════════════════════════════════╣');
    console.log(`║  Total Records:      ${formatNumber(totalProcessed).padStart(15)}                   ║`);
    console.log(`║  Failed Records:     ${formatNumber(totalErrors).padStart(15)}                   ║`);
    console.log(`║  Total Time:         ${formatTime(insertTime).padStart(15)}                   ║`);
    console.log(`║  Average Rate:       ${(formatNumber(avgRate) + ' rows/sec').padStart(15)}                   ║`);
    console.log('╚══════════════════════════════════════════════════════════════════╝');

    // Verify count
    const result = await db.execute('SELECT COUNT(*) as count FROM transactions');
    console.log(`\n Verified in Turso: ${formatNumber(Number(result.rows[0].count))} records`);

  } catch (error) {
    console.error('\n❌ Import failed:', error.message);
    throw error;
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// RUN
// ═══════════════════════════════════════════════════════════════════════════
loadDataToTurso()
  .then(() => {
    console.log('\n Done!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });