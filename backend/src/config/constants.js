module.exports = {
  // Order statuses (simplified)
  ORDER_STATUSES: {
    PENDING:      'pending',
    EN_ROUTE:     'en_route',
    DELIVERED:    'delivered',
    CANCELLED:    'cancelled',
  },

  STATUS_LABELS: {
    pending:      { label: 'Order Received',    emoji: '📋' },
    en_route:     { label: 'En Route',          emoji: '🚴' },
    delivered:    { label: 'Delivered Delight', emoji: '🎉' },
    cancelled:    { label: 'Order Cancelled',   emoji: '❌' },
  },

  // Valid status transitions
  STATUS_TRANSITIONS: {
    pending:      ['en_route', 'cancelled'],
    en_route:     ['delivered', 'cancelled'],
    delivered:    [],
    cancelled:    [],
  },

  // Payment methods
  PAYMENT_METHODS: {
    MTN_MOMO:       'mtn_momo',
    AIRTEL:         'airtel',
    BANK_TRANSFER:  'bank_transfer',
  },

  // Payment statuses
  PAYMENT_STATUSES: {
    INITIATED:   'initiated',
    PENDING:     'pending',
    SUCCESSFUL:  'successful',
    FAILED:      'failed',
    CANCELLED:   'cancelled',
    REFUNDED:    'refunded',
  },

  // Admin roles
  ROLES: {
    STAFF:      'staff',
    SUPERADMIN: 'superadmin',
  },

  // Currency
  CURRENCY: 'UGX',
  LOCALE:   'Africa/Kampala',

  // Pagination defaults
  DEFAULT_PAGE:  1,
  DEFAULT_LIMIT: 12,
  MAX_LIMIT:     100,

  // File upload
  MAX_FILE_SIZE_BYTES: 5 * 1024 * 1024, // 5MB
  ALLOWED_MIME_TYPES:  ['image/jpeg', 'image/png', 'image/webp'],

  // SSE
  SSE_HEARTBEAT_MS: 30000,

  // Payment polling
  PAYMENT_POLL_INTERVAL_MS: 3000,
  PAYMENT_TIMEOUT_MS:       5 * 60 * 1000, // 5 minutes

  // Webhook replay window (seconds)
  WEBHOOK_REPLAY_WINDOW_S: 300,
};
