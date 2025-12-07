import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let cachedData = null;
let isLoading = false;

export const loadCSVToMemory = () => {
  return new Promise((resolve, reject) => {
    if (cachedData) {
      return resolve(cachedData);
    }

    if (isLoading) {
      // Wait for existing load to complete
      const checkInterval = setInterval(() => {
        if (cachedData) {
          clearInterval(checkInterval);
          resolve(cachedData);
        }
      }, 100);
      return;
    }

    isLoading = true;
    const data = [];
    const csvPath = process.env.CSV_FILE_PATH || path.join(__dirname, '../../../truestate_assignment_dataset.csv');

    console.log('Loading CSV data from:', csvPath);

    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        try {
          data.push({
            transactionId: parseInt(row['Transaction ID']),
            date: row['Date'],
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
          });
        } catch (error) {
          console.error('Error parsing row:', error.message);
        }
      })
      .on('end', () => {
        cachedData = data;
        isLoading = false;
        console.log(`CSV data loaded: ${data.length} records`);
        resolve(cachedData);
      })
      .on('error', (error) => {
        isLoading = false;
        reject(error);
      });
  });
};

export const queryCSVData = async (filters) => {
  const data = await loadCSVToMemory();
  let results = [...data];

  // Apply search filter
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    results = results.filter(item =>
      item.customerName.toLowerCase().includes(searchLower) ||
      item.phoneNumber.includes(searchLower)
    );
  }

  // Apply filters
  if (filters.customerRegion && filters.customerRegion.length > 0) {
    results = results.filter(item => filters.customerRegion.includes(item.customerRegion));
  }

  if (filters.gender && filters.gender.length > 0) {
    results = results.filter(item => filters.gender.includes(item.gender));
  }

  if (filters.ageMin || filters.ageMax) {
    const min = filters.ageMin ? parseInt(filters.ageMin) : 0;
    const max = filters.ageMax ? parseInt(filters.ageMax) : 120;
    results = results.filter(item => item.age >= min && item.age <= max);
  }

  if (filters.productCategory && filters.productCategory.length > 0) {
    results = results.filter(item => filters.productCategory.includes(item.productCategory));
  }

  if (filters.tags && filters.tags.length > 0) {
    results = results.filter(item =>
      filters.tags.some(tag => item.tags.includes(tag))
    );
  }

  if (filters.paymentMethod && filters.paymentMethod.length > 0) {
    results = results.filter(item => filters.paymentMethod.includes(item.paymentMethod));
  }

  if (filters.dateFrom || filters.dateTo) {
    const from = filters.dateFrom ? new Date(filters.dateFrom) : new Date('1900-01-01');
    const to = filters.dateTo ? new Date(filters.dateTo) : new Date('2100-12-31');
    results = results.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= from && itemDate <= to;
    });
  }

  // Apply sorting
  if (filters.sortBy) {
    results.sort((a, b) => {
      let aVal = a[filters.sortBy];
      let bVal = b[filters.sortBy];

      if (filters.sortBy === 'date') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      } else if (filters.sortBy === 'customerName') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (filters.sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
  }

  // Calculate statistics
  const stats = {
    totalQuantity: results.reduce((sum, item) => sum + item.quantity, 0),
    totalAmount: results.reduce((sum, item) => sum + item.totalAmount, 0),
    totalDiscount: results.reduce((sum, item) => sum + (item.totalAmount - item.finalAmount), 0),
    transactionCount: results.length
  };

  // Apply pagination
  const page = filters.page || 1;
  const limit = filters.limit || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedResults = results.slice(startIndex, endIndex);

  return {
    transactions: paginatedResults,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(results.length / limit),
      totalItems: results.length,
      itemsPerPage: limit,
      hasNextPage: endIndex < results.length,
      hasPrevPage: page > 1
    },
    stats
  };
};

export const getFilterOptions = async () => {
  const data = await loadCSVToMemory();

  const uniqueValues = (key) => [...new Set(data.map(item => item[key]))].sort();
  const uniqueTags = [...new Set(data.flatMap(item => item.tags))].sort();

  return {
    customerRegion: uniqueValues('customerRegion'),
    gender: uniqueValues('gender'),
    productCategory: uniqueValues('productCategory'),
    tags: uniqueTags,
    paymentMethod: uniqueValues('paymentMethod')
  };
};
