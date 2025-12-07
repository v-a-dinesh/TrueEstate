import TransactionService from '../services/transactionService.js';

export const getTransactions = async (req, res) => {
  try {
    const filters = {
      search: req.query.search,
      customerRegion: req.query.customerRegion ? 
        (Array.isArray(req.query.customerRegion) ? req.query.customerRegion : [req.query.customerRegion]) : [],
      gender: req.query.gender ? 
        (Array.isArray(req.query.gender) ? req.query.gender : [req.query.gender]) : [],
      ageMin: req.query.ageMin,
      ageMax: req.query.ageMax,
      productCategory: req.query.productCategory ? 
        (Array.isArray(req.query.productCategory) ? req.query.productCategory : [req.query.productCategory]) : [],
      tags: req.query.tags ? 
        (Array.isArray(req.query.tags) ? req.query.tags : [req.query.tags]) : [],
      paymentMethod: req.query.paymentMethod ? 
        (Array.isArray(req.query.paymentMethod) ? req.query.paymentMethod : [req.query.paymentMethod]) : [],
      dateFrom: req.query.dateFrom,
      dateTo: req.query.dateTo,
      sortBy: req.query.sortBy || 'date',
      sortOrder: req.query.sortOrder || 'desc',
      page: req.query.page || 1,
      limit: req.query.limit || 10
    };

    const result = await TransactionService.getTransactions(filters);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error in getTransactions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching transactions',
      error: error.message
    });
  }
};

export const getFilterOptions = async (req, res) => {
  try {
    const options = await TransactionService.getFilterOptions();
    
    res.json({
      success: true,
      data: options
    });
  } catch (error) {
    console.error('Error in getFilterOptions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching filter options',
      error: error.message
    });
  }
};
