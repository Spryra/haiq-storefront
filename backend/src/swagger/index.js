require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const express = require('express');
const swaggerUi = require('swagger-ui-express');
const { swaggerSpec } = require('./openapi');

const SWAGGER_PORT = parseInt(process.env.SWAGGER_PORT || '5010');

const app = express();

// Serve raw OpenAPI JSON for tooling
app.get('/openapi.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json(swaggerSpec);
});

// Custom Swagger UI options
const swaggerUiOptions = {
  customSiteTitle: '🍪 HAIQ Bakery API Documentation',
  customCss: `
    /* ╔═══════════════════════════════════════════════════════════╗
       ║     HAIQ Bakery — Premium API Theme (2026)                ║
       ║     "Made For You" • Kampala, Uganda                      ║
       ╚═══════════════════════════════════════════════════════════╝ */

    /* ─── Root & Body Styling ─── */
    * { box-sizing: border-box; }
    body {
      background: linear-gradient(135deg, #1A0A00 0%, #2A1200 50%, #1A0A00 100%);
      background-attachment: fixed;
    }

    /* ─── Topbar (Header) ─── */
    .swagger-ui .topbar {
      background: linear-gradient(90deg, #1A0A00 0%, #2A1200 50%, #1A0A00 100%);
      border-bottom: 3px solid #B8752A;
      box-shadow: 0 4px 12px rgba(0,0,0,0.5);
      padding: 16px 24px;
    }

    .swagger-ui .topbar-wrapper img { display: none; }

    .swagger-ui .topbar-wrapper::before {
      content: '🍪';
      font-size: 24px;
      margin-right: 12px;
    }

    .swagger-ui .topbar-wrapper::after {
      content: 'HAIQ Bakery API';
      color: #F2EAD8;
      font-size: 22px;
      font-weight: 700;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      background: linear-gradient(135deg, #B8752A, #D4A574);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    /* ─── Info Section ─── */
    .swagger-ui .info {
      background: rgba(42, 18, 0, 0.6);
      border: 2px solid #B8752A;
      border-radius: 12px;
      padding: 28px !important;
      margin: 24px 0 !important;
      backdrop-filter: blur(10px);
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.1);
    }

    .swagger-ui .info .title {
      color: #F2EAD8;
      font-size: 2.2rem;
      font-weight: 800;
      letter-spacing: -0.5px;
      margin-bottom: 8px;
    }

    .swagger-ui .info .description {
      color: #F2EAD8;
      font-size: 1rem;
      line-height: 1.6;
    }

    .swagger-ui .info p,
    .swagger-ui .info li,
    .swagger-ui .info code {
      color: #F2EAD8 !important;
    }

    .swagger-ui .info a {
      color: #B8752A;
      text-decoration: none;
      font-weight: 600;
      transition: all 0.2s ease;
    }

    .swagger-ui .info a:hover {
      color: #D4A574;
      text-decoration: underline;
    }

    /* ─── Scheme Container (Server Selection) ─── */
    .swagger-ui .scheme-container {
      background: rgba(42, 18, 0, 0.4);
      border: 2px dashed #B8752A;
      border-radius: 8px;
      padding: 16px;
    }

    /* ─── Operation Tags (Endpoint Groups) ─── */
    .swagger-ui .opblock-tag {
      color: #F2EAD8;
      border-bottom: 2px solid rgba(184, 117, 42, 0.3);
      font-size: 1.2rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      padding: 12px 0;
      transition: all 0.3s ease;
    }

    .swagger-ui .opblock-tag:hover {
      background: rgba(184, 117, 42, 0.15);
      border-bottom-color: #B8752A;
      padding-left: 4px;
    }

    /* ─── Operation Blocks (Endpoints) ─── */
    .swagger-ui .opblock {
      border: 1px solid rgba(184, 117, 42, 0.4);
      border-radius: 10px;
      margin: 8px 0;
      background: rgba(42, 18, 0, 0.3);
      transition: all 0.3s ease;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }

    .swagger-ui .opblock:hover {
      border-color: #B8752A;
      background: rgba(42, 18, 0, 0.5);
      box-shadow: 0 4px 16px rgba(184, 117, 42, 0.2);
    }

    /* Method Badges */
    .swagger-ui .opblock.opblock-get .opblock-summary-method {
      background: linear-gradient(135deg, #1a7c4d, #2a9d63);
      color: #F2EAD8;
      font-weight: 700;
      box-shadow: 0 4px 12px rgba(26, 124, 77, 0.4);
    }

    .swagger-ui .opblock.opblock-post .opblock-summary-method {
      background: linear-gradient(135deg, #B8752A, #D4A574);
      color: #1A0A00;
      font-weight: 700;
      box-shadow: 0 4px 12px rgba(184, 117, 42, 0.4);
    }

    .swagger-ui .opblock.opblock-put .opblock-summary-method {
      background: linear-gradient(135deg, #8b6914, #a8845a);
      color: #F2EAD8;
      font-weight: 700;
      box-shadow: 0 4px 12px rgba(139, 105, 20, 0.4);
    }

    .swagger-ui .opblock.opblock-patch .opblock-summary-method {
      background: linear-gradient(135deg, #6b5914, #8b7535);
      color: #F2EAD8;
      font-weight: 700;
      box-shadow: 0 4px 12px rgba(107, 89, 20, 0.4);
    }

    .swagger-ui .opblock.opblock-delete .opblock-summary-method {
      background: linear-gradient(135deg, #c93a3a, #e85d5d);
      color: #F2EAD8;
      font-weight: 700;
      box-shadow: 0 4px 12px rgba(201, 58, 58, 0.4);
    }

    /* Endpoint Path & Description */
    .swagger-ui .opblock .opblock-summary-path {
      color: #F2EAD8;
      font-weight: 500;
      font-family: 'Courier New', monospace;
    }

    .swagger-ui .opblock .opblock-summary-description {
      color: rgba(242, 234, 216, 0.7);
    }

    /* ─── Headers & Sections ─── */
    .swagger-ui .opblock-section-header {
      background: rgba(184, 117, 42, 0.15);
      border-bottom: 1px solid rgba(184, 117, 42, 0.3);
      color: #D4A574;
      font-weight: 700;
    }

    .swagger-ui .opblock-body-parameter-override {
      background: rgba(42, 18, 0, 0.4);
      border: 1px solid rgba(184, 117, 42, 0.2);
    }

    /* ─── Buttons ─── */
    .swagger-ui .btn {
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      font-weight: 700;
      letter-spacing: 0.05em;
    }

    .swagger-ui .btn.execute {
      background: linear-gradient(135deg, #B8752A, #D4A574) !important;
      color: #1A0A00 !important;
      border-color: #B8752A !important;
      box-shadow: 0 4px 12px rgba(184, 117, 42, 0.3);
      text-transform: uppercase;
    }

    .swagger-ui .btn.execute:hover {
      background: linear-gradient(135deg, #D4A574, #E8C8A0) !important;
      box-shadow: 0 6px 20px rgba(184, 117, 42, 0.5) !important;
      transform: translateY(-2px);
    }

    .swagger-ui .btn.authorize {
      color: #B8752A;
      border-color: #B8752A;
      background: rgba(184, 117, 42, 0.1);
      transition: all 0.3s ease;
    }

    .swagger-ui .btn.authorize:hover {
      background: rgba(184, 117, 42, 0.2);
      color: #D4A574;
    }

    /* ─── Models & Schemas ─── */
    .swagger-ui .model-box,
    .swagger-ui .model {
      background: rgba(42, 18, 0, 0.4);
      border: 1px solid rgba(184, 117, 42, 0.3);
      color: #F2EAD8;
      border-radius: 6px;
    }

    .swagger-ui .model-title {
      color: #B8752A;
      font-weight: 700;
    }

    /* ─── Response Section ─── */
    .swagger-ui .responses-wrapper {
      color: #F2EAD8;
    }

    .swagger-ui .response-col_description {
      color: #F2EAD8;
    }

    .swagger-ui .response-col_status {
      color: #D4A574;
      font-weight: 700;
    }

    /* ─── Tables ─── */
    .swagger-ui table thead tr td,
    .swagger-ui table thead tr th {
      color: #B8752A;
      border-bottom: 2px solid #B8752A;
      background: rgba(184, 117, 42, 0.1);
      font-weight: 700;
    }

    .swagger-ui table tbody tr:hover {
      background: rgba(184, 117, 42, 0.08) !important;
    }

    .swagger-ui table tbody tr td {
      color: #F2EAD8;
      border-color: rgba(184, 117, 42, 0.2);
    }

    /* ─── Tabs ─── */
    .swagger-ui .tab li {
      color: #8C7355;
      border-bottom: 2px solid transparent;
      transition: all 0.3s ease;
    }

    .swagger-ui .tab li.active {
      color: #B8752A;
      border-bottom-color: #B8752A;
    }

    .swagger-ui .tab li:hover {
      color: #D4A574;
    }

    /* ─── Form Inputs ─── */
    .swagger-ui select,
    .swagger-ui input[type=text],
    .swagger-ui input[type=email],
    .swagger-ui input[type=password],
    .swagger-ui textarea {
      background: rgba(42, 18, 0, 0.6);
      color: #F2EAD8;
      border: 2px solid rgba(184, 117, 42, 0.3);
      border-radius: 6px;
      padding: 10px 12px;
      font-family: 'Courier New', monospace;
      transition: all 0.3s ease;
    }

    .swagger-ui select:focus,
    .swagger-ui input[type=text]:focus,
    .swagger-ui input[type=email]:focus,
    .swagger-ui input[type=password]:focus,
    .swagger-ui textarea:focus {
      border-color: #B8752A;
      box-shadow: 0 0 0 3px rgba(184, 117, 42, 0.2);
      background: rgba(42, 18, 0, 0.8);
    }

    /* ─── Parameters ─── */
    .swagger-ui .parameter__name {
      color: #B8752A;
      font-weight: 700;
    }

    .swagger-ui .parameter__type {
      color: rgba(242, 234, 216, 0.6);
      font-style: italic;
    }

    /* ─── Messages ─── */
    .swagger-ui .response-control-media-type__accept-message {
      color: #F2EAD8;
    }

    /* ─── Scrollbar Styling ─── */
    .swagger-ui ::-webkit-scrollbar {
      width: 10px;
      height: 10px;
    }

    .swagger-ui ::-webkit-scrollbar-track {
      background: rgba(26, 10, 0, 0.3);
    }

    .swagger-ui ::-webkit-scrollbar-thumb {
      background: #B8752A;
      border-radius: 5px;
    }

    .swagger-ui ::-webkit-scrollbar-thumb:hover {
      background: #D4A574;
    }

    /* ─── Container & Layout ─── */
    .swagger-ui .container {
      max-width: 1200px;
      margin: 0 auto;
    }

    /* ─── Code Blocks ─── */
    .swagger-ui code {
      background: rgba(0, 0, 0, 0.5);
      color: #B8752A;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
    }

    /* ─── Footer Brand ─── */
    .swagger-ui .info-item {
      color: #F2EAD8;
    }

    .swagger-ui .info .base-url {
      color: #B8752A;
      font-weight: 700;
    }

    /* ─── Loading & States ─── */
    .swagger-ui .loading::before {
      border: 3px solid rgba(184, 117, 42, 0.2);
      border-right: 3px solid #B8752A;
    }

    /* ─── Links ─── */
    .swagger-ui a {
      color: #B8752A;
      text-decoration: none;
      transition: color 0.2s ease;
    }

    .swagger-ui a:hover {
      color: #D4A574;
      text-decoration: underline;
    }

    /* ─── Success/Error States ─── */
    .swagger-ui .response.success {
      border-color: #1a7c4d;
      background: rgba(26, 124, 77, 0.1);
    }

    .swagger-ui .response.error {
      border-color: #c93a3a;
      background: rgba(201, 58, 58, 0.1);
    }

    /* ─── Animation ─── */
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .swagger-ui .opblock {
      animation: fadeIn 0.3s ease-out;
    }
  `,
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    tryItOutEnabled: true,
    defaultModelsExpandDepth: 2,
    defaultModelExpandDepth: 2,
    docExpansion: 'list',
    tagsSorter: 'alpha',
    layout: 'BaseLayout',
  },
};

app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));

app.listen(SWAGGER_PORT, () => {
  console.log(`\n🍞 HAIQ Swagger UI running at http://localhost:${SWAGGER_PORT}`);
  console.log(`📄 OpenAPI JSON:            http://localhost:${SWAGGER_PORT}/openapi.json`);
  console.log(`🔗 Target API:              http://localhost:${process.env.PORT || 3001}/v1\n`);
});

module.exports = app;
