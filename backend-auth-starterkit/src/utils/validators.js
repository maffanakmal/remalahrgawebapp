import { AppError } from "./appError.js";
import { HTTP_STATUS } from "../constants/index.js";

export const requireField = (value, fieldName) => {
  if (!value && value !== 0) {
    throw new AppError(`${fieldName} wajib diisi`, HTTP_STATUS.BAD_REQUEST);
  }
};

export const requireMinNumber = (value, fieldName, min) => {
  if (value < min) {
    throw new AppError(`${fieldName} minimal ${min}`, HTTP_STATUS.BAD_REQUEST);
  }
};

export const requireMaxNumber = (value, fieldName, max) => {
  if (value > max) {
    throw new AppError(`${fieldName} maksimal ${max}`, HTTP_STATUS.BAD_REQUEST);
  }
};

export const requireInteger = (value, fieldName) => {
  if (!Number.isInteger(value)) {
    throw new AppError(`${fieldName} harus bilangan bulat`, HTTP_STATUS.BAD_REQUEST);
  }
};

export const requireMinLength = (arr, fieldName, min) => {
  if (!arr?.length || arr.length < min) {
    throw new AppError(`${fieldName} minimal ${min} item`, HTTP_STATUS.BAD_REQUEST);
  }
};

export const requireMaxLength = (arr, fieldName, max) => {
  if (arr?.length > max) {
    throw new AppError(`${fieldName} maksimal ${max} item`, HTTP_STATUS.BAD_REQUEST);
  }
};

export const requireNoDuplicate = (arr, key, fieldName) => {
  const values = arr.filter((item) => item[key]).map((item) => item[key]);
  if (values.length !== new Set(values).size) {
    throw new AppError(`Terdapat ${fieldName} duplikat`, HTTP_STATUS.BAD_REQUEST);
  }
};

export const requireExists = (data, fieldName) => {
  if (!data) {
    throw new AppError(`${fieldName} tidak ditemukan`, HTTP_STATUS.NOT_FOUND);
  }
};