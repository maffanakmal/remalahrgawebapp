import { catchAsync, sendSuccess } from '../utils/index.js';
import { HTTP_STATUS, MESSAGES } from '../constants/index.js';
import { getPagination, getPaginationMeta } from '../utils/pagination.js'; 

import {
  getAllLocationService,
  getLocationByIdService,
  getAllStockService,
  getStockByIdService,
  getStockByLocationIdService,
  getAllTransactionService,
  getTransactionByIdService,
  getTransactionDataTableService,
  getStockDataTableService,
  updateTransactionService,
  updateStockService,
  createBelanjaBulananService,
} from '../services/belanjabulanan.service.js';

// ── Location ──────────────────────────────────────────────────────────────────

export const getAllLocations = catchAsync(async (req, res) => {
  const rawPage = req.query.page;
  const rawLimit = req.query.limit;

  const { page, limit, offset } = getPagination(rawPage, rawLimit);
  
  // Jika Astro mendeteksi request master data, bypass limit hasil kalkulasi helper
  const finalLimit = rawLimit ? parseInt(rawLimit, 500) : limit;

  const { rows, total } = await getAllLocationService(finalLimit, offset);
  const meta = getPaginationMeta({ page, limit: finalLimit, total });

  // Menggunakan ekspresi asli res.status jika sendSuccess Anda memiliki auto-wrapper
  res.status(HTTP_STATUS.OK || 200).json({
    success: true,
    message: MESSAGES.SUCCESS,
    data: rows,
    meta
  });
});

export const getLocationById = catchAsync(async (req, res) => {
  const location = await getLocationByIdService(req.params.location_id);
  sendSuccess(res, { message: MESSAGES.SUCCESS, data: location });
});

// ── Stock ─────────────────────────────────────────────────────────────────────

export const getAllStocks =
  catchAsync(
    async (req, res) => {

      const result =
        await getStockDataTableService(
          {
            draw:
              Number(req.query.draw) || 1,

            start:
              Number(req.query.start) || 0,

            length:
              Number(req.query.length) || 10,

            search: {
              value:
                req.query[
                  'search[value]'
                ] || ''
            },

            order: [
              {
                column:
                  req.query[
                    'order[0][column]'
                  ],

                dir:
                  req.query[
                    'order[0][dir]'
                  ] || 'asc'
              }
            ]
          }
        );

      res.status(
        HTTP_STATUS.OK
      ).json({
        draw:
          result.draw,

        recordsTotal:
          result.total,

        recordsFiltered:
          result.filteredTotal,

        data:
          result.rows
      });
    }
  );

export const getStockById = catchAsync(async (req, res) => {
  const stock = await getStockByIdService(req.params.stock_id);
  sendSuccess(res, { message: MESSAGES.SUCCESS, data: stock });
});

export const getStockByLocationId = catchAsync(async (req, res) => {
  const stocks = await getStockByLocationIdService(req.params.location_id);
  sendSuccess(res, { message: MESSAGES.SUCCESS, data: stocks });
});

// ── Transaction ───────────────────────────────────────────────────────────────

// SSR Pagination
export const getAllTransactions = catchAsync(async (req, res) => {

  const result =
    await getTransactionDataTableService({
      draw: Number(req.query.draw) || 1,
      start: Number(req.query.start) || 0,
      length: Number(req.query.length) || 10,

      search: {
        value:
          req.query["search[value]"] || ""
      },

      order: [
        {
          column:
            req.query["order[0][column]"] || 0,

          dir:
            req.query["order[0][dir]"] || "desc"
        }
      ]
    });

  res.status(200).json(result);
});

export const getTransactionById = catchAsync(async (req, res) => {
  const transaction = await getTransactionByIdService(req.params.transaction_id);
  sendSuccess(res, { message: MESSAGES.SUCCESS, data: transaction });
});

export const updateTransaction = catchAsync(async (req, res) => {
  const updated = await updateTransactionService(req.params.transaction_id, req.body);
  sendSuccess(res, { message: MESSAGES.UPDATED, data: updated });
});

export const updateStock = catchAsync(async (req, res) => {
  const updated = await updateStockService(req.params.stock_id, req.body);
  sendSuccess(res, { message: MESSAGES.UPDATED, data: updated });
});

// ── Create ────────────────────────────────────────────────────────────────────

export const createBelanjaBulanan = catchAsync(async (req, res) => {
  // req.user?.user_id didapatkan secara aman dari auth middleware Anda
  const created = await createBelanjaBulananService(req.body, req.user?.user_id);
  
  sendSuccess(res, {
    statusCode: HTTP_STATUS.CREATED,
    message: MESSAGES.CREATED,
    data: created,
  });
});