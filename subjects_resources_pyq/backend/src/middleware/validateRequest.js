/**
 * Request validation middleware factory.
 * Checks that every field listed in `requiredFields` is present and non-empty
 * in the request body.
 *
 * @param {string[]} requiredFields - List of required body field names.
 * @returns {Function} Express middleware
 */
const validateRequest = (requiredFields) => {
  return (req, res, next) => {
    const missingFields = [];

    for (const field of requiredFields) {
      const value = req.body[field];
      if (value === undefined || value === null || value === '') {
        missingFields.push(field);
      }
    }

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
      });
    }

    next();
  };
};

module.exports = validateRequest;
