import express from 'express';
import {
  getAllKendaraan,
  getAllReporting,
  getKendaraanByPlateNumber,
  getReportingById,
  getReportingByPlateNumber,
  createReportingKendaraan,
} from '../controllers/inventoryKendaraan.controller.js';
import { authenticate, authorize } from '../middleware/index.js';

const router = express.Router();

const isGA = [authenticate, authorize('GA')];

// ── Kendaraan ─────────────────────────────────────────────────────────────────
// router.get('/kendaraan', getAllKendaraan);
// router.get('/kendaraan/search', getKendaraanByPlateNumber);   // ?plate_number=

// ── Reporting ─────────────────────────────────────────────────────────────────
// router.get('/reporting', getAllReporting);
// router.get('/reporting/:report_id', getReportingById);
// router.get('/reporting/search', getReportingByPlateNumber);   // ?plate_number=
// router.post('/reporting', authenticate, createReportingKendaraan);
// router.post('/reporting', createReportingKendaraan);

// ── GA only ───────────────────────────────────────────────────────────────────
router.get('/ga/kendaraan', ...isGA, getAllKendaraan);
router.get('/ga/kendaraan/search/:plate_number', ...isGA, getKendaraanByPlateNumber);

router.get('/ga/reporting', ...isGA, getAllReporting);
router.get('/ga/reporting/:report_id', ...isGA, getReportingById);
router.get('/ga/reporting/search/:plate_number', ...isGA, getReportingByPlateNumber);
router.post('/ga/reporting', ...isGA, createReportingKendaraan);

export default router;