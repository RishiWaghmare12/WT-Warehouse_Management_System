/**
 * Calculate utilization percentage
 */
export const calculateUtilization = (current, max) => {
  if (max === 0) return 0;
  return Math.round((current / max) * 100);
};

/**
 * Get available space
 */
export const getAvailableSpace = (current, max) => {
  return Math.max(0, max - current);
};

/**
 * Format date to localized string
 */
export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString();
};

/**
 * Format date to short format
 */
export const formatDateShort = (dateString) => {
  return new Date(dateString).toLocaleDateString();
};
