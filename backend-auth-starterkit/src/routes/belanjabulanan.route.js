import express from 'express';
import {
  getAllLocations,
  getLocationById,
  getAllStocks,
  getStockById,
  getStockByLocationId,
  getAllTransactions,
  getTransactionById,
  updateTransaction,
  updateStock,
  createBelanjaBulanan,
} from '../controllers/belanjabulanan.controller.js';
import { authenticate, authorize } from '../middleware/index.js';

const router = express.Router();

const isGA = [authenticate, authorize('GA')];

// ── Locations ─────────────────────────────────────────────────────────────────
router.get('/locations', getAllLocations);
router.get('/transactions', getAllTransactions);
router.get('/locations/:location_id', getLocationById);

// ── Stocks ────────────────────────────────────────────────────────────────────
router.get('/stocks', getAllStocks);
router.get('/stocks/by-location/:location_id', getStockByLocationId); // ✅ spesifik dulu
router.get('/stocks/:stock_id', getStockById);

// ── Transactions (public) ─────────────────────────────────────────────────────
router.post('/transactions', createBelanjaBulanan);

// ── GA only ───────────────────────────────────────────────────────────────────
router.get('/ga/locations', ...isGA, getAllLocations);  
router.get('/ga/locations/:location_id', ...isGA, getLocationById);
router.get('/ga/stocks', ...isGA, getAllStocks);
router.get('/ga/stocks/by-location/:location_id', ...isGA, getStockByLocationId); // ✅ spesifik dulu
router.get('/ga/stocks/:stock_id', ...isGA, getStockById);
router.patch('/ga/stocks/:stock_id', ...isGA, updateStock);

router.get('/ga/transactions', ...isGA, getAllTransactions);
router.get('/ga/transactions/:transaction_id', ...isGA, getTransactionById);
router.patch('/ga/transactions/:transaction_id', ...isGA, updateTransaction);
router.post('/ga/transactions', ...isGA, createBelanjaBulanan);

export default router;