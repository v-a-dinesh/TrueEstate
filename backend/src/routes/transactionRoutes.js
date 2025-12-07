import express from 'express';
import { getTransactions, getFilterOptions } from '../controllers/transactionController.js';

const router = express.Router();

router.get('/transactions', getTransactions);
router.get('/filter-options', getFilterOptions);

export default router;
