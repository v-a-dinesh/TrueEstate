import { getDb } from '../utils/tursoDatabase.js';
import { queryCSVData, getFilterOptions as getCSVFilterOptions } from '../utils/csvFallback.js';

class TransactionService {
  constructor() {
    this.useTurso = true; // Try Turso first
  }

  async getTransactions(filters) {
    // Try Turso first, fallback to CSV
    if (this.useTurso) {
      try {
        console.log('Attempting Turso database query...');
        const result = await this.getTransactionsFromTurso(filters);
        
        // If Turso returns empty data, check if it's because DB is empty
        if (result.transactions.length === 0 && result.pagination.totalItems === 0) {
          // Check if this is first query - if so, Turso might be empty
          const countCheck = await this.checkTursoHasData();
          if (!countCheck) {
            console.warn('Turso database is empty, falling back to CSV');
            this.useTurso = false;
            return await queryCSVData(filters);
          }
        }
        
        return result;
      } catch (error) {
        console.warn('Turso query failed, falling back to CSV:', error.message);
        this.useTurso = false; // Disable Turso for subsequent requests
      }
    }
    
    // Fallback to CSV
    console.log('Using CSV fallback for data retrieval');
    return await queryCSVData(filters);
  }

  async checkTursoHasData() {
    try {
      const db = getDb();
      if (!db) return false;
      
      const result = await db.execute('SELECT COUNT(*) as count FROM transactions LIMIT 1');
      return result.rows[0].count > 0;
    } catch (error) {
      return false;
    }
  }

  async getTransactionsFromTurso(filters) {
    const db = getDb();
    if (!db) {
      throw new Error('Turso database not connected');
    }
    const {
      search = '',
      customerRegion = [],
      gender = [],
      ageMin,
      ageMax,
      productCategory = [],
      tags = [],
      paymentMethod = [],
      dateFrom,
      dateTo,
      sortBy = 'date',
      sortOrder = 'desc',
      page = 1,
      limit = 10
    } = filters;

    // Build WHERE clause
    const conditions = [];
    const params = [];

    if (search) {
      conditions.push('(customerName LIKE ? OR phoneNumber LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    if (customerRegion.length > 0) {
      conditions.push(`customerRegion IN (${customerRegion.map(() => '?').join(',')})`);
      params.push(...customerRegion);
    }

    if (gender.length > 0) {
      conditions.push(`gender IN (${gender.map(() => '?').join(',')})`);
      params.push(...gender);
    }

    if (ageMin) {
      conditions.push('age >= ?');
      params.push(parseInt(ageMin));
    }

    if (ageMax) {
      conditions.push('age <= ?');
      params.push(parseInt(ageMax));
    }

    if (productCategory.length > 0) {
      conditions.push(`productCategory IN (${productCategory.map(() => '?').join(',')})`);
      params.push(...productCategory);
    }

    if (paymentMethod.length > 0) {
      conditions.push(`paymentMethod IN (${paymentMethod.map(() => '?').join(',')})`);
      params.push(...paymentMethod);
    }

    if (tags.length > 0) {
      const tagConditions = tags.map(() => 'tags LIKE ?').join(' OR ');
      conditions.push(`(${tagConditions})`);
      params.push(...tags.map(tag => `%${tag}%`));
    }

    if (dateFrom) {
      conditions.push('date >= ?');
      params.push(dateFrom);
    }

    if (dateTo) {
      conditions.push('date <= ?');
      params.push(dateTo);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Build ORDER BY clause
    let orderByClause = 'ORDER BY ';
    if (sortBy === 'date') {
      orderByClause += `date ${sortOrder.toUpperCase()}`;
    } else if (sortBy === 'quantity') {
      orderByClause += `quantity ${sortOrder.toUpperCase()}`;
    } else if (sortBy === 'customerName') {
      orderByClause += `customerName ${sortOrder.toUpperCase()}`;
    } else {
      orderByClause += `date DESC`;
    }

    // Pagination
    const offset = (page - 1) * limit;

    // Get total count
    const countQuery = `SELECT COUNT(*) as count FROM transactions ${whereClause}`;
    const countResult = await db.execute({ sql: countQuery, args: params });
    const totalCount = countResult.rows[0].count;

    // Get transactions
    const dataQuery = `
      SELECT * FROM transactions 
      ${whereClause} 
      ${orderByClause} 
      LIMIT ? OFFSET ?
    `;
    const dataResult = await db.execute({ 
      sql: dataQuery, 
      args: [...params, limit, offset] 
    });

    // Calculate statistics
    const statsQuery = `
      SELECT 
        SUM(quantity) as totalQuantity,
        SUM(totalAmount) as totalAmount,
        SUM(totalAmount - finalAmount) as totalDiscount,
        COUNT(*) as transactionCount
      FROM transactions 
      ${whereClause}
    `;
    const statsResult = await db.execute({ sql: statsQuery, args: params });
    const stats = statsResult.rows[0];

    // Parse tags from string to array
    const transactions = dataResult.rows.map(row => ({
      ...row,
      tags: row.tags ? row.tags.split(',').map(t => t.trim()) : []
    }));

    return {
      transactions,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        itemsPerPage: limit,
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPrevPage: page > 1
      },
      stats: {
        totalQuantity: stats.totalQuantity || 0,
        totalAmount: stats.totalAmount || 0,
        totalDiscount: stats.totalDiscount || 0,
        transactionCount: stats.transactionCount || 0
      }
    };
  }

  async getFilterOptions() {
    // Try Turso first, fallback to CSV
    if (this.useTurso) {
      try {
        console.log('Attempting Turso filter options query...');
        return await this.getFilterOptionsFromTurso();
      } catch (error) {
        console.warn('Turso filter options failed, falling back to CSV:', error.message);
        this.useTurso = false;
      }
    }
    
    // Fallback to CSV
    console.log('Using CSV fallback for filter options');
    return await getCSVFilterOptions();
  }

  async getFilterOptionsFromTurso() {
    const db = getDb();
    if (!db) {
      throw new Error('Turso database not connected');
    }

    const [regionResult, genderResult, categoryResult, paymentResult] = await Promise.all([
      db.execute('SELECT DISTINCT customerRegion FROM transactions ORDER BY customerRegion'),
      db.execute('SELECT DISTINCT gender FROM transactions ORDER BY gender'),
      db.execute('SELECT DISTINCT productCategory FROM transactions ORDER BY productCategory'),
      db.execute('SELECT DISTINCT paymentMethod FROM transactions ORDER BY paymentMethod')
    ]);

    // Get unique tags (they're stored as comma-separated strings)
    const tagsResult = await db.execute('SELECT DISTINCT tags FROM transactions');
    const allTags = new Set();
    tagsResult.rows.forEach(row => {
      if (row.tags) {
        row.tags.split(',').forEach(tag => allTags.add(tag.trim()));
      }
    });

    return {
      customerRegion: regionResult.rows.map(r => r.customerRegion),
      gender: genderResult.rows.map(r => r.gender),
      productCategory: categoryResult.rows.map(r => r.productCategory),
      tags: Array.from(allTags).sort(),
      paymentMethod: paymentResult.rows.map(r => r.paymentMethod)
    };
  }
}

export default new TransactionService();
