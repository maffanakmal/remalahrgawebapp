export const rules = {
  required: (label) => (value) => {
    if (value === null || value === undefined || value === "") return `"${label}" wajib diisi.`;
    if (Array.isArray(value) && value.length === 0) return `"${label}" wajib diisi.`;
    return null;
  },

  min: (min, label) => (value) =>
    Number(value) < min ? `${label} harus minimal ${min}.` : null,

  max: (max, label) => (value) =>
    Number(value) > max ? `"${label}" tidak boleh melebihi ${max}.` : null,

  email: (label) => (value) => {
    if (!value) return null;
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(value) ? null : `${label} tidak valid.`;
  },

  minLength: (min, label) => (value) =>
    value?.toString().trim().length < min
      ? `${label} minimal ${min} karakter.`
      : null,

  maxLength: (max, label) => (value) =>
    value?.toString().trim().length > max
      ? `${label} maksimal ${max} karakter.`
      : null,

  numeric: (label) => (value) => {
    if (value === null || value === undefined || value === "") return null;
    return isNaN(Number(value)) ? `${label} harus berupa angka.` : null;
  },

  unique: (set, label) => (value) => {
    if (!set) return null;
    return set.has(value) ? `${label} dipilih lebih dari satu kali.` : null;
  },

  confirmedPassword: (passwordValue, label) => (value) =>
    value !== passwordValue ? `${label} tidak cocok dengan Password.` : null,

  fileExtension: (allowedExtensions = [], label) => (value) => {
    if (!value || !(value instanceof File) || !value.name) return null;
    const ext = value.name.split('.').pop().toLowerCase();
    return allowedExtensions.includes(ext) 
      ? null 
      : `${label} harus bertipe: ${allowedExtensions.join(', ')}.`;
  },

  passwordStrength: (label) => (value) => {
    if (!value) return null;
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(value)
      ? null
      : `${label} harus minimal 8 karakter, termasuk huruf besar, huruf kecil, angka, dan simbol.`;
  },

  fileSize: (maxSizeMB, label) => (value) => {
    if (!value || !(value instanceof File)) return null;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return value.size > maxSizeBytes
      ? `${label} tidak boleh lebih dari ${maxSizeMB} MB.`
      : null;
  },
};

export function validate(data, validationRules) {
  const errors = {};

  for (const field in validationRules) {
    for (const rule of validationRules[field]) {
      const error = rule(data[field]);
      if (error) {
        errors[field] = error;
        break;
      }
    }
  }
  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}