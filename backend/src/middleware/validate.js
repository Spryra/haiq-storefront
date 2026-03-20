const { ZodError } = require('zod');

/**
 * Validate request body/params/query against a Zod schema.
 * @param {import('zod').ZodSchema} schema
 * @param {'body'|'params'|'query'} target
 */
function validate(schema, target = 'body') {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req[target]);
      req[target] = parsed; // replace with coerced/stripped values
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errors = err.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        return res.status(422).json({
          success: false,
          error: 'Validation failed',
          details: errors,
        });
      }
      next(err);
    }
  };
}

module.exports = { validate };
