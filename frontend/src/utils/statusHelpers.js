// Status color constants
export const STATUS_COLORS = {
  LOW: '#dc3545',      // Red
  MEDIUM: '#ffc107',   // Yellow/Orange
  GOOD: '#28a745',     // Green
  FULL: '#6c757d',     // Gray
};

// Thresholds
export const THRESHOLDS = {
  LOW_STOCK: 20,
  MEDIUM_STOCK: 60,
  HIGH_CAPACITY: 70,
  CRITICAL_CAPACITY: 90,
};

/**
 * Get status color based on utilization percentage for stock levels
 */
export const getStockStatusColor = (utilizationPercentage) => {
  if (utilizationPercentage < THRESHOLDS.LOW_STOCK) return STATUS_COLORS.LOW;
  if (utilizationPercentage < THRESHOLDS.MEDIUM_STOCK) return STATUS_COLORS.MEDIUM;
  return STATUS_COLORS.GOOD;
};

/**
 * Get status color based on utilization percentage for capacity
 */
export const getCapacityStatusColor = (utilizationPercentage) => {
  if (utilizationPercentage > THRESHOLDS.CRITICAL_CAPACITY) return STATUS_COLORS.LOW;
  if (utilizationPercentage > THRESHOLDS.HIGH_CAPACITY) return STATUS_COLORS.MEDIUM;
  return STATUS_COLORS.GOOD;
};

/**
 * Get status label based on utilization
 */
export const getStatusLabel = (utilizationPercentage) => {
  if (utilizationPercentage === 0) return 'Empty';
  if (utilizationPercentage < THRESHOLDS.LOW_STOCK) return 'Low Stock';
  if (utilizationPercentage < THRESHOLDS.MEDIUM_STOCK) return 'Medium Stock';
  if (utilizationPercentage === 100) return 'Full';
  return 'Good Stock';
};

/**
 * Check if item is low stock
 */
export const isLowStock = (current, max) => {
  if (max === 0) return false;
  const utilization = (current / max) * 100;
  return utilization < THRESHOLDS.LOW_STOCK;
};
