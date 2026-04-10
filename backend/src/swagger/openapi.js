const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: '🍞 HAIQ Bakery API',
      version: '1.0.0',
      description: `
## HAIQ Bakery — REST API

Premium Ugandan bakery order management system.

### Authentication
- **Customer endpoints**: Use \`Bearer <access_token>\` from \`POST /v1/auth/login\`
- **Admin endpoints**: Use \`Bearer <admin_token>\` from \`POST /v1/admin/auth/login\`
- **Public endpoints**: No auth required

### Currency
All monetary values are in **UGX (Ugandan Shillings)**

### Timezone
All timestamps are **UTC**. Display in **Africa/Kampala (EAT, UTC+3)**

### Order Status Flow
\`pending\` → \`freshly_kneaded\` → \`ovenbound\` → \`on_the_cart\` → \`en_route\` → \`delivered\`

Any status can transition to \`cancelled\`
      `,
      contact: {
        name: 'HAIQ Bakery Dev',
        email: 'dev@haiq.ug',
      },
      license: { name: 'Proprietary' },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3001}/v1`,
        description: 'Local Development',
      },
      {
        url: 'https://api.haiq.ug/v1',
        description: 'Production',
      },
    ],
    components: {
      securitySchemes: {
        CustomerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Customer JWT token from POST /auth/login',
        },
        AdminAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Admin JWT token from POST /admin/auth/login',
        },
      },
      schemas: {
        // ─── Shared ───────────────────────────────────────────
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'Something went wrong' },
          },
        },
        ValidationError: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'Validation failed' },
            details: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string', example: 'email' },
                  message: { type: 'string', example: 'Invalid email address' },
                },
              },
            },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            total: { type: 'integer', example: 42 },
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 12 },
            totalPages: { type: 'integer', example: 4 },
          },
        },
        // ─── Product ──────────────────────────────────────────
        ProductVariant: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            label: { type: 'string', example: '6-inch' },
            price: { type: 'number', example: 185000 },
            stock_qty: { type: 'integer', example: 10 },
            is_default: { type: 'boolean', example: true },
          },
        },
        ProductImage: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            url: { type: 'string', example: 'https://res.cloudinary.com/haiq/...' },
            alt_text: { type: 'string' },
            sort_order: { type: 'integer' },
          },
        },
        Product: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            slug: { type: 'string', example: 'the-kampala-classic' },
            name: { type: 'string', example: 'The Kampala Classic' },
            subtitle: { type: 'string', example: '(Triple Chocolate)' },
            description: { type: 'string' },
            tasting_notes: { type: 'string' },
            base_price: { type: 'number', example: 185000 },
            is_active: { type: 'boolean' },
            is_featured: { type: 'boolean' },
            is_limited: { type: 'boolean' },
            category: { type: 'object', properties: { id: { type: 'integer' }, name: { type: 'string' }, slug: { type: 'string' } } },
            images: { type: 'array', items: { $ref: '#/components/schemas/ProductImage' } },
            variants: { type: 'array', items: { $ref: '#/components/schemas/ProductVariant' } },
            items: { type: 'array', items: { type: 'object', properties: { label: { type: 'string' }, sort_order: { type: 'integer' } } } },
          },
        },
        // ─── Order ────────────────────────────────────────────
        CartItem: {
          type: 'object',
          required: ['product_id', 'variant_id', 'quantity'],
          properties: {
            product_id: { type: 'string', format: 'uuid' },
            variant_id: { type: 'string', format: 'uuid' },
            quantity: { type: 'integer', minimum: 1, maximum: 100, example: 1 },
          },
        },
        CreateOrderRequest: {
          type: 'object',
          required: ['first_name', 'last_name', 'email', 'phone', 'delivery_address', 'items', 'payment_method', 'consent_given'],
          properties: {
            first_name: { type: 'string', example: 'Jane' },
            last_name: { type: 'string', example: 'Nakato' },
            email: { type: 'string', format: 'email', example: 'jane@example.com' },
            phone: { type: 'string', example: '+256701234567' },
            delivery_address: { type: 'string', example: 'Plot 12, Kampala Road, Kampala' },
            delivery_note: { type: 'string', example: 'Call on arrival' },
            gift_note: { type: 'string', example: 'Happy Birthday Amara!' },
            items: { type: 'array', minItems: 1, items: { $ref: '#/components/schemas/CartItem' } },
            payment_method: { type: 'string', enum: ['mtn_momo', 'airtel', 'cash_on_delivery'] },
            consent_given: { type: 'boolean', example: true },
          },
        },
        OrderItem: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            product_name: { type: 'string' },
            variant_label: { type: 'string' },
            unit_price: { type: 'number' },
            quantity: { type: 'integer' },
            line_total: { type: 'number' },
          },
        },
        TrackingStep: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            label: { type: 'string', example: 'Ovenbound 🔥' },
            timestamp: { type: 'string', format: 'date-time', nullable: true },
            done: { type: 'boolean' },
          },
        },
        // ─── Payment ──────────────────────────────────────────
        PaymentInitiateRequest: {
          type: 'object',
          required: ['order_id', 'payer_phone'],
          properties: {
            order_id: { type: 'string', format: 'uuid' },
            payer_phone: { type: 'string', example: '+256701234567' },
          },
        },
        PaymentStatusResponse: {
          type: 'object',
          properties: {
            internal_ref: { type: 'string' },
            status: { type: 'string', enum: ['initiated', 'pending', 'successful', 'failed', 'cancelled'] },
            amount: { type: 'number', example: 185000 },
            currency: { type: 'string', example: 'UGX' },
            provider_ref: { type: 'string', nullable: true },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        // ─── Auth ─────────────────────────────────────────────
        RegisterRequest: {
          type: 'object',
          required: ['email', 'password', 'first_name', 'last_name'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 8 },
            first_name: { type: 'string' },
            last_name: { type: 'string' },
            phone: { type: 'string', example: '+256701234567' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            access_token: { type: 'string' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                email: { type: 'string' },
                first_name: { type: 'string' },
                last_name: { type: 'string' },
              },
            },
          },
        },
      },
      responses: {
        Unauthorized: {
          description: 'Authentication required or token invalid',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
        },
        Forbidden: {
          description: 'Insufficient permissions',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
        },
        NotFound: {
          description: 'Resource not found',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
        },
        ValidationError: {
          description: 'Request validation failed',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ValidationError' } } },
        },
        TooManyRequests: {
          description: 'Rate limit exceeded',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
        },
      },
    },
    tags: [
      { name: 'Health',      description: 'Service health check' },
      { name: 'Auth',        description: 'Customer authentication' },
      { name: 'Products',    description: 'Product catalogue' },
      { name: 'Orders',      description: 'Order management' },
      { name: 'Tracking',    description: 'Public order tracking' },
      { name: 'Payments',    description: 'MTN MoMo, Airtel Money, Bank Transfer' },
      { name: 'Messages',    description: 'Customer-admin messaging' },
      { name: 'Newsletter',  description: 'Email subscription' },
      { name: 'Admin Auth',  description: 'Admin authentication' },
      { name: 'Admin Orders',    description: 'Admin order management' },
      { name: 'Admin Products',  description: 'Admin product management' },
      { name: 'Admin Messages',  description: 'Admin messaging' },
      { name: 'Admin Analytics', description: 'Business analytics' },
    ],
  },
  apis: [
    './src/routes/*.js',
    './src/routes/admin/*.js',
  ],
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = { swaggerSpec };
