/**
 * Formats a number to Indian currency system (e.g. 1,23,456.78)
 */
export const formatINR = (value) => {
  if (value === null || value === undefined || isNaN(value)) return '0.00';
  const num = Number(value);
  return num.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

/**
 * Format Indian number format without currency symbol
 */
export const indianFormat = (val) => {
  if (!val && val !== 0) return '';
  return formatINR(val);
};

/**
 * Formats date to DD-MM-YYYY format
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};
