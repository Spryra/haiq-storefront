/**
 * Format a number as UGX currency string
 * e.g. 185000 → "UGX 185,000"
 */
function formatUGX(amount) {
  if (amount == null) return 'UGX 0';
  return `UGX ${Number(amount).toLocaleString('en-UG', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

/**
 * Parse a UGX string back to number
 */
function parseUGX(str) {
  return parseInt(String(str).replace(/[^0-9]/g, ''), 10) || 0;
}

/**
 * Calculate delivery fee based on address area
 * Simple heuristic — extend with actual zone logic
 */
function calculateDeliveryFee(address = '') {
  const lower = address.toLowerCase();
  if (lower.includes('kampala') || lower.includes('wakiso')) return 5000;
  if (lower.includes('entebbe')) return 10000;
  if (lower.includes('jinja') || lower.includes('mukono')) return 20000;
  return 15000; // default
}

module.exports = { formatUGX, parseUGX, calculateDeliveryFee };
