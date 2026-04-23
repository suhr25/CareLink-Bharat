import AppError from '../utils/AppError.js';

const validate = (schema) => (req, _res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return next(result.error);
  }
  req.validated = result.data;
  next();
};

export default validate;
