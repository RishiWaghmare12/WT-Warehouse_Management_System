const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);

  const statusCode = err.statusCode || 500;
  
  const response = {
    success: false,
    error: err.message || 'An unexpected error occurred'
  };

  // Include extra error data if present
  if (err.availableQuantity !== undefined) {
    response.availableQuantity = err.availableQuantity;
  }
  if (err.availableSpace !== undefined) {
    response.availableSpace = err.availableSpace;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
