export const apiResponse = (res, statusCode, data, message = 'Success') => {
  return res.status(statusCode).json({
    status: statusCode < 400 ? 'success' : 'fail',
    message,
    data,
  });
};
