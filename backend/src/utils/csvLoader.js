import fs from 'fs';
import csv from 'csv-parser';
import Transaction from '../models/Transaction.js';

export const loadCSVData = async (filePath) => {
  let transactions = [];
  let batchCount = 0;
  const batchSize = 1000; // Smaller batch to avoid memory issues
  let totalProcessed = 0;
  let isPaused = false;
  
  // Clear existing data first
  console.log('Clearing existing data...');
  await Transaction.deleteMany({});
  console.log('Existing data cleared');
  
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(filePath, { highWaterMark: 16 * 1024 });
    const parser = csv();
    
    const processBatch = async () => {
      if (transactions.length === 0) return;
      
      const batch = transactions.splice(0, transactions.length);
      try {
        await Transaction.insertMany(batch, { ordered: false });
        totalProcessed += batch.length;
        batchCount++;
        console.log(`Inserted batch ${batchCount} (${totalProcessed} total records)`);
      } catch (error) {
        console.error(`Error inserting batch ${batchCount}:`, error.message);
      }
      
      if (isPaused) {
        isPaused = false;
        stream.resume();
      }
    };
    
    parser.on('data', (row) => {
      try {
        const transaction = {
          transactionId: parseInt(row['Transaction ID']),
          date: new Date(row['Date']),
          customerId: row['Customer ID'],
          customerName: row['Customer Name'],
          phoneNumber: row['Phone Number'],
          gender: row['Gender'],
          age: parseInt(row['Age']),
          customerRegion: row['Customer Region'],
          customerType: row['Customer Type'],
          productId: row['Product ID'],
          productName: row['Product Name'],
          brand: row['Brand'],
          productCategory: row['Product Category'],
          tags: row['Tags'] ? row['Tags'].split(',').map(tag => tag.trim()) : [],
          quantity: parseInt(row['Quantity']),
          pricePerUnit: parseFloat(row['Price per Unit']),
          discountPercentage: parseFloat(row['Discount Percentage']),
          totalAmount: parseFloat(row['Total Amount']),
          finalAmount: parseFloat(row['Final Amount']),
          paymentMethod: row['Payment Method'],
          orderStatus: row['Order Status'],
          deliveryType: row['Delivery Type'],
          storeId: row['Store ID'],
          storeLocation: row['Store Location'],
          salespersonId: row['Salesperson ID'],
          employeeName: row['Employee Name']
        };
        
        transactions.push(transaction);
        
        // Insert in batches
        if (transactions.length >= batchSize) {
          isPaused = true;
          stream.pause();
          processBatch();
        }
      } catch (error) {
        console.error('Error parsing row:', error.message);
      }
    });
    
    parser.on('end', async () => {
      try {
        // Insert remaining transactions
        await processBatch();
        
        console.log(`\nCSV data loaded successfully!`);
        console.log(`Total records processed: ${totalProcessed}`);
        
        // Verify count
        const finalCount = await Transaction.countDocuments();
        console.log(`Final database count: ${finalCount}`);
        
        resolve();
      } catch (error) {
        console.error('Error in final batch:', error);
        reject(error);
      }
    });
    
    parser.on('error', (error) => {
      console.error('Parser error:', error);
      reject(error);
    });
    
    stream.on('error', (error) => {
      console.error('Stream error:', error);
      reject(error);
    });
    
    stream.pipe(parser);
  });
};
