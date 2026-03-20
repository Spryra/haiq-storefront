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
  customSiteTitle: '🍞 HAIQ API Docs',
  customCss: `
    /* ─── HAIQ Bakery Swagger Theme ─── */
    body { background-color: #0E0E10; }

    .swagger-ui { font-family: 'Inter', system-ui, sans-serif; }

    .swagger-ui .topbar {
      background-color: #0E0E10;
      border-bottom: 1px solid #C19A6B;
      padding: 12px 0;
    }
    .swagger-ui .topbar-wrapper img { display: none; }
    .swagger-ui .topbar-wrapper::before {
      content: '🍞 HAIQ Bakery API';
      color: #C19A6B;
      font-size: 20px;
      font-weight: 700;
      letter-spacing: 0.1em;
    }

    .swagger-ui .info { background: #0E0E10; margin: 20px 0; }
    .swagger-ui .info .title { color: #FBF8F4; font-size: 2rem; }
    .swagger-ui .info p,
    .swagger-ui .info li,
    .swagger-ui .info code { color: #FBF8F4 !important; }

    .swagger-ui .scheme-container {
      background: #1a1a1d;
      border: 1px solid #C19A6B33;
      border-radius: 8px;
    }

    .swagger-ui .opblock-tag {
      color: #FBF8F4;
      border-bottom: 1px solid #C19A6B44;
      font-size: 1.1rem;
    }
    .swagger-ui .opblock-tag:hover { background: #1a1a1d; }

    .swagger-ui .opblock { border-radius: 8px; margin: 6px 0; }

    .swagger-ui .opblock.opblock-get .opblock-summary-method { background: #1a6b3c; }
    .swagger-ui .opblock.opblock-post .opblock-summary-method { background: #C19A6B; color: #0E0E10; }
    .swagger-ui .opblock.opblock-put .opblock-summary-method { background: #8b6914; }
    .swagger-ui .opblock.opblock-patch .opblock-summary-method { background: #6b4c14; }
    .swagger-ui .opblock.opblock-delete .opblock-summary-method { background: #8b1414; }

    .swagger-ui .opblock .opblock-summary-path { color: #FBF8F4; }
    .swagger-ui .opblock .opblock-summary-description { color: #FBF8F4aa; }
    .swagger-ui .opblock-body-parameter-override,
    .swagger-ui .opblock-section-header { background: #1a1a1d; }

    .swagger-ui .btn.execute {
      background: #C19A6B !important;
      color: #0E0E10 !important;
      border-color: #C19A6B !important;
      font-weight: 700;
      letter-spacing: 0.05em;
    }
    .swagger-ui .btn.execute:hover { background: #a8845a !important; }

    .swagger-ui .btn.authorize {
      color: #C19A6B;
      border-color: #C19A6B;
    }

    .swagger-ui .model-box,
    .swagger-ui .model { background: #1a1a1d; color: #FBF8F4; }

    .swagger-ui .responses-wrapper,
    .swagger-ui .response-col_description { color: #FBF8F4; }

    .swagger-ui table thead tr td,
    .swagger-ui table thead tr th { color: #C19A6B; border-bottom: 1px solid #C19A6B44; }

    .swagger-ui .tab li { color: #FBF8F4; }
    .swagger-ui .tab li.active { color: #C19A6B; }

    .swagger-ui select,
    .swagger-ui input[type=text],
    .swagger-ui textarea {
      background: #1a1a1d;
      color: #FBF8F4;
      border: 1px solid #C19A6B44;
    }

    .swagger-ui .parameter__name { color: #C19A6B; }
    .swagger-ui .parameter__type { color: #FBF8F4aa; }

    .swagger-ui .response-control-media-type__accept-message { color: #FBF8F4; }

    /* Health badge */
    .swagger-ui .info .base-url { color: #C19A6B; }
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
