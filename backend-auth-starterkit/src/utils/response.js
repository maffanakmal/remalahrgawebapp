import { HTTP_STATUS, MESSAGES } from '../constants/index.js';

export const sendSuccess = (res, {
  data = null,
  message = MESSAGES.SUCCESS,
  statusCode = HTTP_STATUS.OK,
  meta = null,
} = {}) => {
  const body = { success: true, message };

  if (data !== null) body.data = data;
  if (meta !== null) body.meta = meta;

  return res.status(statusCode).json(body);
};

export const sendError = (res, {
  message = MESSAGES.INTERNAL_ERROR,
  statusCode = HTTP_STATUS.INTERNAL_ERROR,
  errors = null,
} = {}) => {
  const body = { success: false, message };

  if (errors !== null) body.errors = errors;

  return res.status(statusCode).json(body);
};